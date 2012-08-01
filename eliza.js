Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");

if (Meteor.is_client) {
    var localMessages = null;
    var roomPassInput = null;
    var messageInput = null;

    var handleRoomCreation = function(message) {
        if (!hasName()) return false;
        if (message == "create room") {
            $('#passQueryModal').modal('show');
            return true;
        }
        return false;
    };

    var handleNameChange = function(message) {
        var regex = /my name is ([a-z]+)/g;
        result = regex.exec(message);
        if (result != null && result.length > 1) {
            Session.set("name", result[1]);
            return true;
        }
        return false;
    };

    var getName = function() {
        return Session.get("name") == undefined? "you" : Session.get("name");
    };

    var elizaSays = function(message) {
        return "<strong>eliza:</strong> " + message + "</br>";
    }

    var getElizaReply = function(message) {
        return elizaSays("you said: " + message);
    }

    var hasName = function() { return (getName() != "you"); }

    var isInRoom = function() { return false; }

    var enterText = function() {
        var ts = Date.now() / 1000;
        var message = messageInput.value.toLowerCase();

        localMessages.innerHTML += 
            "<strong>" + getName() + ":</strong> " + message + "</br>";

        if (handleNameChange(message)) {}
        else if (handleRoomCreation(message)) {} 
        else if (!isInRoom()) {
            localMessages.innerHTML += getElizaReply(message);
        } else {
            localMessages.innerHTML = "";
            Messages.insert({name: getName(), message: message, time: ts});
        }
        messageInput.value = "";
        window.scrollTo(0, document.body.scrollHeight);
    };

    var roomHandler = function() {
        var roomPass = roomPassInput.value;
        localMessages.innerHTML += elizaSays("created room.");
        $('#passQueryModal').modal('hide');
    };

    Template.messages.messages = function() {
        return isInRoom()? Messages.find({}, {}) : "";
    }

    Meteor.startup(function() {
        localMessages = document.getElementById('localMessages');
        messageInput = document.getElementById('messageInput');
        roomPassInput = document.getElementById("roomPassInput");
    });

    Template.entry.events = {};
    Template.entry.events['click #messageInputBtn'] = enterText;
    Template.entry.events[okcancel_events("#messageInput")] = 
    make_okcancel_handler({
        ok: enterText
    });
    Template.roomForm.events = {};
    Template.roomForm.events[okcancel_events("#roomPassInput")] =
    make_okcancel_handler({
        ok: roomHandler
    });
}

if (Meteor.is_server) {
}

