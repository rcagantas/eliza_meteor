var messageInput = null;
var roomNameInput = null;
var roomPassInput = null;
var roomModalHeader = null;
var localMessages = localMessages == null?
    new LocalCollection("localMessages") : localMessages;

Meteor.startup(function() {
    messageInput = document.getElementById('messageInput');
    roomNameInput = document.getElementById('roomNameInput');
    roomPassInput = document.getElementById("roomPassInput");
    roomModalHeader = document.getElementById("roomModalHeader");
    Session.set("name","you");
    Session.set("currentRoom", "local");
    Meteor.autosubscribe(function() {
        Meteor.subscribe("messages", Session.get("currentRoom"));
    });
    $('#passQueryModal').on('hidden', function () {
        messageInput.focus();
    });
    $('#passQueryModal').on('shown', function () {
        roomNameInput.focus();
    });
});

var insertMessage = function(from, message) {
    var ts = Date.now() / 1000;
    if (Session.equals("currentRoom", "local")) {
        localMessages.insert({
            room: "local",
            name: from, 
            message: message, 
            time: ts});
    } else {
        console.log(from + ": " + message);
        Messages.insert({
            room: Session.get("currentRoom"), 
            name: from, 
            message: message, 
            time: ts}
        );
    }
}

var nameHandler = function(message) {
    var regex = /my name is ([a-z]+)/g;
    var result = regex.exec(message);
    if (result != null && result.length > 1) {
        Session.set("name", result[1]);
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
    else if (Session.equals("currentRoom","local")) 
        insertMessage("eliza", "you said: " + message);
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


