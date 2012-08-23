Messages = new Meteor.Collection("messages");
Rooms = new Meteor.Collection("rooms");

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(s) {
        return this.slice(0, s.length) == s;
    }
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function(s) {
        return this.slice(-s.length) == s;
    }
}

var rand = function(min, max) {
    return parseInt(Math.random() * (max-min+1), 10) + min;
}

var randomShade = function() {
    var h = rand(0, 10);
    var s = rand(0, 10);
    var l = rand(20, 60);
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}
