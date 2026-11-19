import * as THREE from 'three';
import { ROOM } from './config.js';

function srgb(texture) {
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function neonMat(hex, intensity) {
  const color = new THREE.Color(hex);
  return new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: intensity == null ? 1.8 : intensity,
    roughness: 0.45,
    metalness: 0.05
  });
}

function addBox(scene, w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  scene.add(mesh);
  return mesh;
}

function addFloorPlane(scene, w, d, material, x, y, z, rotY) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material);
  mesh.rotation.x = -Math.PI / 2;
  if (rotY) mesh.rotation.z = rotY;
  mesh.position.set(x, y, z);
  mesh.receiveShadow = false;
  scene.add(mesh);
  return mesh;
}

const PIXEL_HEART = [
  '..##.##..',
  '.#######.',
  '#########',
  '#########',
  '.#######.',
  '..#####..',
  '...###...',
  '....#....'
];

const PIXEL_STAR = [
  '....#....',
  '...###...',
  '.#######.',
  '..#####..',
  '.##.#.##.',
  '##..#..##',
  '....#....'
];

const PIXEL_COIN = [
  '..###..',
  '.#####.',
  '##...##',
  '##.#.##',
  '##...##',
  '.#####.',
  '..###..'
];

function drawPixelSprite(pattern, fillHex, glowHex) {
  const rows = pattern.length;
  const cols = pattern[0].length;
  const cell = 8;
  const pad = 16;
  const canvas = document.createElement('canvas');
  canvas.width = cols * cell + pad * 2;
  canvas.height = rows * cell + pad * 2;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = fillHex;
  ctx.shadowColor = glowHex;
  ctx.shadowBlur = 8;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (pattern[y][x] === '#') {
        ctx.fillRect(pad + x * cell, pad + y * cell, cell - 1, cell - 1);
      }
    }
  }
  return srgb(new THREE.CanvasTexture(canvas));
}

function drawCeilingPanel(accentHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#12101a';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 6;
  ctx.shadowColor = accentHex;
  ctx.shadowBlur = 12;
  ctx.strokeRect(18, 18, 220, 220);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(40, 50 + i * 36);
    ctx.lineTo(216, 50 + i * 36);
    ctx.stroke();
  }
  ctx.fillStyle = accentHex;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(48, 48, 40, 40);
  ctx.fillRect(168, 168, 40, 40);
  ctx.globalAlpha = 1;
  return srgb(new THREE.CanvasTexture(canvas));
}

function drawCeilingPixelStrip() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 64);
  const colors = ['#ff4ad8', '#3ad7ff', '#c14bff', '#7dffd4'];
  for (let i = 0; i < 32; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.55 + (i % 3) * 0.12;
    ctx.fillRect(8 + i * 15, 18 + (i % 2) * 8, 10, 10);
  }
  ctx.globalAlpha = 1;
  return srgb(new THREE.CanvasTexture(canvas));
}

function drawHangingSign(label, accentHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 384, 128);
  ctx.fillStyle = 'rgba(12,8,20,0.85)';
  ctx.fillRect(12, 20, 360, 88);
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 5;
  ctx.shadowColor = accentHex;
  ctx.shadowBlur = 10;
  ctx.strokeRect(12, 20, 360, 88);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 42px Orbitron, Montserrat, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 192, 68);
  return srgb(new THREE.CanvasTexture(canvas));
}

function drawFloorRing() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  ctx.translate(256, 256);

  // Directional chevrons around the emblem.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(58,215,255,0.55)' : 'rgba(255,74,216,0.5)';
    ctx.beginPath();
    ctx.moveTo(0, -118);
    ctx.lineTo(14, -96);
    ctx.lineTo(-14, -96);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.strokeStyle = 'rgba(193,75,255,0.65)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 132, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(58,215,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 148, 0, Math.PI * 2);
  ctx.stroke();

  // Dashed orbit.
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.arc(0, 0, 168, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  return srgb(new THREE.CanvasTexture(canvas));
}

function drawFloorPath() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 64, 256);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(58,215,255,0.55)' : 'rgba(255,74,216,0.45)';
    ctx.fillRect(22, 12 + i * 30, 20, 16);
  }
  return srgb(new THREE.CanvasTexture(canvas));
}

/** Ceiling + floor decorations only. Does not touch existing room objects. */
export function addCeilingFloorDecor(scene) {
  const halfW = ROOM.width / 2;
  const halfD = ROOM.depth / 2;
  const h = ROOM.height;

  const pink = neonMat('#ff4ad8', 1.7);
  const cyan = neonMat('#3ad7ff', 1.7);
  const purple = neonMat('#c14bff', 1.6);

  // --- Ceiling: neon LED strips along selected edges ---
  const stripY = h - 0.08;
  const stripT = 0.03;
  addBox(scene, ROOM.width - 1.2, stripT, stripT, pink, 0, stripY, -halfD + 0.35);
  addBox(scene, ROOM.width - 1.2, stripT, stripT, cyan, 0, stripY, halfD - 0.35);
  addBox(scene, stripT, stripT, ROOM.depth - 1.4, purple, -halfW + 0.35, stripY, 0.15);
  addBox(scene, stripT, stripT, ROOM.depth - 1.4, cyan, halfW - 0.35, stripY, -0.15);

  // Short accent strips near corners.
  addBox(scene, 1.1, stripT, stripT, cyan, -halfW + 1.1, stripY - 0.04, -halfD + 0.7);
  addBox(scene, 1.1, stripT, stripT, pink, halfW - 1.1, stripY - 0.04, -halfD + 0.7);
  addBox(scene, 1.1, stripT, stripT, purple, -halfW + 1.1, stripY - 0.04, halfD - 0.7);
  addBox(scene, 1.1, stripT, stripT, pink, halfW - 1.1, stripY - 0.04, halfD - 0.7);

  // --- Ceiling: geometric light panels ---
  const panelA = new THREE.Mesh(
    new THREE.PlaneGeometry(0.85, 0.85),
    new THREE.MeshBasicMaterial({ map: drawCeilingPanel('#ff4ad8'), transparent: true })
  );
  panelA.rotation.x = Math.PI / 2;
  panelA.position.set(-2.4, h - 0.07, 1.8);
  scene.add(panelA);

  const panelB = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.7),
    new THREE.MeshBasicMaterial({ map: drawCeilingPanel('#3ad7ff'), transparent: true })
  );
  panelB.rotation.x = Math.PI / 2;
  panelB.position.set(2.55, h - 0.07, 1.55);
  scene.add(panelB);

  const panelC = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 0.55),
    new THREE.MeshBasicMaterial({ map: drawCeilingPanel('#c14bff'), transparent: true })
  );
  panelC.rotation.x = Math.PI / 2;
  panelC.position.set(0, h - 0.07, 2.55);
  scene.add(panelC);

  // Pixel pattern strips on ceiling.
  const pixelStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 0.28),
    new THREE.MeshBasicMaterial({ map: drawCeilingPixelStrip(), transparent: true, depthWrite: false })
  );
  pixelStrip.rotation.x = Math.PI / 2;
  pixelStrip.position.set(-2.2, h - 0.06, -0.4);
  scene.add(pixelStrip);

  const pixelStrip2 = pixelStrip.clone();
  pixelStrip2.position.set(2.2, h - 0.06, -0.6);
  pixelStrip2.rotation.z = Math.PI;
  scene.add(pixelStrip2);

  // --- Ceiling: small hanging arcade signs ---
  function hangSign(label, accent, x, z) {
    const cord = neonMat(accent, 1.2);
    addBox(scene, 0.015, 0.35, 0.015, cord, x - 0.22, h - 0.28, z);
    addBox(scene, 0.015, 0.35, 0.015, cord, x + 0.22, h - 0.28, z);
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.22),
      new THREE.MeshBasicMaterial({ map: drawHangingSign(label, accent), transparent: true })
    );
    board.position.set(x, h - 0.52, z);
    scene.add(board);
  }
  hangSign('INSERT', '#ff4ad8', -2.6, 2.6);
  hangSign('PLAYER 1', '#3ad7ff', 2.6, 2.45);

  // Tiny hanging diamond ornaments.
  [[-1.1, 2.8], [1.1, 2.8]].forEach(function (p, i) {
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.07, 0),
      neonMat(i === 0 ? '#c14bff' : '#3ad7ff', 2.0)
    );
    gem.position.set(p[0], h - 0.55, p[1]);
    scene.add(gem);
    addBox(scene, 0.012, 0.28, 0.012, neonMat('#ffffff', 0.8), p[0], h - 0.3, p[1]);
  });

  // --- Floor: glowing path lines (above existing reflective floor) ---
  const floorY = 0.012;
  addBox(scene, 0.04, 0.012, 3.2, cyan, -1.15, floorY, 0.9);
  addBox(scene, 0.04, 0.012, 3.2, pink, 1.15, floorY, 0.9);
  addBox(scene, 2.4, 0.012, 0.04, purple, 0, floorY, 2.55);
  addBox(scene, 1.6, 0.012, 0.03, cyan, -2.6, floorY, -0.4);
  addBox(scene, 1.6, 0.012, 0.03, pink, 2.6, floorY, -0.4);

  // Dashed neon path toward the center emblem.
  const pathMat = new THREE.MeshBasicMaterial({
    map: drawFloorPath(),
    transparent: true,
    depthWrite: false,
    opacity: 0.85
  });
  addFloorPlane(scene, 0.22, 1.1, pathMat, 0, floorY + 0.002, 2.35, 0);

  // Directional ring around the existing invader emblem (emblem stays).
  const ring = new THREE.Mesh(
    new THREE.PlaneGeometry(3.05, 3.05),
    new THREE.MeshBasicMaterial({ map: drawFloorRing(), transparent: true, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, floorY + 0.003, 1.05);
  scene.add(ring);

  // Small pixel-art floor stickers.
  function floorSprite(pattern, fill, glow, x, z, size) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({
        map: drawPixelSprite(pattern, fill, glow),
        transparent: true,
        depthWrite: false
      })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, floorY + 0.004, z);
    scene.add(mesh);
  }
  floorSprite(PIXEL_HEART, '#ff4ad8', '#ff4ad8', -2.8, 2.2, 0.42);
  floorSprite(PIXEL_STAR, '#3ad7ff', '#3ad7ff', 2.85, 2.15, 0.4);
  floorSprite(PIXEL_COIN, '#c14bff', '#c14bff', -2.9, -0.2, 0.36);
  floorSprite(PIXEL_STAR, '#ff4ad8', '#ff4ad8', 2.9, -0.35, 0.34);
  floorSprite(PIXEL_HEART, '#3ad7ff', '#3ad7ff', 0, -2.0, 0.32);

  // Corner arcade symbols (simple neon L-marks).
  function cornerMark(x, z, mat) {
    addBox(scene, 0.45, 0.012, 0.03, mat, x, floorY, z);
    addBox(scene, 0.03, 0.012, 0.45, mat, x, floorY, z);
  }
  cornerMark(-halfW + 0.55, -halfD + 0.55, purple);
  cornerMark(halfW - 0.55, -halfD + 0.55, cyan);
  cornerMark(-halfW + 0.55, halfD - 0.55, pink);
  cornerMark(halfW - 0.55, halfD - 0.55, purple);
}
