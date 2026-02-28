// ======================================
// FAIST – Dollhouse Game Loop
// FIX: Wall + furniture real Z collisions
// ======================================

// ----- ROOM -----
const ROOM_WIDTH = 800;
const FLOOR_DEPTH = 200; // hloubka podlahy (Z)

// ----- AVATAR -----
const avatar = {
  x: 200,
  z: 120,        // chodidla v prostoru
  width: 40,
  depth: 20,
  speed: 2
};

// ----- FURNITURE -----
// VŠECHEN NÁBYTEK JE U ZDI (z = 0) A MÁ HLOUBKU
const furniture = [
  {
    el: document.querySelectorAll(".furniture")[0],
    x: 280,
    z: 0,          // U ZDI
    width: 80,
    depth: 50      // směr k hráči
  },
  {
    el: document.querySelectorAll(".furniture")[1],
    x: 420,
    z: 0,          // U ZDI
    width: 60,
    depth: 70
  }
];

// ----- INPUT -----
const input = { moveX: 0, moveZ: 0 };
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

// ----- INPUT RESOLUTION -----
function updateInput() {
  input.moveX = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
  input.moveZ = (keys.up ? -1 : 0) + (keys.down ? 1 : 0);
}

// ----- COLLISION (AABB v X/Z) -----
function collides(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.z < b.z + b.depth &&
    a.z + a.depth > b.z
  );
}

// ----- UPDATE AVATAR -----
function updateAvatar() {
  const next = {
    x: avatar.x + input.moveX * avatar.speed,
    z: avatar.z + input.moveZ * avatar.speed,
    width: avatar.width,
    depth: avatar.depth
  };

  // X bounds
  next.x = Math.max(0, Math.min(ROOM_WIDTH - avatar.width, next.x));

  // Z bounds = ZEĎ JE FYZICKÁ
  next.z = Math.max(0, Math.min(FLOOR_DEPTH - avatar.depth, next.z));

  // COLLISION WITH FURNITURE
  for (const item of furniture) {
    if (collides(next, item)) {
      return; // STOP – narazil
    }
  }

  avatar.x = next.x;
  avatar.z = next.z;
}

// ----- RENDER -----
function render() {
  const avatarEl = document.getElementById("avatar");

  avatarEl.style.left = avatar.x + "px";
  avatarEl.style.bottom = (FLOOR_DEPTH - avatar.z) + "px";
  avatarEl.style.zIndex = Math.floor(avatar.z) + 10;

  for (const item of furniture) {
    item.el.style.left = item.x + "px";
    item.el.style.bottom = (FLOOR_DEPTH - item.z - item.depth) + "px";
    item.el.style.zIndex = Math.floor(item.z);
  }
}

// ----- LOOP -----
function loop() {
  updateInput();
  updateAvatar();
  render();
  requestAnimationFrame(loop);
}

loop();
