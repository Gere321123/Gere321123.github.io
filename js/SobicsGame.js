class SobicsGame {
  constructor() {
    this.score = 0;
    this.board = [];
    this.colors = ["red", "blue", "green", "yellow"];
    this.boardSize = { width: 18, height: 10 };
    this.selectedBlock = null;
    this.linePos = canvas.width;
    this.playerPos = [9, 9];
    this.playerImage = new Image();
    this.playerImage.src = "img/player.png";
    this.grabbedBlock = null;
    this.newCycle = false;
  }

  start() {
    this.createBoard(3);
    this.renderBoard();
    this.bindEvents();
    this.animateLine();
  }

  createBoard(x) {
    if (x === 3) {
      for (let i = 0; i < this.boardSize.height; i++) {
        let row = [];
        for (let j = 0; j < this.boardSize.width; j++) {
          let color = "transparent";
          if (i < 3) {
            color = this.getRandomColor();
          }
          row.push({ color: color, x: j, y: i });
        }
        this.board.push(row);
      }
    } else {
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
    }
  }
  shiftGrabbedBlockDown() {
    if (this.grabbedBlock !== null) {
      this.grabbedBlock.y--;
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
    $(document).on("click", ".block", (event) => {
      let block = $(event.currentTarget);
      if (this.selectedBlock) {
        let selectedX = this.selectedBlock.data("x");
        let selectedY = this.selectedBlock.data("y");
        let blockX = block.data("x");
        let blockY = block.data("y");

        if (
          (selectedX === blockX && Math.abs(selectedY - blockY) === 1) ||
          (selectedY === blockY && Math.abs(selectedX - blockX) === 1)
        ) {
          this.swapBlocks(this.selectedBlock, block);
        }
        this.selectedBlock.removeClass("selected");
        this.selectedBlock = null;
      } else {
        this.selectedBlock = block;
        this.selectedBlock.addClass("selected");
      }
    });

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
      if (!foundColorBlock) {
        return;
      }
    }
    this.renderBoardWithGrabbedBlock();
  }
  

  renderBoardWithGrabbedBlock() {
    this.renderBoard();
  
    if (this.grabbedBlock) {
      const blockX = this.playerPos[0];
      const blockY = this.playerPos[1] - 1;
      const blockElement = $(`.block[data-x="${blockX}"][data-y="${blockY}"]`);
      blockElement.css("background-color", this.grabbedBlock.color);
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
