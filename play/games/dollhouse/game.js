// ======================================
// FAIST – Dollhouse Game Loop
// STEP C: Avatar collisions + layering
// ======================================

// ---------- CONSTANTS ----------
const ROOM_WIDTH = 800;
const FLOOR_HEIGHT = 200;

// ---------- AVATAR ----------
const avatar = {
  x: 200,
  z: 0,           // 0 = u zdi
  width: 40,
  height: 60,
  speed: 2
};

// ---------- INPUT ----------
const input = {
  moveX: 0,
  moveZ: 0
};

const keys = { left:false, right:false, up:false, down:false };

// ---------- KEYBOARD ----------
window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
  if (e.key === "ArrowUp") keys.up = true;
  if (e.key === "ArrowDown") keys.down = true;
});

window.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
  if (e.key === "ArrowUp") keys.up = false;
  if (e.key === "ArrowDown") keys.down = false;
});

// ---------- FURNITURE ----------
const furnitureEls = Array.from(document.querySelectorAll(".furniture"));

const furniture = furnitureEls.map(el => ({
  el,
  x: parseInt(el.style.left, 10),
  z: 0,
  width: el.offsetWidth,
  height: el.offsetHeight
}));

// ---------- INPUT RESOLUTION ----------
function updateInput() {
  input.moveX = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
  input.moveZ = (keys.up ? -1 : 0) + (keys.down ? 1 : 0);
}

// ---------- COLLISION CHECK ----------
function collides(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.z < b.z + b.height &&
    a.z + a.height > b.z
  );
}

// ---------- UPDATE AVATAR ----------
function updateAvatar() {
  const next = {
    x: avatar.x + input.moveX * avatar.speed,
    z: avatar.z + input.moveZ * avatar.speed,
    width: avatar.width,
    height: avatar.height
  };

  // room bounds
  next.x = Math.max(0, Math.min(ROOM_WIDTH - avatar.width, next.x));
  next.z = Math.max(0, Math.min(FLOOR_HEIGHT, next.z));

  // collision with furniture
  for (const item of furniture) {
    if (collides(next, item)) {
      return; // pohyb se zruší
    }
  }

  // apply movement
  avatar.x = next.x;
  avatar.z = next.z;
}

// ---------- RENDER ----------
function render() {
  const el = document.getElementById("avatar");

  el.style.left = avatar.x + "px";
  el.style.bottom = (FLOOR_HEIGHT - avatar.z) + "px";

  // 🔑 AVATAR JE VŽDY PŘED NÁBYTKEM
  el.style.zIndex = 10;
}

// ---------- LOOP ----------
function loop() {
  updateInput();
  updateAvatar();
  render();
  requestAnimationFrame(loop);
}

loop();
