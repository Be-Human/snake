document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const scoreElement = document.getElementById('score');
  const levelElement = document.getElementById('level');
  const highScoreElement = document.getElementById('highScore');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const finalScoreElement = document.getElementById('finalScore');
  const finalHighScoreElement = document.getElementById('finalHighScore');
  const restartButton = document.getElementById('restartButton');
  const startScreen = document.getElementById('startScreen');
  const leaderboardElement = document.getElementById('leaderboard');
  const nameInputSection = document.getElementById('nameInputSection');
  const playerNameInput = document.getElementById('playerName');
  const submitNameButton = document.getElementById('submitNameButton');
  const achievementsElement = document.getElementById('achievements');
  const achievementNotification = document.getElementById('achievementNotification');
  const achievementNameElement = document.getElementById('achievementName');
  const skinButtons = document.querySelectorAll('.skin-button');
  const difficultyButtons = document.querySelectorAll('.difficulty-button');
  
  const activePowerupContainer = document.getElementById('activePowerupContainer');
  const activePowerupIcon = document.getElementById('activePowerupIcon');
  const activePowerupName = document.getElementById('activePowerupName');
  const activePowerupTimer = document.getElementById('activePowerupTimer');
  
  let powerupTimerInterval = null;

  canvas.width = GRID_SIZE * TILE_COUNT;
  canvas.height = GRID_SIZE * TILE_COUNT;

  let game = null;
  let highlightedRank = null;
  let currentGameScore = 0;
  let currentGameNormalFoodEaten = 0;
  let currentGameAnyFoodEaten = 0;
  let gamesPlayed = 0;
  
  const achievementNotificationQueue = [];
  let isShowingAchievementNotification = false;

  function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function applySkin(skinId) {
    if (!setCurrentSkin(skinId)) {
      return;
    }

    const skin = getCurrentSkin();
    const css = skin.css;

    document.documentElement.style.setProperty('--body-bg', css.bodyBg);
    document.documentElement.style.setProperty('--primary-color', css.primary);
    document.documentElement.style.setProperty('--text-color', css.text);
    document.documentElement.style.setProperty('--secondary-text', css.secondary);
    document.documentElement.style.setProperty('--accent-color', css.accent);
    document.documentElement.style.setProperty('--overlay-bg', css.overlayBg);
    document.documentElement.style.setProperty('--card-bg', css.cardBg);
    document.documentElement.style.setProperty('--achievement-color', css.achievement);

    document.documentElement.style.setProperty('--primary-color-rgba', hexToRgba(css.primary, 0.5));
    document.documentElement.style.setProperty('--primary-color-rgba-light', hexToRgba(css.primary, 0.3));
    document.documentElement.style.setProperty('--primary-color-rgba-medium', hexToRgba(css.primary, 0.3));
    document.documentElement.style.setProperty('--primary-color-rgba-verylight', hexToRgba(css.primary, 0.1));
    document.documentElement.style.setProperty('--accent-color-rgba', hexToRgba(css.accent, 0.5));
    document.documentElement.style.setProperty('--achievement-color-rgba', hexToRgba(css.achievement, 0.5));
    document.documentElement.style.setProperty('--achievement-color-rgba-light', hexToRgba(css.achievement, 0.3));
    document.documentElement.style.setProperty('--achievement-color-rgba-bg', hexToRgba(css.achievement, 0.2));

    skinButtons.forEach(btn => {
      if (btn.dataset.skin === skinId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    localStorage.setItem('snakeSkin', skinId);
  }

  function loadSavedSkin() {
    const savedSkin = localStorage.getItem('snakeSkin');
    if (savedSkin) {
      applySkin(savedSkin);
    } else {
      applySkin('classic');
    }
  }

  function handleSkinChange(skinId) {
    applySkin(skinId);
    if (typeof game !== 'undefined' && game) {
      game.draw();
    }
  }

  skinButtons.forEach(button => {
    button.addEventListener('click', () => {
      const skinId = button.dataset.skin;
      handleSkinChange(skinId);
    });
  });

  function applyDifficulty(difficultyId) {
    if (!setCurrentDifficulty(difficultyId)) {
      return;
    }

    difficultyButtons.forEach(btn => {
      if (btn.dataset.difficulty === difficultyId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    localStorage.setItem('snakeDifficulty', difficultyId);
  }

  function loadSavedDifficulty() {
    const savedDifficulty = localStorage.getItem('snakeDifficulty');
    if (savedDifficulty) {
      applyDifficulty(savedDifficulty);
    } else {
      applyDifficulty('normal');
    }
  }

  difficultyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const difficultyId = button.dataset.difficulty;
      applyDifficulty(difficultyId);
    });
  });

  const ACHIEVEMENTS = [
    {
      id: 'first_bite',
      name: '第一口',
      description: '吃到第一个食物',
      icon: '🍎',
      checkCondition: (stats) => stats.anyFoodEaten >= 1
    },
    {
      id: 'junior_player',
      name: '初入江湖',
      description: '得分达到50',
      icon: '🌟',
      checkCondition: (stats) => stats.score >= 50
    },
    {
      id: 'level_challenger',
      name: '关卡挑战者',
      description: '升到第2关',
      icon: '🎯',
      checkCondition: (stats) => stats.level >= 2
    },
    {
      id: 'snake_king',
      name: '贪吃王',
      description: '单局吃满10个普通食物',
      icon: '👑',
      checkCondition: (stats) => stats.normalFoodEaten >= 10
    },
    {
      id: 'veteran_player',
      name: '老玩家',
      description: '累计游戏5次',
      icon: '🏆',
      checkCondition: (stats) => stats.gamesPlayed >= 5
    }
  ];

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

  function getLeaderboard() {
    const saved = localStorage.getItem('snakeLeaderboard');
    return saved ? JSON.parse(saved) : [];
  }

  function saveLeaderboard(leaderboard) {
    localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
  }

  function isInTopFive(score) {
    if (score <= 0) {
      return false;
    }
    
    const leaderboard = getLeaderboard();
    if (leaderboard.length < 5) {
      return true;
    }
    return score > leaderboard[leaderboard.length - 1].score;
  }

  function addToLeaderboard(name, score) {
    const leaderboard = getLeaderboard();
    const newEntry = { name, score, timestamp: Date.now() };
    
    leaderboard.push(newEntry);
    leaderboard.sort((a, b) => b.score - a.score);
    
    if (leaderboard.length > 5) {
      leaderboard.splice(5);
    }
    
    saveLeaderboard(leaderboard);
    
    const rank = leaderboard.findIndex(entry => 
      entry.timestamp === newEntry.timestamp && 
      entry.name === name && 
      entry.score === score
    );
    
    return rank !== -1 ? rank + 1 : null;
  }

  function renderLeaderboard(highlightRank = null) {
    const leaderboard = getLeaderboard();
    
    if (leaderboard.length === 0) {
      leaderboardElement.innerHTML = '<div class="leaderboard-placeholder">暂无记录</div>';
      return;
    }
    
    let html = '';
    leaderboard.forEach((entry, index) => {
      const rank = index + 1;
      const isHighlighted = highlightRank === rank;
      
      html += `
        <div class="leaderboard-item${isHighlighted ? ' highlight' : ''}">
          <span class="rank">${rank}</span>
          <span class="name">${entry.name}</span>
          <span class="score">${entry.score}</span>
        </div>
      `;
    });
    
    leaderboardElement.innerHTML = html;
  }

  function getAchievements() {
    const saved = localStorage.getItem('snakeAchievements');
    return saved ? JSON.parse(saved) : {};
  }

  function saveAchievements(achievements) {
    localStorage.setItem('snakeAchievements', JSON.stringify(achievements));
  }

  function getGamesPlayed() {
    const saved = localStorage.getItem('snakeGamesPlayed');
    return saved ? parseInt(saved, 10) : 0;
  }

  function incrementGamesPlayed() {
    const current = getGamesPlayed();
    localStorage.setItem('snakeGamesPlayed', (current + 1).toString());
    return current + 1;
  }

  function showAchievementNotification(achievement) {
    achievementNotificationQueue.push(achievement);
    processAchievementNotificationQueue();
  }

  function processAchievementNotificationQueue() {
    if (isShowingAchievementNotification || achievementNotificationQueue.length === 0) {
      return;
    }
    
    isShowingAchievementNotification = true;
    const achievement = achievementNotificationQueue.shift();
    
    achievementNameElement.textContent = achievement.name;
    achievementNotification.classList.add('show');
    
    setTimeout(() => {
      achievementNotification.classList.remove('show');
      
      setTimeout(() => {
        isShowingAchievementNotification = false;
        processAchievementNotificationQueue();
      }, 300);
    }, 3000);
  }

  function checkAchievements() {
    const unlockedAchievements = getAchievements();
    const currentStats = {
      score: game.score,
      level: game.level,
      normalFoodEaten: currentGameNormalFoodEaten,
      anyFoodEaten: currentGameAnyFoodEaten,
      gamesPlayed: gamesPlayed
    };
    
    let newAchievements = false;
    
    for (const achievement of ACHIEVEMENTS) {
      if (!unlockedAchievements[achievement.id] && achievement.checkCondition(currentStats)) {
        unlockedAchievements[achievement.id] = true;
        newAchievements = true;
        showAchievementNotification(achievement);
      }
    }
    
    if (newAchievements) {
      saveAchievements(unlockedAchievements);
      renderAchievements();
    }
  }

  function renderAchievements() {
    const unlockedAchievements = getAchievements();
    
    let html = '';
    for (const achievement of ACHIEVEMENTS) {
      const isUnlocked = unlockedAchievements[achievement.id];
      const className = isUnlocked ? 'unlocked' : 'locked';
      
      html += `
        <div class="achievement-item ${className}">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-info">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
          </div>
        </div>
      `;
    }
    
    achievementsElement.innerHTML = html;
  }

  function showActivePowerup(powerupType, remainingTime) {
    activePowerupIcon.textContent = powerupType.icon;
    activePowerupName.textContent = powerupType.name;
    activePowerupTimer.textContent = formatTime(remainingTime);
    activePowerupContainer.style.display = 'flex';
    
    if (powerupTimerInterval) {
      clearInterval(powerupTimerInterval);
    }
    
    powerupTimerInterval = setInterval(() => {
      const currentTime = performance.now();
      const remaining = game.getActivePowerupRemainingTime(currentTime);
      
      if (remaining <= 0) {
        clearInterval(powerupTimerInterval);
        powerupTimerInterval = null;
        hideActivePowerup();
      } else {
        activePowerupTimer.textContent = formatTime(remaining);
      }
    }, 100);
  }

  function hideActivePowerup() {
    activePowerupContainer.style.display = 'none';
    if (powerupTimerInterval) {
      clearInterval(powerupTimerInterval);
      powerupTimerInterval = null;
    }
  }

  function formatTime(ms) {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  }

  loadSavedSkin();
  loadSavedDifficulty();

  updateHighScoreDisplay();
  renderLeaderboard();
  renderAchievements();
  gamesPlayed = getGamesPlayed();

  game = new Game(canvas);

  game.onScoreUpdate = (score) => {
    scoreElement.textContent = score;
    checkAchievements();
  };

  game.onLevelUpdate = (level) => {
    levelElement.textContent = level;
    checkAchievements();
  };

  game.onFoodEaten = (foodType) => {
    currentGameAnyFoodEaten++;
    
    if (foodType.id === FOOD_TYPES.NORMAL.id) {
      currentGameNormalFoodEaten++;
    }
    
    checkAchievements();
  };

  game.onPowerupActivated = (powerupType, remainingTime) => {
    showActivePowerup(powerupType, remainingTime);
  };

  game.onPowerupDeactivated = () => {
    hideActivePowerup();
  };

  game.onGameOver = (score) => {
    gamesPlayed = incrementGamesPlayed();
    checkAchievements();
    
    const isNewHighScore = setHighScore(score);
    updateHighScoreDisplay();
    finalScoreElement.textContent = score;
    currentGameScore = score;
    
    if (isNewHighScore && finalHighScoreElement) {
      finalHighScoreElement.textContent = score;
    }
    
    nameInputSection.style.display = 'none';
    
    if (isInTopFive(score)) {
      nameInputSection.style.display = 'flex';
      playerNameInput.value = '';
      playerNameInput.focus();
    }
    
    gameOverScreen.style.display = 'flex';
  };
  
  function submitPlayerName() {
    let name = playerNameInput.value.trim();
    
    if (name.length === 0) {
      name = '匿名玩家';
    } else if (name.length > 10) {
      name = name.substring(0, 10);
    }
    
    highlightedRank = addToLeaderboard(name, currentGameScore);
    renderLeaderboard(highlightedRank);
    
    nameInputSection.style.display = 'none';
  }

  game.init();
  game.draw();

  document.addEventListener('keydown', (e) => {
    if (document.activeElement === playerNameInput) {
      if (e.keyCode === 13) {
        e.preventDefault();
        submitPlayerName();
      }
      return;
    }
    
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
      case KEY_CODES.SPACE:
        e.preventDefault();
        game.togglePause();
        return;
    }

    if (direction) {
      e.preventDefault();
      
      if (startScreen.style.display !== 'none') {
        startScreen.style.display = 'none';
        currentGameNormalFoodEaten = 0;
        currentGameAnyFoodEaten = 0;
      }
      
      game.handleKeyPress(direction);
    }
  });

  submitNameButton.addEventListener('click', () => {
    submitPlayerName();
  });

  restartButton.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'none';
    currentGameNormalFoodEaten = 0;
    currentGameAnyFoodEaten = 0;
    game.restart();
    updateHighScoreDisplay();
    
    if (highlightedRank !== null) {
      renderLeaderboard();
      highlightedRank = null;
    }
  });

  startScreen.addEventListener('click', () => {
    startScreen.style.display = 'none';
    currentGameNormalFoodEaten = 0;
    currentGameAnyFoodEaten = 0;
    game.start();
  });
});
