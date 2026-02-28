// ======================================
// FAIST – Dollhouse
// Modes + HOLD + TAP + MOVE + COLLISIONS
// ======================================

// ----- CONFIG -----
const FLOOR_HEIGHT_RATIO = 0.35;
const STORAGE_KEY = "faist_dollhouse_world_v1";

const HOLD_TIME_MS = 2000;
const MOVE_THRESHOLD_PX = 6;
const TAP_TIME_MS = 250;

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
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
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
        id: "room-1",
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

    const panel = createObjectPanel(item);
    el.appendChild(panel);

    enableGestures(el, item, room, roomData.furniture);

    room.appendChild(el);
  });
}

// ======================================
// OBJECT PANEL (PLACEHOLDER)
// ======================================
function createObjectPanel(item) {
  const panel = document.createElement("div");
  panel.className = "object-panel";
  panel.style.display = "none";

  panel.innerHTML = `
    <strong>${item.type}</strong><br>
    <small>(obsah přijde později)</small><br><br>
    <button>Zavřít</button>
  `;

  panel.querySelector("button").onclick = e => {
    e.stopPropagation();
    closeInteraction();
  };

  return panel;
}

// ======================================
// GESTURES
// ======================================
function enableGestures(el, item, room, allItems) {
  el.addEventListener("pointerdown", e => {
    if (gameMode !== MODE_NORMAL) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = performance.now();

    el.style.setProperty("--hold-progress", "0deg");

    function animateHold(now) {
      if (!gesture || gesture.moved) return;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / HOLD_TIME_MS, 1);
      el.style.setProperty("--hold-progress", `${progress * 360}deg`);

      if (progress < 1) {
        requestAnimationFrame(animateHold);
      } else {
        openInteraction(el);
      }
    }

    gesture = {
      el,
      item,
      room,
      allItems,
      startX,
      startY,
      startTime,
      baseX: item.position.x,
      baseY: item.position.y,
      moved: false
    };

    el.setPointerCapture(e.pointerId);
    requestAnimationFrame(animateHold);
  });

  el.addEventListener("pointermove", e => {
    if (!gesture || gameMode !== MODE_NORMAL) return;

    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;

    if (Math.abs(dx) > MOVE_THRESHOLD_PX || Math.abs(dy) > MOVE_THRESHOLD_PX) {
      gesture.moved = true;
      el.style.setProperty("--hold-progress", "0deg");

      const nextX = gesture.baseX + dx;
      const nextY = gesture.baseY + dy;

      if (!collides(nextX, nextY, el, item, gesture.allItems)) {
        el.style.left = nextX + "px";
        el.style.top  = nextY + "px";
      }
    }
  });

  el.addEventListener("pointerup", e => {
    if (!gesture) return;

    el.releasePointerCapture(e.pointerId);
    el.style.setProperty("--hold-progress", "0deg");

    const elapsed = performance.now() - gesture.startTime;

    if (gesture.moved) {
      applyConstraints(el, item, room);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(worldState));
      gesture = null;
      return;
    }

    if (elapsed <= TAP_TIME_MS && gameMode === MODE_NORMAL) {
      markSelected(el);
    }

    gesture = null;
  });
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

    const overlap =
      rectA.left < rectB.right &&
      rectA.right > rectB.left &&
      rectA.top < rectB.bottom &&
      rectA.bottom > rectB.top;

    if (overlap) return true;
  }

  return false;
}

// ======================================
// INTERACTION MODE
// ======================================
function openInteraction(el) {
  gameMode = MODE_INTERACTING;
  el.querySelector(".object-panel").style.display = "block";
}

function closeInteraction() {
  document.querySelectorAll(".object-panel")
    .forEach(p => p.style.display = "none");
  gameMode = MODE_NORMAL;
}

// ======================================
// CONSTRAINTS
// ======================================
function applyConstraints(el, item, room) {
  const roomHeight = room.offsetHeight;
  const floorTop = roomHeight * (1 - FLOOR_HEIGHT_RATIO);
  const floorBottom = roomHeight;

  let x = parseInt(el.style.left);
  let y = parseInt(el.style.top);

  const bottom = y + el.offsetHeight;

  if (bottom < floorTop) y = floorTop - el.offsetHeight;
  if (y > floorBottom - el.offsetHeight) y = floorBottom - el.offsetHeight;

  item.position.x = x;
  item.position.y = y;
  el.style.top = y + "px";
}

// ======================================
// FAST TAP SELECT
// ======================================
function markSelected(el) {
  document.querySelectorAll(".furniture.selected")
    .forEach(e => e.classList.remove("selected"));

  el.classList.add("selected");
  setTimeout(() => el.classList.remove("selected"), 600);
}
