/* ======================================
   FAIST – Dollhouse
   styles.css (shadow + preview)
====================================== */

* {
  box-sizing: border-box;
  user-select: none;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(#ffd1e8, #fff);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  touch-action: none;
}

#app {
  margin-top: 20px;
  text-align: center;
}

h1 {
  margin: 0 0 8px;
  color: #c2185b;
}

/* ======================================
   MÍSTNOST
====================================== */

.room {
  position: relative;
  width: 800px;
  height: 500px;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(
    to bottom,
    #ff9fcb 0%,
    #ff9fcb 65%,
    #f6d3a3 65%,
    #e8b97a 100%
  );
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  touch-action: none;
}

/* Podlahová zóna */
.floor-guide {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 35%;
  background: linear-gradient(
    to top,
    rgba(255,190,220,0.35),
    rgba(255,190,220,0.08)
  );
  pointer-events: none;
}

/* ======================================
   NÁBYTEK
====================================== */

.furniture {
  position: absolute;
  padding: 10px 16px;
  border-radius: 16px;
  font-weight: 600;
  color: #fff;
  cursor: grab;
  touch-action: none;
  transition: box-shadow 0.15s ease;
}

.furniture:active {
  cursor: grabbing;
}

/* STÍN POD NÁBYTKEM */
.furniture::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -10px;
  width: 80%;
  height: 10px;
  background: radial-gradient(
    ellipse at center,
    rgba(0,0,0,0.35),
    rgba(0,0,0,0)
  );
  transform: translateX(-50%);
  opacity: 0.35;
  pointer-events: none;
}

/* Náhled dopadu u zdi */
.furniture.preview {
  outline: 3px dashed rgba(255,255,255,0.8);
  outline-offset: -6px;
}

/* Typy */
.furniture.sofa { background:#ff5fa2; width:140px; }
.furniture.table { background:#b388ff; width:100px; }
.furniture.fridge { background:#5fdde5; width:90px; height:120px; }
.furniture.stove {
  background:#fff;
  color:#333;
  width:90px;
  height:80px;
  border:3px solid #ff8fab;
}
