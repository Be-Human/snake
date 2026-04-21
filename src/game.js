class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.gridSize = GRID_SIZE;
    
    this.gameMode = getCurrentGameMode();
    this.snake = new Snake(PLAYER_CONFIGS.PLAYER1);
    this.snake2 = null;
    this.foods = [];
    this.obstacles = [];
    
    this.score = 0;
    this.score2 = 0;
    this.level = 1;
    this.gameSpeed = INITIAL_SNAKE_SPEED;
    this.isGameOver = false;
    this.isPlaying = false;
    this.isPaused = false;
    this.winner = null;
    
    this.lastRenderTime = 0;
    this.animationFrameId = null;
    
    this.onScoreUpdate = null;
    this.onScore2Update = null;
    this.onLevelUpdate = null;
    this.onGameOver = null;
    this.onFoodEaten = null;
    this.onPowerupActivated = null;
    this.onPowerupDeactivated = null;
    this.onTimeUpdate = null;
    
    this.poisonFlashStartTime = 0;
    this.pauseStartTime = 0;
    
    this.powerup = null;
    this.activePowerup = null;
    this.powerupEndTime = 0;
    this.gameStartTime = 0;
    this.baseGameSpeed = INITIAL_SNAKE_SPEED;
    
    this.isClockActive = false;
    this.isGoldenBodyActive = false;
    this.isWeaponActive = false;
    this.isSpeedBoostActive = false;
    this.speedBeforeBoost = 0;
    this.keysPressed = {};
    this.isDirectionKeyHeld = false;
    this.baseSpeedBeforeHoldBoost = 0;
    
    this.isDirectionKeyHeld1 = false;
    this.isDirectionKeyHeld2 = false;
    this.lastMoveTime1 = 0;
    this.lastMoveTime2 = 0;
    
    this.isTimedMode = false;
    this.remainingTime = 0;
    this.lastTimeCheck = 0;
    this.totalSurvivalTime = 0;
    
    this.particleSystem = new ParticleSystem();
  }

  init() {
    const difficulty = getCurrentDifficulty();
    this.gameMode = getCurrentGameMode();
    
    this.score = 0;
    this.score2 = 0;
    this.level = 1;
    this.gameSpeed = difficulty.initialSpeed;
    this.baseGameSpeed = difficulty.initialSpeed;
    this.isGameOver = false;
    this.isPlaying = false;
    this.isPaused = false;
    this.winner = null;
    
    this.snake.reset();
    if (this.gameMode.id === 'multiplayer') {
      if (!this.snake2) {
        this.snake2 = new Snake(PLAYER_CONFIGS.PLAYER2);
      } else {
        this.snake2.reset();
      }
    } else {
      this.snake2 = null;
    }
    
    const currentMap = getCurrentMap();
    if (currentMap.hasPresetObstacles) {
      this.obstacles = [...currentMap.obstacles];
    } else {
      this.obstacles = [];
    }
    this.generateAllFoods(0);
    
    this.poisonFlashStartTime = 0;
    
    this.powerup = null;
    this.activePowerup = null;
    this.powerupEndTime = 0;
    this.gameStartTime = 0;
    
    this.isClockActive = false;
    this.isGoldenBodyActive = false;
    this.isWeaponActive = false;
    this.isSpeedBoostActive = false;
    this.speedBeforeBoost = 0;
    this.keysPressed = {};
    this.isDirectionKeyHeld = false;
    this.baseSpeedBeforeHoldBoost = 0;
    
    this.isDirectionKeyHeld1 = false;
    this.isDirectionKeyHeld2 = false;
    this.lastMoveTime1 = 0;
    this.lastMoveTime2 = 0;
    
    this.isTimedMode = this.gameMode.id === 'timed';
    this.remainingTime = this.isTimedMode ? TIMED_MODE_CONFIG.INITIAL_TIME : 0;
    this.lastTimeCheck = 0;
    this.totalSurvivalTime = 0;
    
    if (this.particleSystem) {
      this.particleSystem.clear();
    }
    
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
    if (this.onScore2Update) {
      this.onScore2Update(this.score2);
    }
    if (this.onLevelUpdate) {
      this.onLevelUpdate(this.level);
    }
    if (this.onPowerupDeactivated) {
      this.onPowerupDeactivated();
    }
    if (this.onTimeUpdate && this.isTimedMode) {
      this.onTimeUpdate(this.remainingTime);
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

  trySpawnPowerup(currentTime) {
    if (this.powerup !== null) {
      return;
    }
    
    const timeSinceStart = currentTime - this.gameStartTime;
    if (timeSinceStart < POWERUP_INITIAL_DELAY) {
      return;
    }
    
    if (Math.random() < POWERUP_CHANCE) {
      const randomType = Powerup.getRandomType();
      this.powerup = new Powerup(randomType);
      this.powerup.generate(this.snake, currentTime, this.foods, this.obstacles);
    }
  }

  checkExpiredPowerups(currentTime) {
    if (this.powerup && this.powerup.isExpired(currentTime)) {
      this.powerup = null;
    }
    
    if (this.activePowerup && currentTime >= this.powerupEndTime) {
      this.deactivatePowerup();
    }
  }

  activatePowerup(powerupType, currentTime) {
    if (this.activePowerup && this.activePowerup.id === powerupType.id) {
      this.powerupEndTime = currentTime + powerupType.duration;
      return;
    }
    
    if (this.activePowerup) {
      this.deactivatePowerup();
    }
    
    this.activePowerup = powerupType;
    this.powerupEndTime = currentTime + powerupType.duration;
    
    switch (powerupType.id) {
      case 'clock':
        this.isClockActive = true;
        break;
      case 'goldenBody':
        this.isGoldenBodyActive = true;
        break;
      case 'weapon':
        this.isWeaponActive = true;
        break;
      case 'speed':
        this.isSpeedBoostActive = true;
        this.speedBeforeBoost = this.gameSpeed;
        this.gameSpeed = this.gameSpeed * 1.5;
        break;
    }
    
    if (this.onPowerupActivated) {
      this.onPowerupActivated(powerupType, this.powerupEndTime - currentTime);
    }
  }

  deactivatePowerup() {
    if (!this.activePowerup) {
      return;
    }
    
    switch (this.activePowerup.id) {
      case 'clock':
        this.isClockActive = false;
        break;
      case 'goldenBody':
        this.isGoldenBodyActive = false;
        break;
      case 'weapon':
        this.isWeaponActive = false;
        break;
      case 'speed':
        this.isSpeedBoostActive = false;
        this.gameSpeed = this.speedBeforeBoost;
        this.speedBeforeBoost = 0;
        break;
    }
    
    this.activePowerup = null;
    this.powerupEndTime = 0;
    
    if (this.onPowerupDeactivated) {
      this.onPowerupDeactivated();
    }
  }

  getActivePowerupRemainingTime(currentTime) {
    if (!this.activePowerup) {
      return 0;
    }
    return Math.max(0, this.powerupEndTime - currentTime);
  }

  handlePowerupCollision(powerup, currentTime) {
    this.activatePowerup(powerup.type, currentTime);
    this.powerup = null;
  }

  start() {
    this.init();
    
    this.isPlaying = true;
    this.lastRenderTime = 0;
    this.gameStartTime = performance.now();
    this.lastTimeCheck = this.gameStartTime;
    this.totalSurvivalTime = 0;
    this.gameLoop();
  }

  gameLoop(currentTime = 0) {
    if (!this.isPlaying) return;
    
    this.animationFrameId = window.requestAnimationFrame(
      (time) => this.gameLoop(time)
    );

    const secondsSinceLastRender = (currentTime - this.lastRenderTime) / 1000;
    
    if (this.isTimedMode && !this.isPaused) {
      const secondsSinceLastTimeCheck = (currentTime - this.lastTimeCheck) / 1000;
      if (secondsSinceLastTimeCheck >= 1) {
        this.remainingTime -= Math.floor(secondsSinceLastTimeCheck);
        this.totalSurvivalTime = Math.floor((currentTime - this.gameStartTime) / 1000);
        this.lastTimeCheck = currentTime;
        
        if (this.onTimeUpdate) {
          this.onTimeUpdate(this.remainingTime);
        }
        
        if (this.remainingTime <= 0) {
          this.remainingTime = 0;
          this.gameOver();
          return;
        }
      }
    }
    
    if (this.isPaused) {
      this.draw(currentTime);
      return;
    }
    
    if (this.isClockActive) {
      this.checkExpiredPowerups(currentTime);
      this.trySpawnPowerup(currentTime);
      this.draw(currentTime);
      return;
    }
    
    const currentMode = this.gameMode;
    let effectiveGameSpeed = this.gameSpeed;
    
    if (currentMode.id === 'multiplayer') {
      effectiveGameSpeed = this.gameSpeed;
    } else {
      if (this.isDirectionKeyHeld && !this.isSpeedBoostActive) {
        if (this.baseSpeedBeforeHoldBoost === 0) {
          this.baseSpeedBeforeHoldBoost = this.gameSpeed;
        }
        this.gameSpeed = Math.min(this.baseSpeedBeforeHoldBoost * 1.5, MAX_SPEED * 1.5);
        effectiveGameSpeed = this.gameSpeed;
      } else if (!this.isDirectionKeyHeld && this.baseSpeedBeforeHoldBoost !== 0) {
        this.gameSpeed = this.baseSpeedBeforeHoldBoost;
        this.baseSpeedBeforeHoldBoost = 0;
        effectiveGameSpeed = this.gameSpeed;
      }
    }
    
    if (secondsSinceLastRender < 1 / effectiveGameSpeed) return;

    this.lastRenderTime = currentTime;

    this.update(currentTime);
    this.draw(currentTime);
  }

  update(currentTime) {
    this.checkExpiredFoods(currentTime);
    this.checkExpiredPowerups(currentTime);
    this.trySpawnPowerup(currentTime);
    
    this.snake.move();
    if (this.snake2) {
      this.snake2.move();
    }

    for (let i = this.foods.length - 1; i >= 0; i--) {
      const food = this.foods[i];
      if (this.snake.checkFoodCollision(food.position)) {
        this.handleFoodCollision(food, currentTime, this.snake, 1);
      }
      if (this.snake2 && this.snake2.checkFoodCollision(food.position)) {
        this.handleFoodCollision(food, currentTime, this.snake2, 2);
      }
    }

    if (this.powerup && this.snake.checkFoodCollision(this.powerup.position)) {
      this.handlePowerupCollision(this.powerup, currentTime);
    }

    if (this.gameMode.id === 'multiplayer') {
      this.checkMultiplayerCollision();
      if (this.isGameOver) return;
      
      if (this.isDirectionKeyHeld1 || this.isDirectionKeyHeld2) {
        this.updateMultiplayerExtraMove(currentTime);
      }
    } else {
      const hitObstacle = this.checkObstacleCollision(this.snake);
      
      if (this.snake.checkCollision() || (hitObstacle && !this.isGoldenBodyActive && !this.isWeaponActive)) {
        this.gameOver();
      }
    }
  }

  updateMultiplayerExtraMove(currentTime) {
    if (this.isDirectionKeyHeld1 && !this.isGameOver) {
      this.snake.move();
      
      for (let i = this.foods.length - 1; i >= 0; i--) {
        const food = this.foods[i];
        if (this.snake.checkFoodCollision(food.position)) {
          this.handleFoodCollision(food, currentTime, this.snake, 1);
        }
      }
      
      if (this.powerup && this.snake.checkFoodCollision(this.powerup.position)) {
        this.handlePowerupCollision(this.powerup, currentTime);
      }
      
      this.checkMultiplayerCollision();
      if (this.isGameOver) return;
    }
    
    if (this.isDirectionKeyHeld2 && !this.isGameOver && this.snake2) {
      this.snake2.move();
      
      for (let i = this.foods.length - 1; i >= 0; i--) {
        const food = this.foods[i];
        if (this.snake2.checkFoodCollision(food.position)) {
          this.handleFoodCollision(food, currentTime, this.snake2, 2);
        }
      }
      
      this.checkMultiplayerCollision();
      if (this.isGameOver) return;
    }
  }

  handleFoodCollision(food, currentTime, snake, playerNum) {
    const foodColor = getFoodColor(food.type.id);
    const foodPosition = { ...food.position };
    const scoreValue = food.type.score;
    
    if (this.isTimedMode) {
      let timeChange = 0;
      if (food.type.id === FOOD_TYPES.NORMAL.id) {
        timeChange = TIMED_MODE_CONFIG.NORMAL_FOOD_TIME_BONUS;
      } else if (food.type.id === FOOD_TYPES.GOLDEN.id) {
        timeChange = TIMED_MODE_CONFIG.GOLDEN_FOOD_TIME_BONUS;
      } else if (food.type.id === FOOD_TYPES.POISON.id) {
        timeChange = -TIMED_MODE_CONFIG.POISON_TIME_PENALTY;
      }
      
      if (timeChange !== 0) {
        this.remainingTime += timeChange;
        if (this.remainingTime < 0) {
          this.remainingTime = 0;
        }
        if (this.onTimeUpdate) {
          this.onTimeUpdate(this.remainingTime);
        }
      }
    }
    
    if (food.type.effect === 'grow') {
      snake.grow();
      if (playerNum === 1) {
        this.score += food.type.score;
        if (this.onScoreUpdate) {
          this.onScoreUpdate(this.score);
        }
      } else {
        this.score2 += food.type.score;
        if (this.onScore2Update) {
          this.onScore2Update(this.score2);
        }
      }
      this.increaseSpeed();
      this.checkLevelUp();
    } else if (food.type.effect === 'shrink') {
      snake.shrink(food.type.shrinkAmount);
      if (playerNum === 1) {
        this.score += food.type.score;
        if (this.score < 0) {
          this.score = 0;
        }
        if (this.onScoreUpdate) {
          this.onScoreUpdate(this.score);
        }
      } else {
        this.score2 += food.type.score;
        if (this.score2 < 0) {
          this.score2 = 0;
        }
        if (this.onScore2Update) {
          this.onScore2Update(this.score2);
        }
      }
      this.poisonFlashStartTime = currentTime;
    }
    
    this.replaceFood(food, currentTime);
    
    if (this.particleSystem) {
      this.particleSystem.createExplosion(foodPosition.x, foodPosition.y, foodColor, this.gridSize);
      this.particleSystem.createScoreFloat(foodPosition.x, foodPosition.y, scoreValue, foodColor);
    }
    
    if (this.onFoodEaten) {
      this.onFoodEaten(food.type);
    }
  }

  checkObstacleCollision(snake) {
    const head = snake.body[0];
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      if (head.x === obstacle.x && head.y === obstacle.y) {
        if (this.isWeaponActive) {
          this.obstacles.splice(i, 1);
          return false;
        }
        return true;
      }
    }
    return false;
  }

  checkSnakeCollision(snake, otherSnake = null) {
    if (snake.checkCollision()) {
      return true;
    }
    
    if (otherSnake) {
      const head = snake.body[0];
      for (let segment of otherSnake.body) {
        if (segment.x === head.x && segment.y === head.y) {
          return true;
        }
      }
    }
    
    return false;
  }

  checkMultiplayerCollision() {
    const snake1HitObstacle = this.checkObstacleCollision(this.snake);
    const snake2HitObstacle = this.checkObstacleCollision(this.snake2);
    
    const snake1HitSelf = this.snake.checkCollision();
    const snake2HitSelf = this.snake2.checkCollision();
    
    const snake1HitSnake2 = this.checkSnakeCollision(this.snake, this.snake2);
    const snake2HitSnake1 = this.checkSnakeCollision(this.snake2, this.snake);
    
    const snake1Dead = snake1HitSelf || (snake1HitObstacle && !this.isGoldenBodyActive && !this.isWeaponActive) || snake1HitSnake2;
    const snake2Dead = snake2HitSelf || (snake2HitObstacle && !this.isGoldenBodyActive && !this.isWeaponActive) || snake2HitSnake1;
    
    if (snake1Dead || snake2Dead) {
      if (snake1Dead && snake2Dead) {
        this.winner = 'draw';
      } else if (snake1Dead) {
        this.winner = 'player2';
      } else {
        this.winner = 'player1';
      }
      this.gameOver();
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
      const currentMap = getCurrentMap();
      if (currentMap.levelUpAddsObstacles) {
        const levelsToAdd = newLevel - this.level;
        for (let i = 0; i < levelsToAdd; i++) {
          this.addObstacles();
        }
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

  draw(currentTime = 0) {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();
    this.drawObstacles();
    for (let food of this.foods) {
      food.draw(this.ctx, this.gridSize, currentTime);
    }
    if (this.powerup) {
      this.powerup.draw(this.ctx, this.gridSize, currentTime);
    }
    this.snake.draw(this.ctx, this.gridSize);
    if (this.snake2) {
      this.snake2.draw(this.ctx, this.gridSize);
    }
    
    if (this.particleSystem) {
      this.particleSystem.update();
      this.particleSystem.draw(this.ctx, this.gridSize);
    }
    
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

    if (this.isTimedMode && this.totalSurvivalTime === 0) {
      const currentTime = performance.now();
      this.totalSurvivalTime = Math.floor((currentTime - this.gameStartTime) / 1000);
    }

    if (this.onGameOver) {
      this.onGameOver(this.score, this.score2, this.winner, this.isTimedMode, this.totalSurvivalTime);
    }
  }

  handleKeyPress(direction, playerNum = 1) {
    if (!this.isPlaying && !this.isGameOver) {
      this.start();
    }
    
    if (this.isPlaying && !this.isPaused) {
      const snake = playerNum === 1 ? this.snake : this.snake2;
      if (snake) {
        snake.changeDirection(direction);
      }
      
      if (this.isClockActive) {
        const currentTime = performance.now();
        const secondsSinceLastRender = (currentTime - this.lastRenderTime) / 1000;
        
        if (secondsSinceLastRender >= 1 / this.gameSpeed) {
          this.lastRenderTime = currentTime;
          
          this.snake.move();
          if (this.snake2) {
            this.snake2.move();
          }
          
          for (let i = this.foods.length - 1; i >= 0; i--) {
            const food = this.foods[i];
            if (this.snake.checkFoodCollision(food.position)) {
              this.handleFoodCollision(food, currentTime, this.snake, 1);
            }
            if (this.snake2 && this.snake2.checkFoodCollision(food.position)) {
              this.handleFoodCollision(food, currentTime, this.snake2, 2);
            }
          }
          
          if (this.powerup && this.snake.checkFoodCollision(this.powerup.position)) {
            this.handlePowerupCollision(this.powerup, currentTime);
          }
          
          if (this.gameMode.id === 'multiplayer') {
            this.checkMultiplayerCollision();
          } else {
            const hitObstacle = this.checkObstacleCollision(this.snake);
            
            if (this.snake.checkCollision() || (hitObstacle && !this.isGoldenBodyActive && !this.isWeaponActive)) {
              this.gameOver();
            }
          }
        }
      }
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
      if (this.powerup) {
        this.powerup.addPausedTime(pauseDuration);
      }
      if (this.activePowerup) {
        this.powerupEndTime += pauseDuration;
      }
      if (this.isTimedMode) {
        this.lastTimeCheck += pauseDuration;
      }
      this.lastRenderTime = 0;
    }
  }

  restart() {
    this.start();
  }
}
