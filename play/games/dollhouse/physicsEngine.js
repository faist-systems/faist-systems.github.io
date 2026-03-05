// ======================================
// FAIST – Physics Engine
// ======================================

import { ROOM_WIDTH, FLOOR_DEPTH } from "./world.js";

function aabbOverlap(a,b){

  return(
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.z < b.z + b.depth &&
    a.z + a.depth > b.z
  );
}

export function processPhysics({room,entity,action}){

  if(action.type === "STEP"){

    const dx = action.dx || 0;
    const dz = action.dz || 0;

    const next = {
      x: entity.transform.x + dx,
      z: entity.transform.z + dz,
      width: entity.size.width,
      depth: entity.size.depth
    };

    if(!insideRoom(next)) return;

    if(collides(room,entity,next)) return;

    entity.transform.x = next.x;
    entity.transform.z = next.z;
  }

}

function collides(room,entity,testBox){

  for(const other of room.entities){

    if(other.id === entity.id) continue;
    if(!other.physics?.solid) continue;

    const otherBox = {
      x: other.transform.x,
      z: other.transform.z,
      width: other.size.width,
      depth: other.size.depth
    };

    if(aabbOverlap(testBox,otherBox)){
      return true;
    }
  }

  return false;
}

function insideRoom(box){

  return(
    box.x >= 0 &&
    box.z >= 0 &&
    box.x + box.width <= ROOM_WIDTH &&
    box.z <= FLOOR_DEPTH
  );
}
