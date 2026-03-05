// ======================================
// FAIST – Renderer + Depth Engine
// ======================================

import { FLOOR_DEPTH } from "./world.js";

let initialized = false;

function initRoom(room){

  const roomElement = document.querySelector(".room");

  for(const entity of room.entities){

    let el = document.getElementById(entity.id);

    if(!el){

      el = document.createElement("div");
      el.id = entity.id;

      if(entity.kind === "avatar"){
        el.className = "avatar";
        el.textContent = "🙂";
      }

      if(entity.kind === "furniture"){
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
// DEPTH SORTING ENGINE
// ======================================

function sortEntitiesByDepth(entities){

  return [...entities].sort((a,b)=>{

    const aDepth = a.transform.z + a.size.depth;
    const bDepth = b.transform.z + b.size.depth;

    return aDepth - bDepth;
  });

}


// ======================================
// RENDER ENTITY
// ======================================

function renderEntity(entity){

  const el = document.getElementById(entity.id);
  if(!el) return;

  el.style.left = entity.transform.x + "px";

  let bottom = FLOOR_DEPTH - entity.transform.z - entity.size.depth;

  // avatar má pivot na nohách
  if(entity.kind === "avatar"){

    const visualOffset = entity.size.height - entity.size.depth;

    bottom += visualOffset;
  }

  el.style.bottom = bottom + "px";

}


// ======================================
// MAIN RENDER
// ======================================

export function renderRoom(room){

  if(!initialized){
    initRoom(room);
  }

  const sorted = sortEntitiesByDepth(room.entities);

  let zIndex = 1;

  for(const entity of sorted){

    renderEntity(entity);

    const el = document.getElementById(entity.id);

    el.style.zIndex = zIndex;

    zIndex++;
  }

}
