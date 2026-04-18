const GRID_SIZE = 20;
const TILE_COUNT = 20;
const INITIAL_SNAKE_SPEED = 5;
const SPEED_INCREMENT = 0.5;
const MAX_SPEED = 15;

const FOOD_TYPES = {
  NORMAL: {
    id: 'normal',
    score: 10,
    color: '#ff6b6b',
    effect: 'grow'
  },
  GOLDEN: {
    id: 'golden',
    score: 30,
    color: '#ffd700',
    effect: 'grow',
    lifetime: 5000
  },
  POISON: {
    id: 'poison',
    score: 0,
    color: '#9b59b6',
    effect: 'shrink',
    shrinkAmount: 3
  }
};

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const KEY_CODES = {
  ARROW_UP: 38,
  ARROW_DOWN: 40,
  ARROW_LEFT: 37,
  ARROW_RIGHT: 39,
  W: 87,
  A: 65,
  S: 83,
  D: 68
};

const COLORS = {
  BACKGROUND: '#1a1a2e',
  GRID: '#16213e',
  SNAKE_HEAD: '#00ff88',
  SNAKE_BODY: '#00cc6a',
  FOOD: '#ff6b6b',
  GOLDEN_FOOD: '#ffd700',
  POISON_FOOD: '#9b59b6',
  TEXT: '#ffffff'
};
