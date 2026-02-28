// ======================================
// FAIST – Dollhouse
// Floor Zone + Wall Stop + Soft Drop
// ======================================

const STORAGE_KEY = "faist_dollhouse_world";

// kolik spodku místnosti tvoří podlaha
const FLOOR_HEIGHT_RATIO = 0.35;

// jak dlouho trvá „dosednutí“ (ms)
const DROP_DURATION = 220;

let world = null;
let drag = null;

// --------------------------------------
// INIT
// --------------------------------------

document.addEventListener("DOMContentLoaded", async () => {
  world = await loadWorld();
  render();
});

// --------------------------------------
// LOAD / SAVE WORLD
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
// RENDER
// --------------------------------------

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = `Ahoj ${world.player.name.forms.vocative}!`;
  app.appendChild(title);

  const roomData = world.house.rooms[0];

  const room = document.createElement("div");
  room.className = "room";
  room.style.width = roomData.bounds.width + "px";
  room.style.height = roomData.bounds.height + "px";
  app.appendChild(room);

  // PODLAHOVÁ ZÓNA (vizuální)
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
// DRAG LOGIC
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

    el.style.transition = ""; // během tahu žádná animace
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

    applyFloorConstraints(el, item, room);

    saveWorld();
    drag = null;
  });
}

// --------------------------------------
// FLOOR + WALL CONSTRAINTS WITH SOFT DROP
// --------------------------------------

function applyFloorConstraints(el, item, room) {
  const roomHeight = room.offsetHeight;

  const floorTop = roomHeight * (1 - FLOOR_HEIGHT_RATIO);
  const floorBottom = roomHeight;

  let finalX = parseInt(el.style.left);
  let finalY = parseInt(el.style.top);

  // ⛔ NESMÍ PROJÍT „ZDÍ“ (spodní hrana nábytku)
  const furnitureBottom = finalY + el.offsetHeight;
  if (furnitureBottom < floorTop) {
    finalY = floorTop - el.offsetHeight;
  }

  // ⛔ NESMÍ VEN DOLE
  finalY = Math.min(finalY, floorBottom - el.offsetHeight);

  // 💾 uložíme do DAT
  item.position.x = finalX;
  item.position.y = finalY;

  // 🎞️ JEMNÉ DOSEDNUTÍ
  el.style.transition = `top ${DROP_DURATION}ms cubic-bezier(0.25, 0.8, 0.25, 1)`;
  el.style.top = finalY + "px";

  // po animaci transition vypneme
  setTimeout(() => {
    el.style.transition = "";
  }, DROP_DURATION);
}
