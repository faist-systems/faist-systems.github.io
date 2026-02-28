// ======================================
// FAIST – Dollhouse
// World Loader + Drag & Drop + Gravity v0.1
// ======================================

const STORAGE_KEY = "faist_dollhouse_world";

// kde začíná podlaha (65 % místnosti)
const FLOOR_RATIO = 0.65;

let currentWorld = null;
let dragState = null;

// ======================================
// INIT
// ======================================

document.addEventListener("DOMContentLoaded", async () => {
  currentWorld = await loadWorld();
  renderWorld();
});

// ======================================
// WORLD LOAD / SAVE
// ======================================

async function loadWorld() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const response = await fetch("world.json");
  const world = await response.json();
  saveWorld(world);
  return world;
}

function saveWorld(world) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(world));
}

// ======================================
// RENDER
// ======================================

function renderWorld() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = `Ahoj ${currentWorld.player.name.forms.vocative}!`;
  app.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.textContent = currentWorld.house.name;
  app.appendChild(subtitle);

  const room = currentWorld.house.rooms[0];

  const roomEl = document.createElement("div");
  roomEl.className = "room";
  roomEl.style.width = room.bounds.width + "px";
  roomEl.style.height = room.bounds.height + "px";
  app.appendChild(roomEl);

  room.furniture.forEach(item => {
    const el = document.createElement("div");
    el.className = `furniture ${item.type}`;
    el.textContent = item.type;
    el.style.left = item.position.x + "px";
    el.style.top = item.position.y + "px";
    el.dataset.id = item.id;

    enableDrag(el, item, room, roomEl);

    roomEl.appendChild(el);
  });

  const pet = currentWorld.pet;
  const petEl = document.createElement("div");
  petEl.className = "pet";
  petEl.textContent = pet.name;
  petEl.style.left = pet.position.x + "px";
  petEl.style.top = pet.position.y + "px";

  roomEl.appendChild(petEl);
}

// ======================================
// DRAG & DROP + GRAVITY
// ======================================

function enableDrag(element, item, room, roomEl) {
  element.addEventListener("pointerdown", e => {
    e.preventDefault();
    e.stopPropagation();

    dragState = {
      element,
      item,
      startX: e.clientX,
      startY: e.clientY,
      originX: item.position.x,
      originY: item.position.y
    };

    element.setPointerCapture(e.pointerId);
    element.style.zIndex = 9999;
  });

  element.addEventListener("pointermove", e => {
    if (!dragState) return;

    const rect = roomEl.getBoundingClientRect();

    let x = dragState.originX + (e.clientX - dragState.startX);
    let y = dragState.originY + (e.clientY - dragState.startY);

    // hranice místnosti
    x = Math.max(0, Math.min(x, rect.width - element.offsetWidth));
    y = Math.max(0, Math.min(y, rect.height - element.offsetHeight));

    element.style.left = x + "px";
    element.style.top = y + "px";
  });

  element.addEventListener("pointerup", e => {
    if (!dragState) return;

    applyGravity(element, roomEl);

    item.position.x = parseInt(element.style.left);
    item.position.y = parseInt(element.style.top);

    saveWorld(currentWorld);

    element.releasePointerCapture(e.pointerId);
    element.style.zIndex = "";
    dragState = null;
  });
}

// ======================================
// GRAVITY
// ======================================

function applyGravity(element, roomEl) {
  const roomHeight = roomEl.offsetHeight;
  const floorY = roomHeight * FLOOR_RATIO;

  const targetY =
    floorY - element.offsetHeight;

  // jemná animace „spadnutí“
  element.style.transition = "top 0.2s ease-out";
  element.style.top = targetY + "px";

  // po animaci vrátíme kontrolu
  setTimeout(() => {
    element.style.transition = "";
  }, 200);
}
