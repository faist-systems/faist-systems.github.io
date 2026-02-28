/* ======================================
   FAIST – Dollhouse
   styles.css (shadow + preview)
====================================== */

* {
  box-sizing: border-box;
  user-select: none;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(#ffd1e8, #fff);
  display: flex;// ======================================
// FAIST – Dollhouse
// STABLE BASE VERSION (ROOM FIX)
// ======================================

const STORAGE_KEY = "faist_dollhouse_world";
const FLOOR_HEIGHT_RATIO = 0.35; // spodních 35 % = podlaha
const SNAP_DURATION = 220;

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
// LOAD / SAVE
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

  // 🔴 TADY SE TVOŘÍ ROOM – TO CHYBĚLO
  const room = document.createElement("div");
  room.className = "room";
  room.style.width = roomData.bounds.width + "px";
  room.style.height = roomData.bounds.height + "px";
  app.appendChild(room);

  // podlahová zóna
  const floor = document.createElement("div");
  floor.className = "floor-guide";
  room.appendChild(floor);

  // nábytek
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
    el.style.transition = "";
    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener("pointermove", e => {
    if (!drag) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    const nextX = drag.baseX + dx;
    const nextY = drag.baseY + dy;

    el.style.left = nextX + "px";
    el.style.top = nextY + "px";

    // preview u zdi
    const roomHeight = room.offsetHeight;
    const floorTop = roomHeight * (1 - FLOOR_HEIGHT_RATIO);
    const bottom = nextY + el.offsetHeight;

    if (bottom < floorTop) {
      el.classList.add("preview");
    } else {
      el.classList.remove("preview");
    }
  });

  el.addEventListener("pointerup", e => {
    if (!drag) return;
    el.releasePointerCapture(e.pointerId);

    applyConstraints(el, item, room);

    el.classList.remove("preview");
    saveWorld();
    drag = null;
  });
}

// --------------------------------------
// CORE PHYSICS
// --------------------------------------

function applyConstraints(el, item, room) {
  const roomHeight = room.offsetHeight;
  const floorTop = roomHeight * (1 - FLOOR_HEIGHT_RATIO);
  const floorBottom = roomHeight;

  let finalX = parseInt(el.style.left);
  let finalY = parseInt(el.style.top);

  const bottom = finalY + el.offsetHeight;
  let snapped = false;

  // ⛔ za zdí → vrátit na červenou čáru
  if (bottom < floorTop) {
    finalY = floorTop - el.offsetHeight;
    snapped = true;
  }

  // ⛔ ven z místnosti dole
  if (finalY > floorBottom - el.offsetHeight) {
    finalY = floorBottom - el.offsetHeight;
    snapped = true;
  }

  item.position.x = finalX;
  item.position.y = finalY;

  if (snapped) {
    el.style.transition = `top ${SNAP_DURATION}ms cubic-bezier(0.25,0.8,0.25,1)`;
  }

  el.style.top = finalY + "px";

  setTimeout(() => {
    el.style.transition = "";
  }, SNAP_DURATION);
}
  justify-content: center;
  align-items: flex-start;
  touch-action: none;
}

#app {
  margin-top: 20px;
  text-align: center;
}

h1 {
  margin: 0 0 8px;
  color: #c2185b;
}

/* ======================================
   MÍSTNOST
====================================== */

.room {
  position: relative;
  width: 800px;
  height: 500px;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(
    to bottom,
    #ff9fcb 0%,
    #ff9fcb 65%,
    #f6d3a3 65%,
    #e8b97a 100%
  );
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  touch-action: none;
}

/* Podlahová zóna */
.floor-guide {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 35%;
  background: linear-gradient(
    to top,
    rgba(255,190,220,0.35),
    rgba(255,190,220,0.08)
  );
  pointer-events: none;
}

/* ======================================
   NÁBYTEK
====================================== */

.furniture {
  position: absolute;
  padding: 10px 16px;
  border-radius: 16px;
  font-weight: 600;
  color: #fff;
  cursor: grab;
  touch-action: none;
  transition: box-shadow 0.15s ease;
}

.furniture:active {
  cursor: grabbing;
}

/* STÍN POD NÁBYTKEM */
.furniture::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -10px;
  width: 80%;
  height: 10px;
  background: radial-gradient(
    ellipse at center,
    rgba(0,0,0,0.35),
    rgba(0,0,0,0)
  );
  transform: translateX(-50%);
  opacity: 0.35;
  pointer-events: none;
}

/* Náhled dopadu u zdi */
.furniture.preview {
  outline: 3px dashed rgba(255,255,255,0.8);
  outline-offset: -6px;
}

/* Typy */
.furniture.sofa { background:#ff5fa2; width:140px; }
.furniture.table { background:#b388ff; width:100px; }
.furniture.fridge { background:#5fdde5; width:90px; height:120px; }
.furniture.stove {
  background:#fff;
  color:#333;
  width:90px;
  height:80px;
  border:3px solid #ff8fab;
}
