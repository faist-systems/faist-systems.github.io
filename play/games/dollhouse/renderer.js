// ======================================
// FAIST – Dollhouse Renderer
// STEP 2: Floor-based 2.5D projection
// ======================================

// --------------------------------------------------
// ROOM VISUAL CONSTANTS
// --------------------------------------------------

const ROOM_WIDTH = 800;
const ROOM_HEIGHT = 360;

const FLOOR_HEIGHT = 120;        // vizuální výška podlahy
const WALL_HEIGHT = ROOM_HEIGHT - FLOOR_HEIGHT;

// jemná perspektiva (NE výška!)
const DEPTH_PERSPECTIVE = 0.1;

// --------------------------------------------------
// ROOT
// --------------------------------------------------

const gameRoot = document.getElementById("game");

// --------------------------------------------------
// MAIN RENDER
// --------------------------------------------------

export function renderRoom(room) {
  if (!room) return;

  gameRoot.innerHTML = "";

  // ==============================
  // ROOM CONTAINER (KAMERA ZAMČENÁ)
  // ==============================

  const roomEl = document.createElement("div");
  roomEl.style.position = "absolute";
  roomEl.style.width = `${ROOM_WIDTH}px`;
  roomEl.style.height = `${ROOM_HEIGHT}px`;
  roomEl.style.left = "50%";
  roomEl.style.top = "50%";
  roomEl.style.transform = "translate(-50%, -50%)";
  roomEl.style.background = "#ffc1dd";
  roomEl.style.borderRadius = "24px";
  roomEl.style.boxShadow = "0 24px 60px rgba(0,0,0,0.25)";
  roomEl.style.overflow = "hidden";

  // ==============================
  // WALL (ZADNÍ ZEĎ)
  // ==============================

  const wall = document.createElement("div");
  wall.style.position = "absolute";
  wall.style.left = "0";
  wall.style.top = "0";
  wall.style.width = "100%";
  wall.style.height = `${WALL_HEIGHT}px`;
  wall.style.background = "#ffd9eb";
  roomEl.appendChild(wall);

  // ==============================
  // FLOOR
  // ==============================

  const floor = document.createElement("div");
  floor.style.position = "absolute";
  floor.style.left = "0";
  floor.style.bottom = "0";
  floor.style.width = "100%";
  floor.style.height = `${FLOOR_HEIGHT}px`;
  floor.style.background = "#f2c89b";
  roomEl.appendChild(floor);

  // ==============================
  // ENTITIES (SORT BY Z)
  // ==============================

  const sorted = [...room.entities].sort(
    (a, b) => a.transform.z - b.transform.z
  );

  for (const entity of sorted) {
    renderEntity(roomEl, entity);
  }

  gameRoot.appendChild(roomEl);
}

// --------------------------------------------------
// ENTITY RENDER
// --------------------------------------------------

function renderEntity(roomEl, entity) {
  const el = document.createElement("div");

  const { x, z, y } = entity.transform;
  const { width, height } = entity.size;

  // ==============================
  // FLOOR-BASED PROJECTION
  // ==============================

  const floorTop = ROOM_HEIGHT - FLOOR_HEIGHT;

  const screenX = x;
  const screenY =
    floorTop -           // horní hrana podlahy
    height -             // stojí NA podlaze
    y -                  // výška nad podlahou (většinou 0)
    z * DEPTH_PERSPECTIVE; // jen optická hloubka

  el.style.position = "absolute";
  el.style.left = `${screenX}px`;
  el.style.top = `${screenY}px`;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  // čím blíž (menší z), tím víc vepředu
  el.style.zIndex = Math.floor(1000 - z);

  // ==============================
  // DOČASNÝ VZHLED
  // ==============================

  if (entity.kind === "avatar") {
    el.style.background = "#6dd3ff";
    el.style.borderRadius = "12px";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.fontSize = "24px";
    el.textContent = "🙂";
  } else {
    el.style.background = entity.physics.canSupport
      ? "#ffd27f"
      : "#d0d0d0";
    el.style.borderRadius = "10px";
  }

  roomEl.appendChild(el);
}
