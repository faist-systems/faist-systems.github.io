// ======================================
// FAIST – Physics Engine
// ======================================

function aabbOverlap(a, b) {

  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.z < b.z + b.depth &&
    a.z + a.depth > b.z
  );
}

export function processPhysics({ room, entity, action }) {

  if (action.type === "STEP") {

    const dx = action.dx || 0;
    const dz = action.dz || 0;

    const next = {
      x: entity.transform.x + dx,
      z: entity.transform.z + dz,
      width: entity.size.width,
      depth: entity.size.depth
    };

    if (!insideRoom(room, next)) return;

    if (collides(room, entity, next)) return;

    entity.transform.x = next.x;
    entity.transform.z = next.z;
  }

  if (action.type === "DRAG") {

    const next = {
      x: action.x,
      z: action.z,
      width: entity.size.width,
      depth: entity.size.depth
    };

    if (!insideRoom(room, next)) return;

    entity.transform.x = action.x;
    entity.transform.z = action.z;
  }

}


function collides(room, entity, testBox) {

  for (const other of room.entities) {

    if (other.id === entity.id) continue;

    if (!other.physics?.solid) continue;

    const otherBox = {
      x: other.transform.x,
      z: other.transform.z,
      width: other.size.width,
      depth: other.size.depth
    };

    if (aabbOverlap(testBox, otherBox)) return true;
  }

  return false;
}


function insideRoom(room, box) {

  return (
    box.x >= 0 &&
    box.z >= 0 &&
    box.x + box.width <= room.bounds.width &&
    box.z + box.depth <= room.bounds.depth
  );
}
