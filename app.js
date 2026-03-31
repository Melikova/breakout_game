const grid = document.querySelector(".grid");
const scoreDisplay = document.querySelector("#score");

const boardWidth = grid.clientWidth;
const boardHeight = grid.clientHeight;

const ballDiameter = 20;

const blockHeight = 20;
const minBlockWidth = 80;
const blockGap = 10;
const maxBlockAreaHeight = boardHeight * 0.5;
const blockRows = Math.max(
    2,
    Math.floor(maxBlockAreaHeight / (blockHeight + blockGap))
);
const topOffset = 30;

const userWidth = 100;
const userHeight = 20;
const userStep = 20;

const ballStartX = Math.floor(boardWidth / 2) - Math.floor(ballDiameter / 2);
const ballStartY = 40;

let blockWidth = 0;
let timerId;
let xDirection = 2;
let yDirection = 2;
let score = 0;

const userStart = [Math.floor((boardWidth - userWidth) / 2), 10];
let currentPosition = [...userStart];

const ballStart = [ballStartX, ballStartY];
let ballCurrentPosition = [...ballStart];

class Block {
    constructor(x, y, width, row) {
        this.bottomLeft = [x, y];
        this.bottomRight = [x + width, y];
        this.topLeft = [x, y + blockHeight];
        this.topRight = [x + width, y + blockHeight];
        this.width = width;
        this.row = row;
    }
}

const blocks = [];

function generateBlocks() {
    const columns = Math.floor((boardWidth + blockGap) / (minBlockWidth + blockGap));
    blockWidth = Math.floor((boardWidth - (columns - 1) * blockGap) / columns);

    for (let row = 0; row < blockRows; row++) {
        for (let col = 0; col < columns; col++) {
            const x = col * (blockWidth + blockGap);
            const y = boardHeight - topOffset - blockHeight - row * (blockHeight + blockGap);

            blocks.push(new Block(x, y, blockWidth, row));
        }
    }
}

function addBlocks() {
    for (let i = 0; i < blocks.length; i++) {
        const block = document.createElement("div");
        const colorIndex = blocks[i].row % 6;

        block.classList.add("block", `row-${colorIndex}`);
        block.style.left = `${blocks[i].bottomLeft[0]}px`;
        block.style.bottom = `${blocks[i].bottomLeft[1]}px`;
        block.style.width = `${blocks[i].width}px`;
        block.style.height = `${blockHeight}px`;

        grid.appendChild(block);
    }
}

generateBlocks();
addBlocks();

const user = document.createElement("div");
user.classList.add("user");
user.style.width = `${userWidth}px`;
user.style.height = `${userHeight}px`;
drawUser();
grid.appendChild(user);

const ball = document.createElement("div");
ball.classList.add("ball");
drawBall();
grid.appendChild(ball);

function drawUser() {
    user.style.left = `${currentPosition[0]}px`;
    user.style.bottom = `${currentPosition[1]}px`;
}

function drawBall() {
    ball.style.left = `${ballCurrentPosition[0]}px`;
    ball.style.bottom = `${ballCurrentPosition[1]}px`;
}

function moveUser(e) {
    switch (e.key) {
        case "ArrowLeft":
            if (currentPosition[0] > 0) {
                currentPosition[0] -= userStep;

                if (currentPosition[0] < 0) {
                    currentPosition[0] = 0;
                }

                drawUser();
            }
            break;

        case "ArrowRight":
            if (currentPosition[0] < boardWidth - userWidth) {
                currentPosition[0] += userStep;

                if (currentPosition[0] > boardWidth - userWidth) {
                    currentPosition[0] = boardWidth - userWidth;
                }

                drawUser();
            }
            break;
    }
}

document.addEventListener("keydown", moveUser);

function moveBall() {
    ballCurrentPosition[0] += xDirection;
    ballCurrentPosition[1] += yDirection;
    drawBall();
    checkForCollisions();
}

timerId = setInterval(moveBall, 30);

function checkForCollisions() {
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        const ballHitsBlockHorizontally =
            ballCurrentPosition[0] >= block.bottomLeft[0] &&
            ballCurrentPosition[0] <= block.bottomRight[0];

        const ballHitsBlockVertically =
            ballCurrentPosition[1] + ballDiameter >= block.bottomLeft[1] &&
            ballCurrentPosition[1] <= block.topLeft[1];

        if (ballHitsBlockHorizontally && ballHitsBlockVertically) {
            const allBlocks = Array.from(document.querySelectorAll(".block"));

            allBlocks[i].remove();

            blocks.splice(i, 1);
            changeDirection();

            score++;
            scoreDisplay.innerHTML = `Score: ${score}`;

            if (blocks.length === 0) {
                scoreDisplay.innerHTML = "You won";
                clearInterval(timerId);
                document.removeEventListener("keydown", moveUser);
            }

            break;
        }
    }

    if (
        ballCurrentPosition[0] >= boardWidth - ballDiameter ||
        ballCurrentPosition[1] >= boardHeight - ballDiameter ||
        ballCurrentPosition[0] <= 0
    ) {
        changeDirection();
    }

    const ballHitsUserHorizontally =
        ballCurrentPosition[0] >= currentPosition[0] &&
        ballCurrentPosition[0] <= currentPosition[0] + userWidth;

    const ballHitsUserVertically =
        ballCurrentPosition[1] >= currentPosition[1] &&
        ballCurrentPosition[1] <= currentPosition[1] + userHeight;

    if (ballHitsUserHorizontally && ballHitsUserVertically) {
        changeDirection();
    }

    if (ballCurrentPosition[1] <= 0) {
        clearInterval(timerId);
        scoreDisplay.innerHTML = "You lost";
        document.removeEventListener("keydown", moveUser);
    }
}

function changeDirection() {
    if (xDirection === 2 && yDirection === 2) {
        yDirection = -2;
        return;
    }

    if (xDirection === 2 && yDirection === -2) {
        xDirection = -2;
        return;
    }

    if (xDirection === -2 && yDirection === -2) {
        yDirection = 2;
        return;
    }

    if (xDirection === -2 && yDirection === 2) {
        xDirection = 2;
    }
}
