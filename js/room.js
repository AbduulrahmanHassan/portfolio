import * as THREE from 'three';
import { ROOM } from './config.js';

function srgb(texture) {
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function noiseTexture(hex, repeats) {
  const size = 256;
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
  texture.anisotropy = 8;
  return texture;
}

function glow(hex, intensity) {
  const color = new THREE.Color(hex);
  return new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.35,
    metalness: 0.04
  });
}

function box(parent, w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function drawSign() {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(700, 168);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#e4c6ff';
  ctx.fillStyle = '#e4c6ff';
  ctx.lineWidth = 10;
  ctx.shadowColor = '#b388ff';
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.moveTo(-78, 18);
  ctx.bezierCurveTo(-138, 18, -150, -28, -104, -46);
  ctx.bezierCurveTo(-78, -86, -24, -64, 0, -30);
  ctx.bezierCurveTo(24, -64, 78, -86, 104, -46);
  ctx.bezierCurveTo(150, -28, 138, 18, 78, 18);
  ctx.bezierCurveTo(42, 40, -42, 40, -78, 18);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-62, -18);
  ctx.lineTo(-62, 8);
  ctx.moveTo(-76, -5);
  ctx.lineTo(-48, -5);
  ctx.stroke();
  [[54, -28], [74, -10], [54, 8], [34, -10]].forEach(function (point) {
    ctx.beginPath();
    ctx.arc(point[0], point[1], 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 78px Montserrat, Arial, sans-serif';
  ctx.fillStyle = '#f5f7ff';
  ctx.shadowColor = '#9ec8ff';
  ctx.shadowBlur = 18;
  ctx.fillText('ABDELRAHMAN\u2019S', 700, 330);

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ff4ad2';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#ff4ad2';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(250, 392);
  ctx.lineTo(470, 392);
  ctx.moveTo(930, 392);
  ctx.lineTo(1150, 392);
  ctx.stroke();

  ctx.font = '800 104px Orbitron, Arial, sans-serif';
  ctx.fillStyle = '#ff4ad8';
  ctx.shadowColor = '#ff4ad8';
  ctx.shadowBlur = 22;
  ctx.fillText('ARCADE', 700, 470);
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
  const scale = 18;
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
  canvas.width = 768;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 768, 768);
  ctx.strokeStyle = 'rgba(176, 92, 255, 0.9)';
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(176, 92, 255, 0.8)';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(384, 384, 300, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  const cell = 22;
  const rows = INVADER.length;
  const cols = INVADER[0].length;
  const originX = 384 - (cols * cell) / 2;
  const originY = 384 - (rows * cell) / 2;
  ctx.fillStyle = '#9eb0d4';
  ctx.shadowBlur = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (INVADER[y][x] === '#') ctx.fillRect(originX + x * cell, originY + y * cell, cell - 2, cell - 2);
    }
  }
  const texture = srgb(new THREE.CanvasTexture(canvas));
  texture.anisotropy = 8;
  return texture;
}

function makeEnvironment(renderer) {
  const faces = [];
  for (let i = 0; i < 6; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 64);
    gradient.addColorStop(0, '#3a2060');
    gradient.addColorStop(0.45, '#140a1c');
    gradient.addColorStop(1, '#07040c');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = i % 2 === 0 ? '#3ad7ff' : '#ff3ec8';
    ctx.fillRect(0, 46, 64, 4);
    faces.push(canvas);
  }
  const cube = new THREE.CubeTexture(faces);
  cube.needsUpdate = true;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromCubemap(cube).texture;
  pmrem.dispose();
  cube.dispose();
  return env;
}

export function buildRoom(scene, renderer) {
  scene.environment = makeEnvironment(renderer);

  const wallMap = noiseTexture('#241c30', [2.2, 1.2]);
  const floorMap = noiseTexture('#1a1722', [4, 3]);
  const wallMat = new THREE.MeshStandardMaterial({ map: wallMap, roughness: 0.92, metalness: 0.04 });
  const floorMat = new THREE.MeshPhysicalMaterial({
    map: floorMap,
    roughness: 0.22,
    metalness: 0.62,
    clearcoat: 0.55,
    clearcoatRoughness: 0.28,
    envMapIntensity: 1.15
  });

  const halfW = ROOM.width / 2;
  const halfD = ROOM.depth / 2;
  const h = ROOM.height;

  const floor = box(scene, ROOM.width, 0.2, ROOM.depth, floorMat, 0, -0.1, 0);
  floor.receiveShadow = true;
  floor.castShadow = false;

  box(scene, ROOM.width, h, 0.16, wallMat, 0, h / 2, -halfD);
  box(scene, ROOM.width, h, 0.16, wallMat, 0, h / 2, halfD);
  box(scene, 0.16, h, ROOM.depth, wallMat, -halfW, h / 2, 0);
  box(scene, 0.16, h, ROOM.depth, wallMat, halfW, h / 2, 0);
  const ceiling = box(scene, ROOM.width, 0.12, ROOM.depth, new THREE.MeshStandardMaterial({ color: 0x100e16, roughness: 0.9 }), 0, h, 0);
  ceiling.castShadow = false;

  const edge = glow('#c14bff', 1.6);
  const y = 0.012;
  const t = 0.045;
  box(scene, ROOM.width - 0.4, t, t, edge, 0, y, -halfD + 0.18).castShadow = false;
  box(scene, ROOM.width - 0.4, t, t, edge, 0, y, halfD - 0.18).castShadow = false;
  box(scene, t, t, ROOM.depth - 0.4, edge, -halfW + 0.18, y, 0).castShadow = false;
  box(scene, t, t, ROOM.depth - 0.4, edge, halfW - 0.18, y, 0).castShadow = false;

  const tube = glow('#ff4ad2', 2);
  [-1.45, 1.45].forEach(function (x) {
    const mesh = box(scene, 0.035, 2.7, 0.035, tube, x, 1.45, -halfD + 0.2);
    mesh.castShadow = false;
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

  const benchMat = new THREE.MeshStandardMaterial({ color: 0x14141c, roughness: 0.6, metalness: 0.35 });
  box(scene, 1.7, 0.38, 0.52, benchMat, 0, 0.19, -2.55);
  plant(scene, -1.25, -2.45);

  pendant(scene, -1.75, -2.15);
  pendant(scene, 1.75, -2.15);

  scene.add(new THREE.AmbientLight(0x2a1844, 0.38));
  scene.add(new THREE.HemisphereLight(0x4a2a72, 0x08060e, 0.48));

  const sun = new THREE.DirectionalLight(0xd8c8ea, 0.42);
  sun.position.set(1.5, 6.2, 2.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 16;
  sun.shadow.camera.left = -6;
  sun.shadow.camera.right = 6;
  sun.shadow.camera.top = 6;
  sun.shadow.camera.bottom = -6;
  sun.shadow.bias = -0.0004;
  scene.add(sun);

  const signLight = new THREE.PointLight(0xb388ff, 1.7, 7, 2);
  signLight.position.set(0, 2.1, -halfD + 0.8);
  scene.add(signLight);
  const left = new THREE.PointLight(0x3ad7ff, 1.5, 8, 2);
  left.position.set(-2.2, 1.5, -0.8);
  scene.add(left);
  const right = new THREE.PointLight(0xff3ec8, 1.5, 8, 2);
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
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5, metalness: 0.4 })
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
    new THREE.CylinderGeometry(0.16, 0.13, 0.32, 18),
    new THREE.MeshStandardMaterial({ color: 0xf2f2f4, roughness: 0.55 })
  );
  pot.position.y = 0.16;
  pot.castShadow = true;
  group.add(pot);
  const leafMat = [
    new THREE.MeshStandardMaterial({ color: 0x1f6b38, roughness: 0.75 }),
    new THREE.MeshStandardMaterial({ color: 0x2f8a48, roughness: 0.7 }),
    new THREE.MeshStandardMaterial({ color: 0x174f2c, roughness: 0.8 })
  ];
  for (let i = 0; i < 8; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1 + (i % 3) * 0.025, 12, 10), leafMat[i % 3]);
    const angle = (i / 8) * Math.PI * 2;
    leaf.position.set(Math.cos(angle) * 0.08, 0.48 + (i % 4) * 0.08, Math.sin(angle) * 0.08);
    leaf.castShadow = true;
    group.add(leaf);
  }
  group.position.set(x, 0, z);
  scene.add(group);
}

function pendant(scene, x, z) {
  const group = new THREE.Group();
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.55, 6),
    new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 })
  );
  cord.position.y = 0.28;
  group.add(cord);
  const shade = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48),
    new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.4, metalness: 0.7, side: THREE.DoubleSide })
  );
  shade.castShadow = true;
  group.add(shade);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xffe2b0 })
  );
  bulb.position.y = -0.08;
  group.add(bulb);
  group.position.set(x, ROOM.height - 0.28, z);
  scene.add(group);
  const light = new THREE.PointLight(0xffd8a0, 0.7, 4.5, 2);
  light.position.set(x, ROOM.height - 0.55, z);
  scene.add(light);
}
