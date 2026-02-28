// ======================================
// FAIST – Dollhouse Game Core
// STEP 3 (FIXED): Stable interaction layer
// ======================================

import { renderRoom } from "./renderer.js";
import { processPhysics } from "./physicsEngine.js";

// ======================================
// WORLD STATE
// ======================================

const world = {
  activeRoomId: "kitchen",
  rooms: {}
};

// ======================================
// INPUT STATE
// ======================================

const input = {
  left: false,
  right: false,
  up: false,
  down: false
};

// ======================================
// DRAG STATE (WORLD-BASED)
// ======================================

let dragged = null;
let dragStartX = 0;

// ======================================
// ROOM SETUP
// ======================================

function createKitchenRoom() {
  return {
    id: "kitchen",
    bounds: {
      width: 800,
      depth: 300,
      floorY: 0
    },
    entities: [
      {
        id: "avatar",
        kind: "avatar",
        transform: { x: 200, z: 120, y: 0 },
        size: { width: 40, height: 60, depth: 20 },
        physics: { solid: true, canSupport: false }
      },
      {
        id: "table",
        kind: "furniture",
        transform: { x: 300, z: 160, y: 0 },
        size: { width: 80, height: 40, depth: 40 },
        physics: { solid: true, canSupport: true }
      },
      {
        id: "fridge",
        kind: "furniture",
        transform: { x: 500, z: 140, y: 0 },
        size: { width: 50, height: 90, depth: 40 },
        physics: { solid: true, canSupport: false }
      }
    ]
  };
}

world.rooms.kitchen = createKitchenRoom();

// ======================================
// KEYBOARD (AVATAR)
// ======================================

window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") input.left = true;
  if (e.key === "ArrowRight") input.right = true;
  if (e.key === "ArrowUp") input.up = true;
  if (e.key === "ArrowDown") input.down = true;
});

window.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") input.left = false;
  if (e.key === "ArrowRight") input.right = false;
  if (e.key === "ArrowUp") input.up = false;
  if (e.key === "ArrowDown") input.down = false;
});

// ======================================
// MOUSE DRAG (SAFE VERSION)
// ======================================

window.addEventListener("mousedown", e => {
  const room = world.rooms[world.activeRoomId];

  // jednoduchý výběr: první furniture
  dragged = room.entities.find(ent => ent.kind === "furniture");
  if (!dragged) return;

  dragStartX = e.clientX;
});

window.addEventListener("mousemove", e => {
  if (!dragged) return;

  const dx = e.clientX - dragStartX;
  dragged.transform.x += dx * 0.5; // zpomalení
  dragged.transform.y = 0;

  dragStartX = e.clientX;

  const room = world.rooms[world.activeRoomId];
  dragged.transform.x = Math.max(
    0,
    Math.min(room.bounds.width - dragged.size.width, dragged.transform.x)
  );
});

window.addEventListener("mouseup", () => {
  dragged = null;
});

// ======================================
// AVATAR UPDATE
// ======================================

const AVATAR_SPEED = 4;

function updateAvatar(room) {
  const avatar = room.entities.find(e => e.kind === "avatar");
  if (!avatar) return;

  if (input.left) avatar.transform.x -= AVATAR_SPEED;
  if (input.right) avatar.transform.x += AVATAR_SPEED;
  if (input.up) avatar.transform.z += AVATAR_SPEED;
  if (input.down) avatar.transform.z -= AVATAR_SPEED;

  avatar.transform.y = 0;

  avatar.transform.x = Math.max(
    0,
    Math.min(room.bounds.width - avatar.size.width, avatar.transform.x)
  );

  avatar.transform.z = Math.max(
    0,
    Math.min(room.bounds.depth - avatar.size.depth, avatar.transform.z)
  );
}

// ======================================
// GAME LOOP
// ======================================

function gameLoop() {
  const room = world.rooms[world.activeRoomId];

  updateAvatar(room);

  for (const entity of room.entities) {
    processPhysics({
      room,
      entity,
      action: { type: "STEP" }
    });
  }

  renderRoom(room);
  requestAnimationFrame(gameLoop);
}

gameLoop();
