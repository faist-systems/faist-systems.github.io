const FLOOR_DEPTH = 240;

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

function renderEntity(entity){

  const el = document.getElementById(entity.id);
  if(!el) return;

  el.style.left = entity.transform.x + "px";

  el.style.bottom = (FLOOR_DEPTH - entity.transform.z) + "px";

  el.style.zIndex = entity.transform.z;
}

export function renderRoom(room){

  if(!initialized){
    initRoom(room);
  }

  for(const entity of room.entities){
    renderEntity(entity);
  }

}
