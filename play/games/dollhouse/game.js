// ======================================
// FAIST – Dollhouse
// Drag & Drop + HARD GRAVITY DEBUG
// ======================================

const STORAGE_KEY = "faist_dollhouse_world";

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
    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener("pointermove", e => {
    if (!drag) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    const x = drag.baseX + dx;
    const y = drag.baseY + dy;

    el.style.left = x + "px";
    el.style.top = y + "px";
  });

  el.addEventListener("pointerup", e => {
    if (!drag) return;

    el.releasePointerCapture(e.pointerId);

    // 🔥 HARD GRAVITY
    const roomHeight = room.offsetHeight;
    const elementHeight = el.offsetHeight;

    const finalY = roomHeight - elementHeight;

    console.log("GRAVITY:", finalY);

    // uložíme DO DAT
    item.position.x = parseInt(el.style.left);
    item.position.y = finalY;

    // vykreslíme DO DOM
    el.style.top = finalY + "px";

    localStorage.setItem(STORAGE_KEY, JSON.stringify(world));

    drag = null;
  });
}
