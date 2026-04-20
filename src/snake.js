class Snake {
  constructor() {
    this.reset();
  }

  reset() {
    this.body = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    this.direction = DIRECTIONS.RIGHT;
    this.nextDirection = DIRECTIONS.RIGHT;
    this.growNext = false;
  }

  changeDirection(newDirection) {
    if (this.isOppositeDirection(newDirection)) {
      return;
    }
    this.nextDirection = newDirection;
  }

  isOppositeDirection(newDirection) {
    return (
      (newDirection.x === -this.direction.x && newDirection.x !== 0) ||
      (newDirection.y === -this.direction.y && newDirection.y !== 0)
    );
  }

  move() {
    this.direction = this.nextDirection;
    
    const head = { ...this.body[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;

    this.body.unshift(head);

    if (this.growNext) {
      this.growNext = false;
    } else {
      this.body.pop();
    }
  }

  grow() {
    this.growNext = true;
  }

  shrink(amount) {
    const minLength = 1;
    for (let i = 0; i < amount && this.body.length > minLength; i++) {
      this.body.pop();
    }
  }

  checkCollision(position = null) {
    const pos = position || this.body[0];
    
    if (pos.x < 0 || pos.x >= TILE_COUNT || pos.y < 0 || pos.y >= TILE_COUNT) {
      return true;
    }

    if (position) {
      for (let segment of this.body) {
        if (segment.x === pos.x && segment.y === pos.y) {
          return true;
        }
      }
    } else {
      for (let i = 1; i < this.body.length; i++) {
        if (this.body[i].x === pos.x && this.body[i].y === pos.y) {
          return true;
        }
      }
    }

    return false;
  }

  checkFoodCollision(foodPosition) {
    const head = this.body[0];
    return head.x === foodPosition.x && head.y === foodPosition.y;
  }

  draw(ctx, gridSize) {
    const stage = getSnakeGrowthStage(this.body.length);
    const skinColors = getSkinColors();
    
    this.body.forEach((segment, index) => {
      const isHead = index === 0;
      let fillColor;
      
      if (isHead) {
        fillColor = getStageHeadColor(stage, skinColors);
      } else {
        fillColor = getStageBodyColor(stage, skinColors, index);
      }
      
      ctx.fillStyle = fillColor;
      
      if (isHead) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = fillColor;
      }
      
      ctx.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
      );
      
      ctx.shadowBlur = 0;
      
      if (isHead && stage.hasEyes) {
        this.drawEyes(ctx, segment, gridSize, stage);
      }
    });
  }

  drawEyes(ctx, head, gridSize, stage) {
    const eyeSize = gridSize / 4;
    const pupilSize = eyeSize / 2;
    const headX = head.x * gridSize;
    const headY = head.y * gridSize;
    
    let eye1X, eye1Y, eye2X, eye2Y;
    let pupilOffsetX, pupilOffsetY;
    
    if (this.direction.x === 1) {
      eye1X = headX + gridSize * 0.75;
      eye1Y = headY + gridSize * 0.3;
      eye2X = headX + gridSize * 0.75;
      eye2Y = headY + gridSize * 0.7;
      pupilOffsetX = eyeSize / 3;
      pupilOffsetY = 0;
    } else if (this.direction.x === -1) {
      eye1X = headX + gridSize * 0.25;
      eye1Y = headY + gridSize * 0.3;
      eye2X = headX + gridSize * 0.25;
      eye2Y = headY + gridSize * 0.7;
      pupilOffsetX = -eyeSize / 3;
      pupilOffsetY = 0;
    } else if (this.direction.y === 1) {
      eye1X = headX + gridSize * 0.3;
      eye1Y = headY + gridSize * 0.75;
      eye2X = headX + gridSize * 0.7;
      eye2Y = headY + gridSize * 0.75;
      pupilOffsetX = 0;
      pupilOffsetY = eyeSize / 3;
    } else {
      eye1X = headX + gridSize * 0.3;
      eye1Y = headY + gridSize * 0.25;
      eye2X = headX + gridSize * 0.7;
      eye2Y = headY + gridSize * 0.25;
      pupilOffsetX = 0;
      pupilOffsetY = -eyeSize / 3;
    }
    
    ctx.fillStyle = stage.eyeColor;
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = stage.pupilColor;
    ctx.beginPath();
    ctx.arc(eye1X + pupilOffsetX, eye1Y + pupilOffsetY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(eye2X + pupilOffsetX, eye2Y + pupilOffsetY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
  }
}
