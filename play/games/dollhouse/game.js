/* ======================================
   FAIST – Dollhouse Game Logic
   KROK 4: Avatar X + Z movement (2.5D)
   ====================================== */

// ===============================
// DOM REFERENCES
// ===============================

const roomEl = document.querySelector(".room");
const floorEl = document.querySelector(".floor");
const avatarEl = document.querySelector(".avatar");

// ===============================
// ROOM CONSTANTS
// ===============================

const ROOM_WIDTH = 800;
const FLOOR_HEIGHT = 120;

// hloubka podlahy (kolik prostoru má Z)
const FLOOR_DEPTH = 160;

// ===============================
// AVATAR CONSTANTS
// ===============================

const AVATAR_SPEED = 3;

// ===============================
// AVATAR STATE (WORLD COORDS)
// ===============================

const avatar = {
  x: 200,   // doleva / doprava
  z: 0      // hloubka po podlaze (0 = u zdi)
};

// ===============================
// INPUT
// ===============================

const input = {
  left: false,
  right: false,
  forward: false,
  backward: false
};

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") input.left = true;
  if (e.key === "ArrowRight") input.right = true;
  if (e.key === "ArrowUp") input.forward = true;
  if (e.key === "ArrowDown") input.backward = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") input.left = false;
  if (e.key === "ArrowRight") input.right = false;
  if (e.key === "ArrowUp") input.forward = false;
  if (e.key === "ArrowDown") input.backward = false;
});

// ===============================
// UPDATE AVATAR
// ===============================

function updateAvatar() {
  // X movement
  if (input.left) avatar.x -= AVATAR_SPEED;
  if (input.right) avatar.x += AVATAR_SPEED;

  // Z movement (hloubka)
  if (input.forward) avatar.z += AVATAR_SPEED;
  if (input.backward) avatar.z -= AVATAR_SPEED;

  // X bounds
  avatar.x = Math.max(
    0,
    Math.min(ROOM_WIDTH - avatarEl.offsetWidth, avatar.x)
  );

  // Z bounds (po podlaze)
  avatar.z = Math.max(
    0,
    Math.min(FLOOR_DEPTH - avatarEl.offsetHeight, avatar.z)
  );

  // ===============================
  // MAP WORLD → SCREEN
  // ===============================
  // X → left
  avatarEl.style.left = avatar.x + "px";

  // Z → bottom (podlaha + hloubka)
  avatarEl.style.bottom = (FLOOR_HEIGHT + avatar.z) + "px";
}

// ===============================
// GAME LOOP
// ===============================

function gameLoop() {
  updateAvatar();
  requestAnimationFrame(gameLoop);
}

// ===============================
// START
// ===============================

gameLoop();
