// ======================================
// FAIST – Renderer (Room-Locked Camera)
// ======================================

// pevné nastavení místnosti
const ROOM_WIDTH = 800;
const ROOM_DEPTH = 400;

// vizuální projekce
const DEPTH_FACTOR = 0.25;
const FLOOR_SCREEN_Y = 420;

// root
const gameRoot = document.getElementById("game");

// ======================================
// RENDER ROOM (KAMERA UZAMČENÁ)
// ======================================
export function renderRoom(room) {
  gameRoot.innerHTML = "";

  // === ROOM BACKDROP ===
  const roomEl = document.createElement("div");
  roomEl.className = "room";
  roomEl.style.position = "absolute";
  roomEl.style.width = `${ROOM_WIDTH}px`;
  roomEl.style.height = `300px`;
  roomEl.style.left = "50%";
  roomEl.style.top = "50%";
  roomEl.style.transform = "translate(-50%, -50%)";
  roomEl.style.background = "#ffb3d9";
  roomEl.style.borderRadius = "24px";
  roomEl.style.boxShadow = "0 20px 60px rgba(0,0,0,0.2)";
  roomEl.style.overflow = "hidden";

  // === FLOOR ===
  const floor = document.createElement("div");
  floor.style.position = "absolute";
  floor.style.left = "0";
  floor.style.right = "0";
  floor.style.bottom = "0";
  floor.style.height = "120px";
  floor.style.background = "#f4c49a";
  roomEl.appendChild(floor);

  // sort by Z (hloubka)
  const sorted = [...room.entities].sort(
    (a, b) => a.transform.z - b.transform.z
  );

  for (const entity of sorted) {
    renderEntity(roomEl, entity);
  }

  gameRoot.appendChild(roomEl);
}

// ======================================
// RENDER ENTITY (RELATIVNĚ K MÍSTNOSTI)
// ======================================
function renderEntity(roomEl, entity) {
  const el = document.createElement("div");
  el.className = `entity ${entity.kind}`;

  const { x, y, z } = entity.transform;
  const { width, height } = entity.size;

  const screenX = x;
  const screenY = FLOOR_SCREEN_Y - z * DEPTH_FACTOR - y;

  el.style.position = "absolute";
  el.style.left = `${screenX}px`;
  el.style.bottom = `${screenY}px`;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.zIndex = Math.floor(1000 - z);

  // dočasný vizuál
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
