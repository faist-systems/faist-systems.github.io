// ======================================
// FAIST – Dollhouse Game Loop
// STEP A: Unified Input Layer
// ======================================

// ---------- WORLD SETUP ----------
const room = {
  width: 800,
  depth: 300,
  floorZMin: 0,
  floorZMax: 300
};

// ---------- AVATAR ----------
const avatar = {
  x: 200,
  z: 120,          // Z = hloubka (podlaha)
  width: 40,
  height: 60,
  speed: 2
};

// ---------- INPUT STATE (CENTRAL) ----------
const input = {
  moveX: 0,        // -1 .. 1
  moveZ: 0         // -1 .. 1
};

// ---------- KEYBOARD MAP ----------
const keys = {
  left: false,
  right: false,
  up: false,
  down: false
};

// ---------- KEYBOARD LISTENERS ----------
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
    case "a":
      keys.left = true;
      break;
    case "ArrowRight":
    case "d":
      keys.right = true;
      break;
    case "ArrowUp":
    case "w":
      keys.up = true;
      break;
    case "ArrowDown":
    case "s":
      keys.down = true;
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowLeft":
    case "a":
      keys.left = false;
      break;
    case "ArrowRight":
    case "d":
      keys.right = false;
      break;
    case "ArrowUp":
    case "w":
      keys.up = false;
      break;
    case "ArrowDown":
    case "s":
      keys.down = false;
      break;
  }
});

// ---------- INPUT RESOLUTION ----------
function updateInput() {
  input.moveX = 0;
  input.moveZ = 0;

  if (keys.left) input.moveX -= 1;
  if (keys.right) input.moveX += 1;
  if (keys.up) input.moveZ -= 1;     // ↑ = ke zdi (menší Z)
  if (keys.down) input.moveZ += 1;   // ↓ = k hráči (větší Z)

  // normalizace diagonály
  if (input.moveX !== 0 && input.moveZ !== 0) {
    input.moveX *= 0.7;
    input.moveZ *= 0.7;
  }
}

// ---------- AVATAR MOVEMENT ----------
function updateAvatar() {
  avatar.x += input.moveX * avatar.speed;
  avatar.z += input.moveZ * avatar.speed;

  // X bounds
  avatar.x = Math.max(0, Math.min(room.width - avatar.width, avatar.x));

  // Z bounds (PODLAHA – CELÁ PLOCHA)
  avatar.z = Math.max(
    room.floorZMin,
    Math.min(room.floorZMax - avatar.height, avatar.z)
  );
}

// ---------- RENDER ----------
function renderAvatar() {
  const el = document.getElementById("avatar");
  if (!el) return;

  el.style.left = `${avatar.x}px`;
  el.style.bottom = `${avatar.z}px`;

  // hloubka = z-index
  el.style.zIndex = Math.floor(avatar.z);
}

// ---------- GAME LOOP ----------
function gameLoop() {
  updateInput();
  updateAvatar();
  renderAvatar();
  requestAnimationFrame(gameLoop);
}

// ---------- START ----------
window.addEventListener("DOMContentLoaded", () => {
  gameLoop();
});
