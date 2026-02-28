// ======================================
// FAIST – Dollhouse Game Core
// STEP 1: World axes + avatar movement
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
// ROOM + ENTITIES SETUP
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
      // AVATAR
      {
        id: "avatar",
        kind: "avatar",
        transform: {
          x: 200,
          z: 120,
          y: 0 // VŽDY výška nad podlahou
        },
        size: {
          width: 40,
          height: 60,
          depth: 20
        },
        physics: {
          solid: true,
          canSupport: false
        }
      },

      // TABLE
      {
        id: "table",
        kind: "furniture",
        transform: {
          x: 300,
          z: 160,
          y: 0
        },
        size: {
          width: 80,
          height: 40,
          depth: 40
        },
        physics: {
          solid: true,
          canSupport: true
        }
      },

      // FRIDGE
      {
        id: "fridge",
        kind: "furniture",
        transform: {
          x: 500,
          z: 140,
          y: 0
        },
        size: {
          width: 50,
          height: 90,
          depth: 40
        },
        physics: {
          solid: true,
          canSupport: false
        }
      }
    ]
  };
}

// ======================================
// INITIALIZE WORLD
// ======================================

world.rooms["kitchen"] = createKitchenRoom();

// ======================================
// INPUT HANDLERS
// ======================================

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") input.left = true;
  if (e.key === "ArrowRight") input.right = true;
  if (e.key === "ArrowUp") input.up = true;
  if (e.key === "ArrowDown") input.down = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") input.left = false;
  if (e.key === "ArrowRight") input.right = false;
  if (e.key === "ArrowUp") input.up = false;
  if (e.key === "ArrowDown") input.down = false;
});

// ======================================
// AVATAR MOVEMENT (FLOOR-BASED)
// ======================================

const AVATAR_SPEED = 4;

function updateAvatar(room) {
  const avatar = room.entities.find(e => e.kind === "avatar");
  if (!avatar) return;

  if (input.left)  avatar.transform.x -= AVATAR_SPEED;
  if (input.right) avatar.transform.x += AVATAR_SPEED;

  if (input.up)    avatar.transform.z += AVATAR_SPEED;
  if (input.down)  avatar.transform.z -= AVATAR_SPEED;

  // ❗ ZÁKON SVĚTA
  avatar.transform.y = 0;

  // room bounds (X/Z only)
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

  // 1️⃣ pohyb avatara po podlaze
  updateAvatar(room);

  // 2️⃣ fyzika ostatních entit (zatím jen placeholder)
  for (const entity of room.entities) {
    processPhysics({
      room,
      entity,
      action: { type: "STEP" }
    });
  }

  // 3️⃣ render
  renderRoom(room);

  requestAnimationFrame(gameLoop);
}

// ======================================
// START
// ======================================

gameLoop();
