/* global gameCamera PlayerObject buildMap fromBottomOfCanvas */

// GLOBAL VARIABLES
var player; // the player
var gameCanvas; // the actual element that will contain the game itself
var GRAVITY = 0.5;
var MOVE_SPEED = 5;
var JUMP_STRENGTH = -11;
var TERMINAL_VELOCITY = 60;
var GAMEOVER = false;
var FPS = 55;

var currentFrame = 0;
var walkFrames = 11;

// we have 10 images
var totalResources;
var numResourcesLoaded = 0;

var platforms = [];
var facts = [];
var mapBlocks = [];
var backgroundBlocks = []

var images = {};

function loadImages() {
    var imageSources = [
        "player/p1_standR",
        "player/p1_standL",
        "player/p1_jumpR",
        "player/p1_jumpL",
        "player/p1_walkR",
        "player/p1_walkL",
        "platforms/trampoline",
        "platforms/platform1",
        "platforms/platform2",
        "platforms/platform3",
        "items/fact",
        "floors/floor",
        "floors/upperLevel",
        "background/colored_land",
        "background/colored_land_sky"
    ];
    
    totalResources = imageSources.length;
    
    for (var i = 0; i < imageSources.length; i++)
        loadImage(imageSources[i]);
}

function loadImage(name) {
    images[name] = new Image();
    
    images[name].onload = function() { 
        resourceLoaded();
    }
    
    images[name].src = "assets/" + name + ".png";
}

function resourceLoaded() {
    numResourcesLoaded++;
    if (numResourcesLoaded === totalResources) 
        startGame();
}


var framesR = [
    {"x":0,"y":0,"w":67,"h":93},
    {"x":67,"y":0,"w":67,"h":93},
    {"x":133,"y":0,"w":67,"h":93},
    {"x":0,"y":93,"w":67,"h":93},
    {"x":67,"y":93,"w":67,"h":93},
    {"x":133,"y":93,"w":71,"h":93},
    {"x":0,"y":186,"w":71,"h":93},
    {"x":71,"y":186,"w":71,"h":93},
    {"x":142,"y":186,"w":70,"h":93},
    {"x":0,"y":279,"w":71,"h":93},
    {"x":71,"y":279,"w":67,"h":93}
];

var framesL = [];

(function populateFramesL () {
    for(var i = 0; i < framesR.length; i++) {
        var frame = clone(framesR[i]);
        frame["x"] = 256 - frame["x"] - frame["w"];
        framesL.push(frame);
    }
}());

// clones object
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

// prevents users from just scrolling inside the canvas
if(window.addEventListener) { // Firefox only
    window.addEventListener("DOMMouseScroll", function(e) {e.preventDefault()}, true);
}
window.onscroll = function(e){e.preventDefault()};


function startGame() {
    initializeGameWindow();
    initializePrototypes();
    buildMap();
    //                        width, height, imageObj, xPos, yPos
    player = new PlayerObject(40, 50, new Image(), 430, fromBottomOfCanvas(0));
}

function initializeGameWindow() {
    gameCanvas = {
		canvas : document.createElement("canvas"),
		start : function() {
			this.canvas.width = 1000;
			this.canvas.height = 2000;
			this.context = this.canvas.getContext("2d");
			gameCamera.insertBefore(this.canvas, gameCamera.childNodes[0]);
			this.interval = setInterval(updateGame, 1000/FPS);
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


function BackgroundBlock(width, height, src, xPos, yPos) {
    this.width = width;
    this.height = height;
    this.src = src;
    this.x = xPos;
    this.y = yPos;
    this.right = this.x + this.width;
    this.left = this.x;
    this.bottom = this.y + this.height;
    this.top = this.y;
}

function MapBlock(width, height, src, xPos, yPos) {
    this.width = width;
    this.height = height;
    this.src = src;
    this.x = xPos;
    this.y = yPos;
    this.right = this.x + this.width;
    this.left = this.x;
    this.bottom = this.y + this.height;
    this.top = this.y;
}

function Platform(width, height, src, xPos, yPos, isTrampoline) {
    this.width = width;
    this.height = height;
    this.src = src;
    this.x = xPos;
    this.y = yPos;
    this.right = this.x + this.width;
    this.left = this.x;
    this.bottom = this.y + this.height;
    this.top = this.y;
    this.isTrampoline = isTrampoline || false;
}

function FactObject(fact, width, height, xPos, yPos) {
    this.width = width;
    this.height = height;
    this.x = xPos;
    this.y = yPos;
    this.right = this.x + this.width;
    this.left = this.x;
    this.bottom = this.y + this.height;
    this.top = this.y;
    this.ctx = gameCanvas.context;
    this.fact = fact;
}

// sets up the methods in the object's parent, so each object doesn't need its own copy of it
function initializePrototypes() {
    PlayerObject.prototype.update = function() {
        
        var sprite = "player/";
        var walking = false;
        
        if (this.crashedBottom || this.grounded) {
            if (this.moving) {
                walking = true;
                sprite += (this.facingRight) ? "p1_walkR" : "p1_walkL";
            }
            else {
                sprite += (this.facingRight) ? "p1_standR" : "p1_standL";
            }
        } else {
            sprite += (this.facingRight) ? "p1_jumpR" : "p1_jumpL";
        }
        
        
        if (walking) {
            var frameSet = (this.facingRight) ? framesR : framesL;
            
            if (currentFrame === walkFrames) {
                currentFrame = 0;
            }
            
            this.ctx.drawImage(
                images[sprite], 
                frameSet[currentFrame]["x"], 
                frameSet[currentFrame]["y"], 
                frameSet[currentFrame]["w"], 
                frameSet[currentFrame]["h"],
                this.x,
                this.y,
                this.width,
                this.height
            );
            
            currentFrame++;
            
        } else {
            currentFrame = 0;
            
            this.ctx.drawImage(
                images[sprite], 
                this.x, 
                this.y, 
                this.width, 
                this.height
            );
        }
    }
    
    BackgroundBlock.prototype.update = function() {
      var ctx = gameCanvas.context;
      
      ctx.drawImage(
            images[this.src], 
            this.x,
            this.y,
            this.width,
            this.height
        );
    };
    
    MapBlock.prototype.update = function() {
      var ctx = gameCanvas.context;
      
      ctx.drawImage(
            images[this.src], 
            this.x,
            this.y,
            this.width,
            this.height
        );
    };
    
    Platform.prototype.update = function() {
        var sprite = "platforms/" + this.src;
        
        var ctx = gameCanvas.context;
        
        ctx.drawImage(
            images[sprite], 
            this.x, 
            (this.isTrampoline) ? this.y - this.height/2 : this.y, 
            this.width, 
            this.height*3.5
        );
    };
    
    FactObject.prototype.update = function() {
        var sprite = "items/fact";
        
        var ctx = gameCanvas.context;
        
        ctx.drawImage(
            images[sprite], 
            this.x - this.width*1.5, 
            this.y - this.height*1.5, 
            this.width*4, 
            this.height*4
        );
    };
}

function updateGame() {
    gameCanvas.clear();
    
    if (!GAMEOVER) {
        // backgroundBlocks
        for(var i = 0; i < backgroundBlocks.length; i++) {
        	backgroundBlocks[i].update();
        }
        
        // mapBlocks
        for(var i = 0; i < mapBlocks.length; i++) {
        	mapBlocks[i].update();
        }
        
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
