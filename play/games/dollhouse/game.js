/* ======================================
   FAIST – Dollhouse Game Logic
   KROK 3: DOM-based movement
   ====================================== */

// ===============================
// DOM REFERENCES
// ===============================

const roomEl = document.querySelector(".room");
const floorEl = document.querySelector(".floor");
const avatarEl = document.querySelector(".avatar");
const furnitureEls = document.querySelectorAll(".furniture");

// ===============================
// WORLD CONSTANTS (zatím jednoduché)
// ===============================

const ROOM_WIDTH = 800;
const FLOOR_HEIGHT = 120;
const AVATAR_SPEED = 4;

// ===============================
// AVATAR STATE
// ===============================

const avatar = {
  x: 200,
  y: 0,        // výška nad podlahou (zatím vždy 0)
  z: 0         // hloubka – zatím nepoužíváme
};

// ===============================
// INPUT
// ===============================

const input = {
  left: false,
  right: false
};

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") input.left = true;
  if (e.key === "ArrowRight") input.right = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") input.left = false;
  if (e.key === "ArrowRight") input.right = false;
});

// ===============================
// UPDATE LOOP
// ===============================

function updateAvatar() {
  if (input.left) avatar.x -= AVATAR_SPEED;
  if (input.right) avatar.x += AVATAR_SPEED;

  // hranice místnosti
  avatar.x = Math.max(0, Math.min(ROOM_WIDTH - avatarEl.offsetWidth, avatar.x));

  // aplikace do DOM
  avatarEl.style.left = avatar.x + "px";
  avatarEl.style.bottom = FLOOR_HEIGHT + "px";
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
