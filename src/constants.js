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

const GAME_MODES = {
  SINGLE: {
    id: 'single',
    name: '单人模式'
  },
  MULTIPLAYER: {
    id: 'multiplayer',
    name: '双人对战'
  },
  TIMED: {
    id: 'timed',
    name: '限时模式'
  }
};

const TIMED_MODE_CONFIG = {
  INITIAL_TIME: 60,
  NORMAL_FOOD_TIME_BONUS: 3,
  GOLDEN_FOOD_TIME_BONUS: 5,
  POISON_TIME_PENALTY: 5,
  WARNING_TIME_THRESHOLD: 10
};

let CURRENT_GAME_MODE = GAME_MODES.SINGLE;

function getCurrentGameMode() {
  return CURRENT_GAME_MODE;
}

function setCurrentGameMode(modeId) {
  for (const modeKey in GAME_MODES) {
    if (GAME_MODES[modeKey].id === modeId) {
      CURRENT_GAME_MODE = GAME_MODES[modeKey];
      return true;
    }
  }
  return false;
}

const PLAYER_CONFIGS = {
  PLAYER1: {
    id: 'player1',
    name: '玩家1',
    initialPosition: { x: 10, y: 10 },
    initialDirection: DIRECTIONS.RIGHT,
    controlKeys: {
      UP: KEY_CODES.W,
      DOWN: KEY_CODES.S,
      LEFT: KEY_CODES.A,
      RIGHT: KEY_CODES.D
    }
  },
  PLAYER2: {
    id: 'player2',
    name: '玩家2',
    initialPosition: { x: 10, y: 8 },
    initialDirection: DIRECTIONS.LEFT,
    controlKeys: {
      UP: KEY_CODES.ARROW_UP,
      DOWN: KEY_CODES.ARROW_DOWN,
      LEFT: KEY_CODES.ARROW_LEFT,
      RIGHT: KEY_CODES.ARROW_RIGHT
    }
  }
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

const SNAKE_GROWTH_STAGES = [
  {
    minLength: 3,
    name: '初生',
    headColor: null,
    bodyColor: null,
    shadowColor: null,
    bodyStyle: 'solid',
    hasEyes: true,
    eyeColor: '#ffffff',
    pupilColor: '#000000'
  },
  {
    minLength: 6,
    name: '成长',
    headColor: null,
    bodyColor: null,
    shadowColor: null,
    bodyStyle: 'gradient',
    hasEyes: true,
    eyeColor: '#ffffff',
    pupilColor: '#000000'
  },
  {
    minLength: 10,
    name: '成熟',
    headColor: null,
    bodyColor: null,
    shadowColor: null,
    bodyStyle: 'pattern',
    hasEyes: true,
    eyeColor: '#ff0000',
    pupilColor: '#ffff00'
  }
];

function getSnakeGrowthStage(bodyLength) {
  let stage = SNAKE_GROWTH_STAGES[0];
  for (let i = SNAKE_GROWTH_STAGES.length - 1; i >= 0; i--) {
    if (bodyLength >= SNAKE_GROWTH_STAGES[i].minLength) {
      stage = SNAKE_GROWTH_STAGES[i];
      break;
    }
  }
  return stage;
}

function getStageHeadColor(stage, skinColors) {
  if (stage.headColor) {
    return stage.headColor;
  }
  if (stage.name === '初生') {
    return skinColors.SNAKE_HEAD;
  } else if (stage.name === '成长') {
    return adjustColorBrightness(skinColors.SNAKE_HEAD, 20);
  } else {
    return adjustColorBrightness(skinColors.SNAKE_HEAD, 40);
  }
}

function getStageBodyColor(stage, skinColors, segmentIndex) {
  if (stage.bodyColor) {
    return stage.bodyColor;
  }
  
  if (stage.bodyStyle === 'solid') {
    return skinColors.SNAKE_BODY;
  } else if (stage.bodyStyle === 'gradient') {
    const brightness = -segmentIndex * 5;
    return adjustColorBrightness(skinColors.SNAKE_BODY, brightness);
  } else {
    return segmentIndex % 2 === 0 ? 
      skinColors.SNAKE_BODY : 
      adjustColorBrightness(skinColors.SNAKE_BODY, -20);
  }
}

function adjustColorBrightness(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const MAP_TYPES = {
  CLASSIC: {
    id: 'classic',
    name: '经典',
    description: '无预设障碍物，随关卡增加障碍',
    hasPresetObstacles: false,
    obstacles: [],
    levelUpAddsObstacles: true
  },
  BORDER: {
    id: 'border',
    name: '边框',
    description: '四周有边框障碍物',
    hasPresetObstacles: true,
    obstacles: (() => {
      const obstacles = [];
      for (let i = 0; i < TILE_COUNT; i++) {
        obstacles.push({ x: i, y: 0 });
        obstacles.push({ x: i, y: TILE_COUNT - 1 });
        obstacles.push({ x: 0, y: i });
        obstacles.push({ x: TILE_COUNT - 1, y: i });
      }
      return obstacles;
    })(),
    levelUpAddsObstacles: false
  },
  MAZE: {
    id: 'maze',
    name: '迷宫',
    description: '预设迷宫障碍物布局',
    hasPresetObstacles: true,
    obstacles: (() => {
      const obstacles = [];
      for (let i = 0; i < TILE_COUNT; i++) {
        obstacles.push({ x: i, y: 0 });
        obstacles.push({ x: i, y: TILE_COUNT - 1 });
        obstacles.push({ x: 0, y: i });
        obstacles.push({ x: TILE_COUNT - 1, y: i });
      }
      for (let i = 5; i < 10; i++) {
        obstacles.push({ x: i, y: 5 });
      }
      for (let i = 10; i < 15; i++) {
        obstacles.push({ x: i, y: 14 });
      }
      for (let i = 3; i < 8; i++) {
        obstacles.push({ x: 5, y: i });
      }
      for (let i = 12; i < 17; i++) {
        obstacles.push({ x: 14, y: i });
      }
      return obstacles;
    })(),
    levelUpAddsObstacles: false
  }
};

let CURRENT_MAP = MAP_TYPES.CLASSIC;

function getCurrentMap() {
  return CURRENT_MAP;
}

function setCurrentMap(mapId) {
  for (const mapKey in MAP_TYPES) {
    if (MAP_TYPES[mapKey].id === mapId) {
      CURRENT_MAP = MAP_TYPES[mapKey];
      return true;
    }
  }
  return false;
}

const COLORS = {
  get BACKGROUND() { return getSkinColors().BACKGROUND; },
  get GRID() { return getSkinColors().GRID; },
  get SNAKE_HEAD() { return getSkinColors().SNAKE_HEAD; },
  get SNAKE_BODY() { return getSkinColors().SNAKE_BODY; },
  get OBSTACLE() { return getSkinColors().OBSTACLE; },
  get TEXT() { return getSkinColors().TEXT; }
};
