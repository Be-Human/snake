const GRID_SIZE = 20;
const TILE_COUNT = 20;
const INITIAL_SNAKE_SPEED = 5;
const SPEED_INCREMENT = 0.5;
const MAX_SPEED = 15;

const GOLDEN_FOOD_BLINK_START = 3000;
const GOLDEN_FOOD_BLINK_INTERVAL = 200;
const POISON_PENALTY_SCORE = -20;
const POISON_FLASH_DURATION = 500;
const POISON_FLASH_COLOR = 'rgba(255, 0, 0, 0.3)';

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
    score: POISON_PENALTY_SCORE,
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
  D: 68,
  SPACE: 32
};

const LEVEL_UP_SCORE = 100;
const OBSTACLES_PER_LEVEL = 3;

const SKINS = {
  CLASSIC: {
    id: 'classic',
    name: '经典',
    canvas: {
      BACKGROUND: '#1a1a2e',
      GRID: '#16213e',
      SNAKE_HEAD: '#00ff88',
      SNAKE_BODY: '#00cc6a',
      OBSTACLE: '#6c757d',
      TEXT: '#ffffff'
    },
    css: {
      bodyBg: '#0f0f1e',
      primary: '#00ff88',
      text: '#ffffff',
      secondary: '#aaa',
      accent: '#ff6b6b',
      overlayBg: 'rgba(15, 15, 30, 0.9)',
      cardBg: 'rgba(15, 15, 30, 0.8)'
    },
    foodColors: {
      NORMAL: '#ff6b6b',
      GOLDEN: '#ffd700',
      POISON: '#9b59b6'
    }
  },
  NEON: {
    id: 'neon',
    name: '霓虹',
    canvas: {
      BACKGROUND: '#0a0a1a',
      GRID: '#1a1a3a',
      SNAKE_HEAD: '#00ffff',
      SNAKE_BODY: '#00cccc',
      OBSTACLE: '#ff4500',
      TEXT: '#ffffff'
    },
    css: {
      bodyBg: '#1a0a2e',
      primary: '#00ffff',
      text: '#ffffff',
      secondary: '#aaa',
      accent: '#ff69b4',
      overlayBg: 'rgba(10, 10, 26, 0.95)',
      cardBg: 'rgba(26, 10, 46, 0.8)'
    },
    foodColors: {
      NORMAL: '#ff69b4',
      GOLDEN: '#ffff00',
      POISON: '#ff00ff'
    }
  },
  MINIMAL: {
    id: 'minimal',
    name: '极简',
    canvas: {
      BACKGROUND: '#f8f9fa',
      GRID: '#e9ecef',
      SNAKE_HEAD: '#212529',
      SNAKE_BODY: '#495057',
      OBSTACLE: '#6c757d',
      TEXT: '#212529'
    },
    css: {
      bodyBg: '#ffffff',
      primary: '#212529',
      text: '#212529',
      secondary: '#6c757d',
      accent: '#dc3545',
      overlayBg: 'rgba(255, 255, 255, 0.95)',
      cardBg: 'rgba(248, 249, 250, 0.9)'
    },
    foodColors: {
      NORMAL: '#dc3545',
      GOLDEN: '#ffc107',
      POISON: '#6f42c1'
    }
  }
};

let CURRENT_SKIN = SKINS.CLASSIC;

function getCurrentSkin() {
  return CURRENT_SKIN;
}

function setCurrentSkin(skinId) {
  for (const skinKey in SKINS) {
    if (SKINS[skinKey].id === skinId) {
      CURRENT_SKIN = SKINS[skinKey];
      return true;
    }
  }
  return false;
}

function getSkinColors() {
  const skin = getCurrentSkin();
  return skin.canvas;
}

function getFoodColor(foodTypeId) {
  const skin = getCurrentSkin();
  return skin.foodColors[foodTypeId] || FOOD_TYPES[foodTypeId]?.color || '#ff6b6b';
}

const COLORS = {
  get BACKGROUND() { return getSkinColors().BACKGROUND; },
  get GRID() { return getSkinColors().GRID; },
  get SNAKE_HEAD() { return getSkinColors().SNAKE_HEAD; },
  get SNAKE_BODY() { return getSkinColors().SNAKE_BODY; },
  get OBSTACLE() { return getSkinColors().OBSTACLE; },
  get TEXT() { return getSkinColors().TEXT; }
};
