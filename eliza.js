Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");

if (Meteor.is_client) {
    var localMessages = null;
    var roomNameInput = null;
    var roomPassInput = null;
    var messageInput = null;
    var roomModalHeader = null;
    var userAlias = "you";
    var lastCommand = null;

    var roomCreateHandler = function(message) {
        if (!hasName()) return false;
        if (message == "create room") {
            roomModalHeader.innerHTML = "Create Room";
            $('#passQueryModal').modal('show');
            lastCommand = message;
            return true;
        }
        return false;
    };

    var nameChangeHandler = function(message) {
        var regex = /my name is ([a-z]+)/g;
        result = regex.exec(message);
        if (result != null && result.length > 1) {
            userAlias = result[1];
            lastCommand = message;
            return true;
        }
        return false;
    };

    var elizaSays = function(message) {
        return "<strong>eliza:</strong> " + message + "</br>";
    }

    var getElizaReply = function(message) {
        return elizaSays("you said: " + message);
    }

    var hasName = function() { return (userAlias != "you"); }

    var isInRoom = function() { return false; }

    var messageHandler = function() {
        var ts = Date.now() / 1000;
        var message = messageInput.value.toLowerCase();

        if (message == "") return;
        localMessages.innerHTML += 
            "<strong>" + userAlias + ":</strong> " + message + "</br>";

        if (nameChangeHandler(message)) {}
        else if (roomCreateHandler(message)) {} 
        else if (!isInRoom()) {
            localMessages.innerHTML += getElizaReply(message);
        } else {
            localMessages.innerHTML = "";
            Messages.insert({name: userAlias, message: message, time: ts});
        }
        messageInput.value = "";
        window.scrollTo(0, document.body.scrollHeight);
    };

    var roomHandler = function() {
        var roomName = roomNameInput.value;
        var roomPass = roomPassInput.value;
        if (lastCommand = "create room") {
            localMessages.innerHTML += elizaSays("created room " + roomName + ".");
        }
        $('#passQueryModal').modal('hide');
        window.scrollTo(0, document.body.scrollHeight);
    };

    Template.messageList.messages = function() {
        return isInRoom()? Messages.find({}, {}) : "";
    }

    Meteor.startup(function() {
        localMessages = document.getElementById('localMessages');
        messageInput = document.getElementById('messageInput');
        roomNameInput = document.getElementById('roomNameInput');
        roomPassInput = document.getElementById("roomPassInput");
        roomModalHeader = document.getElementById("roomModalHeader");
    });

    Template.entry.events = {};
    Template.entry.events['click #messageInputBtn'] = messageHandler;
    Template.entry.events[okcancel_events("#messageInput")] = 
    make_okcancel_handler({
        ok: messageHandler
    });
    Template.roomForm.events = {};
    Template.roomForm.events[okcancel_events("#roomPassInput")] =
    make_okcancel_handler({
        ok: roomHandler
    });
}

if (Meteor.is_server) {
}

