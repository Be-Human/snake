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
    this.body.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? COLORS.SNAKE_HEAD : COLORS.SNAKE_BODY;
      
      if (index === 0) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.SNAKE_HEAD;
      }
      
      ctx.fillRect(
        segment.x * gridSize + 1,
        segment.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
      );
      
      ctx.shadowBlur = 0;
    });
  }
}
