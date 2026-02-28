// ======================================
// FAIST – Game Layer (World + Control)
// ======================================

import { processPhysics } from "./physicsEngine.js";
import { renderRoom } from "./renderer.js";

// ======================================
// ROOM: KITCHEN (REFERENCE)
// ======================================

const kitchen = {
  id: "kitchen",
  bounds: {
    width: 800,
    depth: 400,
    floorY: 0
  },
  entities: []
};

// ======================================
// FURNITURE ENTITIES
// ======================================

const counter = {
  id: "counter",
  kind: "furniture",
  transform: { x: 100, y: 0, z: 250 },
  size: { width: 300, height: 60, depth: 60 },
  physics: {
    solid: true,
    canSupport: true
  },
  state: "IDLE"
};

const fridge = {
  id: "fridge",
  kind: "furniture",
  transform: { x: 450, y: 0, z: 260 },
  size: { width: 80, height: 160, depth: 80 },
  physics: {
    solid: true,
    canSupport: false
  },
  state: "IDLE"
};

const microwave = {
  id: "microwave",
  kind: "furniture",
  transform: { x: 120, y: 60, z: 260 },
  size: { width: 60, height: 40, depth: 40 },
  physics: {
    solid: true,
    canSupport: false
  },
  state: "IDLE"
};

const kettle = {
  id: "kettle",
  kind: "furniture",
  transform: { x: 200, y: 60, z: 260 },
  size: { width: 30, height: 40, depth: 30 },
  physics: {
    solid: true,
    canSupport: false
  },
  state: "IDLE"
};

// ======================================
// AVATAR ENTITY
// ======================================

const avatar = {
  id: "avatar",
  kind: "avatar",
  transform: { x: 200, y: 0, z: 80 },
  size: { width: 30, height: 60, depth: 20 },
  physics: {
    solid: true,
    canSupport: false
  },
  state: "IDLE"
};

// ======================================
// ADD ENTITIES TO ROOM
// ======================================

kitchen.entities.push(
  counter,
  fridge,
  microwave,
  kettle,
  avatar
);

// ======================================
// ACTIVE ROOM
// ======================================

let activeRoom = kitchen;

// ======================================
// INPUT → AVATAR MOVEMENT
// ======================================

const STEP_SIZE = 10;

document.addEventListener("keydown", (e) => {
  let dx = 0;
  let dz = 0;

  switch (e.key) {
    case "ArrowLeft":
      dx = -STEP_SIZE;
      break;
    case "ArrowRight":
      dx = STEP_SIZE;
      break;
    case "ArrowUp":
      dz = STEP_SIZE;
      break;
    case "ArrowDown":
      dz = -STEP_SIZE;
      break;
    default:
      return;
  }

  processPhysics({
    room: activeRoom,
    entity: avatar,
    action: {
      type: "STEP",
      dx,
      dz
    }
  });

  render();
});

// ======================================
// RENDER
// ======================================

function render() {
  renderRoom(activeRoom);
}

// ======================================
// INITIAL RENDER
// ======================================

render();
