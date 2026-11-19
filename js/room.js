import * as THREE from 'three';
import { ROOM } from './config.js';

function srgb(texture) {
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function glow(hex) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(hex) });
}

function box(parent, w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function drawSign() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(512, 120);
  ctx.strokeStyle = '#f0d8ff';
  ctx.fillStyle = '#f0d8ff';
  ctx.lineWidth = 8;
  ctx.shadowColor = '#c29bff';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(-70, 16);
  ctx.bezierCurveTo(-120, 16, -130, -24, -90, -40);
  ctx.bezierCurveTo(-70, -74, -20, -56, 0, -26);
  ctx.bezierCurveTo(20, -56, 70, -74, 90, -40);
  ctx.bezierCurveTo(130, -24, 120, 16, 70, 16);
  ctx.bezierCurveTo(36, 34, -36, 34, -70, 16);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 64px Montserrat, Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#9ec8ff';
  ctx.shadowBlur = 14;
  ctx.fillText('ABDELRAHMAN\u2019S', 512, 250);

  ctx.font = '800 90px Orbitron, Arial, sans-serif';
  ctx.fillStyle = '#ff4ad8';
  ctx.shadowColor = '#ff4ad8';
  ctx.shadowBlur = 18;
  ctx.fillText('ARCADE', 512, 350);
  return srgb(new THREE.CanvasTexture(canvas));
}

const INVADER = [
  '..#.....#..',
  '...#...#...',
  '..#######..',
  '.##.###.##.',
  '###########',
  '#.#######.#',
  '#.#.....#.#',
  '...##.##...'
];

function floorDecal() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);
  ctx.strokeStyle = 'rgba(186, 110, 255, 0.9)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 128, 100, 0, Math.PI * 2);
  ctx.stroke();
  const cell = 10;
  const rows = INVADER.length;
  const cols = INVADER[0].length;
  const originX = 128 - (cols * cell) / 2;
  const originY = 128 - (rows * cell) / 2;
  ctx.fillStyle = '#c5d2ef';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (INVADER[y][x] === '#') ctx.fillRect(originX + x * cell, originY + y * cell, cell - 1, cell - 1);
    }
  }
  return srgb(new THREE.CanvasTexture(canvas));
}

export function buildRoom(scene) {
  const halfW = ROOM.width / 2;
  const halfD = ROOM.depth / 2;
  const h = ROOM.height;

  // Flat cheap materials — no noise maps, no env map, no fog.
  const wallMat = new THREE.MeshBasicMaterial({ color: 0x1c1628 });
  const floorMat = new THREE.MeshBasicMaterial({ color: 0x14121c });
  const ceilingMat = new THREE.MeshBasicMaterial({ color: 0x100e16 });

  box(scene, ROOM.width, 0.2, ROOM.depth, floorMat, 0, -0.1, 0);
  box(scene, ROOM.width, h, 0.16, wallMat, 0, h / 2, -halfD);
  box(scene, ROOM.width, h, 0.16, wallMat, 0, h / 2, halfD);
  box(scene, 0.16, h, ROOM.depth, wallMat, -halfW, h / 2, 0);
  box(scene, 0.16, h, ROOM.depth, wallMat, halfW, h / 2, 0);
  box(scene, ROOM.width, 0.12, ROOM.depth, ceilingMat, 0, h, 0);

  const edge = glow('#c14bff');
  const y = 0.014;
  const t = 0.04;
  box(scene, ROOM.width - 0.35, t, t, edge, 0, y, -halfD + 0.16);
  box(scene, ROOM.width - 0.35, t, t, edge, 0, y, halfD - 0.16);
  box(scene, t, t, ROOM.depth - 0.35, edge, -halfW + 0.16, y, 0);
  box(scene, t, t, ROOM.depth - 0.35, edge, halfW - 0.16, y, 0);

  const tube = glow('#ff4ad2');
  box(scene, 0.04, 2.75, 0.04, tube, -1.45, 1.48, -halfD + 0.18);
  box(scene, 0.04, 2.75, 0.04, tube, 1.45, 1.48, -halfD + 0.18);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 0.85),
    new THREE.MeshBasicMaterial({ map: drawSign(), transparent: true })
  );
  sign.position.set(0, 3.05, -halfD + 0.1);
  scene.add(sign);

  const decal = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 2.1),
    new THREE.MeshBasicMaterial({ map: floorDecal(), transparent: true, depthWrite: false })
  );
  decal.rotation.x = -Math.PI / 2;
  decal.position.set(0, 0.014, 1.05);
  scene.add(decal);

  // Ambient only — MeshBasic materials don't need directional lights.
  scene.add(new THREE.AmbientLight(0x5a3a78, 1.05));

  return {
    colliders: [],
    bounds: {
      minX: -halfW + 0.42,
      maxX: halfW - 0.42,
      minZ: -halfD + 0.42,
      maxZ: halfD - 0.42
    }
  };
}
