var elizaBot = null;
Session.set("name","you");
Session.set("currentRoom", "local");

var localMessages = localMessages == null?
    new LocalCollection("localMessages") : localMessages;

var insertMessage = function(from, message) {
    //var ts = Date.now() / 1000;
    var ts = +new Date() / 1000; // for IE8
    if (Session.equals("currentRoom", "local")) {
        localMessages.insert({
            room: "local",
            name: from, 
            message: message, 
            time: ts});
    } else {
        Messages.insert({
            room: Session.get("currentRoom"),
            color: Session.get("color"),
            name: from, 
            message: message, 
            time: ts}
        );
    }
}

var nameHandler = function(message) {
    message = message.toLowerCase();
    var regex = /^my name is ([a-z0-9]+)/g;
    var result = regex.exec(message);
    if (result != null && result.length > 1) {
        Session.set("name", result[1]);
        Session.set("color", randomShade());
        return true;
    }
    return false;
}

var roomHandler = function(message) {
    $('#roomNameInput').val("");
    $('#roomPassInput').val("");
    
    if (Session.equals("name", "you")) { return; }
    var validCmd = (message == "create room" || 
        message == "enter room" ||
        message == "destroy room" ||
        message == "leave room");
    if (message == "leave room") {
        Session.set("currentRoom", "local");
    } else if (validCmd) {
        Session.set("lastCommand", message);
        Meteor.flush();
        $('#passQueryModal').modal('show');
        return true;
    }
    return false;
};

var messageHandlerCB = function(evt) {
    if (evt.type == "keydown" && evt.which != 13) return;

    document.title = "Eliza";
    var message = $("#messageInput").val();
    if (message == "") return;
    
    if (message != "leave room")
        insertMessage(Session.get("name"), message);
    nameHandler(message);
    roomHandler(message);
    if (Session.equals("currentRoom","local")) {
        var reply = elizaBot.transform(message);
        insertMessage("eliza", reply);
    }
    $("#messageInput").val("");
    window.scrollTo(0, document.body.scrollHeight);
};

var roomHandlerCB = function(evt) {
    if (evt.type == "keydown" && evt.which != 13) return;
    
    var roomName = $("#roomNameInput").val();
    var roomPass = $("#roomPassInput").val();
    if (Session.equals("lastCommand", "create room")) {
        Meteor.call("createRoom", roomName, roomPass, function(e, result) {
            if (result) {
                insertMessage("eliza", "creating room " + roomName);
                Session.set("currentRoom", roomName);
            }
        });
    } else if (Session.equals("lastCommand", "enter room")) {
        Meteor.call("enterRoom", roomName, roomPass, function(e, result){
            if (result) { Session.set("currentRoom", roomName); }
        });
    } else if (Session.equals("lastCommand", "destroy room")) {
        Meteor.call("destroyRoom", roomName, roomPass, function(e) {
            if (!e) { Session.set("currentRoom", "local"); }
        });
    }
    $("#passQueryModal").modal('hide');
    $("#messageInput").focus();
    window.scrollTo(0, document.body.scrollHeight);
};

Meteor.startup(function() {
    Meteor.autosubscribe(function() {
        Meteor.subscribe("messages", Session.get("currentRoom"));
    });
    elizaBot = new ElizaBot();
    var initial = elizaBot.getInitial();
    insertMessage("eliza", initial);

    var Workspace = Backbone.Router.extend({
        routes: { "":"main", ":page": "redirect" },
        main: function(){Session.set("currentPage","mainPage");},
        redirect: function(page) { Session.set("currentPage", page + "Page"); }
    });
    Router = new Workspace;
    Backbone.history.start({pushState: true});
});
//Header events
Template.header.events({
    'click .nav a':function(evt){
        Router.navigate($(evt.target).attr("href"), {trigger: true});
        evt.preventDefault();
    },
    'click a.brand':function(evt){
        Router.navigate($(evt.target).attr("href"), {trigger: true});
        evt.preventDefault();
    }
})

Template.pageSelector.renderPage = function() {
    var template = Session.get("currentPage");
    template = template == undefined? "mainPage" : template;
    return new Handlebars.SafeString(Template[template]());
}

Template.messageList.messages = function() {
    var weekago = new Date();
    weekago.setDate(weekago.getDate() - 7);
    var weekagoint = weekago / 1000;
    return Session.equals("currentRoom", "local")?
        localMessages.find({room: "local"}) :
        Messages.find({room: Session.get("currentRoom"), time: { $gt: weekagoint}}); 
}

Template.messageList.scrolldown = function() {
    Meteor.defer(function() {
        window.scrollTo(0, document.body.scrollHeight);
        var lastUpdateBy = 
            Messages.findOne({room: Session.get("currentRoom")},
                {sort: {time: -1}},
                {fields: name});
        if (!Session.equals("name", lastUpdateBy.name) && 
            !Session.equals("currentRoom", "local")) {
            document.title = "Eliza - " + lastUpdateBy.name ;
        }
    });
}

Template.roomForm.rendered = function() {
    $('#passQueryModal').on('hidden', function () {
        $("#messageInput").focus();
    });
    $('#passQueryModal').on('shown', function () {
        $("#roomNameInput").focus();
    });
}

Template.roomForm.roomHeader = function() {
    if (Session.equals("lastCommand", "create room")) { return "Create Room"; }
    else if (Session.equals("lastCommand", "enter room")) { return "Enter Room"; }
    else if (Session.equals("lastCommand", "destroy room")) { return "Destroy Room"; }
    return "Room Handler";
};

Template.entry.events({
    'click #messageInputBtn': messageHandlerCB,
    'keydown #messageInput': messageHandlerCB
});

Template.roomForm.events({
    'click #roomSetBtn': roomHandlerCB,
    'keydown #roomPassInput': roomHandlerCB
});
