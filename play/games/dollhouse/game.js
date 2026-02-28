// ======================================
// FAIST – Dollhouse Game Loop
// STEP B: Virtual Joystick
// ======================================

// ---------- ROOM ----------
const room = {
  width: 800,
  floorZMin: 0,
  floorZMax: 180
};

// ---------- AVATAR ----------
const avatar = {
  x: 200,
  z: 80,
  width: 40,
  height: 60,
  speed: 2
};

// ---------- INPUT (CENTRAL) ----------
const input = {
  moveX: 0,
  moveZ: 0
};

// ---------- KEYBOARD ----------
const keys = { left:false, right:false, up:false, down:false };

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

// ---------- JOYSTICK ----------
const base = document.getElementById("joystick-base");
const knob = document.getElementById("joystick-knob");
let joyActive = false;
let joyCenter = { x:0, y:0 };

base?.addEventListener("touchstart", e => {
  joyActive = true;
  const r = base.getBoundingClientRect();
  joyCenter.x = r.left + r.width / 2;
  joyCenter.y = r.top + r.height / 2;
});

window.addEventListener("touchmove", e => {
  if (!joyActive) return;
  const t = e.touches[0];
  let dx = t.clientX - joyCenter.x;
  let dy = t.clientY - joyCenter.y;

  const dist = Math.min(40, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);

  dx = Math.cos(angle) * dist;
  dy = Math.sin(angle) * dist;

  knob.style.left = 30 + dx + "px";
  knob.style.top  = 30 + dy + "px";

  input.moveX = dx / 40;
  input.moveZ = dy / 40;
});

window.addEventListener("touchend", () => {
  joyActive = false;
  input.moveX = 0;
  input.moveZ = 0;
  knob.style.left = "30px";
  knob.style.top  = "30px";
});

// ---------- INPUT RESOLUTION ----------
function updateInput() {
  if (!joyActive) {
    input.moveX = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
    input.moveZ = (keys.up ? -1 : 0) + (keys.down ? 1 : 0);
  }
}

// ---------- UPDATE ----------
function updateAvatar() {
  avatar.x += input.moveX * avatar.speed;
  avatar.z += input.moveZ * avatar.speed;

  avatar.x = Math.max(0, Math.min(room.width - avatar.width, avatar.x));
  avatar.z = Math.max(room.floorZMin, Math.min(room.floorZMax, avatar.z));
}

// ---------- RENDER ----------
function renderAvatar() {
  const el = document.getElementById("avatar");
  el.style.left = avatar.x + "px";
  el.style.bottom = avatar.z + "px";
  el.style.zIndex = Math.floor(avatar.z);
}

// ---------- LOOP ----------
function loop() {
  updateInput();
  updateAvatar();
  renderAvatar();
  requestAnimationFrame(loop);
}

loop();
