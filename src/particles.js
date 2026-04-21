class Particle {
  constructor(x, y, color, velocity, size, life) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = velocity;
    this.size = size;
    this.life = life;
    this.maxLife = life;
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.life -= 1;
    this.velocity.y += 0.1;
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.fillStyle = this.hexToRgba(this.color, alpha);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  isDead() {
    return this.life <= 0;
  }
}

class ScoreFloat {
  constructor(x, y, score, color) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.color = color;
    this.life = 60;
    this.maxLife = 60;
    this.velocityY = -2;
  }

  update() {
    this.y += this.velocityY;
    this.velocityY += 0.05;
    this.life -= 1;
  }

  draw(ctx, gridSize) {
    const alpha = this.life / this.maxLife;
    const scale = 1 + (1 - alpha) * 0.3;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${16 * scale}px Arial`;
    ctx.fillStyle = this.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    
    const scoreText = this.score >= 0 ? `+${this.score}` : `${this.score}`;
    ctx.fillText(scoreText, this.x * gridSize + gridSize / 2, this.y * gridSize + gridSize / 2);
    
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.scoreFloats = [];
  }

  createExplosion(x, y, color, gridSize, count = 15) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      };
      const size = 2 + Math.random() * 3;
      const life = 30 + Math.random() * 20;
      
      this.particles.push(new Particle(centerX, centerY, color, velocity, size, life));
    }
  }

  createScoreFloat(x, y, score, color) {
    this.scoreFloats.push(new ScoreFloat(x, y, score, color));
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
    
    for (let i = this.scoreFloats.length - 1; i >= 0; i--) {
      this.scoreFloats[i].update();
      if (this.scoreFloats[i].isDead()) {
        this.scoreFloats.splice(i, 1);
      }
    }
  }

  draw(ctx, gridSize) {
    for (let particle of this.particles) {
      particle.draw(ctx);
    }
    
    for (let scoreFloat of this.scoreFloats) {
      scoreFloat.draw(ctx, gridSize);
    }
  }

  clear() {
    this.particles = [];
    this.scoreFloats = [];
  }
}