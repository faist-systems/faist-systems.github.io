// ======================================
// FAIST – Dollhouse Game Core
// STEP 3 FINAL: Drag in X/Z + stable avatar
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

function createKitchenRoom() {
  return {
    id: "kitchen",
    bounds: { width:800, depth:300, floorY:0 },
    entities: [
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
        transform:{ x:300, z:140, y:0 },
        size:{ width:80, height:40, depth:40 },
        physics:{ solid:true, canSupport:true }
      },
      {
        id:"fridge",
        kind:"furniture",
        transform:{ x:500, z:140, y:0 },
        size:{ width:50, height:90, depth:40 },
        physics:{ solid:true, canSupport:false }
      }
    ]
  };
}

world.rooms.kitchen = createKitchenRoom();

// keyboard
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

// mouse drag (X + Z)
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

  dragged.transform.x = dragOrigin.x + dx * 0.5;
  dragged.transform.z = dragOrigin.z + dz * 0.3;
  dragged.transform.y = 0;

  const room = world.rooms[world.activeRoomId];
  dragged.transform.x = Math.max(0, Math.min(room.bounds.width-dragged.size.width, dragged.transform.x));
  dragged.transform.z = Math.max(0, Math.min(room.bounds.depth-dragged.size.depth, dragged.transform.z));
});

window.addEventListener("mouseup", ()=> dragged=null);

// avatar
const SPEED = 4;
function updateAvatar(room){
  const avatar = room.entities.find(e=>e.kind==="avatar");
  if(!avatar) return;

  if(input.left) avatar.transform.x -= SPEED;
  if(input.right) avatar.transform.x += SPEED;
  if(input.up) avatar.transform.z += SPEED;
  if(input.down) avatar.transform.z -= SPEED;

  avatar.transform.y = 0;

  avatar.transform.x = Math.max(0, Math.min(room.bounds.width-avatar.size.width, avatar.transform.x));
  avatar.transform.z = Math.max(0, Math.min(room.bounds.depth-avatar.size.depth, avatar.transform.z));
}

function gameLoop(){
  const room = world.rooms[world.activeRoomId];

  updateAvatar(room);

  for(const e of room.entities){
    processPhysics({ room, entity:e, action:{ type:"STEP" } });
  }

  renderRoom(room);
  requestAnimationFrame(gameLoop);
}

gameLoop();
