Messages = new Meteor.Collection("messages");

if (Meteor.is_client) {
	Template.hello.greeting = "Welcome to Eliza";

	Template.hello.events = {
		'click input' : function() {
			// template data, if any, is available in 'this'
			if (typeof console !== 'undefined') {
				Template.hello.greeting = "Clicked";
				console.log("You pressed the button. " + Template.hello.greeting );
			}
		}
	};
    
    Template.messages.messages = function() {
        return Messages.find({}, {});
    }
    
	var checkRoomCreation = function (message) {
	    var regex = /create room ([a-z]+) ([a-z]+)/g;
	    var result = regex.exec(message);
	    if (result != null && 
	        result.length > 1 &&
	        result[1].length > 5 && 
	        result[2].length > 9) {
	        alert(result[1]);
	        alert(result[2]);
	    }		
	};

	var checkNameChange = function(message) {
		var regex = /my name is ([a-z]+)/g;
		result = regex.exec(message);
		if (result != null && result.length > 1) {
			Session.set("name", result[1]);
		}
	};

	var getName = function() {
		return Session.get("name") == undefined? "You" : Session.get("name");
	};

    var enterText = function() {
        var ts = Date.now() / 1000;
        var messageEntry = document.getElementById('messageBox');
        var message = messageEntry.value;
        //console.log("message: " + message);
        checkNameChange(message);
        Messages.insert({name: getName(), message: message, time: ts});
        messageEntry.value = "";
        window.scrollTo(0, document.body.scrollHeight);
    };
        
    Template.entry.events = {
//        'click #messageBoxBtn': enterText
    };
    Template.entry.events['click #messageBoxBtn'] = enterText;
    Template.entry.events[okcancel_events("#messageBox")] = 
    make_okcancel_handler({
        ok: enterText
    });
}

if (Meteor.is_server) {
}

