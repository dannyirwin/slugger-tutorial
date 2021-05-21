const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const numOfCells = 16;
const sideLength = 600;
const scale = sideLength / numOfCells;
const backgroundColor = "#c3faa2";

function resizeCanvas() {
  canvas.height = sideLength;
  canvas.width = sideLength;
}

function drawBackground() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, sideLength, sideLength);
  ctx.fillStyle = "rgba(255,255,255, 0.2)";

  for (let i = 0; i < numOfCells; i += 2) {
    for (let j = 0; j < numOfCells; j += 2) {
      ctx.fillRect(i * scale, j * scale, scale, scale);
      ctx.fillRect((i + 1) * scale, (j + 1) * scale, scale, scale);
    }
  }
}

function cellPosToCanvasPos(positionArray) {
  const x = Math.floor(positionArray[0] * scale + scale * 0.5);
  const y = Math.floor(positionArray[1] * scale + scale * 0.5);
  return [x, y];
}

//---- part 4 vvv

function Slug(
  color = "salmon",
  x = Math.floor(numOfCells / 2),
  y = Math.floor(numOfCells / 2)
) {
  return {
    color: color,
    direction: "north",
    bellyPositions: [], //new
    isDigesting: false, //new
    segmentPositions: [
      [x, y],
      [x, y + 1],
      [x, y + 2],
    ],
    update: function () {
      this.checkCollision();
      this.moveSlug();
      this.handleDigestion(); //<<NEw
      this.drawSlug();
      this.drawBelly(); //<new
    },
    drawSlug: function () {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = scale * 0.8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      this.segmentPositions.forEach((segmentPosition, index) => {
        const position = cellPosToCanvasPos(segmentPosition);
        if (index === 0) {
          ctx.moveTo(position[0], position[1]);
        } else {
          ctx.lineTo(position[0], position[1]);
        }
      });
      ctx.stroke();
    },
    drawBelly: function () {
      //<<new
      if (this.isDigesting) {
        ctx.fillStyle = this.color;
        this.bellyPositions.forEach(position => {
          position = cellPosToCanvasPos(position);
          ctx.beginPath();
          ctx.arc(position[0], position[1], scale * 0.5, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    },
    moveSlug: function () {
      this.segmentPositions.pop();
      this.segmentPositions.unshift(this.findNextPosition());
    },
    findNextPosition: function (direction = this.direction) {
      const firstSegment = this.segmentPositions[0];
      let newSegment = [];
      switch (direction) {
        case "north":
          newSegment[0] = firstSegment[0];
          newSegment[1] = firstSegment[1] - 1;
          break;
        case "west":
          newSegment[0] = firstSegment[0] - 1;
          newSegment[1] = firstSegment[1];
          break;
        case "south":
          newSegment[0] = firstSegment[0];
          newSegment[1] = firstSegment[1] + 1;
          break;
        case "east":
          newSegment[0] = firstSegment[0] + 1;
          newSegment[1] = firstSegment[1];
          break;
      }
      return newSegment;
    },
    checkCollision: function () {
      const nextPosition = this.findNextPosition();
      const nextSegmentPositions = [...this.segmentPositions];
      nextSegmentPositions.pop();
      const collideWithSelf = nextSegmentPositions.some(
        position =>
          position[0] == nextPosition[0] && position[1] == nextPosition[1]
      );
      const collideWithEdge =
        nextPosition[0] < 0 ||
        nextPosition[0] > numOfCells - 1 ||
        nextPosition[1] < 0 ||
        nextPosition[1] > numOfCells - 1;
      const collideWithSnack =
        nextPosition[0] == snack.position[0] &&
        nextPosition[1] == snack.position[1]; //<PART 5

      if (collideWithSelf || collideWithEdge) {
        isPaused = true;
        gameOver();
      } else if (collideWithSnack) {
        //<PART 5
        this.handleEatSnack();
      }
    },
    handleEatSnack: function () {
      //NEW
      this.bellyPositions.push(snack.position);
      this.isDigesting = true;
      snack.handleEaten();
    },
    handleMovementInput: function (direction) {
      const nextPosition = this.findNextPosition(direction);
      const canMoveThere = !this.segmentPositions.some(
        position =>
          position[0] == nextPosition[0] && position[1] == nextPosition[1]
      );
      if (canMoveThere) {
        this.direction = direction;
      }
    },
    handleDigestion: function () {
      //<<New
      if (this.isDigesting) {
        const tempPositions = [...this.bellyPositions];
        tempPositions.forEach(position => {
          const finalSegment =
            this.segmentPositions[this.segmentPositions.length - 1];
          if (
            position[0] === finalSegment[0] &&
            position[1] === finalSegment[1]
          ) {
            this.segmentPositions.push(position);
            this.bellyPositions.shift();
            if (this.bellyPositions.length == 0) {
              this.isDigesting = false;
            }
          }
        });
      }
    },
  };
}

/* class Slug {
  constructor(
    color = "salmon",
    x = Math.floor(numOfCells / 2),
    y = Math.floor(numOfCells / 2)
  ) {
    this.color = color;
    this.direction = "north";
    this.bellyPositions = []; //NeW
    this.isDigesting = false; //New
    this.segmentPositions = [
      [x, y],
      [x, y + 1],
      [x, y + 2],
    ];
  }
  update() {
    this.checkCollision();
    this.moveSlug();
    this.handleDigestion(); //<<NEw
    this.drawSlug();
    this.drawBelly(); //<new
  }
  drawSlug() {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = scale * 0.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    this.segmentPositions.forEach((segmentPosition, index) => {
      const position = cellPosToCanvasPos(segmentPosition);
      if (index === 0) {
        ctx.moveTo(position[0], position[1]);
      } else {
        ctx.lineTo(position[0], position[1]);
      }
    });
    ctx.stroke();
  }
  drawBelly() {
    //<<new
    if (this.isDigesting) {
      ctx.fillStyle = this.color;
      this.bellyPositions.forEach(position => {
        position = cellPosToCanvasPos(position);
        ctx.beginPath();
        ctx.arc(position[0], position[1], scale * 0.5, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }
  moveSlug() {
    this.segmentPositions.pop();
    this.segmentPositions.unshift(this.findNextPosition());
  }
  findNextPosition(direction = this.direction) {
    const firstSegment = this.segmentPositions[0];
    let newSegment = [];
    switch (direction) {
      case "north":
        newSegment[0] = firstSegment[0];
        newSegment[1] = firstSegment[1] - 1;
        break;
      case "west":
        newSegment[0] = firstSegment[0] - 1;
        newSegment[1] = firstSegment[1];
        break;
      case "south":
        newSegment[0] = firstSegment[0];
        newSegment[1] = firstSegment[1] + 1;
        break;
      case "east":
        newSegment[0] = firstSegment[0] + 1;
        newSegment[1] = firstSegment[1];
        break;
    }
    return newSegment;
  }
  checkCollision() {
    const nextPosition = this.findNextPosition();
    const nextSegmentPositions = [...this.segmentPositions];
    nextSegmentPositions.pop();
    const collideWithSelf = nextSegmentPositions.some(
      position =>
        position[0] == nextPosition[0] && position[1] == nextPosition[1]
    );
    const collideWithEdge =
      nextPosition[0] < 0 ||
      nextPosition[0] > numOfCells ||
      nextPosition[1] < 0 ||
      nextPosition[1] > numOfCells;
    const collideWithSnack =
      nextPosition[0] == snack.position[0] &&
      nextPosition[1] == snack.position[1]; //<PART 5

    if (collideWithSelf || collideWithEdge) {
      isPaused = true;
      gameOver();
    } else if (collideWithSnack) {
      //<PART 5
      this.handleEatSnack();
    }
  }
  handleEatSnack() {
    //NEW
    this.bellyPositions.push(snack.position);
    this.isDigesting = true;
    snack.handleEaten();
  }
  handleMovementInput(direction) {
    const nextPosition = this.findNextPosition(direction);
    const canMoveThere = !this.segmentPositions.some(
      position =>
        position[0] == nextPosition[0] && position[1] == nextPosition[1]
    );
    if (canMoveThere) {
      this.direction = direction;
    }
  }
  handleDigestion() {
    //<<New

    if (this.isDigesting) {
      const tempPositions = [...this.bellyPositions];
      tempPositions.forEach(position => {
        const finalSegment =
          this.segmentPositions[this.segmentPositions.length - 1];
        if (
          position[0] === finalSegment[0] &&
          position[1] === finalSegment[1]
        ) {
          this.segmentPositions.push(position);
          this.bellyPositions.shift();
          if (this.bellyPositions.length == 0) {
            this.isDigesting = false;
          }
        }
      });
    }
  }
} 

let slug = new Slug(); */

let slug = Slug();

// part 4 ^^^

// part 5 vvv

function Snack(color = "#66b8ff") {
  const newSnack = {
    color: color,
    position: [0, 0],
    randomizePosition: function () {
      const slugPositions = [slug.findNextPosition()].concat(
        slug.segmentPositions
      );
      const randomX = Math.floor(Math.random() * numOfCells);
      const randomY = Math.floor(Math.random() * numOfCells);
      if (slugPositions.length - 2 == numOfCells ** 2) {
        gameOver("You WIN!");
      } else if (
        slugPositions.some(
          position => position[0] === randomX && position[1] === randomY
        )
      ) {
        this.randomizePosition();
      } else {
        this.position = [randomX, randomY];
      }
    },
    drawSnack: function () {
      const position = cellPosToCanvasPos(this.position);

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(position[0], position[1], scale * 0.3, 0, 2 * Math.PI);
      ctx.fill();
    },
    handleEaten: function () {
      snack = Snack();
    },
  };
  newSnack.randomizePosition();
  return newSnack;
}

let snack = Snack();

function gameOver(message = "Game Over") {
  isPaused = true;
  slug = Slug();
  snack = Snack();
  drawBackground();
  alert(message);
}

//part 5 ^^^

let isPaused = true;
const fps = 5;
const fpsInterval = 1000 / fps;
let now, then, delta;

function startGame(fps) {
  then = window.performance.now();
  requestAnimationFrame(update);
}

function update() {
  now = window.performance.now();
  delta = now - then;

  if (delta > fpsInterval) {
    then = now - (delta % fpsInterval);
    drawBackground();
    slug.update();
    snack.drawSnack();
  }
  !isPaused && requestAnimationFrame(update);
}

function init() {
  resizeCanvas();
  drawBackground();
  startGame();
}

window.addEventListener("load", init);

document.addEventListener("keydown", event => {
  const key = event.key.toLocaleLowerCase();
  switch (key) {
    case " ":
      isPaused && update();
      break;
    case "p":
      isPaused = !isPaused;
      !isPaused && requestAnimationFrame(update);
      break;
    case "w":
    case "arrowup":
      slug.handleMovementInput("north");
      break;
    case "s":
    case "arrowdown":
      slug.handleMovementInput("south");
      break;
    case "a":
    case "arrowleft":
      slug.handleMovementInput("west");
      break;
    case "d":
    case "arrowright":
      slug.handleMovementInput("east");
      break;
  }
});
