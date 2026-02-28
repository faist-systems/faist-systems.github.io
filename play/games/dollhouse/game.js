// ======================================
// FAIST – Dollhouse
// World Loader + Interactions v0.1
// ======================================

const STORAGE_KEY = "faist_dollhouse_world";

let currentWorld = null;
let draggedItem = null;
let dragOffset = { x: 0, y: 0 };

// ======================================
// INIT
// ======================================

document.addEventListener("DOMContentLoaded", () => {
  loadWorld().then(world => {
    currentWorld = world;
    renderWorld();
  });
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
  roomEl.dataset.roomId = room.id;
  app.appendChild(roomEl);

  // Nábytek
  room.furniture.forEach(item => {
    const el = document.createElement("div");
    el.className = `furniture ${item.type}`;
    el.style.left = item.position.x + "px";
    el.style.top = item.position.y + "px";
    el.textContent = item.type;
    el.dataset.id = item.id;

    enableDrag(el, item, room);

    roomEl.appendChild(el);
  });

  // Pet
  const pet = currentWorld.pet;
  const petEl = document.createElement("div");
  petEl.className = "pet";
  petEl.textContent = pet.name;
  petEl.style.left = pet.position.x + "px";
  petEl.style.top = pet.position.y + "px";

  roomEl.appendChild(petEl);
}

// ======================================
// DRAG & DROP
// ======================================

function enableDrag(element, item, room) {
  element.addEventListener("mousedown", e => {
    draggedItem = { element, item, room };
    dragOffset.x = e.offsetX;
    dragOffset.y = e.offsetY;
    element.style.zIndex = 1000;
  });
}

document.addEventListener("mousemove", e => {
  if (!draggedItem) return;

  const roomEl = document.querySelector(".room");
  const rect = roomEl.getBoundingClientRect();

  let x = e.clientX - rect.left - dragOffset.x;
  let y = e.clientY - rect.top - dragOffset.y;

  // hranice místnosti
  x = Math.max(0, Math.min(x, rect.width - draggedItem.element.offsetWidth));
  y = Math.max(0, Math.min(y, rect.height - draggedItem.element.offsetHeight));

  draggedItem.element.style.left = x + "px";
  draggedItem.element.style.top = y + "px";
});

document.addEventListener("mouseup", () => {
  if (!draggedItem) return;

  // uložíme pozici
  draggedItem.item.position.x =
    parseInt(draggedItem.element.style.left);
  draggedItem.item.position.y =
    parseInt(draggedItem.element.style.top);

  saveWorld(currentWorld);

  draggedItem.element.style.zIndex = "";
  draggedItem = null;
});
