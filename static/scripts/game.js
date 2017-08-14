/* global gameCamera PlayerObject buildMap fromBottomOfCanvas */

// GLOBAL VARIABLES
var player; // the player
var gameCanvas; // the actual element that will contain the game itself
var GRAVITY = 0.5;
var MOVE_SPEED = 5;
var JUMP_STRENGTH = -10;
var TERMINAL_VELOCITY = 60;
var GAMEOVER = false;

var platforms = [];
var facts = [];

var images = {
	platform1: '/assets/platforms/metalPlatform.png',
	platform2: '/assets/platforms/metalPlatformWire.png',
	platform3: '/assets/platforms/metalPlatformWireAlt.png',
	
	trampoline: '/assets/platforms/beamBoltsNarrow.png',
	
	playerSprites: {
	    stand: '/assets/player/p1_stand.png',
	    walk1: '/assets/player/p1_stand.png',
	    walk2: '/assets/player/p1_stand.png',
	    walk3: '/assets/player/p1_stand.png',
	    walk4: '/assets/player/p1_stand.png',
	    walk5: '/assets/player/p1_stand.png',
	    walk6: '/assets/player/p1_stand.png',
	    walk7: '/assets/player/p1_stand.png',
	    walk8: '/assets/player/p1_stand.png',
	    walk9: '/assets/player/p1_stand.png',
	    walk10: '/assets/player/p1_stand.png',
	    walk11: '/assets/player/p1_stand.png',
	    jump: '/assets/player/p1_stand.png',
	    duck: '/assets/player/p1_stand.png'
	}
};


// prevents users from just scrolling inside the canvas
if(window.addEventListener) { // Firefox only
    window.addEventListener("DOMMouseScroll", function(e) {e.preventDefault()}, true);
}
window.onscroll = function(e){e.preventDefault()};


function startGame() {
    initializeGameWindow();
    initializePrototypes();
    //                        width, height, imageObj, xPos, yPos
    player = new PlayerObject(40, 50, new Image(), 50, fromBottomOfCanvas(0));
    buildMap();
}

function initializeGameWindow() {
    gameCanvas = {
		canvas : document.createElement("canvas"),
		start : function() {
			this.canvas.width = 1000;
			this.canvas.height = 2000;
			this.context = this.canvas.getContext("2d");
			gameCamera.insertBefore(this.canvas, gameCamera.childNodes[0]);
			this.interval = setInterval(updateGame, 20);
			window.addEventListener('keydown', function(e) {
			    // array of booleans representing keycode values and if they are pressed down
			    gameCanvas.keys = (gameCanvas.keys || []);
			    gameCanvas.keys[e.keyCode] = true;
			})
			window.addEventListener('keyup', function(e) {
			    gameCanvas.keys[e.keyCode] = false;
			})
		},
		clear : function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},
		stop : function() {
		    clearInterval(this.interval);
		}
	}
	
    gameCanvas.start();
}

// platform object
function Platform(width, height, src, xPos, yPos, isTrampoline) {
    this.width = width;
    this.height = height;
    //this.color = color;
    this.image = new Image(width, height);
    this.image.src = images[src];
    this.x = xPos;
    this.y = yPos;
    this.right = this.x + this.width;
    this.left = this.x;
    this.bottom = this.y + this.height;
    this.top = this.y;
    this.isTrampoline = isTrampoline || false;
}

function FactObject(xPos, yPos, fact) {
    this.width = 10;
    this.height = 10;
    this.x = xPos;
    this.y = yPos;
    this.right = this.x + this.width;
    this.left = this.x;
    this.bottom = this.y + this.height;
    this.top = this.y;
    this.color = "black";
    this.fact = fact;
}

// sets up the methods in the object's parent, so each object doesn't need its own copy of it
function initializePrototypes() {
    PlayerObject.prototype.update = function() {
        // this.ctx.fillStyle = "red";
        // this.ctx.fillRect(this.x, this.y, this.width, this.height);
        // standing = 67 196 66 92
        
        this.image.src = this.sprites.stand;
        
        this.ctx.drawImage(
            this.image, 
            this.x, 
            this.y, 
            this.width, 
            this.height
        );
    }
    
    Platform.prototype.update = function() {
        var ctx = gameCanvas.context;
        ctx.drawImage(
            this.image, 
            this.x, 
            (this.isTrampoline) ? this.y - this.height/2 : this.y, 
            this.width, 
            this.height*3.5
        );
    };
    
    FactObject.prototype.update = function() {
        var ctx = gameCanvas.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
}

function updateGame() {
    gameCanvas.clear();
    
    if (!GAMEOVER) {
        // player
        player.move();
        player.newPos();
        player.update();
        // platforms
        for(var i = 0; i < platforms.length; i++) {
        	platforms[i].update();
        }
        // facts
        for(var j = 0; j < facts.length; j++) {
            facts[j].update();
        }
    }
 }
