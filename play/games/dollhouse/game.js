// ======================================
// FAIST – Dollhouse
// World Loader v0.1
// ======================================

const STORAGE_KEY = "faist_dollhouse_world";

// Hlavní vstupní bod hry
document.addEventListener("DOMContentLoaded", () => {
  loadWorld().then(world => {
    console.log("🌍 Svět načten:", world);
    renderWorld(world);
  });
});

// ======================================
// Načtení světa
// ======================================

async function loadWorld() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn("⚠️ Poškozený uložený svět, načítám nový.");
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const response = await fetch("world.json");
  const world = await response.json();

  saveWorld(world);
  return world;
}

// ======================================
// Uložení světa
// ======================================

function saveWorld(world) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(world));
}

// ======================================
// Základní renderer (dočasný)
// ======================================

function renderWorld(world) {
  const app = document.getElementById("app");

  if (!app) {
    console.error("❌ Chybí #app kontejner v index.html");
    return;
  }

  app.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = `Ahoj ${world.player.name.forms.vocative}!`;
  app.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.textContent = world.house.name;
  app.appendChild(subtitle);

  const room = world.house.rooms[0];

  const roomEl = document.createElement("div");
  roomEl.className = "room";
  roomEl.style.width = room.bounds.width + "px";
  roomEl.style.height = room.bounds.height + "px";

  app.appendChild(roomEl);

  room.furniture.forEach(item => {
    const el = document.createElement("div");
    el.className = `furniture ${item.type}`;
    el.style.left = item.position.x + "px";
    el.style.top = item.position.y + "px";
    el.textContent = item.type;
    roomEl.appendChild(el);
  });

  const pet = world.pet;
  const petEl = document.createElement("div");
  petEl.className = "pet";
  petEl.style.left = pet.position.x + "px";
  petEl.style.top = pet.position.y + "px";
  petEl.textContent = pet.name;

  roomEl.appendChild(petEl);
}

// ======================================
// API pro budoucí změny světa
// ======================================

function updateWorld(mutator) {
  const world = JSON.parse(localStorage.getItem(STORAGE_KEY));
  mutator(world);
  saveWorld(world);
  renderWorld(world);
}
