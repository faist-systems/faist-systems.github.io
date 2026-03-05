// ======================================
// FAIST – Physics Engine
// ======================================

const GRAVITY_STEP = 4;

const STATE_IDLE="IDLE";
const STATE_DRAGGING="DRAGGING";
const STATE_FALLING="FALLING";

function aabbOverlap(a,b){
  return(
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y &&
    a.z < b.z + b.depth &&
    a.z + a.depth > b.z
  );
}

export function processPhysics({room,entity,action}){

  switch(action.type){

    case "DRAG":
      return handleDrag(room,entity,action);

    case "DROP":
      return handleDrop(room,entity);

    case "STEP":
      return handleStep(room,entity,action);
  }
}

function handleDrag(room,entity,action){

  entity.state=STATE_DRAGGING;

  const proposed={
    x:action.x,
    y:action.y,
    z:action.z,
    width:entity.size.width,
    height:entity.size.height,
    depth:entity.size.depth
  };

  if(!insideRoom(room,proposed)) return;
  if(collides(room,entity,proposed)) return;

  entity.transform={...entity.transform,...action};
}

function handleDrop(room,entity){
  entity.state=STATE_IDLE;
}

function handleStep(room,entity,action){

  const dx=action.dx || 0;
  const dz=action.dz || 0;

  const proposed={
    x:entity.transform.x + dx,
    y:entity.transform.y,
    z:entity.transform.z + dz,
    width:entity.size.width,
    height:entity.size.height,
    depth:entity.size.depth
  };

  if(!insideRoom(room,proposed)) return;
  if(collides(room,entity,proposed)) return;

  entity.transform.x=proposed.x;
  entity.transform.z=proposed.z;
}

function collides(room,entity,testBox){

  for(const other of room.entities){

    if(other.id===entity.id) continue;
    if(!other.physics?.solid) continue;

    const otherBox={
      x:other.transform.x,
      y:other.transform.y,
      z:other.transform.z,
      width:other.size.width,
      height:other.size.height,
      depth:other.size.depth
    };

    if(aabbOverlap(testBox,otherBox)){
      return true;
    }
  }

  return false;
}

function insideRoom(room,box){
  return(
    box.x>=0 &&
    box.z>=0 &&
    box.x + box.width <= room.bounds.width &&
    box.z + box.depth <= room.bounds.depth
  );
}
