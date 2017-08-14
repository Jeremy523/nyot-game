/* global platforms Platform facts FactObject gameCanvas */

function buildMap() {
    // LEVEL 1
    
    var FLOOR_HEIGHT = 95;
    
    var mapPlatforms = [
        createTrampoline(50, 10, 850, 10),
        createPlatform1(600, 20, 200, FLOOR_HEIGHT*4),
        createPlatform1(225, 20, 200, FLOOR_HEIGHT*5),
        createPlatform1(225, 20, 575, FLOOR_HEIGHT*5)
    ];
    
    var mapFacts = [
        createFact(300, FLOOR_HEIGHT*4, "Fact!")
    ];
    
    for (var i = 0; i < mapPlatforms.length; i++) {
        if (typeof mapPlatforms[i] === 'object' && false) {
            // for each key value pair, push the pair
        } else platforms.push(mapPlatforms[i]);
    }
    
    for (var j = 0; j < mapFacts.length; j++) {
        facts.push(mapFacts[j]);
    }
    
}

function fromBottomOfCanvas(px) {
    return gameCanvas.canvas.height - px; 
}

function createPlatform1(width, height, x, y) {
    return new Platform(width, height, "platform1", x, fromBottomOfCanvas(y));
}

function createPlatform2(width, height, x, y) {
    return new Platform(width, height, "platform2", x, fromBottomOfCanvas(y));
}

function createPlatform3(width, height, x, y) {
    return new Platform(width, height, "platform3", x, fromBottomOfCanvas(y));
}

function createTrampoline(width, height, x, y) {
    return new Platform(width, height, "trampoline", x, fromBottomOfCanvas(y), true);
}

function createFact(x, y, msg) {
    return new FactObject(x, fromBottomOfCanvas(y + 12), msg);
}

function createFloorWithGap(floorHeight, gapWidth) {
    return;
}