// game canvas --------------------------
var Game = {};

// In Game.init(), there is only one parameter to set:
Game.init = function(){
	// This will make the game keep reacting to messages from the server even 
	// when the game window doesn’t have focus 
	// (which is a desired behavior for most games)
    game.stage.disableVisibilityChange = true;
};

////////////////////////////////////////////////////////////////////////
// In Game.preload(), we load the assets that we will need
Game.preload = function() {
	// including the tilemap in JSON format (exported from Tiled)
    game.load.tilemap('map', 'assets/map/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', 'assets/map/tilesheet.png',32,32);

    // this will be the sprite of the players
    game.load.image('sprite','assets/sprites/sprite.png'); 
};

////////////////////////////////////////////////////////////////////////
// In Game.create(), 
Game.create = function(){

    // this empty object will be useful later on to keep track of players
    Game.playerMap = {};

	// we start by creating and displaying our map.
    var map = game.add.tilemap('map');

    // tilesheet is the key of the tileset in map's JSON file
    map.addTilesetImage('tilesheet', 'tileset'); 

    // map layer
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }

    // Allows clicking on the map
    layer.inputEnabled = true; 

    // We basically want that when the map is clicked, 
    // the coordinates are sent to the server, 
    // so that the position of the player who clicked can be updated for everyone

    // Callback of onInputUp events in Phaser receive as second argument the corresponding pointer object
    // which contains two properties worldX and worldY that we can use to know where, on the game map, did the click take place.
    // We can then pass these coordinates to Client.sendClick() in client.js
    layer.events.onInputUp.add(Game.getCoordinates, this);

    // notify the server that a new player should be created.
    // - function defined in client.js
    Client.askNewPlayer();
};

////////////////////////////////////////////////////////////////////////
// We can now proceed by setting up the game canvas
// (assuming we have a div block with id="game") 
var game = new Phaser.Game(768, 544, Phaser.AUTO, document.getElementById('game'));

// and declaring a single game state, called "Game", 
// corresponding to a Javascript object of the same name.
game.state.add('Game',Game);
game.state.start('Game');


////////////////////////////////////////////////////////////////////////
// This method creates a new sprite at the specified coordinates, 
// and stores the corresponding Sprite object into an associative array declared in Game.create(), 
// with the supplied id as the key

// This allows to easily access the sprite corresponding to a specific player, 
// for example when we need to move or remove it
Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
};


////////////////////////////////////////////////////////////////////////
// Function to remove player, called by client when told to by server
Game.removePlayer = function(id){
    // use of the Game.playerMap data structure allows you to fetch the ID immediately
    Game.playerMap[id].destroy();

    // remove player
    delete Game.playerMap[id];
};


////////////////////////////////////////////////////////////////////////
// Function to get coords that were clicked
Game.getCoordinates = function(layer,pointer){
    Client.sendClick(pointer.worldX,pointer.worldY);
};


////////////////////////////////////////////////////////////////////////
// Function to move player
Game.movePlayer = function(id,x,y){
    // again make use of the Game.playerMap structure to retrieve the proper sprite
    var player = Game.playerMap[id];

    var distance = Phaser.Math.distance(player.x,player.y,x,y);
    var duration = distance*10;

    // we tween it to make the movement progressive
    var tween = game.add.tween(player);
    tween.to({x:x,y:y}, duration);
    tween.start();
};