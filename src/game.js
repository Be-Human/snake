import { Snake } from './snake.js';
import { Food } from './food.js';
import { GRID_SIZE, INITIAL_SNAKE_SPEED, SCORE_INCREMENT, COLORS, TILE_COUNT } from './constants.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = GRID_SIZE;
    
    this.snake = new Snake();
    this.food = new Food();
    
    this.score = 0;
    this.gameSpeed = INITIAL_SNAKE_SPEED;
    this.isGameOver = false;
    this.isPlaying = false;
    
    this.lastRenderTime = 0;
    this.animationFrameId = null;
    
    this.onScoreUpdate = null;
    this.onGameOver = null;
  }

  init() {
    this.score = 0;
    this.gameSpeed = INITIAL_SNAKE_SPEED;
    this.isGameOver = false;
    this.isPlaying = false;
    
    this.snake.reset();
    this.food.generate(this.snake);
    
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  start() {
    if (this.isGameOver) {
      this.init();
    }
    
    this.isPlaying = true;
    this.lastRenderTime = 0;
    this.gameLoop();
  }

  gameLoop(currentTime = 0) {
    if (!this.isPlaying) return;
    
    this.animationFrameId = window.requestAnimationFrame(
      (time) => this.gameLoop(time)
    );

    const secondsSinceLastRender = (currentTime - this.lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / this.gameSpeed) return;

    this.lastRenderTime = currentTime;

    this.update();
    this.draw();
  }

  update() {
    this.snake.move();

    if (this.snake.checkFoodCollision(this.food.position)) {
      this.snake.grow();
      this.score += SCORE_INCREMENT;
      this.food.generate(this.snake);
      
      if (this.onScoreUpdate) {
        this.onScoreUpdate(this.score);
      }
    }

    if (this.snake.checkCollision()) {
      this.gameOver();
    }
  }

  draw() {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();
    this.food.draw(this.ctx, this.gridSize);
    this.snake.draw(this.ctx, this.gridSize);
  }

  drawGrid() {
    this.ctx.strokeStyle = COLORS.GRID;
    this.ctx.lineWidth = 0.5;

    for (let i = 0; i <= TILE_COUNT; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.isPlaying = false;
    
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.onGameOver) {
      this.onGameOver(this.score);
    }
  }

  handleKeyPress(direction) {
    if (!this.isPlaying && !this.isGameOver) {
      this.start();
    }
    
    if (this.isPlaying) {
      this.snake.changeDirection(direction);
    }
  }

  restart() {
    this.init();
    this.start();
  }
}
