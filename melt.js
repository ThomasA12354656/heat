const canvas = document.getElementById('heatCanvas');
const ctx = canvas.getContext('2d');

// Material properties
let materialProps = {
  ice: {
    meltPoint: 0,
    specificHeat: 2100,
    k: 2,
    color: '#aee'
  },
  wood: {
    meltPoint: 300,
    specificHeat: 1700,
    k: 0.2,
    color: '#a0522d'
  },
  metal: {
    meltPoint: 660,
    specificHeat: 900,
    k: 50,
    color: '#ccc'
  }
};

// State variables
let state = 'Solid';
let temp = -10;
let material = 'ice';
let mass = 1;
let running = false;
let lastTime = null;

const hotTemp = 1000; // Constant hot source

const tempDisplay = document.getElementById('tempDisplay');
const stateDisplay = document.getElementById('stateDisplay');

function updateInputs() {
  material = document.getElementById('material').value;
  temp = parseFloat(document.getElementById('initialTemp').value);
  mass = parseFloat(document.getElementById('mass').value);
}

function resetSimulation() {
  updateInputs();
  running = false;
  lastTime = null;
  state = 'Solid';
  tempDisplay.textContent = temp;
  stateDisplay.textContent = state;
  drawMaterial();
}

function drawMaterial() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const mat = materialProps[material];
  const blockX = 300;
  const blockY = 80;
  const blockWidth = 200;
  const originalHeight = 80;

  let blockHeight = originalHeight;

  // Adjust block height for melting animation
  if (material === 'ice' && state === 'Melted') {
    blockHeight = Math.max(20, originalHeight - (temp - mat.meltPoint) * 2);
  } else if (material === 'wood' && state === 'Charred') {
    blockHeight = Math.max(40, originalHeight - (temp - mat.meltPoint) * 0.2);
  } else if (material === 'metal' && state === 'Melted') {
    blockHeight = Math.max(40, originalHeight - (temp - mat.meltPoint) * 0.5);
  }

  const adjustedY = blockY + (originalHeight - blockHeight);

  // Change color based on material state
  let color = mat.color;
  if (material === 'ice' && state === 'Melted') color = '#3399ff'; // puddle blue
  if (material === 'wood' && state === 'Charred') color = '#111'; // black char
  if (material === 'metal' && state === 'Melted') color = '#ff4444'; // glowing red

  // Draw material block
  ctx.fillStyle = color;
  ctx.fillRect(blockX, adjustedY, blockWidth, blockHeight);

  // Draw dripping effect for ice
  if (material === 'ice' && state === 'Melted') {
    ctx.beginPath();
    ctx.arc(blockX + 100, adjustedY + blockHeight + 10 + Math.sin(Date.now() / 200) * 2, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#66ccff';
    ctx.fill();
  }

  // Heat source (left red block)
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(100, 80, 50, 80);
}

function simulateStep(dt) {
  const mat = materialProps[material];

  // Heat transfer (conduction)
  const dQ = mat.k * (hotTemp - temp) * dt;
  const dT = dQ / (mass * mat.specificHeat);

  temp += dT;

  // State transitions
  if (material === 'ice' && temp >= mat.meltPoint) state = 'Melted';
  if (material === 'wood' && temp >= mat.meltPoint) state = 'Charred';
  if (material === 'metal' && temp >= mat.meltPoint) state = 'Melted';

  // Update UI
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

// Event listeners
document.getElementById('startBtn').addEventListener('click', () => {
  updateInputs();
  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  resetSimulation();
});

// Start with visual
resetSimulation();
