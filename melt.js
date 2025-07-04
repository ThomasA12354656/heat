const canvas = document.getElementById('heatCanvas');
const ctx = canvas.getContext('2d');

let materialProps = {
  ice:    { meltPoint: 0, specificHeat: 2100, k: 2, color: '#aee' },
  wood:   { meltPoint: 300, specificHeat: 1700, k: 0.2, color: '#a0522d' },
  metal:  { meltPoint: 660, specificHeat: 900, k: 50, color: '#ccc' }
};

let state = 'Solid';
let temp = -10;
let material = 'ice';
let mass = 1;
let running = false;
let lastTime = null;

const hotTemp = 1000; // Constant hot source (°C)

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

  // Block color changes if melted
  ctx.fillStyle = (state === 'Melted' || state === 'Charred') ? '#ff4d4d' : mat.color;
  ctx.fillRect(300, 80, 200, 80);

  // Hot source (red block on left)
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(100, 80, 50, 80);
}

function simulateStep(dt) {
  const mat = materialProps[material];

  const dQ = mat.k * (hotTemp - temp) * dt;
  const dT = dQ / (mass * mat.specificHeat);

  temp += dT;

  // State transition
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

resetSimulation(); // Initial draw
