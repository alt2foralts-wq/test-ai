diff --git a/script.js b/script.js
new file mode 100644
index 0000000000000000000000000000000000000000..e700a9ea28e482e026fe2fb376d9c8b802709e67
--- /dev/null
+++ b/script.js
@@ -0,0 +1,288 @@
+const canvas = document.getElementById('game');
+const ctx = canvas.getContext('2d');
+const inventoryEl = document.getElementById('inventory');
+const statsEl = document.getElementById('stats');
+
+const tileSize = 30;
+const worldWidth = 120;
+const worldHeight = 40;
+const gravity = 0.6;
+const maxFall = 12;
+
+const BLOCKS = {
+  air: { id: 0, color: null, name: 'Air', solid: false, liquid: false, gravity: false },
+  grass: { id: 1, color: '#5ea53f', name: 'Grass', solid: true, liquid: false, gravity: false },
+  dirt: { id: 2, color: '#835632', name: 'Dirt', solid: true, liquid: false, gravity: false },
+  stone: { id: 3, color: '#7f858a', name: 'Stone', solid: true, liquid: false, gravity: false },
+  wood: { id: 4, color: '#9f6a35', name: 'Wood', solid: true, liquid: false, gravity: false },
+  leaves: { id: 5, color: '#3e8835', name: 'Leaves', solid: true, liquid: false, gravity: false },
+  sand: { id: 6, color: '#d4c28a', name: 'Sand', solid: true, liquid: false, gravity: true },
+  water: { id: 7, color: '#3c87e6', name: 'Water', solid: false, liquid: true, gravity: false },
+  lava: { id: 8, color: '#d86125', name: 'Lava', solid: false, liquid: true, gravity: false },
+};
+
+const blockById = Object.values(BLOCKS).reduce((acc, block) => {
+  acc[block.id] = block;
+  return acc;
+}, {});
+
+const placeable = [BLOCKS.dirt, BLOCKS.stone, BLOCKS.wood, BLOCKS.leaves, BLOCKS.sand, BLOCKS.water, BLOCKS.lava];
+let selected = 0;
+let tick = 0;
+
+const world = Array.from({ length: worldHeight }, () => Array(worldWidth).fill(BLOCKS.air.id));
+
+function setBlock(x, y, block) {
+  if (x < 0 || y < 0 || x >= worldWidth || y >= worldHeight) return;
+  world[y][x] = block.id;
+}
+
+function getBlock(x, y) {
+  if (x < 0 || y < 0 || x >= worldWidth || y >= worldHeight) return BLOCKS.stone.id;
+  return world[y][x];
+}
+
+function generateWorld() {
+  for (let x = 0; x < worldWidth; x++) {
+    const heightOffset = Math.floor(Math.sin(x * 0.25) * 2 + Math.sin(x * 0.08) * 4);
+    const surface = 20 + heightOffset;
+
+    for (let y = surface; y < worldHeight; y++) {
+      if (y === surface) setBlock(x, y, BLOCKS.grass);
+      else if (y < surface + 4) setBlock(x, y, BLOCKS.dirt);
+      else setBlock(x, y, BLOCKS.stone);
+    }
+
+    if (Math.random() < 0.1) setBlock(x, surface, BLOCKS.sand);
+
+    if (Math.random() < 0.07) {
+      const treeY = surface - 1;
+      for (let t = 0; t < 4; t++) setBlock(x, treeY - t, BLOCKS.wood);
+      for (let lx = -2; lx <= 2; lx++) {
+        for (let ly = -2; ly <= 1; ly++) {
+          if (Math.abs(lx) + Math.abs(ly) < 4) setBlock(x + lx, treeY - 4 + ly, BLOCKS.leaves);
+        }
+      }
+    }
+
+    if (Math.random() < 0.03) setBlock(x, surface - 1, BLOCKS.water);
+  }
+}
+
+generateWorld();
+
+const player = {
+  x: 15 * tileSize,
+  y: 10 * tileSize,
+  w: tileSize * 0.75,
+  h: tileSize * 1.4,
+  vx: 0,
+  vy: 0,
+  onGround: false,
+  health: 20,
+  hunger: 20,
+  mode: 'survival',
+};
+
+const keys = new Set();
+const camera = { x: 0, y: 0 };
+
+window.addEventListener('keydown', (e) => {
+  keys.add(e.key.toLowerCase());
+  if (e.key.toLowerCase() === 'g') {
+    player.mode = player.mode === 'survival' ? 'creative' : player.mode === 'creative' ? 'spectator' : 'survival';
+  }
+});
+window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
+
+function isSolidAtPixel(px, py) {
+  const tx = Math.floor(px / tileSize);
+  const ty = Math.floor(py / tileSize);
+  const id = getBlock(tx, ty);
+  return blockById[id].solid;
+}
+
+function isLiquidAtPixel(px, py) {
+  const tx = Math.floor(px / tileSize);
+  const ty = Math.floor(py / tileSize);
+  return blockById[getBlock(tx, ty)].liquid;
+}
+
+function moveAndCollide() {
+  if (player.mode === 'spectator') {
+    player.x += player.vx;
+    player.y += player.vy;
+    return;
+  }
+
+  player.vy = Math.min(maxFall, player.vy + gravity);
+
+  player.x += player.vx;
+  if (player.vx > 0 && (isSolidAtPixel(player.x + player.w, player.y + 4) || isSolidAtPixel(player.x + player.w, player.y + player.h - 4))) {
+    player.x = Math.floor((player.x + player.w) / tileSize) * tileSize - player.w - 0.01;
+    player.vx = 0;
+  } else if (player.vx < 0 && (isSolidAtPixel(player.x, player.y + 4) || isSolidAtPixel(player.x, player.y + player.h - 4))) {
+    player.x = Math.floor(player.x / tileSize + 1) * tileSize + 0.01;
+    player.vx = 0;
+  }
+
+  player.y += player.vy;
+  player.onGround = false;
+  if (player.vy > 0 && (isSolidAtPixel(player.x + 4, player.y + player.h) || isSolidAtPixel(player.x + player.w - 4, player.y + player.h))) {
+    const impact = player.vy;
+    player.y = Math.floor((player.y + player.h) / tileSize) * tileSize - player.h;
+    player.vy = 0;
+    player.onGround = true;
+    if (player.mode === 'survival' && impact > 9) player.health = Math.max(0, player.health - Math.floor(impact - 8));
+  } else if (player.vy < 0 && (isSolidAtPixel(player.x + 4, player.y) || isSolidAtPixel(player.x + player.w - 4, player.y))) {
+    player.y = Math.floor(player.y / tileSize + 1) * tileSize;
+    player.vy = 0;
+  }
+}
+
+function updatePlayer() {
+  const left = keys.has('a') || keys.has('arrowleft');
+  const right = keys.has('d') || keys.has('arrowright');
+  const jump = keys.has('w') || keys.has('arrowup') || keys.has(' ');
+  const down = keys.has('s') || keys.has('arrowdown');
+
+  const speed = player.mode === 'creative' || player.mode === 'spectator' ? 5 : 3.4;
+  if (left === right) player.vx *= 0.75;
+  else player.vx = left ? -speed : speed;
+
+  if (player.mode === 'spectator') {
+    player.vy = (jump ? -speed : 0) + (down ? speed : 0);
+  } else {
+    if (jump && player.onGround) player.vy = -10.5;
+  }
+
+  const inLiquid = isLiquidAtPixel(player.x + player.w / 2, player.y + player.h / 2);
+  if (inLiquid && player.mode !== 'spectator') {
+    player.vy *= 0.75;
+    if (jump) player.vy = -4;
+  }
+
+  moveAndCollide();
+
+  if (player.mode === 'survival') {
+    if (tick % 180 === 0) player.hunger = Math.max(0, player.hunger - 1);
+    if (player.hunger === 0 && tick % 120 === 0) player.health = Math.max(0, player.health - 1);
+  } else {
+    player.hunger = 20;
+  }
+
+  camera.x = player.x - canvas.width / 2;
+  camera.y = player.y - canvas.height / 2;
+  camera.x = Math.max(0, Math.min(camera.x, worldWidth * tileSize - canvas.width));
+  camera.y = Math.max(0, Math.min(camera.y, worldHeight * tileSize - canvas.height));
+}
+
+function updateWorldPhysics() {
+  for (let y = worldHeight - 2; y >= 0; y--) {
+    for (let x = 0; x < worldWidth; x++) {
+      const current = blockById[getBlock(x, y)];
+      if (current.gravity && getBlock(x, y + 1) === BLOCKS.air.id) {
+        world[y + 1][x] = current.id;
+        world[y][x] = BLOCKS.air.id;
+      }
+      if (current.liquid) {
+        if (getBlock(x, y + 1) === BLOCKS.air.id) {
+          world[y + 1][x] = current.id;
+          world[y][x] = BLOCKS.air.id;
+        } else {
+          const dir = Math.random() < 0.5 ? -1 : 1;
+          if (getBlock(x + dir, y) === BLOCKS.air.id) world[y][x + dir] = current.id;
+        }
+      }
+    }
+  }
+}
+
+canvas.addEventListener('click', (event) => {
+  const rect = canvas.getBoundingClientRect();
+  const x = ((event.clientX - rect.left) * canvas.width) / rect.width + camera.x;
+  const y = ((event.clientY - rect.top) * canvas.height) / rect.height + camera.y;
+  const tx = Math.floor(x / tileSize);
+  const ty = Math.floor(y / tileSize);
+
+  if (event.shiftKey) {
+    if (getBlock(tx, ty) === BLOCKS.air.id) setBlock(tx, ty, placeable[selected]);
+  } else {
+    if (getBlock(tx, ty) !== BLOCKS.air.id) setBlock(tx, ty, BLOCKS.air);
+  }
+});
+
+function drawWorld() {
+  ctx.fillStyle = '#8ec7ff';
+  ctx.fillRect(0, 0, canvas.width, canvas.height);
+
+  const startX = Math.floor(camera.x / tileSize);
+  const endX = Math.ceil((camera.x + canvas.width) / tileSize);
+  const startY = Math.floor(camera.y / tileSize);
+  const endY = Math.ceil((camera.y + canvas.height) / tileSize);
+
+  for (let y = startY; y <= endY; y++) {
+    for (let x = startX; x <= endX; x++) {
+      const id = getBlock(x, y);
+      if (id === BLOCKS.air.id) continue;
+      const block = blockById[id];
+      const px = x * tileSize - camera.x;
+      const py = y * tileSize - camera.y;
+
+      ctx.fillStyle = block.color;
+      ctx.fillRect(px, py, tileSize, tileSize);
+      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
+      ctx.strokeRect(px + 0.5, py + 0.5, tileSize - 1, tileSize - 1);
+    }
+  }
+}
+
+function drawPlayer() {
+  ctx.fillStyle = player.mode === 'spectator' ? '#b4b4ff88' : '#ffce98';
+  ctx.fillRect(player.x - camera.x, player.y - camera.y, player.w, player.h);
+}
+
+function drawDayNightOverlay() {
+  const cycle = (Math.sin(tick * 0.003) + 1) / 2;
+  const darkness = 0.55 - cycle * 0.5;
+  if (darkness > 0) {
+    ctx.fillStyle = `rgba(10, 18, 32, ${darkness.toFixed(3)})`;
+    ctx.fillRect(0, 0, canvas.width, canvas.height);
+  }
+}
+
+function renderStats() {
+  const hearts = '❤'.repeat(Math.ceil(player.health / 2));
+  const hunger = '🍗'.repeat(Math.ceil(player.hunger / 2));
+  statsEl.textContent = `Mode: ${player.mode.toUpperCase()} | Health: ${hearts || '☠'} (${player.health}) | Hunger: ${hunger || '…'} (${player.hunger})`;
+}
+
+function loop() {
+  tick += 1;
+  updatePlayer();
+  if (tick % 10 === 0) updateWorldPhysics();
+  drawWorld();
+  drawPlayer();
+  drawDayNightOverlay();
+  renderStats();
+  requestAnimationFrame(loop);
+}
+
+function renderInventory() {
+  inventoryEl.innerHTML = '';
+  placeable.forEach((block, i) => {
+    const btn = document.createElement('button');
+    btn.className = `slot ${i === selected ? 'active' : ''}`;
+    btn.textContent = block.name;
+    btn.style.background = block.color;
+    btn.style.color = '#fff';
+    btn.addEventListener('click', () => {
+      selected = i;
+      renderInventory();
+    });
+    inventoryEl.appendChild(btn);
+  });
+}
+
+renderInventory();
+loop();
