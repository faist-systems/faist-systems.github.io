/* ======================================
   FAIST – Dollhouse Game Logic
   KROK 4 (FIX): Z pohyb PO PODLAZE
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

// skutečná hloubka podlahy (od zdi ke kraji)
const FLOOR_DEPTH = 120;

// ===============================
// AVATAR CONSTANTS
// ===============================

const AVATAR_SPEED = 3;

// ===============================
// AVATAR STATE (WORLD COORDS)
// ===============================

const avatar = {
  x: 200,   // doleva / doprava
  z: 0      // 0 = u zdi, max = u spodního okraje podlahy
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

  // Z movement (po podlaze)
  if (input.forward) avatar.z -= AVATAR_SPEED;   // ke zdi
  if (input.backward) avatar.z += AVATAR_SPEED;  // k sobě

  // X bounds
  avatar.x = Math.max(
    0,
    Math.min(ROOM_WIDTH - avatarEl.offsetWidth, avatar.x)
  );

  // Z bounds (jen v podlaze)
  avatar.z = Math.max(
    0,
    Math.min(FLOOR_DEPTH - avatarEl.offsetHeight, avatar.z)
  );

  // ===============================
  // MAP WORLD → SCREEN
  // ===============================

  avatarEl.style.left = avatar.x + "px";

  // KLÍČOVÁ OPRAVA:
  // avatar je vždy NA PODLAZE
  avatarEl.style.bottom =
    (FLOOR_HEIGHT - avatar.z) + "px";
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
