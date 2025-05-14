import Player from "./Player.js";
import Ground from "./Ground.js"; 
import CactiController from "./CactiController.js";
import Score from "./Score.js";

const canvas1 = document.getElementById("game1");
const canvas2 = document.getElementById("game2");
const ctx1 = canvas1.getContext("2d");
const ctx2 = canvas2.getContext("2d");

const GAME_SPEED_START = 1;
const GAME_SPEED_INCREMENT = 0.00001;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 200;
const PLAYER_WIDTH = 88 / 1.5;
const PLAYER_HEIGHT = 94 / 1.5;
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;
const GROUND_WIDTH = 2400;
const GROUND_HEIGHT = 24;
const GROUND_AND_CACTUS_SPEED = 0.5;

const CACTI_CONFIG = [
  { width: 48 / 1.5, height: 100 / 1.5, image: "images/cactus_1.png" },
  { width: 98 / 1.5, height: 100 / 1.5, image: "images/cactus_2.png" },
  { width: 68 / 1.5, height: 100 / 1.5, image: "images/cactus_3.png" }
];

let players = [], grounds = [], cactiControllers = [], scores = [];
let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameOver = false;
let waitingToStart = true;
let hasAddedEventListenerForRestart = false;

function createGame(canvas, ctx) {
  const playerWidth = PLAYER_WIDTH * scaleRatio;
  const playerHeight = PLAYER_HEIGHT * scaleRatio;
  const minJump = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJump = MAX_JUMP_HEIGHT * scaleRatio;

  const groundWidth = GROUND_WIDTH * scaleRatio;
  const groundHeight = GROUND_HEIGHT * scaleRatio;

  const player = new Player(ctx, playerWidth, playerHeight, minJump, maxJump, scaleRatio);
  const ground = new Ground(ctx, groundWidth, groundHeight, GROUND_AND_CACTUS_SPEED, scaleRatio);
  const cactiImages = CACTI_CONFIG.map(cactus => {
    const image = new Image();
    image.src = cactus.image;
    return {
      image: image,
      width: cactus.width * scaleRatio,
      height: cactus.height * scaleRatio
    };
  });
  const cactiController = new CactiController(ctx, cactiImages, scaleRatio, GROUND_AND_CACTUS_SPEED);
  const score = new Score(ctx, scaleRatio);

  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;

  return { player, ground, cactiController, score };
}

function setScreen() {
  scaleRatio = getScaleRatio();
  players = [];
  grounds = [];
  cactiControllers = [];
  scores = [];

  [
    { canvas: canvas1, ctx: ctx1 },
    { canvas: canvas2, ctx: ctx2 }
  ].forEach(({ canvas, ctx }) => {
    const { player, ground, cactiController, score } = createGame(canvas, ctx);
    players.push(player);
    grounds.push(ground);
    cactiControllers.push(cactiController);
    scores.push(score);
  });
}

function getScaleRatio() {
  const screenHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
  const screenWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
  return screenWidth / 2 / GAME_WIDTH;
}

function showGameOver(ctx, canvas) {
  const fontSize = 70 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "Grey";
  ctx.fillText("Game Over", canvas.width / 4.5, canvas.height / 2);
}

function setupGameReset() {
  if (!hasAddedEventListenerForRestart) {
    hasAddedEventListenerForRestart = true;
    setTimeout(() => {
      window.addEventListener("keyup", reset, { once: true });
      window.addEventListener("touchstart", reset, { once: true });
    }, 1000);
  }
}

function reset() {
  hasAddedEventListenerForRestart = false;
  gameOver = false;
  waitingToStart = false;
  grounds.forEach(g => g.reset());
  cactiControllers.forEach(c => c.reset());
  scores.forEach(s => s.reset());
  gameSpeed = GAME_SPEED_START;
}

function showStartGameText(ctx, canvas) {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "Grey";
  ctx.fillText("Tap or Press Space to Start", canvas.width / 14, canvas.height / 2);
}

function updateGameSpeed(frameTimeDelta) {
  gameSpeed += frameTimeDelta * GAME_SPEED_INCREMENT;
}

function clearScreen(ctx, canvas) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }
  const frameTimeDelta = currentTime - previousTime;
  previousTime = currentTime;

  for (let i = 0; i < players.length; i++) {
    const ctx = [ctx1, ctx2][i];
    const canvas = [canvas1, canvas2][i];
    clearScreen(ctx, canvas);

    if (!gameOver && !waitingToStart) {
      grounds[i].update(gameSpeed, frameTimeDelta);
      cactiControllers[i].update(gameSpeed, frameTimeDelta);
      players[i].update(gameSpeed, frameTimeDelta);
      scores[i].update(frameTimeDelta);
      updateGameSpeed(frameTimeDelta);
    }

    if (!gameOver && cactiControllers[i].collideWith(players[i])) {
      gameOver = true;
      setupGameReset();
      scores[i].setHighScore();
    }

    grounds[i].draw();
    cactiControllers[i].draw();
    players[i].draw();
    scores[i].draw();

    if (gameOver) showGameOver(ctx, canvas);
    if (waitingToStart) showStartGameText(ctx, canvas);
  }

  requestAnimationFrame(gameLoop);
}

setScreen();
window.addEventListener("resize", () => setTimeout(setScreen, 500));
if (screen.orientation) screen.orientation.addEventListener("change", setScreen);
window.addEventListener("keyup", reset, { once: true });
window.addEventListener("touchstart", reset, { once: true });

// Add custom key controls for each player
window.addEventListener("keydown", (event) => {
  if (event.code === "KeyZ") {
    players[0].jumpPressed = true; // Player 1 uses Z
  } else if (event.code === "KeyM") {
    players[1].jumpPressed = true; // Player 2 uses M
  }
});

requestAnimationFrame(gameLoop);