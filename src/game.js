class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = GRID_SIZE;
    
    this.snake = new Snake();
    this.foods = [];
    
    this.score = 0;
    this.gameSpeed = INITIAL_SNAKE_SPEED;
    this.isGameOver = false;
    this.isPlaying = false;
    
    this.lastRenderTime = 0;
    this.animationFrameId = null;
    
    this.onScoreUpdate = null;
    this.onGameOver = null;
    
    this.poisonFlashStartTime = 0;
  }

  init() {
    this.score = 0;
    this.gameSpeed = INITIAL_SNAKE_SPEED;
    this.isGameOver = false;
    this.isPlaying = false;
    
    this.snake.reset();
    this.generateAllFoods(0);
    
    this.poisonFlashStartTime = 0;
    
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  generateAllFoods(currentTime) {
    this.foods = [
      new Food(FOOD_TYPES.NORMAL),
      new Food(FOOD_TYPES.GOLDEN),
      new Food(FOOD_TYPES.POISON)
    ];
    
    for (let food of this.foods) {
      food.generate(this.snake, currentTime, this.foods);
    }
  }

  replaceFood(food, currentTime) {
    const index = this.foods.indexOf(food);
    if (index !== -1) {
      const newFood = new Food(food.type);
      newFood.generate(this.snake, currentTime, this.foods);
      this.foods[index] = newFood;
    }
  }

  checkExpiredFoods(currentTime) {
    for (let i = this.foods.length - 1; i >= 0; i--) {
      const food = this.foods[i];
      if (food.isExpired(currentTime)) {
        this.replaceFood(food, currentTime);
      }
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

    this.update(currentTime);
    this.draw(currentTime);
  }

  update(currentTime) {
    this.checkExpiredFoods(currentTime);
    
    this.snake.move();

    for (let i = this.foods.length - 1; i >= 0; i--) {
      const food = this.foods[i];
      if (this.snake.checkFoodCollision(food.position)) {
        this.handleFoodCollision(food, currentTime);
      }
    }

    if (this.snake.checkCollision()) {
      this.gameOver();
    }
  }

  handleFoodCollision(food, currentTime) {
    if (food.type.effect === 'grow') {
      this.snake.grow();
      this.score += food.type.score;
      this.increaseSpeed();
    } else if (food.type.effect === 'shrink') {
      this.snake.shrink(food.type.shrinkAmount);
      this.score += food.type.score;
      this.poisonFlashStartTime = currentTime;
    }
    
    this.replaceFood(food, currentTime);
    
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  increaseSpeed() {
    if (this.gameSpeed < MAX_SPEED) {
      this.gameSpeed = Math.min(this.gameSpeed + SPEED_INCREMENT, MAX_SPEED);
    }
  }

  draw(currentTime = 0) {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();
    for (let food of this.foods) {
      food.draw(this.ctx, this.gridSize, currentTime);
    }
    this.snake.draw(this.ctx, this.gridSize);
    
    this.drawPoisonFlash(currentTime);
  }

  drawPoisonFlash(currentTime) {
    if (this.poisonFlashStartTime === 0) {
      return;
    }
    
    const elapsed = currentTime - this.poisonFlashStartTime;
    if (elapsed >= POISON_FLASH_DURATION) {
      return;
    }
    
    const flashProgress = elapsed / POISON_FLASH_DURATION;
    const alpha = 0.3 * (1 - flashProgress);
    
    this.ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
