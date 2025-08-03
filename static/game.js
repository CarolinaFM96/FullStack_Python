// Configurações do jogo
const game = {
  player: { x: 285, y: 360, width: 30, height: 30, speed: 8 },
  enemies: [],
  bullets: [],
  powerUps: [],
  score: 0,
  lives: 3,
  running: false,
  enemySpeed: 2,
  enemySpawnRate: 1000, // ms
  lastEnemySpawn: 0,
  bulletSpeed: 8,
  lastBulletShot: 0,
  fireRate: 300, // ms
  rapidFire: false,
  rapidFireEnd: 0,
  shield: false,
  shieldEnd: 0,
};

// Elementos DOM
const elements = {
  player: document.getElementById("player"),
  gameArea: document.getElementById("space-game"),
  score: document.getElementById("score"),
  lives: document.getElementById("lives"),
  gameOver: document.getElementById("game-over"),
  startBtn: document.getElementById("start-btn"),
  skipBtn: document.getElementById("skip-btn"),
};

// Controles
let keys = { ArrowLeft: false, ArrowRight: false, " ": false };

// Event Listeners
elements.startBtn.addEventListener("click", startGame);
elements.skipBtn.addEventListener(
  "click",
  () => (window.location.href = "/todos")
);

document.addEventListener("keydown", (e) => {
  if (e.key in keys) keys[e.key] = true;
  if (e.code === "Space" && !game.running) startGame();
});

document.addEventListener("keyup", (e) => {
  if (e.key in keys) keys[e.key] = false;
});

// Funções do jogo
function startGame() {
  game.running = true;
  game.score = 0;
  game.lives = 3;
  game.enemies = [];
  game.bullets = [];
  game.powerUps = [];
  game.enemySpeed = 2;
  game.enemySpawnRate = 1000;
  game.rapidFire = false;
  game.shield = false;
  elements.startBtn.style.display = "none";
  elements.gameOver.style.display = "none";
  elements.score.textContent = "SCORE: 0";
  elements.lives.textContent = "LIVES: 3";
  game.player.x = 285;

  // Remover elementos antigos
  document
    .querySelectorAll(".enemy, .bullet, .power-up")
    .forEach((el) => el.remove());

  gameLoop();
}

function update() {
  // Movimento do jogador
  if (keys.ArrowLeft && game.player.x > 0) {
    game.player.x -= game.player.speed;
  }
  if (keys.ArrowRight && game.player.x < 570) {
    game.player.x += game.player.speed;
  }

  // Atirar
  const currentTime = Date.now();
  if (
    keys[" "] &&
    currentTime - game.lastBulletShot > (game.rapidFire ? 100 : game.fireRate)
  ) {
    createBullet();
    game.lastBulletShot = currentTime;
  }

  // Gerar inimigos
  if (currentTime - game.lastEnemySpawn > game.enemySpawnRate) {
    createEnemy();
    game.lastEnemySpawn = currentTime;

    // Aumentar dificuldade
    if (game.enemySpawnRate > 300) {
      game.enemySpawnRate -= 50;
    }
    if (game.enemySpeed < 6) {
      game.enemySpeed += 0.1;
    }
  }

  // Gerar power-ups ocasionalmente
  if (Math.random() < 0.005 && game.running) {
    createPowerUp();
  }

  // Mover inimigos
  for (let i = game.enemies.length - 1; i >= 0; i--) {
    const enemy = game.enemies[i];
    enemy.y += game.enemySpeed;
    enemy.element.style.top = enemy.y + "px";

    // Verificar colisão com jogador
    if (
      enemy.x < game.player.x + game.player.width &&
      enemy.x + enemy.width > game.player.x &&
      enemy.y < game.player.y + game.player.height &&
      enemy.y + enemy.height > game.player.y
    ) {
      if (!game.shield) {
        enemy.element.remove();
        game.enemies.splice(i, 1);
        loseLife();
      }
      continue;
    }

    // Remover inimigos que saíram da tela
    if (enemy.y > 400) {
      enemy.element.remove();
      game.enemies.splice(i, 1);
    }
  }

  // Mover balas
  for (let i = game.bullets.length - 1; i >= 0; i--) {
    const bullet = game.bullets[i];
    bullet.y -= game.bulletSpeed;
    bullet.element.style.top = bullet.y + "px";

    // Verificar colisão com inimigos
    let hit = false;
    for (let j = game.enemies.length - 1; j >= 0; j--) {
      const enemy = game.enemies[j];
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        // Colisão detectada
        enemy.element.remove();
        game.enemies.splice(j, 1);
        hit = true;
        game.score += 10;
        elements.score.textContent = "SCORE: " + game.score;

        // Vida extra a cada 500 pontos
        if (game.score % 500 === 0) {
          game.lives++;
          elements.lives.textContent = "LIVES: " + game.lives;
        }
        break;
      }
    }

    // Remover bala se atingiu um inimigo ou saiu da tela
    if (hit || bullet.y < 0) {
      bullet.element.remove();
      game.bullets.splice(i, 1);
    }
  }

  // Mover power-ups
  for (let i = game.powerUps.length - 1; i >= 0; i--) {
    const powerUp = game.powerUps[i];
    powerUp.y += 2;
    powerUp.element.style.top = powerUp.y + "px";

    // Verificar colisão com jogador
    if (
      powerUp.x < game.player.x + game.player.width &&
      powerUp.x + powerUp.width > game.player.x &&
      powerUp.y < game.player.y + game.player.height &&
      powerUp.y + powerUp.height > game.player.y
    ) {
      applyPowerUp(powerUp.type);
      powerUp.element.remove();
      game.powerUps.splice(i, 1);
      continue;
    }

    // Remover power-ups que saíram da tela
    if (powerUp.y > 400) {
      powerUp.element.remove();
      game.powerUps.splice(i, 1);
    }
  }

  // Verificar duração dos power-ups
  const now = Date.now();
  if (game.rapidFire && now > game.rapidFireEnd) {
    game.rapidFire = false;
  }
  if (game.shield && now > game.shieldEnd) {
    game.shield = false;
    elements.player.style.filter = "none";
  }
}

function render() {
  elements.player.style.left = game.player.x + "px";
}

function createEnemy() {
  const enemy = document.createElement("div");
  enemy.className = "enemy";
  const x = Math.floor(Math.random() * 575);
  enemy.style.left = x + "px";
  enemy.style.top = "-25px";
  elements.gameArea.appendChild(enemy);

  game.enemies.push({
    element: enemy,
    x: x,
    y: -25,
    width: 25,
    height: 25,
  });
}

function createBullet() {
  const bullet = document.createElement("div");
  bullet.className = "bullet";
  const x = game.player.x + game.player.width / 2 - 2.5;
  bullet.style.left = x + "px";
  bullet.style.top = game.player.y - 10 + "px";
  elements.gameArea.appendChild(bullet);

  game.bullets.push({
    element: bullet,
    x: x,
    y: game.player.y - 10,
    width: 5,
    height: 10,
  });
}

function createPowerUp() {
  const powerUpTypes = ["rapid", "shield", "life"];
  const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

  const powerUp = document.createElement("div");
  powerUp.className = "power-up";

  let color, symbol;
  switch (type) {
    case "rapid":
      color = "#66ff66";
      symbol = "⚡";
      break;
    case "shield":
      color = "#3366ff";
      symbol = "🛡️";
      break;
    case "life":
      color = "#ffcc00";
      symbol = "❤️";
      break;
  }

  powerUp.innerHTML = symbol;
  powerUp.style.color = color;
  powerUp.style.textShadow = "0 0 5px #000";
  powerUp.style.fontSize = "20px";
  powerUp.style.textAlign = "center";
  powerUp.style.lineHeight = "30px";

  const x = Math.floor(Math.random() * 575);
  powerUp.style.left = x + "px";
  powerUp.style.top = "-30px";
  powerUp.style.width = "30px";
  powerUp.style.height = "30px";
  elements.gameArea.appendChild(powerUp);

  game.powerUps.push({
    element: powerUp,
    type: type,
    x: x,
    y: -30,
    width: 30,
    height: 30,
  });
}

function applyPowerUp(type) {
  const now = Date.now();

  switch (type) {
    case "rapid":
      game.rapidFire = true;
      game.rapidFireEnd = now + 10000; // 10 segundos
      break;
    case "shield":
      game.shield = true;
      game.shieldEnd = now + 15000; // 15 segundos
      elements.player.style.filter = "drop-shadow(0 0 5px #3366ff)";
      break;
    case "life":
      game.lives++;
      elements.lives.textContent = "LIVES: " + game.lives;
      break;
  }
}

function loseLife() {
  game.lives--;
  elements.lives.textContent = "LIVES: " + game.lives;

  if (game.lives <= 0) {
    gameOver();
  }
}

function gameOver() {
  game.running = false;
  elements.gameOver.style.display = "block";
  elements.startBtn.style.display = "block";
  elements.startBtn.textContent = "RESTART (SPACE)";
}

function gameLoop() {
  if (!game.running) return;

  update();
  render();

  requestAnimationFrame(gameLoop);
}
