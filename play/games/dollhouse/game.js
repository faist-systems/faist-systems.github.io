// ======================================
// FAIST – Stable Game Core
// ======================================

import { renderRoom } from "./renderer.js";

const room = {
  bounds: { width: 800, depth: 300 },
  entities: [
    {
      id: "avatar",
      kind: "avatar",
      transform: { x: 200, y: 0 },
      size: { width: 40, height: 60 }
    },
    {
      id: "table",
      kind: "furniture",
      transform: { x: 300, y: 0 },
      size: { width: 80, height: 40 }
    },
    {
      id: "fridge",
      kind: "furniture",
      transform: { x: 450, y: 0 },
      size: { width: 50, height: 90 }
    }
  ]
};

const input = { left:false, right:false };

window.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") input.left = true;
  if (e.key === "ArrowRight") input.right = true;
});
window.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") input.left = false;
  if (e.key === "ArrowRight") input.right = false;
});

function update() {
  const avatar = room.entities[0];
  if (input.left) avatar.transform.x -= 4;
  if (input.right) avatar.transform.x += 4;

  avatar.transform.x = Math.max(
    0,
    Math.min(room.bounds.width - avatar.size.width, avatar.transform.x)
  );

  renderRoom(room);
  requestAnimationFrame(update);
}

update();
