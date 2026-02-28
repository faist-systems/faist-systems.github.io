// ======================================
// FAIST – Renderer (XYZ → 2D)
// ======================================

const DEPTH_FACTOR = 0.3;
const BASE_FLOOR_Y = 420;

// root container
const gameRoot = document.getElementById("game");

// clear + render whole room
export function renderRoom(room) {
  gameRoot.innerHTML = "";

  // sort by Z (větší Z = víc vzadu)
  const sorted = [...room.entities].sort(
    (a, b) => a.transform.z - b.transform.z
  );

  for (const entity of sorted) {
    renderEntity(entity);
  }
}

// render single entity
function renderEntity(entity) {
  const el = document.createElement("div");
  el.className = `entity ${entity.kind}`;

  const { x, y, z } = entity.transform;
  const { width, height } = entity.size;

  const screenX = x;
  const screenY = BASE_FLOOR_Y - y - z * DEPTH_FACTOR;

  el.style.position = "absolute";
  el.style.left = `${screenX}px`;
  el.style.top = `${screenY - height}px`;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.zIndex = Math.floor(1000 - z);

  // temporary visuals
  el.style.borderRadius = "8px";
  el.style.background =
    entity.kind === "avatar"
      ? "#6dd3ff"
      : entity.physics.canSupport
      ? "#ffcc80"
      : "#cfcfcf";

  el.textContent = entity.kind === "avatar" ? "🙂" : "";

  gameRoot.appendChild(el);
}
