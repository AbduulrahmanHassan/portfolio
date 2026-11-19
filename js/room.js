import * as THREE from 'three';
import { ROOM } from './config.js';

function srgb(texture) {
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function wallTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, size);
  g.addColorStop(0, '#2a2038');
  g.addColorStop(0.55, '#1c1628');
  g.addColorStop(1, '#120e1a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  // Soft plaster grain — much quieter than the old noise.
  let seed = 41;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed & 255) / 255;
  }
  const image = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (rand() - 0.5) * 8;
    image.data[i] = Math.max(0, Math.min(255, image.data[i] + n));
    image.data[i + 1] = Math.max(0, Math.min(255, image.data[i + 1] + n));
    image.data[i + 2] = Math.max(0, Math.min(255, image.data[i + 2] + n));
  }
  ctx.putImageData(image, 0, 0);
  // Subtle architectural panel lines.
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 2;
  for (let y = 48; y < size; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  for (let x = 64; x < size; x += 96) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  const texture = srgb(new THREE.CanvasTexture(canvas));
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.4, 1.15);
  texture.anisotropy = 1;
  return texture;
}

function floorTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#14121c';
  ctx.fillRect(0, 0, size, size);
  let seed = 77;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed & 255) / 255;
  }
  const image = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (rand() - 0.5) * 10;
    image.data[i] = Math.max(0, Math.min(255, image.data[i] + n));
    image.data[i + 1] = Math.max(0, Math.min(255, image.data[i + 1] + n));
    image.data[i + 2] = Math.max(0, Math.min(255, image.data[i + 2] + n * 0.8));
  }
  ctx.putImageData(image, 0, 0);
  ctx.strokeStyle = 'rgba(180,140,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  const texture = srgb(new THREE.CanvasTexture(canvas));
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(5, 4);
  texture.anisotropy = 1;
  return texture;
}

function glow(hex, intensity) {
  const color = new THREE.Color(hex);
  return new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: intensity == null ? 2 : intensity,
    roughness: 0.4,
    metalness: 0.05
  });
}

function box(parent, w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function drawSign() {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Soft backplate glow.
  const glowGrad = ctx.createRadialGradient(700, 320, 40, 700, 320, 420);
  glowGrad.addColorStop(0, 'rgba(120,70,200,0.28)');
  glowGrad.addColorStop(1, 'rgba(120,70,200,0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, 1400, 640);

  ctx.save();
  ctx.translate(700, 150);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#f0d8ff';
  ctx.fillStyle = '#f0d8ff';
  ctx.lineWidth = 11;
  ctx.shadowColor = '#c29bff';
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.moveTo(-86, 20);
  ctx.bezierCurveTo(-150, 20, -164, -30, -114, -50);
  ctx.bezierCurveTo(-86, -94, -26, -70, 0, -34);
  ctx.bezierCurveTo(26, -70, 86, -94, 114, -50);
  ctx.bezierCurveTo(164, -30, 150, 20, 86, 20);
  ctx.bezierCurveTo(46, 44, -46, 44, -86, 20);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-68, -20);
  ctx.lineTo(-68, 10);
  ctx.moveTo(-84, -5);
  ctx.lineTo(-52, -5);
  ctx.stroke();
  [[58, -30], [80, -10], [58, 10], [36, -10]].forEach(function (point) {
    ctx.beginPath();
    ctx.arc(point[0], point[1], 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 86px Montserrat, Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#9ec8ff';
  ctx.shadowBlur = 24;
  ctx.fillText('ABDELRAHMAN\u2019S', 700, 318);

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ff4ad2';
  ctx.lineWidth = 7;
  ctx.shadowColor = '#ff4ad2';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(220, 392);
  ctx.lineTo(470, 392);
  ctx.moveTo(930, 392);
  ctx.lineTo(1180, 392);
  ctx.stroke();

  ctx.font = '800 118px Orbitron, Arial, sans-serif';
  ctx.fillStyle = '#ff4ad8';
  ctx.shadowColor = '#ff4ad8';
  ctx.shadowBlur = 30;
  ctx.fillText('ARCADE', 700, 470);

  // Outer neon frame.
  ctx.shadowBlur = 20;
  ctx.strokeStyle = '#b388ff';
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 36, 1304, 568);

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
  const scale = 16;
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
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 640, 640);
  ctx.strokeStyle = 'rgba(186, 110, 255, 0.92)';
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(186, 110, 255, 0.85)';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(320, 320, 250, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(320, 320, 220, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  const cell = 18;
  const rows = INVADER.length;
  const cols = INVADER[0].length;
  const originX = 320 - (cols * cell) / 2;
  const originY = 320 - (rows * cell) / 2;
  ctx.fillStyle = '#c5d2ef';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (INVADER[y][x] === '#') ctx.fillRect(originX + x * cell, originY + y * cell, cell - 2, cell - 2);
    }
  }
  return srgb(new THREE.CanvasTexture(canvas));
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
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = i % 2 === 0 ? '#3ad7ff' : '#ff3ec8';
    ctx.fillRect(0, 48, 64, 4);
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
  const isMobile = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  // Skip env map on all devices — big savings; neon emissives carry the look.
  scene.fog = isMobile ? null : new THREE.FogExp2(0x0a0712, 0.018);

  const wallMat = new THREE.MeshStandardMaterial({
    map: wallTexture(),
    roughness: 0.92,
    metalness: 0.04
  });
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTexture(),
    roughness: 0.28,
    metalness: 0.7
  });

  const halfW = ROOM.width / 2;
  const halfD = ROOM.depth / 2;
  const h = ROOM.height;

  box(scene, ROOM.width, 0.2, ROOM.depth, floorMat, 0, -0.1, 0);
  box(scene, ROOM.width, h, 0.16, wallMat, 0, h / 2, -halfD);
  box(scene, ROOM.width, h, 0.16, wallMat, 0, h / 2, halfD);
  box(scene, 0.16, h, ROOM.depth, wallMat, -halfW, h / 2, 0);
  box(scene, 0.16, h, ROOM.depth, wallMat, halfW, h / 2, 0);

  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x100e16, roughness: 0.9, metalness: 0.08 });
  box(scene, ROOM.width, 0.12, ROOM.depth, ceilingMat, 0, h, 0);
  box(scene, ROOM.width - 1.4, 0.08, ROOM.depth - 1.4, new THREE.MeshStandardMaterial({ color: 0x0c0a12, roughness: 0.95 }), 0, h - 0.08, 0);

  // Baseboard + crown neon.
  const edge = glow('#c14bff', 1.8);
  const y = 0.014;
  const t = 0.04;
  box(scene, ROOM.width - 0.35, t, t, edge, 0, y, -halfD + 0.16).castShadow = false;
  box(scene, ROOM.width - 0.35, t, t, edge, 0, y, halfD - 0.16).castShadow = false;
  box(scene, t, t, ROOM.depth - 0.35, edge, -halfW + 0.16, y, 0).castShadow = false;
  box(scene, t, t, ROOM.depth - 0.35, edge, halfW - 0.16, y, 0).castShadow = false;
  box(scene, ROOM.width - 0.6, 0.03, 0.03, glow('#7a4dff', 1.4), 0, h - 0.2, -halfD + 0.2);

  const tube = glow('#ff4ad2', 2.2);
  [-1.45, 1.45].forEach(function (x) {
    const mesh = box(scene, 0.04, 2.75, 0.04, tube, x, 1.48, -halfD + 0.18);
    mesh.castShadow = false;
  });

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.7, 1.7),
    new THREE.MeshBasicMaterial({ map: drawSign(), transparent: true })
  );
  sign.position.set(0, 2.08, -halfD + 0.1);
  scene.add(sign);

  // Thin physical frame behind the neon sign.
  const signFrame = box(
    scene,
    3.85,
    1.85,
    0.05,
    new THREE.MeshStandardMaterial({ color: 0x15101c, roughness: 0.55, metalness: 0.4 }),
    0,
    2.08,
    -halfD + 0.06
  );
  signFrame.castShadow = false;

  const decal = new THREE.Mesh(
    new THREE.PlaneGeometry(2.45, 2.45),
    new THREE.MeshBasicMaterial({ map: floorDecal(), transparent: true, depthWrite: false })
  );
  decal.rotation.x = -Math.PI / 2;
  decal.position.set(0, 0.014, 1.05);
  scene.add(decal);

  poster(scene, pixelTexture(INVADER, '#d7def2', '#121018'), -halfW + 0.1, 1.7, -2.15, Math.PI / 2);
  poster(scene, pixelTexture(PAD, '#d7def2', '#121018'), halfW - 0.1, 1.7, -2.15, -Math.PI / 2);

  const benchMat = new THREE.MeshStandardMaterial({ color: 0x14141c, roughness: 0.55, metalness: 0.4 });
  box(scene, 1.7, 0.38, 0.52, benchMat, 0, 0.19, -2.55);
  plant(scene, -1.25, -2.45);
  pendant(scene, -1.75, -2.15, true);
  pendant(scene, 1.75, -2.15, true);

  scene.add(new THREE.AmbientLight(0x2a1844, 0.7));
  scene.add(new THREE.HemisphereLight(0x5a3a82, 0x08060e, 0.7));

  const sun = new THREE.DirectionalLight(0xe8d8ff, 0.35);
  sun.position.set(2.2, 6.4, 3.0);
  scene.add(sun);

  const signLight = new THREE.PointLight(0xb388ff, 1.05, 6.5, 2);
  signLight.position.set(0, 2.15, -halfD + 0.85);
  scene.add(signLight);

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
    },
    isMobile: isMobile
  };
}

function poster(scene, map, x, y, z, rotationY) {
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.56, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.45, metalness: 0.45 })
  );
  frame.position.set(x, y, z);
  frame.rotation.y = rotationY;
  scene.add(frame);
  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.44),
    new THREE.MeshBasicMaterial({ map: map })
  );
  art.position.set(0, 0, 0.025);
  frame.add(art);
}

function plant(scene, x, z) {
  const group = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.13, 0.32, 8),
    new THREE.MeshStandardMaterial({ color: 0xf2f2f4, roughness: 0.55, metalness: 0.05 })
  );
  pot.position.y = 0.16;
  group.add(pot);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f6b38, roughness: 0.78 });
  for (let i = 0; i < 4; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1 + (i % 3) * 0.02, 6, 5), leafMat);
    const angle = (i / 4) * Math.PI * 2;
    leaf.position.set(Math.cos(angle) * 0.08, 0.48 + (i % 3) * 0.08, Math.sin(angle) * 0.08);
    group.add(leaf);
  }
  group.position.set(x, 0, z);
  scene.add(group);
}

function pendant(scene, x, z, isMobile) {
  const group = new THREE.Group();
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.55, 4),
    new THREE.MeshBasicMaterial({ color: 0x111111 })
  );
  cord.position.y = 0.28;
  group.add(cord);

  const shade = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.52),
    new THREE.MeshStandardMaterial({
      color: 0x181818,
      roughness: 0.35,
      metalness: 0.75,
      side: THREE.DoubleSide
    })
  );
  group.add(shade);

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 5),
    new THREE.MeshBasicMaterial({ color: 0xffe2b0 })
  );
  bulb.position.y = -0.09;
  group.add(bulb);

  group.position.set(x, ROOM.height - 0.28, z);
  scene.add(group);

  if (!isMobile) {
    const light = new THREE.PointLight(0xffd8a0, 0.4, 3.8, 2);
    light.position.set(x, ROOM.height - 0.58, z);
    scene.add(light);
  }
}
