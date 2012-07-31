Messages = new Meteor.Collection("messages");

if (Meteor.is_client) {
    var handleRoomCreation = function(message) {
        if (!hasName()) return false;
        var regex = /create room ([a-z]+)/g;
        var result = regex.exec(message);
        if (result != null && 
            result.length > 1 &&
            result[1].length > 5) {
            $('#passQuery').modal('show');
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

    var clearMessageEntry = function(message) {
        var messageEntry = document.getElementById('messageBox');
        messageEntry.value = "";
    }

    var getName = function() {
        return Session.get("name") == undefined? "you" : Session.get("name");
    };

    var getElizaReply = function(message) {
        return "<strong>eliza:</strong> You said: " + message + "</br>";
    }

    var hasName = function() { return (getName() != "you"); }
    var isInRoom = function() { return false; }
    Template.messages.messages = function() {
        return isInRoom()? Messages.find({}, {}) : "";
    }

    var enterText = function() {
        var ts = Date.now() / 1000;
        var localMessages = document.getElementById('localMessages');
        var messageEntry = document.getElementById('messageBox');
        var message = messageEntry.value.toLowerCase();
        handleNameChange(message);
        handleRoomCreation(message);

        if (!isInRoom()) {
            localMessages.innerHTML += 
                "<strong>" + getName() + ":</strong> " + message + "</br>";
            localMessages.innerHTML += getElizaReply(message);
        } else {
            localMessages.innerHTML = "";
            Messages.insert({name: getName(), message: message, time: ts});
        }
        messageEntry.value = "";
        window.scrollTo(0, document.body.scrollHeight);
    };
        
    Template.entry.events = {};
    Template.entry.events['click #messageBoxBtn'] = enterText;
    Template.entry.events[okcancel_events("#messageBox")] = 
    make_okcancel_handler({
        ok: enterText
    });
}

if (Meteor.is_server) {
}

