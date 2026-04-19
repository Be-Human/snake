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

  canvas.width = GRID_SIZE * TILE_COUNT;
  canvas.height = GRID_SIZE * TILE_COUNT;

  let highlightedRank = null;
  let currentGameScore = 0;
  let currentGameNormalFoodEaten = 0;
  let gamesPlayed = 0;

  const ACHIEVEMENTS = [
    {
      id: 'first_bite',
      name: '第一口',
      description: '吃到第一个食物',
      icon: '🍎',
      checkCondition: (stats) => stats.normalFoodEaten >= 1
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
    achievementNameElement.textContent = achievement.name;
    achievementNotification.classList.add('show');
    
    setTimeout(() => {
      achievementNotification.classList.remove('show');
    }, 3000);
  }

  function checkAchievements() {
    const unlockedAchievements = getAchievements();
    const currentStats = {
      score: game.score,
      level: game.level,
      normalFoodEaten: currentGameNormalFoodEaten,
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

  updateHighScoreDisplay();
  renderLeaderboard();
  renderAchievements();
  gamesPlayed = getGamesPlayed();

  const game = new Game(canvas);

  game.onScoreUpdate = (score) => {
    scoreElement.textContent = score;
    checkAchievements();
  };

  game.onLevelUpdate = (level) => {
    levelElement.textContent = level;
    checkAchievements();
  };

  game.onFoodEaten = (foodType) => {
    if (foodType.id === FOOD_TYPES.NORMAL.id) {
      currentGameNormalFoodEaten++;
      checkAchievements();
    }
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
    game.start();
  });
});
