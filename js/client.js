// client --------------------------

// Client object that will act as the interface between the server and the game itself.
var Client = {};

// initiate a connection to the server 
// (localhost if you don't specify otherwise between the parentheses).
// the socket of the client is stored in Client.socket for future use
Client.socket = io.connect();

////////////////////////////////////////////////////////////////////////
// Function to notify the server that a new player should be created.
// This function will use our socket object, and send through it a message to the server.
Client.askNewPlayer = function(){
	// This message will have the label 'newplayer'
	Client.socket.emit('newplayer');
};

////////////////////////////////////////////////////////////////////////
// We now need to adapt the clients so they can process the 'newplayer' and 'allplayers' messages from the server
// the same syntax to handle messages can be used on the client side (message, callback function)
// In both cases, this data is processed by calling Game.addNewPlayer(), which we can now define in game.js

// Therefore, the 'data' object fed to the 'newplayer' callback corresponds to the socket.player data sent by the server
Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
});

// For the 'allplayers' message, 'data' is a list of socket.player objects
Client.socket.on('allplayers',function(data){
    console.log(data);
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
});

////////////////////////////////////////////////////////////////////////
// process 'remove' message from server
Client.socket.on('remove',function(id){
	// remove the player with the id passed in by the server
	// the id allows you to fetch the sprite immediately
    Game.removePlayer(id);
});

////////////////////////////////////////////////////////////////////////
// Function sends the coordinates to the server, with the label 'click'. 
// No need to send any player id, since the socket is client-specific and associated to only one player
Client.sendClick = function(x,y){
  Client.socket.emit('click',{x:x,y:y});
};

////////////////////////////////////////////////////////////////////////
// we need to handle the 'move' message from the server, so that the clients can react to another player moving
Client.socket.on('move',function(data){
    Game.movePlayer(data.id,data.x-30,data.y-47);
});