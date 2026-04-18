import { Game } from './game.js';
import { DIRECTIONS, KEY_CODES, GRID_SIZE, TILE_COUNT } from './constants.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const scoreElement = document.getElementById('score');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const finalScoreElement = document.getElementById('finalScore');
  const restartButton = document.getElementById('restartButton');
  const startScreen = document.getElementById('startScreen');

  canvas.width = GRID_SIZE * TILE_COUNT;
  canvas.height = GRID_SIZE * TILE_COUNT;

  const game = new Game(canvas);

  game.onScoreUpdate = (score) => {
    scoreElement.textContent = score;
  };

  game.onGameOver = (score) => {
    finalScoreElement.textContent = score;
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
    startScreen.style.display = 'flex';
    game.init();
    game.draw();
  });

  startScreen.addEventListener('click', () => {
    startScreen.style.display = 'none';
    game.start();
  });
});
