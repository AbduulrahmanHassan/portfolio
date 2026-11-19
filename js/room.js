import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { ROOM } from './config.js';
import { addCeilingFloorDecor } from './decor.js';

function srgb(texture) {
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function glow(hex, intensity) {
  const color = new THREE.Color(hex);
  return new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: intensity == null ? 2.2 : intensity,
    roughness: 0.4,
    metalness: 0.05
  });
}

function box(parent, w, h, d, material, x, y, z, cast) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = !!cast;
  mesh.receiveShadow = true;
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
  ctx.translate(512, 110);
  ctx.strokeStyle = '#f0d8ff';
  ctx.lineWidth = 7;
  ctx.shadowColor = '#c29bff';
  ctx.shadowBlur = 14;
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
  ctx.font = '700 58px Montserrat, Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#9ec8ff';
  ctx.shadowBlur = 12;
  ctx.fillText('ABDELRAHMAN\u2019S', 512, 250);

  ctx.font = '800 92px Orbitron, Arial, sans-serif';
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
  ctx.strokeStyle = 'rgba(186, 110, 255, 0.95)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 128, 100, 0, Math.PI * 2);
  ctx.stroke();
  const cell = 10;
  const rows = INVADER.length;
  const cols = INVADER[0].length;
  const originX = 128 - (cols * cell) / 2;
  const originY = 128 - (rows * cell) / 2;
  ctx.fillStyle = '#d6e0f5';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (INVADER[y][x] === '#') ctx.fillRect(originX + x * cell, originY + y * cell, cell - 1, cell - 1);
    }
  }
  return srgb(new THREE.CanvasTexture(canvas));
}

function wallNoise() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#3a314c';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1100; i++) {
    const n = 40 + Math.random() * 50;
    ctx.fillStyle = 'rgba(' + n + ',' + (n - 8) + ',' + (n + 18) + ',0.4)';
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const tex = srgb(new THREE.CanvasTexture(canvas));
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 3);
  return tex;
}

export function buildRoom(scene) {
  const halfW = ROOM.width / 2;
  const halfD = ROOM.depth / 2;
  const h = ROOM.height;

  const wallMap = wallNoise();
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x3a314c,
    map: wallMap,
    roughness: 0.82,
    metalness: 0.12
  });
  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0x1a1624,
    roughness: 0.9,
    metalness: 0.08
  });

  // Subtle floor reflections (tinted mirror under a soft gloss plane).
  const mirror = new Reflector(new THREE.PlaneGeometry(ROOM.width - 0.3, ROOM.depth - 0.3), {
    clipBias: 0.003,
    textureWidth: 512,
    textureHeight: 512,
    color: 0x4a3a62
  });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = 0.002;
  scene.add(mirror);

  const floorTint = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width - 0.28, ROOM.depth - 0.28),
    new THREE.MeshStandardMaterial({
      color: 0x16121f,
      transparent: true,
      opacity: 0.72,
      roughness: 0.35,
      metalness: 0.65,
      depthWrite: false
    })
  );
  floorTint.rotation.x = -Math.PI / 2;
  floorTint.position.y = 0.004;
  scene.add(floorTint);

  box(scene, ROOM.width, h, 0.16, wallMat, 0, h / 2, -halfD);
  box(scene, ROOM.width, h, 0.16, wallMat, 0, h / 2, halfD);
  box(scene, 0.16, h, ROOM.depth, wallMat, -halfW, h / 2, 0);
  box(scene, 0.16, h, ROOM.depth, wallMat, halfW, h / 2, 0);
  box(scene, ROOM.width, 0.12, ROOM.depth, ceilingMat, 0, h, 0);

  const edge = glow('#c14bff', 2.6);
  const y = 0.02;
  const t = 0.045;
  box(scene, ROOM.width - 0.35, t, t, edge, 0, y, -halfD + 0.16);
  box(scene, ROOM.width - 0.35, t, t, edge, 0, y, halfD - 0.16);
  box(scene, t, t, ROOM.depth - 0.35, edge, -halfW + 0.16, y, 0);
  box(scene, t, t, ROOM.depth - 0.35, edge, halfW - 0.16, y, 0);

  const tube = glow('#ff4ad2', 2.8);
  box(scene, 0.05, 2.85, 0.05, tube, -1.55, 1.5, -halfD + 0.18);
  box(scene, 0.05, 2.85, 0.05, tube, 1.55, 1.5, -halfD + 0.18);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 1.55),
    new THREE.MeshBasicMaterial({ map: drawSign(), transparent: true })
  );
  sign.position.set(0, 2.35, -halfD + 0.1);
  scene.add(sign);

  const decal = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 2.1),
    new THREE.MeshBasicMaterial({ map: floorDecal(), transparent: true, depthWrite: false })
  );
  decal.rotation.x = -Math.PI / 2;
  decal.position.set(0, 0.018, 1.05);
  scene.add(decal);

  // Soft props for depth (kept light).
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.12, 0.28, 8),
    new THREE.MeshStandardMaterial({ color: 0xf2f2f4, roughness: 0.55, metalness: 0.05 })
  );
  pot.position.set(-2.35, 0.14, -2.35);
  pot.castShadow = true;
  scene.add(pot);
  const leaf = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x1f6b38, roughness: 0.75 })
  );
  leaf.position.set(-2.35, 0.5, -2.35);
  leaf.castShadow = true;
  scene.add(leaf);

  [-1.9, 1.9].forEach(function (x) {
    const shade = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({ color: 0x1a1820, side: THREE.DoubleSide, roughness: 0.7 })
    );
    shade.position.set(x, ROOM.height - 0.32, -1.6);
    scene.add(shade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshStandardMaterial({
        color: 0xffe2b0,
        emissive: 0xffc878,
        emissiveIntensity: 1.4,
        roughness: 0.4
      })
    );
    bulb.position.set(x, ROOM.height - 0.42, -1.6);
    scene.add(bulb);
    const lamp = new THREE.PointLight(0xffd8a8, 0.35, 6, 2);
    lamp.position.set(x, ROOM.height - 0.55, -1.6);
    scene.add(lamp);
  });

  scene.fog = new THREE.FogExp2(0x100c18, 0.018);

  scene.add(new THREE.AmbientLight(0x4a3668, 0.85));
  scene.add(new THREE.HemisphereLight(0x9a78c8, 0x120e1a, 0.65));

  const key = new THREE.DirectionalLight(0xf5ecff, 0.85);
  key.position.set(2.4, 6.2, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 18;
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.bias = -0.0008;
  scene.add(key);

  const fill = new THREE.PointLight(0x7a5cff, 0.7, 16, 2);
  fill.position.set(0, 2.6, 1.2);
  scene.add(fill);

  const backGlow = new THREE.PointLight(0xff4ad8, 0.55, 9, 2);
  backGlow.position.set(0, 2.2, -halfD + 0.8);
  scene.add(backGlow);

  // Additive ceiling + floor decorations only (does not alter existing objects).
  addCeilingFloorDecor(scene);

  return {
    colliders: [
      { x: -2.35, z: -2.35, r: 0.3 }
    ],
    bounds: {
      minX: -halfW + 0.42,
      maxX: halfW - 0.42,
      minZ: -halfD + 0.42,
      maxZ: halfD - 0.42
    }
  };
}
