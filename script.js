const canvas = document.getElementById("heatCanvas");
const ctx = canvas.getContext("2d");

let temperature = 20;
let heating = true;
let material = "ice";

const materials = {
  ice: { meltPoint: 0, color: "#00d0ff" },
  wood: { meltPoint: 100, color: "#a0522d" },
  metal: { meltPoint: 150, color: "#aaaaaa" }
};

const tempSlider = document.getElementById("tempSlider");
const tempValue = document.getElementById("tempValue");
const heatToggle = document.getElementById("heatToggle");
const materialSelect = document.getElementById("materialSelect");

tempSlider.oninput = () => {
  temperature = parseInt(tempSlider.value);
  tempValue.textContent = `${temperature}°C`;
};

heatToggle.onchange = () => {
  heating = heatToggle.checked;
};

materialSelect.onchange = () => {
  material = materialSelect.value;
};

function resetHeat() {
  temperature = 20;
  tempSlider.value = 20;
  tempValue.textContent = `20°C`;
}

function drawBlock() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const mat = materials[material];

  const melted = temperature >= mat.meltPoint + 30;

  ctx.fillStyle = melted ? "#ff4040" : mat.color;
  ctx.fillRect(250, 150, 100, 100);

  if (melted) {
    ctx.fillStyle = "#ff202020";
    ctx.fillRect(250, 250, 100, 10);
  }

  ctx.font = "16px Segoe UI";
  ctx.fillStyle = "#00ffe0";
  ctx.fillText(`${material.toUpperCase()}`, 260, 140);
}

function updateHeat() {
  if (heating && temperature < 200) {
    temperature += 0.1;
    tempSlider.value = Math.floor(temperature);
    tempValue.textContent = `${Math.floor(temperature)}°C`;
  }
}

function animate() {
  updateHeat();
  drawBlock();
  requestAnimationFrame(animate);
}

animate();
