/* global platforms Platform facts FactObject mapBlocks MapBlock gameCanvas images backgroundBlocks BackgroundBlock */

function buildMap() {
    // LEVEL 1
    
    // acts as a placeholder because a reference to mapChunks is needed in creating mapBlocks
    var mapBlockOptions = function(src, y) {
        return { src : src, y : y };
    }
    
    var backgroundChunks = [
        new mapBlockOptions("background/colored_land", -330),
        new mapBlockOptions("background/colored_land_sky"),
    ];
    
    var mapChunks = [
        new mapBlockOptions("floors/floor", -30),
        new mapBlockOptions("floors/upperLevel"),
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
    
    var mapPlatforms = [
        createTrampoline(50, 10, 850, 0),
        createPlatform1(600, 35, 200, FLOOR_HEIGHT),
        createFloorWithGaps(35, 1, 70, "platform1", 312)
    ];
    
    var mapFacts = [
        createFact("Fact!", 10, 10, 300, FLOOR_HEIGHT)
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

function createFact(msg, width, height, x, y) {
    return new FactObject(msg, width, height, x, fromBottomOfCanvas(y) - height*5);
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

function calculateMapBlockY(mapChunks, idx) {
    var previousBlock = mapChunks[idx-1];
    return previousBlock.top;
}