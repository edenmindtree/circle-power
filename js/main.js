// (assuming we have a div block with id="game") 
var game = new Phaser.Game(16*32, 600, Phaser.AUTO, document.getElementById('game'));

// and declaring a single game state, called "Game", 
// corresponding to a Javascript object of the same name.
game.state.add('Game',Game);
game.state.start('Game');