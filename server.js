// game server --------------------------

// npm install --save express
// npm install --save socket.io

// http://localhost:8081

// Express is the module that we will use to serve files to the clients
var express = require('express');

// create a new instance of express called app
var app = express();

// by combining it to the http module, we ensure that our express app will act as an http server.
var server = require('http').Server(app);

// we require the socket.io module and make it listen to the connections to that server.
var io = require('socket.io').listen(server);

////////////////////////////////////////////////////////////////////////
// The next step is to deliver the files depending on the path requested.
app.use('/css',express.static(__dirname + '/css'));			// css folder
app.use('/js',express.static(__dirname + '/js'));			// javascript folder
app.use('/assets',express.static(__dirname + '/assets'));   // assets folder

// specify what file to serve as the root page
app.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
});

////////////////////////////////////////////////////////////////////////
// Keep track of the last id assigned to a new player
server.lastPlayderID = 0; 

// We need to react to messages from the client...
// ARG 1 - We tell Socket.io to listen to the 'connection' event, 
//		   which is fired each time a client connects to the server
// ARG 2 - Callback that receives, as first argument, the socket used to establish the connection
io.on('connection',function(socket){

	// Using the socket.on() method from the socket objects, 
	// it is possible to specify callbacks to handle different messages.

	// Therefore, each time a specific client sends a specific message through his socket, 
	// a specific callback will be called in reaction.
	// In this case, we define a callback to react to the 'newplayer' message
	socket.on('newplayer',function(){

		console.log('Player connected - ID: '+ server.lastPlayderID);

		// First, we create a new custom object, used to represent a player, and store it in the socket object.
		socket.player = {
			// we give the player a unique id (that will be used on the client side)
			id: server.lastPlayderID++,

			// we randomly determine the position of the sprite
			x: randomInt(100,400),
			y: randomInt(100,400)
		};

		// Then, we want to send to the new player the list of already connected players
		// Socket.emit() sends a message to one specific socket. 
		// Here, we send to the newly connected client a message labeled 'allplayers', 
		// and as a second argument, the output of Client.getAllPlayers() 
		// - which will be an array of the currently connected players.
		socket.emit('allplayers',getAllPlayers());

		// socket.emit.broadcast() sends a message to all connected sockets, except the socket who triggered the callback
		// It allows to broadcast events from a client to all other clients without echoing them back to the initiating client
		// Here, we broadcast the 'newplayer' message, and send as data the new player object
		socket.broadcast.emit('newplayer',socket.player);

		// 'click' callback message
		// The x and y fields of the player property of the socket are updated with the new coordinates
		// and then immediately broadcast to everyone so they can see the change
        socket.on('click',function(data){
            console.log('click to '+data.x+', '+data.y);
            socket.player.x = data.x;
            socket.player.y = data.y;

            // the full socket.player object is sent, because the other clients need to know the id of the player who is moving
            // in order to move the proper sprite on-screen
            io.emit('move',socket.player);
        });

		// process the 'disconnect' message so that the server automatically receives when a client actively disconnects or times out.
		socket.on('disconnect',function(){
			// we use io.emit(), which sends a message to all connected clients
			// We send the message 'remove', and send the id of the disconnected player to remove
			io.emit('remove',socket.player.id);
		});
	});
});

////////////////////////////////////////////////////////////////////////
// Function to get all players
// This allows newly connected players to get up to date with the amount and positions of the already connected players
function getAllPlayers(){

	// list to hold players
    var players = [];

    // io.sockets.connected is a Socket.io internal array of the sockets currently connected to the server
    // iterate over all sockets
    Object.keys(io.sockets.connected).forEach(function(socketID){
    	// get the player property we have added to them (if any)
        var player = io.sockets.connected[socketID].player;

        //push them to a list
        if(player) players.push(player);
    });

    return players;
}

////////////////////////////////////////////////////////////////////////
// Function to generate random coords
function randomInt (low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

////////////////////////////////////////////////////////////////////////
// finish setting the server up by indicating which port the server should listen to
// Listens to port 8081
server.listen(8081,function(){ 
	console.log('Listening on '+server.address().port);
});