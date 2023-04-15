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
    countMatchingNeighbors(x, y, color) {
        let visited = new Set();
        let stack = [{ x, y }];
        console.log('Checking neighbors for', x, y, color);
        let count = 0;
    
        while (stack.length > 0) {
            let current = stack.pop();
            let key = `${current.x},${current.y}`;
    
            if (!visited.has(key)) {
                visited.add(key);
                let neighbors = this.getNeighbors(current.x, current.y);
    
                for (let neighbor of neighbors) {
                    let neighborColor = this.getTileColor(neighbor.x, neighbor.y);
                    console.log("Neighbor:", neighbor, "Color:", neighborColor, "Matching:", neighborColor === color); // Új sor a szomszédos cellák adatainak kiírására
    
                    if (neighborColor === color) {
                        count++;
                        stack.push(neighbor);
                    }
                }
            }
        }
    
        return count;
    }
    
    getNeighbors(x, y) {
        const neighbors = [
            { x: x - this.tileSize, y },
            { x: x + this.tileSize, y },
            { x, y: y - this.tileSize },
            { x, y: y + this.tileSize },
        ];
    
        return neighbors.filter(neighbor => neighbor.x >= 0 && neighbor.x < this.canvas.width && neighbor.y >= 0 && neighbor.y < this.canvas.height);
    }
    getTileColor(x, y) {
        const tileColor = this.ctx.getImageData(x, y, 1, 1).data;
        let color = `rgba(${tileColor[0]}, ${tileColor[1]}, ${tileColor[2]}, ${tileColor[3] / 255})`;
    
        // Konvertálja az rgba színt hex színkóddá
        let hexColor = "#" + ((1 << 24) + (tileColor[0] << 16) + (tileColor[1] << 8) + tileColor[2]).toString(16).slice(1).toUpperCase();
        
        // Ellenőrizze, hogy a hexColor értéke megtalálható-e a colors tömbben
        if (this.colors.includes(hexColor)) {
            return hexColor;
        } else {
            return color;
        }
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
    console.log('Placing tile back at', colIndex * this.tileSize, y + this.tileSize);
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
    const matchingNeighbors = this.countMatchingNeighbors(colIndex * this.tileSize, y + this.tileSize, this.selectedTile.color);
    console.log("Matching neighbors:", matchingNeighbors);
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
    
        placeTileBack() {
            const colIndex = Math.floor(this.playerX / this.tileSize);
            let y = this.playerY - 2 * this.tileSize;
            let foundTile = false;
            console.log('Placing tile back at', colIndex * this.tileSize, y + this.tileSize);
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
            const matchingNeighbors = this.countMatchingNeighbors(colIndex * this.tileSize, y + this.tileSize, this.selectedTile.color);
            console.log("Matching neighbors:", matchingNeighbors); // Hívás a countMatchingNeighbors függvényhez
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