/* global platforms Platform facts FactObject mapBlocks MapBlock gameCanvas images backgroundBlocks BackgroundBlock Lever levers */

var platformActions = {
    move: function(lever, platform, options) {
        if ( !(options.hasOwnProperty("platform") && options.hasOwnProperty("dx") && options.hasOwnProperty("dy")) )
            return console.log("REQUIRED PARAMETERS NOT FOUND");
        
        lever.ready = false;
            
        var dx = options["dx"];
        var dy = options["dy"];
            
        if (Math.abs(dx - platform.x) > 0) {
            platform.x += (dx > platform.x) ? 1 : -1;
        }
        
        // inverted to stay consistent in our usage of fromBottomOfCanvas for y values
        if (Math.abs(dy - platform.y) > 0) {
            platform.y += (dy > platform.y) ? 1 : -1;
        }
        
        if (platform.x === options["dx"] && platform.y === options["dy"]) {
            lever.done = true;
            lever.reset = false
            lever.ready = true;
        }
        
    },
    
    resetAction: function(lever, platform) {
        lever.activated = false;
        lever.ready = false;
        
        if (Math.abs(platform.initX - platform.x) > 0) {
            platform.x += (platform.initX > platform.x) ? 1 : -1;
        }
        
        if (Math.abs(platform.initY - platform.y) > 0) {
            platform.y += (platform.initY > platform.y) ? 1 : -1;
        }
        
        if (platform.x === platform.initX && platform.y === platform.initY) {
            lever.reset = true;
            lever.done = false;
            lever.ready = true;
        }
    }
};

var platformMoveOptions = function(platform, dx, dy) {
    return {
      platform: platform,
      dx: dx,
      dy: dy
    };
};

function buildMap() {
    
    // acts as a placeholder because a reference to mapChunks is needed in creating mapBlocks
    var mapBlockOptions = function(src, y) {
        return { src : src, y : y };
    }
    
    var backgroundChunks = [
        new mapBlockOptions("background/desert_blue", -60),
        new mapBlockOptions("background/colored_land_sky"),
        new mapBlockOptions("background/colored_land_sky"),
        new mapBlockOptions("background/colored_land_sky"),
        new mapBlockOptions("background/colored_land_sky"),
        new mapBlockOptions("background/colored_land_sky"),
    ];
    
    var mapChunks = [
        new mapBlockOptions("floors/floor", -30),
        new mapBlockOptions("floors/upperLevel"),
        new mapBlockOptions("floors/clear_w_windows"),
        new mapBlockOptions("floors/clear"),
    ];
    
    (function populateMapChunks() {
        for (var idx = 0; idx < mapChunks.length; idx++) {
            mapChunks[idx] = createMapBlock("map", mapChunks[idx].src, mapChunks[idx].y, mapChunks, idx)
        }
        for (var idx = 0; idx < backgroundChunks.length; idx++) {
            backgroundChunks[idx] = createMapBlock("bg", backgroundChunks[idx].src, backgroundChunks[idx].y, backgroundChunks, idx)
        }
    }());
    
    
    var FLOOR_HEIGHT = 205;
    
    var movingPlatforms = [
        createPlatform2(50, 15, 750, 675),
    ];
    
    var mapPlatforms = [
        createTrampoline(50, 10, 850, 15),
        createFloorWithGaps(35, 3, 0, "platform1", FLOOR_HEIGHT),
        createFloorWithGaps(35, 1, 70, "platform1", 312),
        createPlatform1(50, 15, 840, FLOOR_HEIGHT*2),
        createTrampoline(50, 10, 600, 495),
        createFloorWithGaps(35, 2, 100, "platform1", 660),
        movingPlatforms[0],
        createCenteredPlatform(30, 15, "platform1", 835),
    ];
    
    var mapLevers = [
        createLever(700, 720, movingPlatforms[0], platformActions, platformMoveOptions(movingPlatforms[0], movingPlatforms[0].x, movingPlatforms[0].y - 150) )
    ];
    
    var mapFacts = [
        createFact("You did it! But wait, there's more...", centeredX(15), 840)
    ];
    
    for (var l = 0; l < backgroundChunks.length; l++) {
        backgroundBlocks.push(backgroundChunks[l]);
    }
    
    for (var k = 0; k < mapChunks.length; k++) {
        mapBlocks.push(mapChunks[k]);
    }
    
    for (var i = 0; i < mapPlatforms.length; i++) {
        if (Array.isArray(mapPlatforms[i])) {
            for (var k = 0; k < mapPlatforms[i].length; k++) {
                platforms.push(mapPlatforms[i][k]);
            }
        } else platforms.push(mapPlatforms[i]);
    }
    
    for (var m = 0; m < mapLevers.length; m++) {
        levers.push(mapLevers[m]);
    }
    
    for (var j = 0; j < mapFacts.length; j++) {
        facts.push(mapFacts[j]);
    }
    
}

function fromBottomOfCanvas(px) {
    return gameCanvas.canvas.height - px; 
}

//(width, height, src, xPos, yPos)
function createMapBlock(type, src, y, mapChunks, idx) {
    var width = images[src].width;
    var height = images[src].height;
    var xPos = (gameCanvas.canvas.width - width) / 2;
    var yPos = fromBottomOfCanvas(y) || calculateMapBlockY(mapChunks, idx);
    if (type === "map") {
        return new MapBlock(width, height, src, xPos, yPos - height);
    }
    return new BackgroundBlock(width, height, src, xPos, yPos - height);
}

function createPlatform1(width, height, x, y) {
    return new Platform(width, height, "platform1", x, fromBottomOfCanvas(y) - height);
}

function createPlatform2(width, height, x, y) {
    return new Platform(width, height, "platform2", x, fromBottomOfCanvas(y) - height);
}

function createPlatform3(width, height, x, y) {
    return new Platform(width, height, "platform3", x, fromBottomOfCanvas(y) - height);
}

function createTrampoline(width, height, x, y) {
    return new Platform(width, height, "trampoline", x, fromBottomOfCanvas(y) - height, true);
}

function createFloorWithGaps(floorHeight, numGaps, gapWidth, src, y) {
    var platformGroup = [];
    var baseFloorReference = images["floors/floor"];
    var floorWidth = baseFloorReference.width;
    var availableWidth = floorWidth - (numGaps * gapWidth);
    var widthPerFloorPiece = availableWidth / (numGaps + 1);
    var xPos = (gameCanvas.canvas.width - floorWidth) / 2;
    
    for (var i = 0; i <= numGaps; i++) {
        platformGroup.push( new Platform(widthPerFloorPiece, floorHeight, src, xPos += (i === 0) ? 0 : (widthPerFloorPiece + gapWidth), fromBottomOfCanvas(y) - floorHeight) );
    }
    
    return platformGroup;
}

function createCenteredPlatform(width, height, src, y) {
    return new Platform(width, height, src, centeredX(width), fromBottomOfCanvas(y) - height);
}

function createFact(msg, x, y) {
    return new FactObject(msg, x, fromBottomOfCanvas(y) - (10)*3);
}

function createLever(x, y, linkedPlatform, action, options) {
    return new Lever(x, fromBottomOfCanvas(y), linkedPlatform, action, options);
}


function centeredX(width) {
    width = (width != undefined) ? width : 0;
    var baseFloorReference = images["floors/floor"];
    var baseLeft = (gameCanvas.canvas.width - baseFloorReference.width) / 2;
    var baseRight = baseLeft + baseFloorReference.width;
    var xPos = (baseLeft + baseRight - width) / 2;
    
    return xPos;
}

function calculateMapBlockY(mapChunks, idx) {
    var previousBlock = mapChunks[idx-1];
    return previousBlock.top;
}