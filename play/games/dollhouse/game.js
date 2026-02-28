// ======================================
// FAIST – Dollhouse Game Loop
// STABLE BASE: PC + Mobile safe
// ======================================

document.addEventListener("DOMContentLoaded", () => {

  // ----- ROOM -----
  const ROOM_WIDTH = 800;
  const FLOOR_DEPTH = 200;

  // ----- AVATAR -----
  const avatar = {
    x: 200,
    z: 120,
    width: 40,
    depth: 20,
    speed: 2
  };

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

  // ----- FURNITURE (SAFE LOAD) -----
  const furniture = Array.from(document.querySelectorAll(".furniture"))
    .map(el => ({
      el,
      x: parseInt(el.style.left || 0, 10),
      z: 0,                    // u zdi
      width: el.offsetWidth,
      depth: el.offsetHeight   // hloubka směrem k hráči
    }));

  // ----- INPUT RESOLUTION -----
  function updateInput() {
    input.moveX = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
    input.moveZ = (keys.up ? -1 : 0) + (keys.down ? 1 : 0);
  }

  // ----- COLLISION (AABB X/Z) -----
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

    // room bounds
    next.x = Math.max(0, Math.min(ROOM_WIDTH - avatar.width, next.x));
    next.z = Math.max(0, Math.min(FLOOR_DEPTH - avatar.depth, next.z));

    // furniture collision
    for (const item of furniture) {
      if (collides(next, item)) return;
    }

    avatar.x = next.x;
    avatar.z = next.z;
  }

  // ----- RENDER -----
  function render() {
    const avatarEl = document.getElementById("avatar");
    if (!avatarEl) return;

    avatarEl.style.left = avatar.x + "px";
    avatarEl.style.bottom = (FLOOR_DEPTH - avatar.z) + "px";
    avatarEl.style.zIndex = Math.floor(avatar.z) + 10;

    for (const item of furniture) {
      item.el.style.left = item.x + "px";
      item.el.style.bottom = (FLOOR_DEPTH - item.depth) + "px";
      item.el.style.zIndex = 1;
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
});
