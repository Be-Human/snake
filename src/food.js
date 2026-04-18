class Food {
  constructor() {
    this.position = { x: 0, y: 0 };
  }

  generate(snake) {
    let validPosition = false;
    while (!validPosition) {
      this.position.x = Math.floor(Math.random() * TILE_COUNT);
      this.position.y = Math.floor(Math.random() * TILE_COUNT);
      
      validPosition = !snake.checkCollision(this.position);
    }
  }

  draw(ctx, gridSize) {
    ctx.fillStyle = COLORS.FOOD;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.FOOD;
    
    ctx.fillRect(
      this.position.x * gridSize + 1,
      this.position.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
    
    ctx.shadowBlur = 0;
  }
}
