// ======================================
// FAIST – Dollhouse Game Loop
// FIX: Correct Z mapping
// ======================================

const FLOOR_HEIGHT = 200;
const ROOM_WIDTH = 800;

// AVATAR STATE
const avatar = {
  x: 200,
  z: 0,           // 0 = u zdi
  width: 40,
  height: 60,
  speed: 2
};

// INPUT
const input = {
  moveX: 0,
  moveZ: 0
};

const keys = { left:false, right:false, up:false, down:false };

// KEYBOARD
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

// INPUT RESOLUTION
function updateInput() {
  input.moveX = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
  input.moveZ = (keys.up ? -1 : 0) + (keys.down ? 1 : 0);
}

// UPDATE AVATAR
function updateAvatar() {
  avatar.x += input.moveX * avatar.speed;
  avatar.z += input.moveZ * avatar.speed;

  avatar.x = Math.max(0, Math.min(ROOM_WIDTH - avatar.width, avatar.x));
  avatar.z = Math.max(0, Math.min(FLOOR_HEIGHT, avatar.z));
}

// RENDER
function renderAvatar() {
  const el = document.getElementById("avatar");
  el.style.left = avatar.x + "px";

  // KLÍČ: Z = HLUBOKO → NIŽŠÍ bottom
  el.style.bottom = (FLOOR_HEIGHT - avatar.z) + "px";
  el.style.zIndex = Math.floor(avatar.z);
}

// LOOP
function loop() {
  updateInput();
  updateAvatar();
  renderAvatar();
  requestAnimationFrame(loop);
}

loop();
