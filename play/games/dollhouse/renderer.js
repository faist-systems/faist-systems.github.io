// ======================================
// FAIST – Renderer
// ======================================

const FLOOR_DEPTH = 200;

let initialized = false;
let roomElement = null;


// ======================================
// INIT ROOM
// ======================================

function initRoom(room) {

  roomElement = document.querySelector(".room");

  if (!roomElement) {
    console.error("Renderer: .room element not found");
    return;
  }

  for (const entity of room.entities) {

    let el = document.getElementById(entity.id);

    if (!el) {

      el = document.createElement("div");
      el.id = entity.id;

      if (entity.kind === "avatar") {
        el.className = "avatar";
        el.textContent = "🙂";
      }

      if (entity.kind === "furniture") {
        el.className = "furniture";
      }

      roomElement.appendChild(el);
    }

    el.style.width = entity.size.width + "px";
    el.style.height = entity.size.height + "px";
  }

  initialized = true;
}


// ======================================
// DEPTH SORT
// ======================================

function sortByDepth(entities) {

  return [...entities].sort((a, b) => {

    const za = a.transform.z + a.size.depth;
    const zb = b.transform.z + b.size.depth;

    return za - zb;

  });

}


// ======================================
// RENDER ENTITY
// ======================================

function renderEntity(entity) {

  const el = document.getElementById(entity.id);
  if (!el) return;

  el.style.left = entity.transform.x + "px";

  // ⭐ SPRÁVNÁ PROJEKCE
  el.style.bottom = (FLOOR_DEPTH - (entity.transform.z + entity.size.depth)) + "px";

  el.style.zIndex = Math.floor(entity.transform.z);
}


// ======================================
// MAIN RENDER
// ======================================

export function renderRoom(room) {

  if (!initialized) {
    initRoom(room);
  }

  const ordered = sortByDepth(room.entities);

  for (const entity of ordered) {
    renderEntity(entity);
  }

}
