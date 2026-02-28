// ======================================
// FAIST – Physics Engine (Reference)
// ======================================

// ----- CONSTANTS -----
const GRAVITY_STEP = 4;

// ----- ENTITY STATES -----
const STATE_IDLE = "IDLE";
const STATE_DRAGGING = "DRAGGING";
const STATE_FALLING = "FALLING";

// ======================================
// COLLISION HELPERS (AABB in XYZ)
// ======================================
function aabbOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y &&
    a.z < b.z + b.depth &&
    a.z + a.depth > b.z
  );
}

// ======================================
// CORE PHYSICS LOOP
// ======================================
export function processPhysics({ room, entity, action }) {
  if (!room || !entity || !action) return;

  switch (action.type) {
    case "DRAG":
      return handleDrag(room, entity, action);

    case "DROP":
      return handleDrop(room, entity);

    case "STEP":
      return handleStep(room, entity, action);

    default:
      return;
  }
}

// ======================================
// DRAG LOGIC
// ======================================
function handleDrag(room, entity, action) {
  entity.state = STATE_DRAGGING;

  const proposed = {
    x: action.x,
    y: action.y,
    z: action.z,
    width: entity.size.width,
    height: entity.size.height,
    depth: entity.size.depth
  };

  if (!insideRoom(room, proposed)) return;
  if (collides(room, entity, proposed)) return;

  entity.transform = { ...entity.transform, ...action };
  entity.lastValidTransform = { ...entity.transform };
}

// ======================================
// DROP → FALLING
// ======================================
function handleDrop(room, entity) {
  entity.state = STATE_FALLING;

  const valid = attemptFall(room, entity);

  if (!valid && entity.lastValidTransform) {
    entity.transform = { ...entity.lastValidTransform };
  }

  entity.state = STATE_IDLE;
}

// ======================================
// FALLING LOOP
// ======================================
function attemptFall(room, entity) {
  let y = entity.transform.y;
  let firstStep = true;

  while (true) {
    const nextY = y - GRAVITY_STEP;

    const testBox = {
      x: entity.transform.x,
      y: nextY,
      z: entity.transform.z,
      width: entity.size.width,
      height: entity.size.height,
      depth: entity.size.depth
    };

    // A) FLOOR
    if (nextY <= room.bounds.floorY) {
      entity.transform.y = room.bounds.floorY;
      return true;
    }

    // B) SUPPORT SURFACE
    const support = findSupport(room, entity, testBox);
    if (support) {
      entity.transform.y = support.transform.y + support.size.height;
      return true;
    }

    // C) BODY COLLISION
    if (collides(room, entity, testBox)) {
      if (firstStep) return false;
      entity.transform.y = y;
      return true;
    }

    // D) APPLY STEP
    y = nextY;
    entity.transform.y = y;
    firstStep = false;
  }
}

// ======================================
// AVATAR STEP (SAFE)
// ======================================
function handleStep(room, entity, action) {
  // 🛑 DEFENSIVE GUARDS (KRITICKÉ)
  const dx = typeof action.dx === "number" ? action.dx : 0;
  const dz = typeof action.dz === "number" ? action.dz : 0;

  entity.state = STATE_IDLE;

  const proposed = {
    x: entity.transform.x + dx,
    y: entity.transform.y,
    z: entity.transform.z + dz,
    width: entity.size.width,
    height: entity.size.height,
    depth: entity.size.depth
  };

  if (!insideRoom(room, proposed)) return;
  if (collides(room, entity, proposed)) return;

  entity.transform.x = proposed.x;
  entity.transform.z = proposed.z;
}

// ======================================
// SUPPORT TEST
// ======================================
function findSupport(room, entity, testBox) {
  for (const other of room.entities) {
    if (other.id === entity.id) continue;
    if (!other.physics?.canSupport) continue;

    const surfaceY = other.transform.y + other.size.height;

    const overlapsXZ =
      testBox.x < other.transform.x + other.size.width &&
      testBox.x + testBox.width > other.transform.x &&
      testBox.z < other.transform.z + other.size.depth &&
      testBox.z + testBox.depth > other.transform.z;

    const touchingFromAbove =
      testBox.y <= surfaceY &&
      entity.transform.y >= surfaceY;

    if (overlapsXZ && touchingFromAbove) {
      return other;
    }
  }
  return null;
}

// ======================================
// COLLISION TEST
// ======================================
function collides(room, entity, testBox) {
  for (const other of room.entities) {
    if (other.id === entity.id) continue;
    if (!other.physics?.solid) continue;

    const otherBox = {
      x: other.transform.x,
      y: other.transform.y,
      z: other.transform.z,
      width: other.size.width,
      height: other.size.height,
      depth: other.size.depth
    };

    if (aabbOverlap(testBox, otherBox)) {
      return true;
    }
  }
  return false;
}

// ======================================
// ROOM BOUNDS
// ======================================
function insideRoom(room, box) {
  return (
    box.x >= 0 &&
    box.z >= 0 &&
    box.x + box.width <= room.bounds.width &&
    box.z + box.depth <= room.bounds.depth
  );
}
