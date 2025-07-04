const canvas = document.getElementById('heatCanvas');
const ctx = canvas.getContext('2d');

const smokeParticles = [];

let materialProps = {
  ice: {
    meltPoint: 0,
    specificHeat: 2100,
    k: 2,
    baseColor: '#aee',
    meltedColor: '#3399ff',
    maxProgress: 50
  },
  wood: {
    meltPoint: 300,
    specificHeat: 1700,
    k: 0.2,
    baseColor: '#8b4513',
    charredColor: '#111',
    maxProgress: 100
  },
  metal: {
    meltPoint: 660,
    specificHeat: 900,
    k: 50,
    baseColor: '#ccc',
    meltedColor: '#ff4444',
    maxProgress: 150
  }
};

let temp = -10;
let material = 'ice';
let mass = 1;
let state = 'Solid';
let progress = 0;
let running = false;
let lastTime = null;

const hotTemp = 1000;

const tempDisplay = document.getElementById('tempDisplay');
const stateDisplay = document.getElementById('stateDisplay');

function updateInputs() {
  material = document.getElementById('material').value;
  temp = parseFloat(document.getElementById('initialTemp').value);
  mass = parseFloat(document.getElementById('mass').value);
  state = 'Solid';
  progress = 0;
}

function resetSimulation() {
  updateInputs();
  running = false;
  lastTime = null;
  smokeParticles.length = 0;
  tempDisplay.textContent = temp;
  stateDisplay.textContent = state;
  drawMaterial();
}

function drawFire(x, y, width, height, time) {
  const flames = 5;
  for (let i = 0; i < flames; i++) {
    const flameHeight = height + Math.sin(time / 100 + i) * 20;
    const flameWidth = width + Math.cos(time / 150 + i) * 10;
    const grad = ctx.createRadialGradient(
      x + width / 2,
      y + height / 2,
      5,
      x + width / 2,
      y + height / 2,
      flameHeight
    );

    grad.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
    grad.addColorStop(0.3, 'rgba(255, 140, 0, 0.7)');
    grad.addColorStop(1, 'rgba(255, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, flameWidth / 2, flameHeight, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSmoke() {
  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    const p = smokeParticles[i];
    p.y -= p.vy;
    p.x += p.vx;
    p.alpha -= 0.01;
    if (p.alpha <= 0) {
      smokeParticles.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `rgba(100,100,100,${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawProgressBar() {
  const mat = materialProps[material];
  const barWidth = 200;
  const x = 300, y = 170;
  const percent = Math.min(progress / mat.maxProgress, 1);

  ctx.fillStyle = '#ddd';
  ctx.fillRect(x, y, barWidth, 10);
  ctx.fillStyle = '#28a745';
  ctx.fillRect(x, y, barWidth * percent, 10);

  ctx.strokeStyle = '#444';
  ctx.strokeRect(x, y, barWidth, 10);
}

function drawMaterial() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const mat = materialProps[material];

  const blockX = 300;
  const blockY = 80;
  const blockWidth = 200;
  const originalHeight = 80;

  let blockHeight = originalHeight;

  if (state !== 'Solid') {
    const shrinkFactor = Math.min(progress / mat.maxProgress, 1);
    blockHeight = originalHeight * (1 - shrinkFactor * 0.6);
  }

  const adjustedY = blockY + (originalHeight - blockHeight);

  let baseColor = mat.baseColor;
  if (material === 'ice' && state === 'Melted') baseColor = mat.meltedColor;
  if (material === 'wood' && state === 'Charred') baseColor = mat.charredColor;
  if (material === 'metal' && state === 'Melted') baseColor = mat.meltedColor;

  const grad = ctx.createLinearGradient(0, adjustedY, 0, adjustedY + blockHeight);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.4, baseColor);
  grad.addColorStop(1, '#222');

  ctx.fillStyle = grad;
  ctx.fillRect(blockX, adjustedY, blockWidth, blockHeight);

  // Drip effect for melted ice
  if (material === 'ice' && state === 'Melted') {
    ctx.beginPath();
    ctx.arc(blockX + 100, adjustedY + blockHeight + 10 + Math.sin(Date.now() / 200) * 2, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#66ccff';
    ctx.fill();
  }

  // Smoke for melted wood/metal
  if (state === 'Charred' || state === 'Melted') {
    if (Math.random() < 0.5) {
      smokeParticles.push({
        x: blockX + 100 + (Math.random() * 40 - 20),
        y: adjustedY,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.5 + Math.random() * 0.3,
        size: 5 + Math.random() * 3,
        alpha: 0.4 + Math.random() * 0.2
      });
    }
  }

  // Draw fire
  drawFire(120, 100, 30, 60, Date.now());
  drawSmoke();
  drawProgressBar();
}

function simulateStep(dt) {
  const mat = materialProps[material];
  const dQ = mat.k * (hotTemp - temp) * dt;
  const dT = dQ / (mass * mat.specificHeat);
  temp += dT;

  if ((material === 'ice' && temp >= mat.meltPoint) ||
      (material === 'wood' && temp >= mat.meltPoint) ||
      (material === 'metal' && temp >= mat.meltPoint)) {
    if (state === 'Solid') {
      state = material === 'wood' ? 'Charred' : 'Melted';
    }
    progress += dT * 5;
  }

  tempDisplay.textContent = temp.toFixed(1);
  stateDisplay.textContent = state;

  drawMaterial();
}

function loop(timestamp) {
  if (!running) return;

  if (lastTime == null) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  simulateStep(dt);
  requestAnimationFrame(loop);
}

// UI Buttons
document.getElementById('startBtn').addEventListener('click', () => {
  updateInputs();
  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
});

document.getElementById('resetBtn').addEventListener('click', resetSimulation);

resetSimulation();
