// ======================================
// FAIST – Dollhouse Game Core
// ======================================

import { renderRoom } from "./renderer.js";
import { processPhysics } from "./physicsEngine.js";

const world = {
  activeRoomId: "kitchen",
  rooms: {}
};

const input = { left:false, right:false, up:false, down:false };

let dragged = null;
let dragOrigin = { x:0, z:0 };
let mouseOrigin = { x:0, y:0 };

function createKitchenRoom(){
  return {
    id:"kitchen",
    bounds:{ width:800, depth:200, floorY:0 },
    entities:[
      {
        id:"avatar",
        kind:"avatar",
        transform:{ x:200, z:80, y:0 },
        size:{ width:40, height:60, depth:20 },
        physics:{ solid:true, canSupport:false }
      },
      {
        id:"table",
        kind:"furniture",
        transform:{ x:300, z:20, y:0 },
        size:{ width:80, height:40, depth:40 },
        physics:{ solid:true, canSupport:true }
      },
      {
        id:"fridge",
        kind:"furniture",
        transform:{ x:500, z:20, y:0 },
        size:{ width:50, height:90, depth:40 },
        physics:{ solid:true, canSupport:false }
      }
    ]
  };
}

world.rooms.kitchen = createKitchenRoom();


// ================= INPUT =================

window.addEventListener("keydown", e=>{
  if(e.key==="ArrowLeft") input.left=true;
  if(e.key==="ArrowRight") input.right=true;
  if(e.key==="ArrowUp") input.up=true;
  if(e.key==="ArrowDown") input.down=true;
});

window.addEventListener("keyup", e=>{
  if(e.key==="ArrowLeft") input.left=false;
  if(e.key==="ArrowRight") input.right=false;
  if(e.key==="ArrowUp") input.up=false;
  if(e.key==="ArrowDown") input.down=false;
});


// ================= DRAG =================

window.addEventListener("mousedown", e=>{
  const room = world.rooms[world.activeRoomId];

  dragged = room.entities.find(ent=>ent.kind==="furniture");
  if(!dragged) return;

  mouseOrigin.x = e.clientX;
  mouseOrigin.y = e.clientY;

  dragOrigin.x = dragged.transform.x;
  dragOrigin.z = dragged.transform.z;
});

window.addEventListener("mousemove", e=>{
  if(!dragged) return;

  const dx = e.clientX - mouseOrigin.x;
  const dz = e.clientY - mouseOrigin.y;

  processPhysics({
    room:world.rooms[world.activeRoomId],
    entity:dragged,
    action:{
      type:"DRAG",
      x: dragOrigin.x + dx,
      z: dragOrigin.z + dz,
      y:0
    }
  });
});

window.addEventListener("mouseup", ()=>{
  if(!dragged) return;

  processPhysics({
    room:world.rooms[world.activeRoomId],
    entity:dragged,
    action:{ type:"DROP" }
  });

  dragged=null;
});


// ================= AVATAR =================

const SPEED = 4;

function updateAvatar(room){

  const avatar = room.entities.find(e=>e.kind==="avatar");
  if(!avatar) return;

  let dx=0;
  let dz=0;

  if(input.left) dx-=SPEED;
  if(input.right) dx+=SPEED;
  if(input.up) dz+=SPEED;
  if(input.down) dz-=SPEED;

  if(dx!==0 || dz!==0){
    processPhysics({
      room,
      entity:avatar,
      action:{
        type:"STEP",
        dx,
        dz
      }
    });
  }
}


// ================= LOOP =================

function gameLoop(){

  const room = world.rooms[world.activeRoomId];

  updateAvatar(room);

  renderRoom(room);

  requestAnimationFrame(gameLoop);
}

gameLoop();
