class SobicsGame {
  constructor() {
    this.score = 0;
    this.board = [];
    this.colors = ["red", "blue", "green", "yellow"];
    this.boardSize = { width: 18, height: 10 };
    this.playerPos = [9, 9];
    this.playerImage = new Image();
    this.playerImage.src = "img/player.png";
    this.grabbedBlock = null;
    this.newCycle = false;
  }

  // Játék indítása
  start() {
    this.createBoard(3);
    this.renderBoard();
    this.bindEvents();
    this.animateLine();
  }

  createBoard(x) {
    for (let i = 0; i < this.boardSize.height; i++) {
      let row = [];
      for (let j = 0; j < this.boardSize.width; j++) {
        let color = "transparent";
        if (i < 3 || x !== 3) {
          color = this.getRandomColor();
        }
        row.push({ color: color, x: j, y: i });
      }
      this.board.push(row);
    }
  
    if (x === 1) {
      // Hívjuk meg a shiftGrabbedBlockDown() függvényt itt, hogy frissüljön a kiválasztott kocka pozíciója
      this.shiftGrabbedBlockDown();
      for (let i = this.boardSize.height - 2; i >= 0; i--) {
        for (let j = 0; j < this.boardSize.width; j++) {
          this.board[i + 1][j].color = this.board[i][j].color;
        }
      }
      let firstRow = [];
      for (let j = 0; j < this.boardSize.width; j++) {
        let color = this.getRandomColor();
        firstRow.push({ color: color, x: j, y: this.boardSize.height - 1 });
      }
      this.board[0] = firstRow;
     // console.log("Kocka felkerül", this.grabbedBlock.y, "ez meg a rendes erteke a matrixnak", this.grabbedBlock);
    }
  }
  


  shiftGrabbedBlockDown() {
    if (this.grabbedBlock !== null) {
      const blockAbove = this.board[this.grabbedBlock.y - 1][this.grabbedBlock.x];
      if (blockAbove.color === 'transparent' || this.newCycle) {
        // Eltároljuk a régi pozíciót
        const oldY = this.grabbedBlock.y;
        
        // Frissítjük a grabbedBlock y pozícióját
        this.grabbedBlock.y--;
  
        // Frissítjük a this.board mátrixot az új pozícióban
        this.board[this.grabbedBlock.y][this.grabbedBlock.x] = this.grabbedBlock;
  
        // Beállítjuk az előző pozícióban lévő kockát átlátszóra
        this.board[oldY][this.grabbedBlock.x] = { color: 'transparent', x: this.grabbedBlock.x, y: oldY };
      }
    }
  }
  



  getRandomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  renderBoard() {
    let boardHtml = "";
    for (let i = 0; i < this.boardSize.height; i++) {
      for (let j = 0; j < this.boardSize.width; j++) {
        let block = this.board[i][j];

        if (i === this.playerPos[1] && j === this.playerPos[0]) {
          boardHtml += `<div class="block" data-x="${block.x}" data-y="${block.y}"><img src="${this.playerImage.src}" class="player"></div>`;
        } else {
          const isSelected = this.grabbedBlock && this.grabbedBlock.x === j && this.grabbedBlock.y === i;
          boardHtml += `<div class="block ${block.color}${isSelected ? ' selected' : ''}" data-x="${block.x}" data-y="${block.y}" style="background-color:${block.color}"></div>`;
        }
      }
    }
    $("#board").html(boardHtml);
  }

  bindEvents() {
    $(document).keydown((event) => {
      if (event.key === 'a' || event.key === 'd') {
        this.movePlayer(event.key);
      } else if (event.key === ' ') {
        this.toggleGrabbedBlock();
      }
    });
  }

  toggleGrabbedBlock() {
    if (this.grabbedBlock) {
      // Release the grabbed block
      const newX = this.playerPos[0];
      let newY = this.playerPos[1] - 1;
      let foundColorBlock = false;
      while (newY >= 0) {
        const block = this.board[newY][newX];
        if (block.color === 'transparent') {
          newY--;
        } else {
          foundColorBlock = true;
          this.board[newY + 1][newX] = this.grabbedBlock;
          this.grabbedBlock = null;
          break;
        }
      }
      if (!foundColorBlock) {
        this.board[0][newX] = this.grabbedBlock;
        this.grabbedBlock = null;
      }
    } else {
      // Grab the block above the character
      let foundColorBlock = false;
      for (let i = this.playerPos[1] - 1; i >= 0; i--) {
        const block = this.board[i][this.playerPos[0]];
        if (block.color !== 'transparent') {
          foundColorBlock = true;
          this.grabbedBlock = block;
          this.board[i][this.playerPos[0]] = { color: 'transparent', x: this.playerPos[0], y: i };
          break;
        }
      }
      if (foundColorBlock) {
        this.renderBoardWithGrabbedBlock();
      }
    }
    console.log("Kiválasztott kocka megváltozott", this.grabbedBlock);
  }




  renderBoardWithGrabbedBlock() {
    this.renderBoard();

    if (this.grabbedBlock) {
      const blockX = this.playerPos[0];
      const blockY = this.playerPos[1] - 1;
      const blockElement = $(`.block[data-x="${blockX}"][data-y="${blockY}"]`);
      blockElement.css("background-color", this.grabbedBlock.color);
      // Frissítjük a grabbedBlock pozícióját
      this.grabbedBlock.x = blockX;
      this.grabbedBlock.y = blockY;
    }
  }


  swapBlocks(block1, block2) {
    let x1 = block1.data("x");
    let y1 = block1.data("y");
    let x2 = block2.data("x");
    let y2 = block2.data("y");
    let tempColor = block1.css("background-color");
    this.board[y1][x1].color = block2.css("background-color");
    this.board[y2][x2].color = tempColor;
    block1.css("background-color", block2.css("background-color"));
    block2.css("background-color", tempColor);
  }

  movePlayer(key) {
    const oldX = this.playerPos[0];
    const oldY = this.playerPos[1];
    if (key === 'a' && this.playerPos[0] > 0) {
      this.playerPos[0]--;
    } else if (key === 'd' && this.playerPos[0] < this.boardSize.width - 1) {
      this.playerPos[0]++;
    }
    if (this.newCycle) {
      this.shiftGrabbedBlockDown();
      this.newCycle = false;
    }

    // Frissítjük a grabbedBlock pozícióját, ha van kiválasztott kocka
    if (this.grabbedBlock) {
      this.grabbedBlock.x = this.playerPos[0];
      this.grabbedBlock.y = this.playerPos[1] - 1;
    }

    // Update grabbedBlock if necessary
    if (this.grabbedBlock && this.grabbedBlock.x === oldX && this.grabbedBlock.y === oldY) {
      this.grabbedBlock.x = this.playerPos[0];
      this.grabbedBlock.y = this.playerPos[1];
    }
    // Move the grabbed block along with the character
    if (this.grabbedBlock) {
      const newX = this.playerPos[0];
      const newY = this.playerPos[1] - 1;
      this.board[newY][newX] = this.grabbedBlock;
      this.board[newY][oldX] = { color: 'transparent', x: oldX, y: newY };
    }

    this.renderBoard();
    console.log("Játékos mozog", key, "irányba, játékos pozíció:", this.playerPos, " A Kivalasztott kocka helye:", this.grabbedBlock);
  }

  animateLine() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    this.linePos = 0;
    const lineHeight = 2;
    let newCycle = false;

    const drawLine = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "red";
      ctx.fillRect(0, 0, this.linePos, lineHeight);

      this.linePos += 2;

      if (this.linePos >= canvas.width) {
        this.linePos = 0;
        this.newCycle = true;
        this.createBoard(1);
        if (this.grabbedBlock) {
          this.shiftGrabbedBlockDown();
        }
        this.renderBoardWithGrabbedBlock();
        console.log("Piros csík végigért, új ciklus kezdődik");
      } else {
        this.newCycle = false;
      }


      window.requestAnimationFrame(drawLine);
    };

    window.requestAnimationFrame(drawLine);
  }


}

$(document).ready(function () {
  let game = new SobicsGame();
  game.start();
});
