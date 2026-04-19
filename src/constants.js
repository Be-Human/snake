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

const POWERUP_CHANCE = 0.01;
const POWERUP_INITIAL_DELAY = 10000;
const POWERUP_LIFETIME = 15000;
const POWERUP_BLINK_START = 5000;
const POWERUP_BLINK_INTERVAL = 300;

const POWERUP_TYPES = {
  CLOCK: {
    id: 'clock',
    name: '时钟',
    description: '按住方向键才移动，松开停止',
    icon: '⏰',
    duration: 10000
  },
  GOLDEN_BODY: {
    id: 'goldenBody',
    name: '金身',
    description: '可穿透障碍物而不死亡',
    icon: '🛡️',
    duration: 8000
  },
  WEAPON: {
    id: 'weapon',
    name: '武器',
    description: '撞到障碍物时消除该障碍',
    icon: '⚔️',
    duration: 12000
  },
  SPEED: {
    id: 'speed',
    name: '加速',
    description: '移动速度临时提升50%',
    icon: '⚡',
    duration: 8000
  }
};

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

const DIFFICULTIES = {
  EASY: {
    id: 'easy',
    name: '简单',
    initialSpeed: 3,
    obstaclesPerLevel: 1,
    hasPoison: false
  },
  NORMAL: {
    id: 'normal',
    name: '普通',
    initialSpeed: 5,
    obstaclesPerLevel: 3,
    hasPoison: true
  },
  HARD: {
    id: 'hard',
    name: '困难',
    initialSpeed: 8,
    obstaclesPerLevel: 5,
    hasPoison: true
  }
};

let CURRENT_DIFFICULTY = DIFFICULTIES.NORMAL;

function getCurrentDifficulty() {
  return CURRENT_DIFFICULTY;
}

function setCurrentDifficulty(difficultyId) {
  for (const diffKey in DIFFICULTIES) {
    if (DIFFICULTIES[diffKey].id === difficultyId) {
      CURRENT_DIFFICULTY = DIFFICULTIES[diffKey];
      return true;
    }
  }
  return false;
}

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
      cardBg: 'rgba(15, 15, 30, 0.8)',
      achievement: '#ffd700'
    },
    foodColors: {
      NORMAL: '#ff6b6b',
      GOLDEN: '#ffd700',
      POISON: '#9b59b6'
    },
    powerupColors: {
      CLOCK: '#3498db',
      GOLDEN_BODY: '#f39c12',
      WEAPON: '#e74c3c',
      SPEED: '#2ecc71'
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
      cardBg: 'rgba(26, 10, 46, 0.8)',
      achievement: '#ffff00'
    },
    foodColors: {
      NORMAL: '#ff69b4',
      GOLDEN: '#ffff00',
      POISON: '#ff00ff'
    },
    powerupColors: {
      CLOCK: '#00bfff',
      GOLDEN_BODY: '#ffa500',
      WEAPON: '#ff6347',
      SPEED: '#32cd32'
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
      cardBg: 'rgba(248, 249, 250, 0.9)',
      achievement: '#856404'
    },
    foodColors: {
      NORMAL: '#dc3545',
      GOLDEN: '#ffc107',
      POISON: '#6f42c1'
    },
    powerupColors: {
      CLOCK: '#0066cc',
      GOLDEN_BODY: '#cc8800',
      WEAPON: '#cc3300',
      SPEED: '#28a745'
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
  const typeKey = foodTypeId.toUpperCase();
  return skin.foodColors[typeKey] || FOOD_TYPES[typeKey]?.color || '#ff6b6b';
}

function getPowerupColor(powerupTypeId) {
  const skin = getCurrentSkin();
  const typeKey = powerupTypeId.toUpperCase().replace('_', '_');
  return skin.powerupColors[typeKey] || '#ffffff';
}

const COLORS = {
  get BACKGROUND() { return getSkinColors().BACKGROUND; },
  get GRID() { return getSkinColors().GRID; },
  get SNAKE_HEAD() { return getSkinColors().SNAKE_HEAD; },
  get SNAKE_BODY() { return getSkinColors().SNAKE_BODY; },
  get OBSTACLE() { return getSkinColors().OBSTACLE; },
  get TEXT() { return getSkinColors().TEXT; }
};
