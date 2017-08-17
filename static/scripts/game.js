/* global gameCamera PlayerObject buildMap fromBottomOfCanvas TIME_IN_SECONDS */

// GLOBAL VARIABLES
var player; // the player
var gameCamera;
var gameCanvas; // the actual element that will contain the game itself
var GAMEOVER = false;
var GRAVITY = 0.5;
var MOVE_SPEED = 5;
var JUMP_STRENGTH = -11;
var TRAMPOLINE_STRENGTH = JUMP_STRENGTH * 1.4;
var TERMINAL_VELOCITY = 60;
var FPS = 55;

var COUNTDOWN;

var currentFrame = 0;
var walkFrames = 11;

// we have 10 images
var totalResources;
var numResourcesLoaded = 0;

var platforms = [];
var facts = [];
var levers = [];
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
        
        "switches/laserSwitchGreenOff",
        "switches/laserSwitchGreenOn",
        
        "floors/floor",
        "floors/upperLevel",
        "floors/clear",
        "floors/clear_w_windows",
        "floors/clear_w_signs",
        "floors/clear_w_floor",
        
        "background/colored_land",
        "background/desert_blue",
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
    gameCamera = document.getElementById("gameCamera");
    
    initializeGameWindow();
    initializePrototypes();
    buildMap();
    //                        width, height, imageObj, xPos, yPos
    player = new PlayerObject(40, 50, new Image(), 430, fromBottomOfCanvas(0));
}

//function 

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
		    promptLoseGame();
		    clearInterval(this.interval);
		}
	}
	
    gameCanvas.start();
    
    var progressBar = document.getElementById("progressBar");
    progressBar.setAttribute("max", TIME_IN_SECONDS);
    progressBar.setAttribute("value", TIME_IN_SECONDS);
    
    COUNTDOWN = setInterval(function(){
    progressBar.value = --TIME_IN_SECONDS;
      if(TIME_IN_SECONDS <= 0) {
        clearInterval(COUNTDOWN);
        GAMEOVER = true;
        gameCanvas.stop();
      }
    }, 500);
}

function promptDifficulty() {
    var dialog = bootbox.dialog({
        title: '<span style="color:black">Choose a difficulty!<span>',
        message: '<p style="color:black; text-align:center">This will affect how much time you will have to beat the game.</p>',
        buttons: {
            easy: {
                label: "<b>Easy</b>",
                className: 'btn-success pull-left easy-btn',
                callback: function() {
                    TIME_IN_SECONDS = 30*2;
                    showScreen();
                    loadImages();
                }
            },
            medium: {
                label: "<b>Medium</b>",
                className: 'btn-warning medium-btn',
                callback: function() {
                    TIME_IN_SECONDS = 20*2;
                    showScreen();
                    loadImages();
                }
            },
            hard: {
                label: "<b>Hard</b>",
                className: 'btn-danger hard-btn',
                callback: function() {
                    TIME_IN_SECONDS = 12*2;
                    showScreen();
                    loadImages();
                }
            },
            insane: {
                label: "<b>Insane</b>",
                className: "btn-primary pull-right insane-btn",
                callback: function() {
                    TIME_IN_SECONDS = 10.5*2;
                    showScreen();
                    loadImages();
                }
            }
        }
    });
}

function promptLoseGame() {
    var dialog = bootbox.dialog({
        title: '<span style="color:black">Oh no!<span>',
        message: '<p style="color:black; text-align:center">You didn\'t make it in time. Would you like to try again?</p>',
        buttons: {
            yes: {
                label: "Yes!",
                className: 'btn-success pull-left',
                callback: function() {
                    document.location.reload();
                }
            },
            no: {
                label: "No",
                className: 'btn-warning pull-right',
                callback: function() {
                    document.location.href = "/";
                }
            }
        }
    });
}

function promptWinGame() {
    var dialog = bootbox.dialog({
        title: '<span style="color:black">You did it!<span>',
        message: '<p style="color:black; text-align:center">What\'s this? You unlocked a secret page!</p>',
        buttons: {
            cont: {
                label: "Take me to it!",
                className: 'btn-success pull-left',
                callback: function() {
                    document.location.href="/vision";
                }
            },
            retry: {
                label: "I want to play again instead",
                className: 'btn-danger pull-right',
                callback: function() {
                    document.location.reload();
                }
            }
        }
    });
}

function showScreen() {
    document.getElementsByClassName("gameContainer")[0].style = "visibility: visible";
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
    this.initX = xPos;
    this.initY = yPos;
    this.right = this.x + this.width;
    this.left = this.x;
    this.bottom = this.y + this.height;
    this.top = this.y;
    this.isTrampoline = isTrampoline || false;
}

function Lever(xPos, yPos, platform, fn, options) {
    this.width = 10;
    this.height = 10;
    this.x = xPos;
    this.y = yPos;
    this.right = this.x + this.width;
    this.left = this.x;
    this.bottom = this.y + this.height;
    this.top = this.y;
    this.inRange = false;
    this.activated = false;
    this.done = false;
    this.reset = true;
    this.ready = true;
    this.linkedPlatform = platform;
    this.fn = fn;
    this.options = options;
}

function FactObject(fact, xPos, yPos) {
    this.width = 15;
    this.height = 15;
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
        this.move();
        this.newPos();
        
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
        this.right = this.x + this.width;
        this.left = this.x;
        this.bottom = this.y + this.height;
        this.top = this.y;
        
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
    
    Lever.prototype.toggle = function() {
        this.activated = !this.activated;
    }
    
    Lever.prototype.checkAction = function() {
        if (this.activated && !this.done && this.reset)
            this.fn.move(this, this.linkedPlatform, this.options);
        if(!this.activated && this.done && !this.reset)
            this.fn.resetAction(this, this.linkedPlatform);
    }
    
    Lever.prototype.checkForPlayer = function() {
                                // check within height                                                      // check within width
        if ( (this.bottom > player.top && this.top < player.bottom && !this.crashedBottom) && (this.right > player.left && this.left < player.right) ) {
            this.inRange = true;
        } else this.inRange = false;
        
    }
    
    Lever.prototype.update = function() {
        this.checkForPlayer();
        
        var sprite = "switches/";
        
        sprite += (this.activated) ? "laserSwitchGreenOn" : "laserSwitchGreenOff";
        
        var ctx = gameCanvas.context;
        
        ctx.drawImage(
            images[sprite], 
            this.x - this.width*1.5, 
            this.y - this.height*1.5, 
            this.width*4, 
            this.height*4
        );
    }
    
    FactObject.prototype.update = function() {
        this.right = this.x + this.width;
        this.left = this.x;
        this.bottom = this.y + this.height;
        this.top = this.y;
        
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
        player.update();
        
        // platforms
        for(var i = 0; i < platforms.length; i++) {
        	platforms[i].update();
        }
        
        // levers
        for(var k = 0; k < levers.length; k++) {
            levers[k].update();
            levers[k].checkAction();
        }
        
        // facts
        for(var j = 0; j < facts.length; j++) {
            facts[j].update();
        }
    }
 }
