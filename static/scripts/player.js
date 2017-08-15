/* global gameCanvas gameCamera GRAVITY MOVE_SPEED JUMP_STRENGTH platforms facts TERMINAL_VELOCITY images */

// PLAYER CLASS
function PlayerObject(width, height, image, xPos, yPos) {
    this.width = width;
    this.height = height;
    this.speedX = 0; // displacement X
    this.speedY = 0; // displacement Y
    this.cumulativeGrav = 0; // total gravity buildup
    this.x = xPos;
    this.y = yPos;
    this.right = this.x + this.width;
    this.left = this.x;
    this.bottom = this.y + this.height;
    this.top = this.y;
    
    this.ctx = gameCanvas.context;
    this.facingRight = true;
    this.moving = false;
    this.grounded;
    
    this.factInventory = [];
    
    this.newPos = function() {
        this.cumulativeGrav += GRAVITY;
        this.x += this.speedX;
        this.y += this.speedY + this.cumulativeGrav;
        this.right = this.x + this.width;
        this.left = this.x;
        this.bottom = this.y + this.height;
        this.top = this.y;
        this.crashedBottom = this.crashBottom();
        this.grounded = this.floored();
        this.crashTop();
        this.hitBottom();
        this.retrieveFact();
        
        if (this.cumulativeGrav > TERMINAL_VELOCITY)
            this.cumulativeGrav = TERMINAL_VELOCITY;
        
        this.scrollCanvas();
    }
    
    this.floored = function() {
        return (this.y >= gameCanvas.canvas.height - this.height);
    }
    
    // if player is on same vertical level as obstacle
    this.withinHeight = function(obstacle) {
       return (this.bottom > obstacle.top && this.top < obstacle.bottom && !this.crashedBottom);
    }
    
    // if player is on same horizontal level as obstacle
    this.withinWidth = function(obstacle) {
        return (this.right > obstacle.left && this.left < obstacle.right);
    }
    
    // obstacle is on top of player
    this.crashTop = function() {
        for (var i = 0; i < platforms.length; i++) {
            if ((this.top <= platforms[i].bottom || this.top - this.cumulativeGrav <= platforms[i].bottom) && 
                (this.top > platforms[i].top || this.top - this.cumulativeGrav > platforms[i].top) && 
                this.withinWidth(platforms[i])) {
                this.cumulativeGrav = 0;
                return true;
            }
        }
        return false;
    }
    
    // obstacle is on bottom of player
    this.crashBottom = function() {
        for (var i = 0; i < platforms.length; i++) {
            
            
            if ((this.bottom >= platforms[i].top   || this.bottom + this.cumulativeGrav >= platforms[i].top) && 
                (this.bottom < platforms[i].bottom || this.bottom + this.cumulativeGrav < platforms[i].bottom) &&
                this.withinWidth(platforms[i])) {
                        
                this.y = platforms[i].top - this.height;
                this.cumulativeGrav = 0;
                
                if (platforms[i].isTrampoline) {
                    this.cumulativeGrav = JUMP_STRENGTH * 1.5;
                } else {
                    return true;
                }
                
                
            }
            
            
        }
        return false;
    }
    
    // obstacle is on left side of player
    this.crashLeft = function() {
        for (var i = 0; i < platforms.length; i++) {
            if (this.left <= platforms[i].right && this.left >= platforms[i].left && this.withinHeight(platforms[i]))
                return true;
        }
        return false;
    }
    
    // obstaacle is on right side of player
    this.crashRight = function() {
        for (var i = 0; i < platforms.length; i++) {
            if (this.right >= platforms[i].left && this.right <= platforms[i].right && this.withinHeight(platforms[i]))
                return true;
        }
        return false;
    }
    
    this.hitBottom = function() {
        var floor = gameCanvas.canvas.height - this.height;
        if (this.y > floor) {
            this.y = floor;
            this.cumulativeGrav = 0;
        }
    }
    
    this.moveRight = function() {
        if (!this.facingRight)
            this.direction(true);
            
        var isOutsideMap = this.right >= gameCanvas.canvas.width;
        
        if(!this.crashRight() && !isOutsideMap)
            this.speedX += MOVE_SPEED;
            
        if(isOutsideMap)
            this.x = gameCanvas.canvas.width - this.width;
    }
    
    this.moveLeft = function() {
        if (this.facingRight)
            this.direction(false);
            
        var isOutsideMap = this.left <= 0;
        
        if (!this.crashLeft() && !isOutsideMap)
            this.speedX -= MOVE_SPEED;
            
        if (isOutsideMap)
            this.x = 0;
    }
    
    this.jump = function() {
        if (this.crashedBottom || this.grounded)
            this.cumulativeGrav = JUMP_STRENGTH;
    }
    
    this.move = function() {
        this.speedX = 0;
        this.speedY = 0;
    
        if (gameCanvas.keys) {
            if (gameCanvas.keys[65] || gameCanvas.keys[37]) {
                this.moving = true;
                this.moveLeft();
            } else if (gameCanvas.keys[68] || gameCanvas.keys[39]) {
                this.moving = true;
                this.moveRight();
            } else {
                this.moving = false;
            }
                
            if (gameCanvas.keys[87] || gameCanvas.keys[32] || gameCanvas.keys[38]) // W or UP or SPACE 
                this.jump();
        }
    }
    
    this.retrieveFact = function() {
        for (var i = 0; i < facts.length; i++) {
            if ((this.bottom > facts[i].top && this.top < facts[i].bottom) && this.withinWidth(facts[i])) {
                console.log("FACT: " + facts[i].fact);
                this.factInventory.push(facts.splice(i, 1));
                return;
            }
        }
    }
    
    this.scrollCanvas = function() {
        var buffer = gameCamera.clientWidth/2;
        var deadZone = 10;
        // only scroll in x when player is in center(ish) of frame
        if (this.x >= gameCamera.scrollLeft + buffer)
            gameCamera.scrollLeft+=MOVE_SPEED;
        else if (this.x - buffer + deadZone < gameCamera.scrollLeft)
            gameCamera.scrollLeft-=MOVE_SPEED;
        
        // always scroll in the y direction
        gameCamera.scrollTop = this.y - (gameCamera.clientHeight * 0.5);
    }
    
    // runs every time player switches direction
    this.direction = function(dir) {
        this.facingRight = dir;
    }
}
