import * as THREE from 'three';
import { MACHINES, SCREEN } from './config.js';

const BODY = new THREE.MeshStandardMaterial({ color: 0x14141a, roughness: 0.78, metalness: 0.18 });
const DARK = new THREE.MeshStandardMaterial({ color: 0x0b0b10, roughness: 0.88, metalness: 0.06 });
const PANEL = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.48, metalness: 0.4 });
const BUTTONS = [0xff3358, 0xffc83a, 0x3dde72, 0x3aa0ff, 0xff5ad4, 0xff8a3a];

function idleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 342;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(256, 150, 20, 256, 170, 220);
  gradient.addColorStop(0, '#2a3348');
  gradient.addColorStop(1, '#07080f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 342);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath();
  ctx.moveTo(236, 130);
  ctx.lineTo(236, 230);
  ctx.lineTo(318, 180);
  ctx.closePath();
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

const IDLE_MAP = idleTexture();

function addBox(parent, w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function neonMaterial(hex) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(hex) });
}

function buildCabinet(spec) {
  const group = new THREE.Group();
  group.position.set(spec.position[0], spec.position[1], spec.position[2]);
  group.rotation.y = spec.rotation;

  const neon = neonMaterial(spec.neon);
  const targets = [];

  function solid(parent, w, h, d, material, x, y, z) {
    const mesh = addBox(parent, w, h, d, material, x, y, z);
    mesh.userData.machine = spec;
    targets.push(mesh);
    return mesh;
  }

  solid(group, 0.78, 0.78, 0.62, BODY, 0, 0.39, -0.04);
  solid(group, 0.78, 1.96, 0.08, BODY, 0, 0.98, -0.34);
  solid(group, 0.08, 1.55, 0.5, BODY, -0.36, 1.15, -0.02);
  solid(group, 0.08, 1.55, 0.5, BODY, 0.36, 1.15, -0.02);
  solid(group, 0.84, 0.2, 0.5, BODY, 0, 1.84, -0.02);

  solid(group, 0.26, 0.32, 0.02, DARK, -0.16, 0.34, 0.275);
  solid(group, 0.26, 0.32, 0.02, DARK, 0.16, 0.34, 0.275);

  const pivot = new THREE.Group();
  pivot.position.set(0, 1.32, 0.2);
  pivot.rotation.x = -0.16;
  group.add(pivot);

  const bezel = 0.045;
  solid(pivot, SCREEN.width + bezel * 2, bezel, 0.05, BODY, 0, SCREEN.height / 2 + bezel / 2, 0.03);
  solid(pivot, SCREEN.width + bezel * 2, bezel, 0.05, BODY, 0, -SCREEN.height / 2 - bezel / 2, 0.03);
  solid(pivot, bezel, SCREEN.height, 0.05, BODY, SCREEN.width / 2 + bezel / 2, 0, 0.03);
  solid(pivot, bezel, SCREEN.height, 0.05, BODY, -SCREEN.width / 2 - bezel / 2, 0, 0.03);

  const lip = 0.032;
  addBox(pivot, SCREEN.width + 0.12, lip, lip, neon, 0, SCREEN.height / 2 + 0.07, 0.055);
  addBox(pivot, SCREEN.width + 0.12, lip, lip, neon, 0, -SCREEN.height / 2 - 0.07, 0.055);
  addBox(pivot, lip, SCREEN.height + 0.12, lip, neon, SCREEN.width / 2 + 0.07, 0, 0.055);
  addBox(pivot, lip, SCREEN.height + 0.12, lip, neon, -SCREEN.width / 2 - 0.07, 0, 0.055);

  const mask = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN.width + 0.04, SCREEN.height + 0.04),
    new THREE.MeshBasicMaterial({ colorWrite: false })
  );
  mask.position.z = 0.005;
  mask.renderOrder = -1;
  mask.userData.machine = spec;
  pivot.add(mask);
  targets.push(mask);

  const idle = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN.width, SCREEN.height),
    new THREE.MeshBasicMaterial({ map: IDLE_MAP })
  );
  idle.position.z = 0.006;
  idle.userData.machine = spec;
  pivot.add(idle);
  targets.push(idle);

  const anchor = new THREE.Object3D();
  anchor.position.z = 0.007;
  pivot.add(anchor);

  const deck = new THREE.Group();
  deck.position.set(0, 0.9, 0.22);
  deck.rotation.x = -0.52;
  group.add(deck);
  solid(deck, 0.74, 0.05, 0.38, PANEL, 0, 0, 0.02);
  addBox(deck, 0.74, lip, lip, neon, 0, 0.02, 0.2);

  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.09, 6), PANEL);
  stick.position.set(-0.18, 0.07, 0.02);
  stick.userData.machine = spec;
  deck.add(stick);
  targets.push(stick);
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0xff2a3a, emissive: 0xff2030, emissiveIntensity: 0.35, roughness: 0.4 })
  );
  ball.position.set(-0.18, 0.125, 0.02);
  ball.userData.machine = spec;
  deck.add(ball);
  targets.push(ball);
  const washer = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 8), DARK);
  washer.position.set(-0.18, 0.03, 0.02);
  washer.userData.machine = spec;
  deck.add(washer);

  BUTTONS.forEach(function (hex, index) {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const button = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 6, 5),
      new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 0.28, roughness: 0.45 })
    );
    button.scale.y = 0.55;
    button.position.set(0.02 + col * 0.07, 0.045, -0.02 + row * 0.08);
    button.userData.machine = spec;
    deck.add(button);
    targets.push(button);
  });

  addBox(group, lip, 1.72, lip, neon, -0.4, 0.98, 0.3);
  addBox(group, lip, 1.72, lip, neon, 0.4, 0.98, 0.3);
  addBox(group, 0.82, lip, lip, neon, 0, 1.9, 0.22);

  return {
    spec: spec,
    group: group,
    anchor: anchor,
    idle: idle,
    targets: targets,
    neon: neon,
    neonBase: neon.color.clone(),
    collider: { x: spec.position[0], z: spec.position[2], r: 0.5 }
  };
}

export function buildMachines(scene) {
  const built = MACHINES.map(function (spec) {
    const cabinet = buildCabinet(spec);
    scene.add(cabinet.group);
    return cabinet;
  });

  const highlight = new THREE.Color(0xffffff);

  return {
    list: built,
    targets: built.reduce(function (all, cabinet) { return all.concat(cabinet.targets); }, []),
    colliders: built.map(function (cabinet) { return cabinet.collider; }),
    updateHover: function (id, dt) {
      const blend = Math.min(1, dt * 8);
      built.forEach(function (cabinet) {
        const on = cabinet.spec.id === id;
        const target = on ? highlight : cabinet.neonBase;
        cabinet.neon.color.lerp(target, blend);
      });
    }
  };
}
