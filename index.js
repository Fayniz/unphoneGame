import Player from "./Player.js";
import Ground from "./Ground.js"; 
import CactiController from "./CactiController.js";
import Score from "./Score.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

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

// Game Objects
let player1 = null;
let player2 = null;
let ground = null;
let cactiController = null;
let score = null;

// Game State
let scaleRatio = 1;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let isGameOver = false;

function createSprites() {
  const dinoRunImages1 = ["images/dino_run1.png", "images/dino_run2.png"];
  const dinoRunImages2 = ["images/dino_run2.png", "images/dino_run1.png"];

  player1 = new Player(
    ctx,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    MIN_JUMP_HEIGHT,
    MAX_JUMP_HEIGHT,
    scaleRatio,
    10 * scaleRatio,
    dinoRunImages1
  );

  player2 = new Player(
    ctx,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    MIN_JUMP_HEIGHT,
    MAX_JUMP_HEIGHT,
    scaleRatio,
    150 * scaleRatio,
    dinoRunImages2
  );

  ground = new Ground(ctx, GROUND_WIDTH, GROUND_HEIGHT, GROUND_AND_CACTUS_SPEED, scaleRatio);
  cactiController = new CactiController(ctx, CACTI_CONFIG.map(c => {
    const img = new Image();
    img.src = c.image;
    img.width = c.width;
    img.height = c.height;
    return img;
  }), scaleRatio, GROUND_AND_CACTUS_SPEED);

  score = new Score(ctx, scaleRatio);
}

function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }

  const frameTimeDelta = currentTime - previousTime;
  previousTime = currentTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isGameOver) {
    drawGameOver();
    return;
  }

  ground.update(gameSpeed, frameTimeDelta);
  ground.draw();

  cactiController.update(gameSpeed, frameTimeDelta);
  cactiController.draw();

  player1.update(frameTimeDelta);
  player1.draw();

  player2.update(frameTimeDelta);
  player2.draw();

  score.update(frameTimeDelta);
  score.draw();

  gameSpeed += GAME_SPEED_INCREMENT;

  if (cactiController.collideWithAny([player1, player2])) {
    isGameOver = true;
    score.setHighScore();
  }

  requestAnimationFrame(gameLoop);
}

function drawGameOver() {
  const fontSize = 30 * scaleRatio;
  ctx.font = `${fontSize}px serif`;
  ctx.fillStyle = "black";
  ctx.fillText("Game Over", canvas.width / 2 - fontSize * 2, canvas.height / 2);
}

createSprites();
requestAnimationFrame(gameLoop);

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyW") {
    player1.jumpPressed = true;
  } else if (event.code === "ArrowUp") {
    player2.jumpPressed = true;
  }
});
