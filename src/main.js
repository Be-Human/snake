document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const scoreElement = document.getElementById('score');
  const highScoreElement = document.getElementById('highScore');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const finalScoreElement = document.getElementById('finalScore');
  const finalHighScoreElement = document.getElementById('finalHighScore');
  const restartButton = document.getElementById('restartButton');
  const startScreen = document.getElementById('startScreen');

  canvas.width = GRID_SIZE * TILE_COUNT;
  canvas.height = GRID_SIZE * TILE_COUNT;

  function getHighScore() {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  }

  function setHighScore(score) {
    const currentHighScore = getHighScore();
    if (score > currentHighScore) {
      localStorage.setItem('snakeHighScore', score.toString());
      return true;
    }
    return false;
  }

  function updateHighScoreDisplay() {
    const highScore = getHighScore();
    highScoreElement.textContent = highScore;
    if (finalHighScoreElement) {
      finalHighScoreElement.textContent = highScore;
    }
  }

  updateHighScoreDisplay();

  const game = new Game(canvas);

  game.onScoreUpdate = (score) => {
    scoreElement.textContent = score;
  };

  game.onGameOver = (score) => {
    const isNewHighScore = setHighScore(score);
    updateHighScoreDisplay();
    finalScoreElement.textContent = score;
    
    if (isNewHighScore && finalHighScoreElement) {
      finalHighScoreElement.textContent = score;
    }
    
    gameOverScreen.style.display = 'flex';
  };

  game.init();
  game.draw();

  document.addEventListener('keydown', (e) => {
    let direction = null;

    switch (e.keyCode) {
      case KEY_CODES.ARROW_UP:
      case KEY_CODES.W:
        direction = DIRECTIONS.UP;
        break;
      case KEY_CODES.ARROW_DOWN:
      case KEY_CODES.S:
        direction = DIRECTIONS.DOWN;
        break;
      case KEY_CODES.ARROW_LEFT:
      case KEY_CODES.A:
        direction = DIRECTIONS.LEFT;
        break;
      case KEY_CODES.ARROW_RIGHT:
      case KEY_CODES.D:
        direction = DIRECTIONS.RIGHT;
        break;
    }

    if (direction) {
      e.preventDefault();
      
      if (startScreen.style.display !== 'none') {
        startScreen.style.display = 'none';
      }
      
      game.handleKeyPress(direction);
    }
  });

  restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'none';
    game.restart();
    updateHighScoreDisplay();
  });

  startScreen.addEventListener('click', () => {
    startScreen.style.display = 'none';
    game.start();
  });
});
