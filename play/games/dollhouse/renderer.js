// ======================================
// FAIST – Renderer (Room-Locked, Floor-Based)
// ======================================

const ROOM_WIDTH = 800;
const ROOM_HEIGHT = 360;
const FLOOR_HEIGHT = 120;

// jemná hloubka (schválně MALÁ)
const DEPTH_FACTOR = 0.15;

// root
const gameRoot = document.getElementById("game");

export function renderRoom(room) {
  gameRoot.innerHTML = "";

  // === ROOM ===
  const roomEl = document.createElement("div");
  roomEl.style.position = "absolute";
  roomEl.style.width = `${ROOM_WIDTH}px`;
  roomEl.style.height = `${ROOM_HEIGHT}px`;
  roomEl.style.left = "50%";
  roomEl.style.top = "50%";
  roomEl.style.transform = "translate(-50%, -50%)";
  roomEl.style.background = "#ffb3d9";
  roomEl.style.borderRadius = "24px";
  roomEl.style.boxShadow = "0 20px 60px rgba(0,0,0,0.25)";
  roomEl.style.overflow = "hidden";

  // === FLOOR ===
  const floor = document.createElement("div");
  floor.style.position = "absolute";
  floor.style.left = "0";
  floor.style.right = "0";
  floor.style.bottom = "0";
  floor.style.height = `${FLOOR_HEIGHT}px`;
  floor.style.background = "#f4c49a";
  roomEl.appendChild(floor);

  // === ENTITIES ===
  const sorted = [...room.entities].sort(
    (a, b) => a.transform.z - b.transform.z
  );

  for (const entity of sorted) {
    renderEntity(roomEl, entity);
  }

  gameRoot.appendChild(roomEl);
}

function renderEntity(roomEl, entity) {
  const el = document.createElement("div");

  const { x, y, z } = entity.transform;
  const { width, height } = entity.size;

  // 🔑 KLÍČ: podlaha jako reference
  const floorTop = ROOM_HEIGHT - FLOOR_HEIGHT;

  const screenX = x;
  const screenY =
    floorTop -
    height -          // stojí NA podlaze
    z * DEPTH_FACTOR - // jemný posun dozadu
    y;                 // vertikální posun (stohování)

  el.style.position = "absolute";
  el.style.left = `${screenX}px`;
  el.style.top = `${screenY}px`;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.zIndex = Math.floor(1000 - z);

  // dočasný vzhled
  if (entity.kind === "avatar") {
    el.style.background = "#6dd3ff";
    el.style.borderRadius = "12px";
    el.textContent = "🙂";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
  } else if (entity.physics.canSupport) {
    el.style.background = "#ffd27f";
    el.style.borderRadius = "10px";
  } else {
    el.style.background = "#d0d0d0";
    el.style.borderRadius = "10px";
  }

  roomEl.appendChild(el);
}
