var elizaBot = null;
var messageInput = null;
var roomNameInput = null;
var roomPassInput = null;
var roomModalHeader = null;
var localMessages = localMessages == null?
    new LocalCollection("localMessages") : localMessages;

var rand = function(min, max) {
    return parseInt(Math.random() * (max-min+1), 10) + min;
}

var randomShade = function() {
    var h = rand(0, 10);
    var s = rand(0, 10);
    var l = rand(20, 60);
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

var insertMessage = function(from, message) {
    var ts = Date.now() / 1000;
    if (Session.equals("currentRoom", "local")) {
        localMessages.insert({
            room: "local",
            name: from, 
            message: message, 
            time: ts});
    } else {
        Meteor.call("insertMessage", 
            Session.get("currentRoom"), 
            Session.get("color"), 
            from, message, ts);
    }
}

var nameHandler = function(message) {
    var regex = /my name is ([a-z]+)/g;
    var result = regex.exec(message);
    if (result != null && result.length > 1) {
        Session.set("name", result[1]);
        Session.set("color", randomShade());
        return true;
    }
    return false;
}

var roomHandler = function(message) {
    roomNameInput.value = "";
    roomPassInput.value = "";
    if (Session.equals("name", "you")) return;
    var returnValue = (message == "create room" || message == "enter room");
    if (returnValue) {
        Session.set("lastCommand", message);
        $('#passQueryModal').modal('show');
    }
    return returnValue;
};

var messageHandler = function() {
    var message = messageInput.value.toLowerCase();
    if (message == "") return;
    insertMessage(Session.get("name"), message);

    if (nameHandler(message)) {}
    else if (roomHandler(message)) {} 
    else if (Session.equals("currentRoom","local")) {
        var reply = elizaBot.transform(message);
        insertMessage("eliza", reply);
    }
    messageInput.value = "";
    window.scrollTo(0, document.body.scrollHeight);
};

var roomHandlerCallback = function() {
    var roomName = roomNameInput.value;
    var roomPass = roomPassInput.value;
    if (Session.equals("lastCommand", "create room")) {
        Meteor.call("createRoom", roomName, roomPass, function(e, result) {
            if (result) insertMessage("eliza", "creating room " + roomName);   
        });
    } else if (Session.equals("lastCommand", "enter room")) {
        Meteor.call("enterRoom", roomName, roomPass, function(e, result){
            if (result) Session.set("currentRoom", roomName);
        });
    }
    $('#passQueryModal').modal('hide');
    messageInput.focus();
    window.scrollTo(0, document.body.scrollHeight);
};

Meteor.startup(function() {
    messageInput = document.getElementById('messageInput');
    roomNameInput = document.getElementById('roomNameInput');
    roomPassInput = document.getElementById("roomPassInput");
    roomModalHeader = document.getElementById("roomModalHeader");
    Session.set("name","you");
    Session.set("currentRoom", "local");
    Session.set("currentPage", "mainPage");
    Meteor.autosubscribe(function() {
        Meteor.subscribe("messages", Session.get("currentRoom"));
    });
    $('#passQueryModal').on('hidden', function () {
        messageInput.focus();
    });
    $('#passQueryModal').on('shown', function () {
        roomNameInput.focus();
    });
    elizaBot = new ElizaBot();
    var initial = elizaBot.getInitial();
    insertMessage("eliza", initial);

    var Workspace = Backbone.Router.extend({
        routes: { ":page": "redirect" },
        redirect: function(page) { Session.set("currentPage", page + "Page"); }
    });
    Router = new Workspace;
    Backbone.history.start({pushState: true});
});

Template.pageSelector.renderPage = function() {
    var template = Session.get("currentPage");
    template = template == undefined? "mainPage" : template;
    return new Handlebars.SafeString(Template[template]());
}

Template.messageList.messages = function() { 
    return Session.equals("currentRoom", "local")?
        localMessages.find({room: "local"}) :
        Messages.find({room: Session.get("currentRoom")}); 
}

Template.roomModal.header = function() {
    if (Session.equals("lastCommand", "create room")) return "Create Room";
    else if (Session.equals("lastCommand", "enter room")) return "Enter Room";
    return "Default";
};
Template.entry.events = {};
Template.entry.events['click #messageInputBtn'] = messageHandler;
Template.entry.events[okcancel_events("#messageInput")] = 
make_okcancel_handler({
    ok: messageHandler
});
Template.roomForm.events = {};
Template.roomForm.events[okcancel_events("#roomPassInput")] =
make_okcancel_handler({
    ok: roomHandlerCallback
});


