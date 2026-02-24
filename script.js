const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const inventoryEl = document.getElementById('inventory');

const tileSize = 30;
const worldWidth = 120;
const worldHeight = 40;
const gravity = 0.6;
const maxFall = 12;

const BLOCKS = {
  air: { id: 0, color: null, name: 'Air', solid: false },
  grass: { id: 1, color: '#5ea53f', name: 'Grass', solid: true },
  dirt: { id: 2, color: '#835632', name: 'Dirt', solid: true },
  stone: { id: 3, color: '#7f858a', name: 'Stone', solid: true },
  wood: { id: 4, color: '#9f6a35', name: 'Wood', solid: true },
  leaves: { id: 5, color: '#3e8835', name: 'Leaves', solid: true },
};

const placeable = [BLOCKS.dirt, BLOCKS.stone, BLOCKS.wood, BLOCKS.leaves];
let selected = 0;

const world = Array.from({ length: worldHeight }, () => Array(worldWidth).fill(BLOCKS.air.id));

function setBlock(x, y, block) {
  if (x < 0 || y < 0 || x >= worldWidth || y >= worldHeight) return;
  world[y][x] = block.id;
}

function getBlock(x, y) {
  if (x < 0 || y < 0 || x >= worldWidth || y >= worldHeight) return BLOCKS.stone.id;
  return world[y][x];
}

function generateWorld() {
  for (let x = 0; x < worldWidth; x++) {
    const heightOffset = Math.floor(Math.sin(x * 0.25) * 2 + Math.sin(x * 0.08) * 4);
    const surface = 20 + heightOffset;

    for (let y = surface; y < worldHeight; y++) {
      if (y === surface) setBlock(x, y, BLOCKS.grass);
      else if (y < surface + 4) setBlock(x, y, BLOCKS.dirt);
      else setBlock(x, y, BLOCKS.stone);
    }

    if (Math.random() < 0.07) {
      const treeY = surface - 1;
      for (let t = 0; t < 4; t++) setBlock(x, treeY - t, BLOCKS.wood);
      for (let lx = -2; lx <= 2; lx++) {
        for (let ly = -2; ly <= 1; ly++) {
          if (Math.abs(lx) + Math.abs(ly) < 4) setBlock(x + lx, treeY - 4 + ly, BLOCKS.leaves);
        }
      }
    }
  }
}

generateWorld();

const player = {
  x: 15 * tileSize,
  y: 10 * tileSize,
  w: tileSize * 0.75,
  h: tileSize * 1.4,
  vx: 0,
  vy: 0,
  onGround: false,
};

const keys = new Set();
const camera = { x: 0, y: 0 };

window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

function isSolidAtPixel(px, py) {
  const tx = Math.floor(px / tileSize);
  const ty = Math.floor(py / tileSize);
  const id = getBlock(tx, ty);
  return Object.values(BLOCKS).find((b) => b.id === id).solid;
}

function moveAndCollide() {
  player.vy = Math.min(maxFall, player.vy + gravity);

  player.x += player.vx;
  if (player.vx > 0 && (isSolidAtPixel(player.x + player.w, player.y + 4) || isSolidAtPixel(player.x + player.w, player.y + player.h - 4))) {
    player.x = Math.floor((player.x + player.w) / tileSize) * tileSize - player.w - 0.01;
    player.vx = 0;
  } else if (player.vx < 0 && (isSolidAtPixel(player.x, player.y + 4) || isSolidAtPixel(player.x, player.y + player.h - 4))) {
    player.x = Math.floor(player.x / tileSize + 1) * tileSize + 0.01;
    player.vx = 0;
  }

  player.y += player.vy;
  player.onGround = false;
  if (player.vy > 0 && (isSolidAtPixel(player.x + 4, player.y + player.h) || isSolidAtPixel(player.x + player.w - 4, player.y + player.h))) {
    player.y = Math.floor((player.y + player.h) / tileSize) * tileSize - player.h;
    player.vy = 0;
    player.onGround = true;
  } else if (player.vy < 0 && (isSolidAtPixel(player.x + 4, player.y) || isSolidAtPixel(player.x + player.w - 4, player.y))) {
    player.y = Math.floor(player.y / tileSize + 1) * tileSize;
    player.vy = 0;
  }
}

function updatePlayer() {
  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  const jump = keys.has('w') || keys.has('arrowup') || keys.has(' ');

  const speed = 3.4;
  if (left === right) player.vx *= 0.75;
  else player.vx = left ? -speed : speed;

  if (jump && player.onGround) player.vy = -10.5;

  moveAndCollide();

  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;
  camera.x = Math.max(0, Math.min(camera.x, worldWidth * tileSize - canvas.width));
  camera.y = Math.max(0, Math.min(camera.y, worldHeight * tileSize - canvas.height));
}

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) * canvas.width) / rect.width + camera.x;
  const y = ((event.clientY - rect.top) * canvas.height) / rect.height + camera.y;
  const tx = Math.floor(x / tileSize);
  const ty = Math.floor(y / tileSize);

  if (event.shiftKey) {
    if (getBlock(tx, ty) === BLOCKS.air.id) {
      setBlock(tx, ty, placeable[selected]);
    }
  } else {
    if (getBlock(tx, ty) !== BLOCKS.air.id) {
      setBlock(tx, ty, BLOCKS.air);
    }
  }
});

function drawWorld() {
  ctx.fillStyle = '#8ec7ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const startX = Math.floor(camera.x / tileSize);
  const endX = Math.ceil((camera.x + canvas.width) / tileSize);
  const startY = Math.floor(camera.y / tileSize);
  const endY = Math.ceil((camera.y + canvas.height) / tileSize);

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const id = getBlock(x, y);
      if (id === BLOCKS.air.id) continue;
      const block = Object.values(BLOCKS).find((b) => b.id === id);
      const px = x * tileSize - camera.x;
      const py = y * tileSize - camera.y;

      ctx.fillStyle = block.color;
      ctx.fillRect(px, py, tileSize, tileSize);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.strokeRect(px + 0.5, py + 0.5, tileSize - 1, tileSize - 1);
    }
  }
}

function drawPlayer() {
  ctx.fillStyle = '#ffce98';
  ctx.fillRect(player.x - camera.x, player.y - camera.y, player.w, player.h);
}

function loop() {
  updatePlayer();
  drawWorld();
  drawPlayer();
  requestAnimationFrame(loop);
}

function renderInventory() {
  inventoryEl.innerHTML = '';
  placeable.forEach((block, i) => {
    const btn = document.createElement('button');
    btn.className = `slot ${i === selected ? 'active' : ''}`;
    btn.textContent = block.name;
    btn.style.background = block.color;
    btn.style.color = '#fff';
    btn.addEventListener('click', () => {
      selected = i;
      renderInventory();
    });
    inventoryEl.appendChild(btn);
  });
}

renderInventory();
loop();
