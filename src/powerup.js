class Powerup {
  constructor(type = null) {
    this.position = { x: 0, y: 0 };
    this.type = type;
    this.spawnTime = 0;
  }

  static getRandomType() {
    const types = Object.values(POWERUP_TYPES);
    return types[Math.floor(Math.random() * types.length)];
  }

  generate(snake, currentTime = 0, existingFoods = [], obstacles = [], existingPowerup = null) {
    let validPosition = false;
    let attempts = 0;
    while (!validPosition && attempts < 100) {
      this.position.x = Math.floor(Math.random() * TILE_COUNT);
      this.position.y = Math.floor(Math.random() * TILE_COUNT);
      
      validPosition = !snake.checkCollision(this.position);
      
      if (validPosition) {
        for (let food of existingFoods) {
          if (food.position.x === this.position.x && food.position.y === this.position.y) {
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
      
      if (validPosition && existingPowerup) {
        if (existingPowerup.position.x === this.position.x && existingPowerup.position.y === this.position.y) {
          validPosition = false;
        }
      }
      
      attempts++;
    }
    this.spawnTime = currentTime;
  }

  isExpired(currentTime) {
    return currentTime - this.spawnTime > POWERUP_LIFETIME;
  }

  addPausedTime(amount) {
    this.spawnTime += amount;
  }

  shouldBlink(currentTime) {
    const elapsed = currentTime - this.spawnTime;
    const remaining = POWERUP_LIFETIME - elapsed;
    return remaining > 0 && remaining <= POWERUP_BLINK_START;
  }

  isVisible(currentTime) {
    if (!this.shouldBlink(currentTime)) {
      return true;
    }
    const elapsed = currentTime - this.spawnTime;
    const blinkPhase = elapsed % (POWERUP_BLINK_INTERVAL * 2);
    return blinkPhase < POWERUP_BLINK_INTERVAL;
  }

  draw(ctx, gridSize, currentTime = 0) {
    if (this.shouldBlink(currentTime) && !this.isVisible(currentTime)) {
      return;
    }
    
    const powerupColor = getPowerupColor(this.type.id);
    ctx.fillStyle = powerupColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = powerupColor;
    
    ctx.fillRect(
      this.position.x * gridSize + 1,
      this.position.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
    
    ctx.shadowBlur = 0;
    
    ctx.font = `${gridSize - 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      this.type.icon,
      this.position.x * gridSize + gridSize / 2,
      this.position.y * gridSize + gridSize / 2
    );
  }
}
