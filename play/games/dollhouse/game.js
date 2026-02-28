// ======================================
// FAIST – Dollhouse
// Stable single-source world state
// ======================================

// ----- CONFIG -----
const FLOOR_HEIGHT_RATIO = 0.35;
const STORAGE_KEY = "faist_dollhouse_world_v1";

// ----- STATE -----
let worldState = null;
let dragState = null;

// ======================================
// INIT
// ======================================
document.addEventListener("DOMContentLoaded", () => {
  worldState = loadWorld();
  renderWorld();
});

// ======================================
// WORLD LOAD / SAVE
// (tahle část se později nahradí serverem)
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
  saveWorld(fresh);
  return fresh;
}

function saveWorld(world) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(world));
}

// ======================================
// DEFAULT WORLD (jen při prvním spuštění)
// ======================================
function createDefaultWorld() {
  return {
    player: {
      name: { vocative: "Lauro" }
    },
    house: {
      rooms: [
        {
          id: "room-1",
          bounds: { width: 800, height: 500 },
          furniture: [
            { id: "f1", type: "sofa", position: { x: 80, y: 320 } },
            { id: "f2", type: "table", position: { x: 300, y: 360 } },
            { id: "f3", type: "fridge", position: { x: 550, y: 300 } }
          ]
        }
      ]
    }
  };
}

// ======================================
// RENDER
// ======================================
function renderWorld() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const title = document.createElement("h1");
  title.textContent = `Ahoj ${worldState.player.name.vocative}!`;
  app.appendChild(title);

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
    el.style.top = item.position.y + "px";

    enableDrag(el, item, room, roomData.furniture);
    enableClick(el, item);

    room.appendChild(el);
  });
}

// ======================================
// DRAG
// ======================================
function enableDrag(el, item, room, allItems) {
  el.addEventListener("pointerdown", e => {
    dragState = {
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
    if (!dragState) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    const nextX = dragState.baseX + dx;
    const nextY = dragState.baseY + dy;

    if (!collides(nextX, nextY, el, item, allItems)) {
      el.style.left = nextX + "px";
      el.style.top = nextY + "px";
    }
  });

  el.addEventListener("pointerup", e => {
    if (!dragState) return;
    el.releasePointerCapture(e.pointerId);

    applyConstraints(el, item, room);
    saveWorld(worldState);

    dragState = null;
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
      `.furniture.${other.type}`
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
// FLOOR + WALL CONSTRAINTS
// ======================================
function applyConstraints(el, item, room) {
  const roomHeight = room.offsetHeight;
  const floorTop = roomHeight * (1 - FLOOR_HEIGHT_RATIO);
  const floorBottom = roomHeight;

  let x = parseInt(el.style.left);
  let y = parseInt(el.style.top);

  const bottom = y + el.offsetHeight;

  // zadní zeď
  if (bottom < floorTop) {
    y = floorTop - el.offsetHeight;
  }

  // dno místnosti
  if (y > floorBottom - el.offsetHeight) {
    y = floorBottom - el.offsetHeight;
  }

  item.position.x = x;
  item.position.y = y;

  el.style.top = y + "px";
}

// ======================================
// CLICK ACTIONS
// ======================================
function enableClick(el, item) {
  el.addEventListener("click", () => {
    if (dragState) return;
    openAction(item.type);
  });
}

function openAction(type) {
  let title = "";
  let text = "";

  if (type === "fridge") {
    title = "Lednice";
    text = "Co si dáme dobrého?";
  } else if (type === "table") {
    title = "Stůl";
    text = "Tady se jí nebo maluje.";
  } else if (type === "sofa") {
    title = "Sedačka";
    text = "Chvilka odpočinku.";
  } else {
    title = "Předmět";
    text = "Něco se tady dá dělat.";
  }

  showModal(title, text);
}

// ======================================
// MODAL
// ======================================
function showModal(title, text) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";

  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <h2>${title}</h2>
    <p>${text}</p>
    <button>Zavřít</button>
  `;

  modal.querySelector("button").onclick = () => overlay.remove();
  overlay.onclick = e => {
    if (e.target === overlay) overlay.remove();
  };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
