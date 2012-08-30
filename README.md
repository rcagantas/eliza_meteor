# Eliza For Meteor

This is an implementation of [ELIZA](http://en.wikipedia.org/wiki/ELIZA) originally designed by professor [Joseph Weizenbaum](http://en.wikipedia.org/wiki/Joseph_Weizenbaum) of MIT around 1964. This example was made using the [Meteor Framework](http://meteor.com).

## Secret Function

Behind the Eliza facade, lies a chat application. To access it perform the following incantations on the message input:

1. my name is `somename`.

    This will set your prompt name. Required to proceed.

1. create room
    
    This will create a room that you will automatically enter. Remember the room name and password to enter the room the next time around.

1. enter room
    
    This will show a similar prompt to create room. Enter an existing room name and password.

1. leave room
    
    This will exit the room and will show the previous Eliza session.

1. destroy room

    This destroys the room and all the messages in it.