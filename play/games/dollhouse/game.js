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
    enableClick(el, item);

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

  if (bottom < floorTop) {
    y = floorTop - el.offsetHeight;
  }
  if (y > floorBottom - el.offsetHeight) {
    y = floorBottom - el.offsetHeight;
  }

  item.position.x = x;
  item.position.y = y;

  el.style.top = y + "px";
}

// ===== CLICK ACTIONS =====
function enableClick(el, item) {
  el.addEventListener("click", e => {
    // když se právě táhlo, ignoruj klik
    if (drag) return;

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

// ===== MODAL =====
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

  modal.querySelector("button").onclick = () => {
    overlay.remove();
  };

  overlay.onclick = e => {
    if (e.target === overlay) overlay.remove();
  };

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
