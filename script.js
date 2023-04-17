class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.tileSize = 20;
        this.colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
        this.setCanvasSize();
        this.loadPlayerImage();
        this.playerX = 0;
        this.playerY = this.canvas.height - this.tileSize;
        this.selectedTile = null;
    }

    // Állítsa be a vászon méretét
    setCanvasSize() {
        this.canvas.width = 500;
        this.canvas.height = 500;
    }

    // Töltse be a játékos képét
    loadPlayerImage() {
        this.playerImage = new Image();
        this.playerImage.crossOrigin = 'anonymous';
        this.playerImage.src = 'img/player.png';
        this.playerImage.onload = () => {
            this.ctx.drawImage(this.playerImage, this.playerX, this.playerY, this.tileSize, this.tileSize);
        };
    }


    // Véletlenszerűen válasszon egy színt a színlistából
    randomColor() {
        return this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    // Rajzolja a mátrixot a vászonra véletlenszerűen választott színekkel
    drawMatrix() {
        const tileRows = Math.floor(this.canvas.height / this.tileSize);
        const tileCols = Math.floor(this.canvas.width / this.tileSize);

        for (let y = 0; y < tileRows; y++) {
            for (let x = 0; x < tileCols; x++) {
                if (y < 3) {
                    this.ctx.fillStyle = this.randomColor();
                } else {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Átlátszó
                }
                this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
    }
// Új metódus a kiválasztott kocka frissítéséhez a játékos X koordinátájához
    updateSelectedTilePosition() {
        if (this.selectedTile !== null) {
            this.ctx.clearRect(this.selectedTile.x, this.playerY - this.tileSize, this.tileSize, this.tileSize);
            this.selectedTile.x = this.playerX;
            this.copySelectedTile(this.selectedTile);
        }
    }
    // Mozgassa a játékost
// Javított movePlayer metódus
movePlayer(keyCode) {
    this.ctx.clearRect(this.playerX, this.playerY, this.tileSize, this.tileSize);
    if (this.selectedTile !== null) {
        this.ctx.clearRect(this.selectedTile.x, this.playerY - this.tileSize, this.tileSize, this.tileSize);
    }

    if (keyCode === 'a') {
        if (this.playerX - this.tileSize >= 0) {
            this.playerX -= this.tileSize;
        }
    } 
    if (keyCode === 'd') {
        if (this.playerX + this.tileSize < this.canvas.width) {
            this.playerX += this.tileSize;
        }
    }
    if (keyCode === 'w') {
        if (this.selectedTile !== null) {
            this.placeTileBack();
        } else {
            this.selectTile();
            if (this.selectedTile !== null) {
                console.log("Selected tile:", this.selectedTile);
                this.ctx.clearRect(this.selectedTile.x, this.selectedTile.y, this.tileSize, this.tileSize);
            } else {  
                console.log("No tile selected");
            }
        }
    }

    this.updateSelectedTilePosition();

    this.ctx.drawImage(this.playerImage, this.playerX, this.playerY, this.tileSize, this.tileSize);
}

placeTileBack() {
    const colIndex = Math.floor(this.playerX / this.tileSize);
    let y = this.playerY - 2 * this.tileSize;
    let foundTile = false;

    for (; y >= 0; y -= this.tileSize) {
        const tileColor = this.ctx.getImageData(colIndex * this.tileSize, y, 1, 1).data;
        const isTransparent = tileColor[3] === 0;

        if (!isTransparent) {
            foundTile = true;
            break;
        }
    }

    if (foundTile) {
        this.ctx.putImageData(
            this.ctx.getImageData(this.selectedTile.x, this.selectedTile.y, this.tileSize, this.tileSize),
            colIndex * this.tileSize,
            y + this.tileSize
        );
    } else {
        this.ctx.putImageData(
            this.ctx.getImageData(this.selectedTile.x, this.selectedTile.y, this.tileSize, this.tileSize),
            colIndex * this.tileSize,
            0
        );
    }
    this.selectedTile = null;
} 
    
        // Válassza ki a legközelebbi nem átlátszó kockát a játékos Y koordinátájában
        selectTile() {
            const tileCols = Math.floor(this.canvas.width / this.tileSize);
            const colIndex = Math.floor(this.playerX / this.tileSize);
            let closestTile = null;
            let closestTileDistance = Infinity;
    
            const playerTopY = this.playerY - this.tileSize;
    
            for (let y = playerTopY; y >= 0; y -= this.tileSize) {
                const tileColor = this.ctx.getImageData(colIndex * this.tileSize, y, 1, 1).data;
                const isTransparent = tileColor[3] === 0;
    
                if (!isTransparent) {
                    const distance = Math.abs(this.playerY - y);
                    if (distance < closestTileDistance) {
                        closestTileDistance = distance;
                        closestTile = { x: colIndex * this.tileSize, y, color: `rgba(${tileColor[0]}, ${tileColor[1]}, ${tileColor[2]}, 1)` };
                    }
                }
            }
    
            this.selectedTile = closestTile;
        }
        countConnectedTiles(x, y, color, processed) {
            const directions = [
                { dx: -1, dy: 0 },
                { dx: 1, dy: 0 },
                { dx: 0, dy: -1 },
                { dx: 0, dy: 1 },
            ];
    
            let connectedTiles = 1;
            processed.push({ x, y });
    
            for (const dir of directions) {
                const newX = x + dir.dx * this.tileSize;
                const newY = y + dir.dy * this.tileSize;
    
                if (newX >= 0 && newX < this.canvas.width && newY >= 0 && newY < this.canvas.height) {
                    if (processed.some(tile => tile.x === newX && tile.y === newY)) {
                        continue;
                    }
    
                    const neighborColor = this.ctx.getImageData(newX, newY, 1, 1).data;
                    const neighborColorString = `rgba(${neighborColor[0]}, ${neighborColor[1]}, ${neighborColor[2]}, 1)`;
    
                    if (color === neighborColorString) {
                        connectedTiles += this.countConnectedTiles(newX, newY, color, processed);
                    }
                }
            }
    
            return connectedTiles;
        }
    
        countMatchingNeighbors(x, y, color) {
            const processed = [];
            const connectedTiles = this.countConnectedTiles(x, y, color, processed);
            return connectedTiles - 1; // Levonjuk az eredeti kockát, mivel azt nem számítjuk szomszédnak
        }
    
        placeTileBack() {
            const colIndex = Math.floor(this.playerX / this.tileSize);
            let y = this.playerY - 2 * this.tileSize;
            let foundTile = false;
    
            for (; y >= 0; y -= this.tileSize) {
                const tileColor = this.ctx.getImageData(colIndex * this.tileSize, y, 1, 1).data;
                const isTransparent = tileColor[3] === 0;
    
                if (!isTransparent) {
                    foundTile = true;
                    break;
                }
            }
    
            if (foundTile) {
                this.ctx.fillStyle = this.selectedTile.color;
                this.ctx.fillRect(colIndex * this.tileSize, y + this.tileSize, this.tileSize, this.tileSize);
            } else {
                this.ctx.fillStyle = this.selectedTile.color;
                this.ctx.fillRect(colIndex * this.tileSize, 0, this.tileSize, this.tileSize);
            }
        
            const placedTileX = colIndex * this.tileSize;
            const placedTileY = foundTile ? y + this.tileSize : 0;
        
            const matchingNeighbors = this.countMatchingNeighbors(placedTileX, placedTileY, this.selectedTile.color);
            console.log("Matching neighbors:", matchingNeighbors);
        
            if (matchingNeighbors >= 3) {
                const processed = [];
                this.countConnectedTiles(placedTileX, placedTileY, this.selectedTile.color, processed);
        
                for (const tile of processed) {
                    this.ctx.clearRect(tile.x, tile.y, this.tileSize, this.tileSize);
                }
            }
        
            this.selectedTile = null;
        }
    
        
        // Új metódus a kiválasztott kocka másolatának létrehozásához
        copySelectedTile(tile) {
            if (tile !== null) {
                this.ctx.fillStyle = tile.color;
                this.ctx.fillRect(tile.x, this.playerY - this.tileSize, this.tileSize, this.tileSize);
            }
        }
}
$(document).ready(function() {
    const game = new Game('gameCanvas');
    game.drawMatrix();

    // Kezelje a billentyűzet eseményeket
    $(document).keydown(function(e) {
        if (e.key === 'a' || e.key === 'd' || e.key === 'w') {
            game.movePlayer(e.key);
        }
    });
});