// ======================================
// FAIST – Dollhouse
// World Loader + Drag & Drop + Gravity (FIX)
// ======================================

const STORAGE_KEY = "faist_dollhouse_world";
const FLOOR_RATIO = 0.65; // kde začíná podlaha (65 % výšky místnosti)

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

    enableDrag(el, item, room, roomEl);
    roomEl.appendChild(el);
  });
}

// ======================================
// DRAG & DROP
// ======================================

function enableDrag(element, item, room, roomEl) {
  element.addEventListener("pointerdown", e => {
    e.preventDefault();

    dragState = {
      element,
      item,
      startX: e.clientX,
      startY: e.clientY,
      originX: item.position.x,
      originY: item.position.y
    };

    element.setPointerCapture(e.pointerId);
    element.style.zIndex = 1000;
  });

  element.addEventListener("pointermove", e => {
    if (!dragState) return;

    const rect = roomEl.getBoundingClientRect();

    let x = dragState.originX + (e.clientX - dragState.startX);
    let y = dragState.originY + (e.clientY - dragState.startY);

    x = Math.max(0, Math.min(x, rect.width - element.offsetWidth));
    y = Math.max(0, Math.min(y, rect.height - element.offsetHeight));

    element.style.left = x + "px";
    element.style.top = y + "px";
  });

  element.addEventListener("pointerup", e => {
    if (!dragState) return;

    element.releasePointerCapture(e.pointerId);
    element.style.zIndex = "";

    // 1️⃣ spočítáme gravitaci DO DAT
    applyGravityToItem(item, element, roomEl);

    // 2️⃣ uložíme svět
    saveWorld(currentWorld);

    // 3️⃣ znovu vykreslíme (pravda je v datech)
    renderWorld();

    dragState = null;
  });
}

// ======================================
// GRAVITY – DATA FIRST
// ======================================

function applyGravityToItem(item, element, roomEl) {
  const roomHeight = roomEl.offsetHeight;
  const floorY = Math.floor(roomHeight * FLOOR_RATIO);

  const targetY = floorY - element.offsetHeight;

  // uložíme PŘÍMO DO SVĚTA
  item.position.y = Math.max(0, targetY);

  // x zůstává tak, jak ho dítě pustilo
  item.position.x = parseInt(element.style.left);
}
