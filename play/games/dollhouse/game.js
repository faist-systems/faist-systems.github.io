// ===== CONFIG =====
const FLOOR_HEIGHT_RATIO = 0.35;

// ===== STATE =====
let world = null;
let drag = null;

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  world = getDefaultWorld();
  render();
});

// ===== WORLD =====
function getDefaultWorld() {
  return {
    player: {
      name: { vocative: "Lauro" }
    },
    house: {
      rooms: [{
        bounds: { width: 800, height: 500 },
        furniture: [
          { id: 1, type: "sofa", position: { x: 80, y: 320 } },
          { id: 2, type: "table", position: { x: 300, y: 360 } },
          { id: 3, type: "fridge", position: { x: 550, y: 300 } }
        ]
      }]
    }
  };
}

// ===== RENDER =====
function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const h1 = document.createElement("h1");
  h1.textContent = "Ahoj Lauro!";
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
    el.className = "furniture " + item.type;
    el.textContent = item.type;
    el.style.left = item.position.x + "px";
    el.style.top = item.position.y + "px";

    enableDrag(el, item, room);
    room.appendChild(el);
  });
}

// ===== DRAG =====
function enableDrag(el, item, room) {
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

    el.style.left = drag.baseX + dx + "px";
    el.style.top = drag.baseY + dy + "px";
  });

  el.addEventListener("pointerup", e => {
    if (!drag) return;
    el.releasePointerCapture(e.pointerId);

    applyConstraints(el, item, room);
    drag = null;
  });
}

// ===== CONSTRAINTS =====
function applyConstraints(el, item, room) {
  const roomHeight = room.offsetHeight;
  const floorTop = roomHeight * (1 - FLOOR_HEIGHT_RATIO);
  const floorBottom = roomHeight;

  let x = parseInt(el.style.left);
  let y = parseInt(el.style.top);

  const bottom = y + el.offsetHeight;

  // zeď vzadu
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
