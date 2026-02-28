// ======================================
// FAIST – Dollhouse
// HOLD + TAP + MOVE + COLLISIONS + GRAVITY
// ======================================

// ----- CONFIG -----
const FLOOR_HEIGHT_RATIO = 0.35;
const STORAGE_KEY = "faist_dollhouse_world_v1";

const HOLD_TIME_MS = 2000;
const MOVE_THRESHOLD_PX = 6;
const TAP_TIME_MS = 250;

const GRAVITY_STEP = 4; // px per step

// ----- GAME MODES -----
const MODE_NORMAL = "NORMAL";
const MODE_INTERACTING = "INTERACTING";

// ----- STATE -----
let worldState = null;
let gesture = null;
let gameMode = MODE_NORMAL;

// ======================================
// INIT
// ======================================
document.addEventListener("DOMContentLoaded", () => {
  worldState = loadWorld();
  renderWorld();
});

// ======================================
// WORLD
// ======================================
function loadWorld() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); }
    catch { localStorage.removeItem(STORAGE_KEY); }
  }
  const fresh = createDefaultWorld();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function createDefaultWorld() {
  return {
    player: { name: { vocative: "Lauro" } },
    house: {
      rooms: [{
        bounds: { width: 800, height: 500 },
        furniture: [
          { id: "f1", type: "sofa",   position: { x: 80,  y: 320 } },
          { id: "f2", type: "table",  position: { x: 300, y: 360 } },
          { id: "f3", type: "fridge", position: { x: 550, y: 300 } }
        ]
      }]
    }
  };
}

// ======================================
// RENDER
// ======================================
function renderWorld() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const h1 = document.createElement("h1");
  h1.textContent = `Ahoj ${worldState.player.name.vocative}!`;
  app.appendChild(h1);

  const roomData = worldState.house.rooms[0];

  const room = document.createElement("div");
  room.className = "room";
  room.style.width = roomData.bounds.width + "px";
  room.style.height = roomData.bounds.height + "px";
  app.appendChild(room);

  const floor = document.createElement("div");
  floor.className = "floor-guide";
  room.appendChild(floor);

  roomData.furniture.forEach(item => {
    const el = document.createElement("div");
    el.className = "furniture " + item.type;
    el.dataset.id = item.id;
    el.textContent = item.type;
    el.style.left = item.position.x + "px";
    el.style.top  = item.position.y + "px";

    const ring = document.createElement("div");
    ring.className = "hold-ring";
    el.appendChild(ring);

    enableGestures(el, item, room, roomData.furniture);
    room.appendChild(el);
  });
}

// ======================================
// GESTURES
// ======================================
function enableGestures(el, item, room, allItems) {
  el.addEventListener("pointerdown", e => {
    if (gameMode !== MODE_NORMAL) return;

    gesture = {
      el,
      item,
      room,
      allItems,
      startX: e.clientX,
      startY: e.clientY,
      baseX: item.position.x,
      baseY: item.position.y,
      lastValidX: item.position.x,
      lastValidY: item.position.y,
      moved: false
    };

    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener("pointermove", e => {
    if (!gesture) return;

    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;

    if (Math.abs(dx) > MOVE_THRESHOLD_PX || Math.abs(dy) > MOVE_THRESHOLD_PX) {
      gesture.moved = true;

      const nx = gesture.baseX + dx;
      const ny = gesture.baseY + dy;

      if (!collides(nx, ny, el, item, gesture.allItems)) {
        el.style.left = nx + "px";
        el.style.top  = ny + "px";
        gesture.lastValidX = nx;
        gesture.lastValidY = ny;
      }
    }
  });

  el.addEventListener("pointerup", e => {
    if (!gesture) return;
    el.releasePointerCapture(e.pointerId);

    if (gesture.moved) {
      applyGravity(el, item, room, gesture);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(worldState));
    }

    gesture = null;
  });
}

// ======================================
// GRAVITY WITH COLLISION
// ======================================
function applyGravity(el, item, room, gesture) {
  const roomHeight = room.offsetHeight;
  const floorTop = roomHeight * (1 - FLOOR_HEIGHT_RATIO);

  let x = gesture.lastValidX;
  let y = gesture.lastValidY;

  let nextY = y;

  while (true) {
    nextY += GRAVITY_STEP;

    const bottom = nextY + el.offsetHeight;

    // podlaha
    if (bottom > roomHeight) {
      nextY = roomHeight - el.offsetHeight;
      break;
    }

    // kolize při pádu
    if (collides(x, nextY, el, item, gesture.allItems)) {
      break;
    }

    // zeď vzadu
    if (bottom < floorTop) {
      nextY = floorTop - el.offsetHeight;
      break;
    }

    y = nextY;
  }

  el.style.left = x + "px";
  el.style.top  = y + "px";

  item.position.x = x;
  item.position.y = y;
}

// ======================================
// COLLISIONS
// ======================================
function collides(x, y, el, currentItem, allItems) {
  const rectA = {
    left: x,
    top: y,
    right: x + el.offsetWidth,
    bottom: y + el.offsetHeight
  };

  for (const other of allItems) {
    if (other.id === currentItem.id) continue;

    const otherEl = document.querySelector(
      `.furniture[data-id="${other.id}"]`
    );
    if (!otherEl) continue;

    const ox = other.position.x;
    const oy = other.position.y;

    const rectB = {
      left: ox,
      top: oy,
      right: ox + otherEl.offsetWidth,
      bottom: oy + otherEl.offsetHeight
    };

    if (
      rectA.left < rectB.right &&
      rectA.right > rectB.left &&
      rectA.top < rectB.bottom &&
      rectA.bottom > rectB.top
    ) {
      return true;
    }
  }

  return false;
}
