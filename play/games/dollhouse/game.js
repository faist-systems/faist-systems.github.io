// ======================================
// FAIST – Dollhouse
// HOLD halo + MOVE + FAST TAP
// ======================================

// ----- CONFIG -----
const FLOOR_HEIGHT_RATIO = 0.35;
const STORAGE_KEY = "faist_dollhouse_world_v1";

const HOLD_TIME_MS = 2000;
const MOVE_THRESHOLD_PX = 6;
const TAP_TIME_MS = 250;

// ----- STATE -----
let worldState = null;
let gesture = null;

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
    el.textContent = item.type;
    el.style.left = item.position.x + "px";
    el.style.top  = item.position.y + "px";

    const ring = document.createElement("div");
    ring.className = "hold-ring";
    el.appendChild(ring);

    enableGestures(el, item, room);
    room.appendChild(el);
  });
}

// ======================================
// GESTURES
// ======================================
function enableGestures(el, item, room) {
  el.addEventListener("pointerdown", e => {
    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = performance.now();

    let moved = false;
    let holdDone = false;

    el.style.setProperty("--hold-progress", "0deg");

    function animateHold(now) {
      if (!gesture || moved) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / HOLD_TIME_MS, 1);
      el.style.setProperty("--hold-progress", `${progress * 360}deg`);

      if (progress < 1) {
        requestAnimationFrame(animateHold);
      } else {
        holdDone = true;
        openAction(item.type);
      }
    }

    gesture = {
      el, item, room,
      startX, startY, startTime,
      baseX: item.position.x,
      baseY: item.position.y,
      moved,
      holdDone
    };

    el.setPointerCapture(e.pointerId);
    requestAnimationFrame(animateHold);
  });

  el.addEventListener("pointermove", e => {
    if (!gesture) return;

    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;

    if (Math.abs(dx) > MOVE_THRESHOLD_PX || Math.abs(dy) > MOVE_THRESHOLD_PX) {
      gesture.moved = true;
      el.style.setProperty("--hold-progress", "0deg");

      el.style.left = gesture.baseX + dx + "px";
      el.style.top  = gesture.baseY + dy + "px";
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

    if (!gesture.holdDone && elapsed <= TAP_TIME_MS) {
      markSelected(el);
    }

    gesture = null;
  });
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

// ======================================
// ACTION (HOLD)
// ======================================
function openAction(type) {
  alert(type === "fridge"
    ? "Lednice – co si dáme?"
    : "Akce objektu");
}
