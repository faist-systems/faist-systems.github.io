// ======================================
// FAIST – Game Core
// ======================================

import { renderRoom } from "./renderer.js";
import { processPhysics } from "./physicsEngine.js";
import { ROOM_WIDTH, FLOOR_DEPTH, AVATAR_SPEED } from "./world.js";

const world = {
  activeRoomId: "kitchen",
  rooms: {}
};

const input = { left:false, right:false, up:false, down:false };

function createRoom(){

  return{

    id:"kitchen",

    bounds:{
      width:ROOM_WIDTH,
      depth:FLOOR_DEPTH
    },

    entities:[

      {
        id:"avatar",
        kind:"avatar",
        transform:{ x:200, z:120, y:0 },
        size:{ width:40, height:60, depth:20 },
        physics:{ solid:true }
      },

      {
        id:"table",
        kind:"furniture",
        transform:{ x:320, z:0, y:0 },
        size:{ width:80, height:40, depth:40 },
        physics:{ solid:true }
      },

      {
        id:"fridge",
        kind:"furniture",
        transform:{ x:520, z:0, y:0 },
        size:{ width:50, height:90, depth:40 },
        physics:{ solid:true }
      }

    ]
  };
}

world.rooms.kitchen = createRoom();

window.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft") input.left=true;
  if(e.key==="ArrowRight") input.right=true;
  if(e.key==="ArrowUp") input.up=true;
  if(e.key==="ArrowDown") input.down=true;
});

window.addEventListener("keyup",e=>{
  if(e.key==="ArrowLeft") input.left=false;
  if(e.key==="ArrowRight") input.right=false;
  if(e.key==="ArrowUp") input.up=false;
  if(e.key==="ArrowDown") input.down=false;
});

function updateAvatar(room){

  const avatar = room.entities.find(e=>e.kind==="avatar");

  let dx = 0;
  let dz = 0;

  if(input.left) dx -= AVATAR_SPEED;
  if(input.right) dx += AVATAR_SPEED;

  if(input.up) dz -= AVATAR_SPEED;
  if(input.down) dz += AVATAR_SPEED;

  processPhysics({
    room,
    entity: avatar,
    action:{
      type:"STEP",
      dx,
      dz
    }
  });

}

function gameLoop(){

  const room = world.rooms[world.activeRoomId];

  updateAvatar(room);

  renderRoom(room);

  requestAnimationFrame(gameLoop);
}

gameLoop();
