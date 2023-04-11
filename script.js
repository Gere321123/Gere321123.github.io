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


    // Mozgassa a játékost
    movePlayer(keyCode) {
        this.ctx.clearRect(this.playerX, this.playerY, this.tileSize, this.tileSize);
    
        if (keyCode === 'a') {
            this.playerX -= this.tileSize;
            //  console.log("A key pressed");
        } 
        if (keyCode === 'd') {
            this.playerX += this.tileSize;
            // console.log("D key pressed");
        }
        if (keyCode === 'w') {
            //  console.log("W key pressed");
            this.selectTile();
            if (this.selectedTile !== null) {
                console.log("Selected tile:", this.selectedTile);
                // Törölje a kiválasztott csempét a vászonról
                this.ctx.clearRect(this.selectedTile.x, this.selectedTile.y, this.tileSize, this.tileSize);
            } else {  
                console.log("No tile selected");
            }
        }
        
        const closestTile = { x: this.playerX, y: this.playerY };
        this.copySelectedTile(closestTile);
        
        // Ne hagyja, hogy a játékos elhagyja a vásznat
        this.playerX = Math.max(0, Math.min(this.playerX, this.canvas.width - this.tileSize));
    
        // Újrarajzolja a játékost a vászonra
        this.ctx.drawImage(this.playerImage, this.playerX, this.playerY, this.tileSize, this.tileSize);
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
                        closestTile = { x: colIndex * this.tileSize, y };
                    }
                }
            }
        
            console.log(`Selected tile: ${closestTile}`);
        
            // Hozzáadunk egy új metódust a kiválasztott kocka másolatának létrehozásához
            this.copySelectedTile(closestTile);
        
            // Frissítjük az előzőleg kiválasztott kockát a jelenleg kiválasztottra
            this.selectedTile = closestTile;
        }
        
        // Új metódus a kiválasztott kocka másolatának létrehozásához
        copySelectedTile(tile) {
            this.ctx.drawImage(this.canvas,
                tile.x, tile.y, this.tileSize, this.tileSize, // forrás kocka
                tile.x, this.playerY - this.tileSize, this.tileSize, this.tileSize // cél kocka
            );
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


