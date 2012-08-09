Meteor.publish("messages", function(roomName) {
    return Messages.find({room: roomName});
});

Meteor.methods({
    createRoom: function(roomName, roomPass) {
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
    destroyRoom: function(roomName, roomPass) {
        Rooms.remove({
            room: roomName,
            password: roomPass}, function(e) {
            if (!e) {
                Messages.remove({room: roomName});
            }
        });
    },
    insertMessage: function(room, color, from, message, ts) {
        Messages.insert({
            room: room,
            color: color,
            name: from, 
            message: message, 
            time: ts}
        );

    }
});

Meteor.startup(function() {
    var collections = ['messages', 'rooms'];
    _.each(collections, function(collection) {
        //_.each(['insert', 'update', 'remove'], function(method) {
        // allow inserts on the client
        _.each(['update', 'remove'], function(method) {
            Meteor.default_server.method_handlers['/' + collection + '/' + method] = function() {};
        });
    });
});