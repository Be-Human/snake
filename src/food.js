class Food {
  constructor(type = FOOD_TYPES.NORMAL) {
    this.position = { x: 0, y: 0 };
    this.type = type;
    this.spawnTime = 0;
  }

  generate(snake, currentTime = 0, existingFoods = [], obstacles = []) {
    let validPosition = false;
    let attempts = 0;
    while (!validPosition && attempts < 100) {
      this.position.x = Math.floor(Math.random() * TILE_COUNT);
      this.position.y = Math.floor(Math.random() * TILE_COUNT);
      
      validPosition = !snake.checkCollision(this.position);
      
      if (validPosition) {
        for (let food of existingFoods) {
          if (food !== this && 
              food.position.x === this.position.x && 
              food.position.y === this.position.y) {
            validPosition = false;
            break;
          }
        }
      }
      
      if (validPosition) {
        for (let obstacle of obstacles) {
          if (obstacle.x === this.position.x && obstacle.y === this.position.y) {
            validPosition = false;
            break;
          }
        }
      }
      
      attempts++;
    }
    this.spawnTime = currentTime;
  }

  isExpired(currentTime) {
    if (this.type.lifetime) {
      return currentTime - this.spawnTime > this.type.lifetime;
    }
    return false;
  }

  addPausedTime(amount) {
    this.spawnTime += amount;
  }

  shouldBlink(currentTime) {
    if (!this.type.lifetime) {
      return false;
    }
    const elapsed = currentTime - this.spawnTime;
    const remaining = this.type.lifetime - elapsed;
    return remaining > 0 && remaining <= GOLDEN_FOOD_BLINK_START;
  }

  isVisible(currentTime) {
    if (!this.shouldBlink(currentTime)) {
      return true;
    }
    const elapsed = currentTime - this.spawnTime;
    const blinkPhase = elapsed % (GOLDEN_FOOD_BLINK_INTERVAL * 2);
    return blinkPhase < GOLDEN_FOOD_BLINK_INTERVAL;
  }

  draw(ctx, gridSize, currentTime = 0) {
    if (this.shouldBlink(currentTime) && !this.isVisible(currentTime)) {
      return;
    }
    
    const foodColor = getFoodColor(this.type.id);
    ctx.fillStyle = foodColor;
    ctx.shadowBlur = 10;
    ctx.shadowColor = foodColor;
    
    ctx.fillRect(
      this.position.x * gridSize + 1,
      this.position.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
    
    ctx.shadowBlur = 0;
  }
}
