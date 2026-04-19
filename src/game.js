class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = GRID_SIZE;
    
    this.snake = new Snake();
    this.foods = [];
    this.obstacles = [];
    
    this.score = 0;
    this.level = 1;
    this.gameSpeed = INITIAL_SNAKE_SPEED;
    this.isGameOver = false;
    this.isPlaying = false;
    this.isPaused = false;
    
    this.lastRenderTime = 0;
    this.animationFrameId = null;
    
    this.onScoreUpdate = null;
    this.onLevelUpdate = null;
    this.onGameOver = null;
    this.onFoodEaten = null;
    
    this.poisonFlashStartTime = 0;
    this.pauseStartTime = 0;
  }

  init() {
    const difficulty = getCurrentDifficulty();
    
    this.score = 0;
    this.level = 1;
    this.gameSpeed = difficulty.initialSpeed;
    this.isGameOver = false;
    this.isPlaying = false;
    this.isPaused = false;
    
    this.snake.reset();
    this.obstacles = [];
    this.generateAllFoods(0);
    
    this.poisonFlashStartTime = 0;
    
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
    if (this.onLevelUpdate) {
      this.onLevelUpdate(this.level);
    }
  }

  generateAllFoods(currentTime) {
    const difficulty = getCurrentDifficulty();
    
    this.foods = [
      new Food(FOOD_TYPES.NORMAL),
      new Food(FOOD_TYPES.GOLDEN)
    ];
    
    if (difficulty.hasPoison) {
      this.foods.push(new Food(FOOD_TYPES.POISON));
    }
    
    for (let food of this.foods) {
      food.generate(this.snake, currentTime, this.foods, this.obstacles);
    }
  }

  replaceFood(food, currentTime) {
    const index = this.foods.indexOf(food);
    if (index !== -1) {
      const newFood = new Food(food.type);
      newFood.generate(this.snake, currentTime, this.foods, this.obstacles);
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
    this.init();
    
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
    
    if (this.isPaused) {
      this.draw(currentTime);
      return;
    }
    
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

    if (this.snake.checkCollision() || this.checkObstacleCollision()) {
      this.gameOver();
    }
  }

  handleFoodCollision(food, currentTime) {
    if (food.type.effect === 'grow') {
      this.snake.grow();
      this.score += food.type.score;
      this.increaseSpeed();
      this.checkLevelUp();
    } else if (food.type.effect === 'shrink') {
      this.snake.shrink(food.type.shrinkAmount);
      this.score += food.type.score;
      if (this.score < 0) {
        this.score = 0;
      }
      this.poisonFlashStartTime = currentTime;
    }
    
    this.replaceFood(food, currentTime);
    
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
    
    if (this.onFoodEaten) {
      this.onFoodEaten(food.type);
    }
  }

  increaseSpeed() {
    if (this.gameSpeed < MAX_SPEED) {
      this.gameSpeed = Math.min(this.gameSpeed + SPEED_INCREMENT, MAX_SPEED);
    }
  }

  checkLevelUp() {
    const newLevel = Math.floor(this.score / LEVEL_UP_SCORE) + 1;
    if (newLevel > this.level) {
      const levelsToAdd = newLevel - this.level;
      for (let i = 0; i < levelsToAdd; i++) {
        this.addObstacles();
      }
      this.level = newLevel;
      if (this.onLevelUpdate) {
        this.onLevelUpdate(this.level);
      }
    }
  }

  addObstacles() {
    const difficulty = getCurrentDifficulty();
    for (let i = 0; i < difficulty.obstaclesPerLevel; i++) {
      this.addSingleObstacle();
    }
  }

  addSingleObstacle() {
    let validPosition = false;
    let attempts = 0;
    while (!validPosition && attempts < 100) {
      const x = Math.floor(Math.random() * TILE_COUNT);
      const y = Math.floor(Math.random() * TILE_COUNT);
      validPosition = this.isValidObstaclePosition(x, y);
      if (validPosition) {
        this.obstacles.push({ x, y });
      }
      attempts++;
    }
  }

  isValidObstaclePosition(x, y) {
    if (this.snake.checkCollision({ x, y })) {
      return false;
    }
    for (let food of this.foods) {
      if (food.position.x === x && food.position.y === y) {
        return false;
      }
    }
    for (let obstacle of this.obstacles) {
      if (obstacle.x === x && obstacle.y === y) {
        return false;
      }
    }
    return true;
  }

  checkObstacleCollision() {
    const head = this.snake.body[0];
    for (let obstacle of this.obstacles) {
      if (head.x === obstacle.x && head.y === obstacle.y) {
        return true;
      }
    }
    return false;
  }

  draw(currentTime = 0) {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();
    this.drawObstacles();
    for (let food of this.foods) {
      food.draw(this.ctx, this.gridSize, currentTime);
    }
    this.snake.draw(this.ctx, this.gridSize);
    
    this.drawPoisonFlash(currentTime);
    
    if (this.isPaused) {
      this.drawPauseText();
    }
  }

  drawObstacles() {
    this.ctx.fillStyle = COLORS.OBSTACLE;
    for (let obstacle of this.obstacles) {
      this.ctx.fillRect(
        obstacle.x * this.gridSize + 1,
        obstacle.y * this.gridSize + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );
    }
  }

  drawPauseText() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.font = 'bold 40px Arial';
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = COLORS.TEXT;
    
    this.ctx.fillText('PAUSED', centerX, centerY);
    
    this.ctx.font = '16px Arial';
    this.ctx.shadowBlur = 0;
    this.ctx.fillText('按空格键继续', centerX, centerY + 50);
    
    this.ctx.restore();
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
    
    if (this.isPlaying && !this.isPaused) {
      this.snake.changeDirection(direction);
    }
  }

  togglePause() {
    if (!this.isPlaying || this.isGameOver) {
      return;
    }
    this.isPaused = !this.isPaused;
    
    const currentTime = performance.now();
    
    if (this.isPaused) {
      this.pauseStartTime = currentTime;
    } else {
      const pauseDuration = currentTime - this.pauseStartTime;
      for (let food of this.foods) {
        food.addPausedTime(pauseDuration);
      }
      this.lastRenderTime = 0;
    }
  }

  restart() {
    this.start();
  }
}
