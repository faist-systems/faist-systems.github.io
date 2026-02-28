// ======================================
// FAIST – Dollhouse
// Back Wall Alignment (FINAL)
// ======================================

const STORAGE_KEY = "faist_dollhouse_world";
const FLOOR_HEIGHT_RATIO = 0.35;
const SNAP_DURATION = 180;

let world = null;
let drag = null;

document.addEventListener("DOMContentLoaded", async () => {
  world = await loadWorld();
  render();
});

// --------------------------------------

async function loadWorld() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  const res = await fetch("world.json");
  const w = await res.json();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(w));
  return w;
}

function saveWorld() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(world));
}

// --------------------------------------

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const h1 = document.createElement("h1");
  h1.textContent = `Ahoj ${world.player.name.forms.vocative}!`;
  app.appendChild(h1);

  const roomData = world.house.rooms[0];

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
    el.className = `furniture ${item.type}`;
    el.textContent = item.type;
    el.style.left = item.position.x + "px";
    el.style.top = item.position.y + "px";

    makeDraggable(el, item, room);
    room.appendChild(el);
  });
}

// --------------------------------------

function makeDraggable(el, item, room) {
  el.addEventListener("pointerdown", e => {
    drag = {
      el,
      item,
      startX: e.clientX,
      startY: e.clientY,
      baseX: item.position.x,
      baseY: item.position.y
    };
    el.style.transition = "";
    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener("pointermove", e => {
    if (!drag) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    el.style.left = drag.baseX + dx + "px";
    el.style.top = drag.baseY + dy + "px";
  });

  el.addEventListener("pointerup", e => {
    if (!drag) return;

    el.releasePointerCapture(e.pointerId);

    alignToFloor(el, item, room);

    saveWorld();
    drag = null;
  });
}

// --------------------------------------
// CORE LOGIC – BACK WALL ALIGNMENT
// --------------------------------------

function alignToFloor(el, item, room) {
  const roomHeight = room.offsetHeight;
  const floorTop = roomHeight * (1 - FLOOR_HEIGHT_RATIO);
  const floorBottom = roomHeight;

  let finalX = parseInt(el.style.left);
  let finalY = parseInt(el.style.top);

  const furnitureBottom = finalY + el.offsetHeight;

  let snapped = false;

  // 🔴 ZA ZDÍ → VRÁTIT NA ČERVENOU ČÁRU
  if (furnitureBottom < floorTop) {
    finalY = floorTop - el.offsetHeight;
    snapped = true;
  }

  // 🔴 MIMO PODLAHU DOLE
  if (finalY > floorBottom - el.offsetHeight) {
    finalY = floorBottom - el.offsetHeight;
    snapped = true;
  }

  item.position.x = finalX;
  item.position.y = finalY;

  if (snapped) {
    el.style.transition = `top ${SNAP_DURATION}ms cubic-bezier(0.25, 0.8, 0.25, 1)`;
  }

  el.style.top = finalY + "px";

  setTimeout(() => {
    el.style.transition = "";
  }, SNAP_DURATION);
}
