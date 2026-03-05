// ======================================
// FAIST Renderer
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

    el.style.transformOrigin = "bottom center";
  }

  initialized = true;
}


function sortEntitiesByDepth(entities){

  return [...entities].sort((a,b)=>{

    const aDepth = a.transform.z + a.size.depth;
    const bDepth = b.transform.z + b.size.depth;

    return aDepth - bDepth;
  });

}


function renderEntity(entity){

  const el = document.getElementById(entity.id);
  if(!el) return;

  el.style.left = entity.transform.x + "px";

  const bottom = FLOOR_DEPTH - entity.transform.z - entity.size.depth;

  el.style.bottom = bottom + "px";

}


export function renderRoom(room){

  if(!initialized){
    initRoom(room);
  }

  const sorted = sortEntitiesByDepth(room.entities);

  let z = 1;

  for(const entity of sorted){

    renderEntity(entity);

    const el = document.getElementById(entity.id);

    el.style.zIndex = z++;

  }

}
