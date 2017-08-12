/* global platforms Platform facts FactObject gameCanvas */

function buildMap() {
    //                        width, height       x,            y,          isTrampoline (empty === false)
    platforms.push(new Platform(100, 10, "blue", 160, fromBottomOfCanvas(90)));
    platforms.push(new Platform(100, 10, "green", 400, fromBottomOfCanvas(165)));
    
    platforms.push(new Platform(100, 10, "purple", 600, fromBottomOfCanvas(250)));
    platforms.push(new Platform(100, 10, "orange", 380, fromBottomOfCanvas(330)));
    
    platforms.push(new Platform(50, 10, "brown", 192, fromBottomOfCanvas(420)));
    
    // trampoline
    platforms.push(new Platform(50, 10, "gray", 136, fromBottomOfCanvas(200), true));
    
                            // x,       y,                   fact
    facts.push(new FactObject(400, fromBottomOfCanvas(10), "Fact #1"));
    facts.push(new FactObject(450, fromBottomOfCanvas(10), "Fact #2"));
    facts.push(new FactObject(500, fromBottomOfCanvas(10), "Fact #3"));
}

function fromBottomOfCanvas(px) {
    return gameCanvas.canvas.height - px; 
}