Meteor.publish("messages", function(roomName) {
    return Messages.find({room: roomName});
});

Meteor.methods({
    createRoom: function(roomName, roomPass) {
        //console.log("creating room " + roomName + " " + roomPass);
        var retVal = (Rooms.find({room: roomName}).count() == 0);
        if (retVal) {
            Rooms.insert({room: roomName, password: roomPass});
        }
        return retVal;
    },
    enterRoom: function(roomName, roomPass) {
        var retVal = Rooms.find({
            room: roomName, 
            password: roomPass}).count() > 0;
        return retVal;
    },
});