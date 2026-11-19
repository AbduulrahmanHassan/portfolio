import * as THREE from 'three';
import { ROOM } from './config.js';

function srgb(texture) {
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function noiseTexture(hex, repeats) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, size, size);
  const image = ctx.getImageData(0, 0, size, size);
  let seed = 19;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed & 255) / 255;
  }
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (rand() - 0.5) * 22;
    image.data[i] = Math.max(0, Math.min(255, image.data[i] + n));
    image.data[i + 1] = Math.max(0, Math.min(255, image.data[i + 1] + n));
    image.data[i + 2] = Math.max(0, Math.min(255, image.data[i + 2] + n));
  }
  ctx.putImageData(image, 0, 0);
  const texture = srgb(new THREE.CanvasTexture(canvas));
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeats[0], repeats[1]);
  texture.anisotropy = 1;
  texture.minFilter = THREE.LinearFilter;
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
  ctx.translate(512, 126);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#e4c6ff';
  ctx.fillStyle = '#e4c6ff';
  ctx.lineWidth = 8;
  ctx.shadowColor = '#b388ff';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(-58, 14);
  ctx.bezierCurveTo(-104, 14, -112, -21, -78, -34);
  ctx.bezierCurveTo(-58, -64, -18, -48, 0, -22);
  ctx.bezierCurveTo(18, -48, 58, -64, 78, -34);
  ctx.bezierCurveTo(112, -21, 104, 14, 58, 14);
  ctx.bezierCurveTo(32, 30, -32, 30, -58, 14);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-46, -14);
  ctx.lineTo(-46, 6);
  ctx.moveTo(-56, -4);
  ctx.lineTo(-36, -4);
  ctx.stroke();
  [[40, -21], [55, -8], [40, 6], [25, -8]].forEach(function (point) {
    ctx.beginPath();
    ctx.arc(point[0], point[1], 4.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 58px Montserrat, Arial, sans-serif';
  ctx.fillStyle = '#f5f7ff';
  ctx.shadowColor = '#9ec8ff';
  ctx.shadowBlur = 12;
  ctx.fillText('ABDELRAHMAN\u2019S', 512, 248);

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ff4ad2';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#ff4ad2';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(180, 296);
  ctx.lineTo(340, 296);
  ctx.moveTo(684, 296);
  ctx.lineTo(844, 296);
  ctx.stroke();

  ctx.font = '800 78px Orbitron, Arial, sans-serif';
  ctx.fillStyle = '#ff4ad8';
  ctx.shadowColor = '#ff4ad8';
  ctx.shadowBlur = 14;
  ctx.fillText('ARCADE', 512, 352);
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

const PAD = [
  '....#####....',
  '..##.....##..',
  '.#..#...#..#.',
  '.#.###.###.#.',
  '.#.........#.',
  '..#.#...#.#..',
  '..#..###..#..',
  '....#####....'
];

function pixelTexture(rows, color, background) {
  const scale = 12;
  const height = rows.length;
  const width = rows[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (rows[y][x] === '#') ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  const texture = srgb(new THREE.CanvasTexture(canvas));
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

function floorDecal() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(176, 92, 255, 0.9)';
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(176, 92, 255, 0.75)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(256, 256, 200, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  const cell = 14;
  const rows = INVADER.length;
  const cols = INVADER[0].length;
  const originX = 256 - (cols * cell) / 2;
  const originY = 256 - (rows * cell) / 2;
  ctx.fillStyle = '#9eb0d4';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (INVADER[y][x] === '#') ctx.fillRect(originX + x * cell, originY + y * cell, cell - 1, cell - 1);
    }
  }
  return srgb(new THREE.CanvasTexture(canvas));
}

export function buildRoom(scene) {
  const wallMap = noiseTexture('#241c30', [2.2, 1.2]);
  const floorMap = noiseTexture('#1a1722', [4, 3]);
  const wallMat = new THREE.MeshStandardMaterial({ map: wallMap, roughness: 0.94, metalness: 0.02 });
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorMap,
    roughness: 0.28,
    metalness: 0.55
  });

  const halfW = ROOM.width / 2;
  const halfD = ROOM.depth / 2;
  const h = ROOM.height;

  box(scene, ROOM.width, 0.2, ROOM.depth, floorMat, 0, -0.1, 0);
  box(scene, ROOM.width, h, 0.16, wallMat, 0, h / 2, -halfD);
  box(scene, ROOM.width, h, 0.16, wallMat, 0, h / 2, halfD);
  box(scene, 0.16, h, ROOM.depth, wallMat, -halfW, h / 2, 0);
  box(scene, 0.16, h, ROOM.depth, wallMat, halfW, h / 2, 0);
  box(scene, ROOM.width, 0.12, ROOM.depth, new THREE.MeshStandardMaterial({ color: 0x100e16, roughness: 0.92 }), 0, h, 0);

  const edge = glow('#c14bff');
  const y = 0.012;
  const t = 0.045;
  box(scene, ROOM.width - 0.4, t, t, edge, 0, y, -halfD + 0.18);
  box(scene, ROOM.width - 0.4, t, t, edge, 0, y, halfD - 0.18);
  box(scene, t, t, ROOM.depth - 0.4, edge, -halfW + 0.18, y, 0);
  box(scene, t, t, ROOM.depth - 0.4, edge, halfW - 0.18, y, 0);

  const tube = glow('#ff4ad2');
  [-1.45, 1.45].forEach(function (x) {
    box(scene, 0.035, 2.7, 0.035, tube, x, 1.45, -halfD + 0.2);
  });

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 1.6),
    new THREE.MeshBasicMaterial({ map: drawSign(), transparent: true })
  );
  sign.position.set(0, 2.05, -halfD + 0.1);
  scene.add(sign);

  const decal = new THREE.Mesh(
    new THREE.PlaneGeometry(2.35, 2.35),
    new THREE.MeshBasicMaterial({ map: floorDecal(), transparent: true, depthWrite: false })
  );
  decal.rotation.x = -Math.PI / 2;
  decal.position.set(0, 0.014, 1.05);
  scene.add(decal);

  poster(scene, pixelTexture(INVADER, '#d7def2', '#121018'), -halfW + 0.1, 1.7, -2.15, Math.PI / 2);
  poster(scene, pixelTexture(PAD, '#d7def2', '#121018'), halfW - 0.1, 1.7, -2.15, -Math.PI / 2);

  const benchMat = new THREE.MeshStandardMaterial({ color: 0x14141c, roughness: 0.65, metalness: 0.28 });
  box(scene, 1.7, 0.38, 0.52, benchMat, 0, 0.19, -2.55);
  plant(scene, -1.25, -2.45);
  pendant(scene, -1.75, -2.15);
  pendant(scene, 1.75, -2.15);

  scene.add(new THREE.AmbientLight(0x2a1844, 0.55));
  scene.add(new THREE.HemisphereLight(0x4a2a72, 0x08060e, 0.62));
  const sun = new THREE.DirectionalLight(0xd8c8ea, 0.35);
  sun.position.set(1.5, 6.2, 2.2);
  scene.add(sun);

  const signLight = new THREE.PointLight(0xb388ff, 1.2, 7, 2);
  signLight.position.set(0, 2.1, -halfD + 0.8);
  scene.add(signLight);
  const left = new THREE.PointLight(0x3ad7ff, 1.05, 7.5, 2);
  left.position.set(-2.2, 1.5, -0.8);
  scene.add(left);
  const right = new THREE.PointLight(0xff3ec8, 1.05, 7.5, 2);
  right.position.set(2.2, 1.5, -0.8);
  scene.add(right);

  return {
    colliders: [
      { x: 0, z: -2.55, r: 0.7 },
      { x: -1.25, z: -2.45, r: 0.32 }
    ],
    bounds: {
      minX: -halfW + 0.42,
      maxX: halfW - 0.42,
      minZ: -halfD + 0.42,
      maxZ: halfD - 0.42
    }
  };
}

function poster(scene, map, x, y, z, rotationY) {
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.56, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.55, metalness: 0.3 })
  );
  frame.position.set(x, y, z);
  frame.rotation.y = rotationY;
  scene.add(frame);
  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.44),
    new THREE.MeshBasicMaterial({ map: map })
  );
  art.position.set(0, 0, 0.02);
  frame.add(art);
}

function plant(scene, x, z) {
  const group = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.13, 0.32, 10),
    new THREE.MeshStandardMaterial({ color: 0xf2f2f4, roughness: 0.6 })
  );
  pot.position.y = 0.16;
  group.add(pot);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f6b38, roughness: 0.8 });
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1 + (i % 3) * 0.02, 6, 5), leafMat);
    const angle = (i / 5) * Math.PI * 2;
    leaf.position.set(Math.cos(angle) * 0.08, 0.48 + (i % 3) * 0.08, Math.sin(angle) * 0.08);
    group.add(leaf);
  }
  group.position.set(x, 0, z);
  scene.add(group);
}

function pendant(scene, x, z) {
  const group = new THREE.Group();
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.55, 4),
    new THREE.MeshBasicMaterial({ color: 0x111111 })
  );
  cord.position.y = 0.28;
  group.add(cord);
  const shade = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48),
    new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.45, metalness: 0.65, side: THREE.DoubleSide })
  );
  group.add(shade);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 6, 5),
    new THREE.MeshBasicMaterial({ color: 0xffe2b0 })
  );
  bulb.position.y = -0.08;
  group.add(bulb);
  group.position.set(x, ROOM.height - 0.28, z);
  scene.add(group);
}
