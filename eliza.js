Messages = new Meteor.Collection("messages");

if (Meteor.is_client) {
    var handleTests = function(message) {
        handleTestModal(message);
    }

    var handleTestModal = function(message) {
        var regex = /(testmodal)/g;
        var result = regex.exec(message);
        if (result != null && 
            result.length > 1) {
            $('#passQuery').modal('show');
        }
    }

    var handleRoomCreation = function(message) {
        var regex = /create room ([a-z]+)/g;
        var result = regex.exec(message);
        if (result != null && 
            result.length > 1 &&
            result[1].length > 5) {
            $('#passQuery').modal('show');
        }       
    };

    var handleNameChange = function(message) {
        var regex = /my name is ([a-z]+)/g;
        result = regex.exec(message);
        if (result != null && result.length > 1) {
            Session.set("name", result[1]);
        }
    };

    var getName = function() {
        return Session.get("name") == undefined? "you" : Session.get("name");
    };

    Template.messages.messages = function() {
        return Messages.find({}, {});
    }    

    var enterText = function() {
        var ts = Date.now() / 1000;
        var messageEntry = document.getElementById('messageBox');
        var message = messageEntry.value;
        //console.log("message: " + message);
        handleTests(message);
        handleNameChange(message);
        handleRoomCreation(message);
        if (getName() == "you") {
            var localMessages = document.getElementById('localMessages');
            localMessages.innerHTML += "<strong>you:</strong> " + message + "</br>";
            console.log(localMessages);
        } else {
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

