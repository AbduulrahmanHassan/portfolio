import * as THREE from 'three';
import { MACHINES, SCREEN } from './config.js';

function srgb(texture) {
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function addBox(parent, w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function neonMat(hex) {
  const color = new THREE.Color(hex);
  return new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 2.2,
    roughness: 0.35,
    metalness: 0.05
  });
}

function drawMarquee(spec) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 768, 0);
  g.addColorStop(0, '#0a0a10');
  g.addColorStop(0.5, '#14141c');
  g.addColorStop(1, '#0a0a10');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 768, 192);
  ctx.strokeStyle = spec.neon;
  ctx.lineWidth = 8;
  ctx.shadowColor = spec.neon;
  ctx.shadowBlur = 18;
  ctx.strokeRect(14, 14, 740, 164);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = spec.neon;
  ctx.shadowBlur = 16;
  const label = String(spec.title).toUpperCase();
  ctx.font = label.length > 12 ? '800 54px Montserrat, Arial, sans-serif' : '800 64px Montserrat, Arial, sans-serif';
  ctx.fillText(label, 384, 96);

  if (spec.theme === 'factory') {
    ctx.shadowBlur = 0;
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? '#111' : '#ffb020';
      ctx.fillRect(40 + i * 28, 150, 24, 14);
    }
  } else if (spec.theme === 'fire') {
    ctx.shadowBlur = 10;
    ctx.fillStyle = spec.neonAlt;
    [[120, 150], [648, 150]].forEach(function (p) {
      ctx.beginPath();
      ctx.moveTo(p[0], p[1] + 18);
      ctx.quadraticCurveTo(p[0] - 14, p[1] - 8, p[0], p[1] - 28);
      ctx.quadraticCurveTo(p[0] + 14, p[1] - 8, p[0], p[1] + 18);
      ctx.fill();
    });
  } else if (spec.theme === 'drive') {
    ctx.shadowBlur = 0;
    ctx.strokeStyle = spec.neonAlt;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 150);
    ctx.lineTo(688, 150);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    for (let x = 120; x < 660; x += 48) ctx.fillRect(x, 146, 22, 8);
  } else if (spec.theme === 'hunt') {
    ctx.strokeStyle = spec.neon;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(120, 96, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(136, 112);
    ctx.lineTo(152, 128);
    ctx.stroke();
  }

  return srgb(new THREE.CanvasTexture(canvas));
}

function drawSideArt(spec) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = spec.accent;
  ctx.fillRect(0, 0, 256, 512);

  if (spec.theme === 'factory') {
    for (let y = -40; y < 560; y += 36) {
      ctx.fillStyle = '#0d0d10';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y + 120);
      ctx.lineTo(256, y + 148);
      ctx.lineTo(0, y + 28);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffb020';
      ctx.beginPath();
      ctx.moveTo(0, y + 28);
      ctx.lineTo(256, y + 148);
      ctx.lineTo(256, y + 168);
      ctx.lineTo(0, y + 48);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.moveTo(128, 170);
    ctx.lineTo(188, 280);
    ctx.lineTo(68, 280);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(128, 250, 16, 0, Math.PI * 2);
    ctx.fill();
  } else if (spec.theme === 'hunt') {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#0e1822');
    g.addColorStop(1, '#152838');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 512);
    ctx.strokeStyle = spec.neon;
    ctx.lineWidth = 4;
    ctx.shadowColor = spec.neon;
    ctx.shadowBlur = 12;
    [[80, 160], [176, 280], [96, 380]].forEach(function (p, i) {
      ctx.beginPath();
      ctx.arc(p[0], p[1], 28 - i * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p[0] - 36, p[1]);
      ctx.lineTo(p[0] + 36, p[1]);
      ctx.moveTo(p[0], p[1] - 36);
      ctx.lineTo(p[0], p[1] + 36);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '700 28px Montserrat, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HAZARD', 128, 70);
  } else if (spec.theme === 'drive') {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#173048');
    g.addColorStop(0.45, '#2a1c14');
    g.addColorStop(1, '#101018');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 512);
    ctx.fillStyle = '#2a2a32';
    ctx.beginPath();
    ctx.moveTo(40, 120);
    ctx.lineTo(216, 180);
    ctx.lineTo(216, 512);
    ctx.lineTo(40, 512);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([18, 16]);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(128, 160);
    ctx.lineTo(128, 500);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = spec.neon;
    ctx.shadowColor = spec.neon;
    ctx.shadowBlur = 12;
    ctx.fillRect(20, 40, 216, 10);
    ctx.shadowBlur = 0;
    // simple skyline
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    [30, 70, 110, 150, 190].forEach(function (x, i) {
      ctx.fillRect(x, 90 - (i % 3) * 18, 28, 40 + (i % 3) * 18);
    });
  } else if (spec.theme === 'fire') {
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#2a1010');
    g.addColorStop(1, '#140808');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 512);
    function flame(x, y, s) {
      ctx.fillStyle = '#ff9a1a';
      ctx.shadowColor = '#ff3b2f';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(x, y + s);
      ctx.bezierCurveTo(x - s * 0.7, y + s * 0.2, x - s * 0.2, y - s * 0.6, x, y - s);
      ctx.bezierCurveTo(x + s * 0.2, y - s * 0.6, x + s * 0.7, y + s * 0.2, x, y + s);
      ctx.fill();
      ctx.fillStyle = '#ffe14a';
      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.55);
      ctx.bezierCurveTo(x - s * 0.28, y + s * 0.15, x, y - s * 0.2, x, y - s * 0.35);
      ctx.bezierCurveTo(x, y - s * 0.2, x + s * 0.28, y + s * 0.15, x, y + s * 0.55);
      ctx.fill();
    }
    flame(128, 220, 90);
    flame(70, 360, 50);
    flame(186, 340, 58);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '700 22px Montserrat, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLASS A  B  E', 128, 460);
  }

  return srgb(new THREE.CanvasTexture(canvas));
}

function drawIdle(spec) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 342;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(256, 160, 10, 256, 170, 240);
  g.addColorStop(0, spec.accent);
  g.addColorStop(1, '#050508');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 342);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.moveTo(232, 128);
  ctx.lineTo(232, 230);
  ctx.lineTo(318, 179);
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = spec.neon;
  ctx.shadowColor = spec.neon;
  ctx.shadowBlur = 12;
  ctx.font = '700 22px Montserrat, Arial, sans-serif';
  ctx.fillText(String(spec.title).toUpperCase(), 256, 278);
  ctx.shadowBlur = 0;

  if (spec.theme === 'factory') {
    ctx.strokeStyle = spec.neon;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(80, 70);
    ctx.lineTo(140, 70);
    ctx.lineTo(110, 30);
    ctx.closePath();
    ctx.stroke();
  } else if (spec.theme === 'fire') {
    ctx.fillStyle = spec.neonAlt;
    ctx.beginPath();
    ctx.moveTo(420, 90);
    ctx.quadraticCurveTo(400, 50, 420, 20);
    ctx.quadraticCurveTo(440, 50, 420, 90);
    ctx.fill();
  } else if (spec.theme === 'drive') {
    ctx.strokeStyle = spec.neonAlt;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(90, 70, 28, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(90, 70);
    ctx.lineTo(108, 52);
    ctx.stroke();
  } else if (spec.theme === 'hunt') {
    ctx.strokeStyle = spec.neon;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(420, 70, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(433, 83);
    ctx.lineTo(448, 98);
    ctx.stroke();
  }

  return srgb(new THREE.CanvasTexture(canvas));
}

function buildCabinet(spec) {
  const group = new THREE.Group();
  group.position.set(spec.position[0], spec.position[1], spec.position[2]);
  group.rotation.y = spec.rotation;

  const bodyMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(spec.body), roughness: 0.72, metalness: 0.28 });
  const accentMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(spec.accent), roughness: 0.8, metalness: 0.12 });
  const panelMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(spec.panel), roughness: 0.42, metalness: 0.55 });
  const bezelMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(spec.bezel), roughness: 0.38, metalness: 0.62 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x09090c, roughness: 0.9, metalness: 0.08 });
  const neon = neonMat(spec.neon);
  const neonAlt = neonMat(spec.neonAlt);
  const neonParts = [neon, neonAlt];
  const targets = [];

  function solid(parent, w, h, d, material, x, y, z) {
    const mesh = addBox(parent, w, h, d, material, x, y, z);
    mesh.userData.machine = spec;
    targets.push(mesh);
    return mesh;
  }

  // Base cabinet proportions — slightly taller footprint for a more real cabinet read.
  solid(group, 0.82, 0.82, 0.68, bodyMat, 0, 0.41, -0.02);
  solid(group, 0.82, 2.05, 0.1, bodyMat, 0, 1.02, -0.36);
  solid(group, 0.1, 1.62, 0.56, bodyMat, -0.38, 1.18, -0.02);
  solid(group, 0.1, 1.62, 0.56, bodyMat, 0.38, 1.18, -0.02);
  solid(group, 0.9, 0.24, 0.56, bodyMat, 0, 1.95, -0.02);

  // Kickplate + coin doors.
  solid(group, 0.78, 0.08, 0.04, accentMat, 0, 0.05, 0.32);
  solid(group, 0.28, 0.34, 0.03, darkMat, -0.17, 0.36, 0.31);
  solid(group, 0.28, 0.34, 0.03, darkMat, 0.17, 0.36, 0.31);
  addBox(group, 0.04, 0.04, 0.02, neon, -0.17, 0.36, 0.33);
  addBox(group, 0.04, 0.04, 0.02, neon, 0.17, 0.36, 0.33);

  const sideMap = drawSideArt(spec);
  [-1, 1].forEach(function (side) {
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 1.35),
      new THREE.MeshStandardMaterial({ map: sideMap, roughness: 0.65, metalness: 0.15 })
    );
    art.position.set(side * 0.435, 1.15, -0.02);
    art.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    art.userData.machine = spec;
    group.add(art);
    targets.push(art);
  });

  // Front identity plate — readable from the entrance without inventing names.
  addBox(group, 0.66, 0.32, 0.02, accentMat, 0, 0.62, 0.31);
  const badge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.28),
    new THREE.MeshBasicMaterial({ map: sideMap })
  );
  badge.position.set(0, 0.62, 0.33);
  badge.userData.machine = spec;
  group.add(badge);
  targets.push(badge);

  // Marquee header with project title from Vimeo.
  const marquee = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.2),
    new THREE.MeshBasicMaterial({ map: drawMarquee(spec) })
  );
  marquee.position.set(0, 2.02, 0.27);
  marquee.userData.machine = spec;
  group.add(marquee);
  targets.push(marquee);
  addBox(group, 0.84, 0.03, 0.03, neon, 0, 2.14, 0.28);
  addBox(group, 0.84, 0.03, 0.03, neonAlt, 0, 1.9, 0.28);

  // Screen assembly.
  const pivot = new THREE.Group();
  pivot.position.set(0, 1.34, 0.22);
  pivot.rotation.x = -0.18;
  group.add(pivot);

  const bezel = 0.05;
  solid(pivot, SCREEN.width + bezel * 2, bezel, 0.06, bezelMat, 0, SCREEN.height / 2 + bezel / 2, 0.03);
  solid(pivot, SCREEN.width + bezel * 2, bezel, 0.06, bezelMat, 0, -SCREEN.height / 2 - bezel / 2, 0.03);
  solid(pivot, bezel, SCREEN.height, 0.06, bezelMat, SCREEN.width / 2 + bezel / 2, 0, 0.03);
  solid(pivot, bezel, SCREEN.height, 0.06, bezelMat, -SCREEN.width / 2 - bezel / 2, 0, 0.03);

  const lip = 0.028;
  addBox(pivot, SCREEN.width + 0.14, lip, lip, neon, 0, SCREEN.height / 2 + 0.08, 0.06);
  addBox(pivot, SCREEN.width + 0.14, lip, lip, neon, 0, -SCREEN.height / 2 - 0.08, 0.06);
  addBox(pivot, lip, SCREEN.height + 0.14, lip, neonAlt, SCREEN.width / 2 + 0.08, 0, 0.06);
  addBox(pivot, lip, SCREEN.height + 0.14, lip, neonAlt, -SCREEN.width / 2 - 0.08, 0, 0.06);

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
    new THREE.MeshBasicMaterial({ map: drawIdle(spec) })
  );
  idle.position.z = 0.006;
  idle.userData.machine = spec;
  pivot.add(idle);
  targets.push(idle);

  const anchor = new THREE.Object3D();
  anchor.position.z = 0.007;
  pivot.add(anchor);

  // Control deck.
  const deck = new THREE.Group();
  deck.position.set(0, 0.92, 0.24);
  deck.rotation.x = -0.55;
  group.add(deck);
  solid(deck, 0.78, 0.06, 0.42, panelMat, 0, 0, 0.02);
  addBox(deck, 0.78, lip, lip, neon, 0, 0.03, 0.22);
  // Deck print / theme stripe.
  const stripe = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.08),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(spec.neon), transparent: true, opacity: 0.35 })
  );
  stripe.rotation.x = -Math.PI / 2;
  stripe.position.set(0, 0.035, -0.1);
  deck.add(stripe);

  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.018, 0.1, 10), panelMat);
  stick.position.set(-0.2, 0.08, 0.02);
  stick.userData.machine = spec;
  stick.castShadow = true;
  deck.add(stick);
  targets.push(stick);
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.034, 12, 10),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.neon),
      emissive: new THREE.Color(spec.neon),
      emissiveIntensity: 0.55,
      roughness: 0.32,
      metalness: 0.2
    })
  );
  ball.position.set(-0.2, 0.14, 0.02);
  ball.userData.machine = spec;
  ball.castShadow = true;
  deck.add(ball);
  targets.push(ball);
  const washer = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.014, 12), darkMat);
  washer.position.set(-0.2, 0.035, 0.02);
  washer.userData.machine = spec;
  deck.add(washer);

  spec.buttons.forEach(function (hex, index) {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const button = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.026, 0.02, 12),
      new THREE.MeshStandardMaterial({
        color: hex,
        emissive: hex,
        emissiveIntensity: 0.4,
        roughness: 0.35,
        metalness: 0.15
      })
    );
    button.position.set(0.02 + col * 0.075, 0.04, -0.02 + row * 0.085);
    button.userData.machine = spec;
    deck.add(button);
    targets.push(button);
  });

  // Outer neon silhouette.
  addBox(group, lip, 1.85, lip, neon, -0.43, 1.0, 0.32);
  addBox(group, lip, 1.85, lip, neon, 0.43, 1.0, 0.32);
  addBox(group, 0.9, lip, lip, neonAlt, 0, 1.98, 0.24);

  const light = new THREE.PointLight(new THREE.Color(spec.neon), 0.55, 3.2, 2);
  light.position.set(0, 1.3, 0.6);
  group.add(light);

  return {
    spec: spec,
    group: group,
    anchor: anchor,
    idle: idle,
    targets: targets,
    neonParts: neonParts,
    light: light,
    lightBase: 0.55,
    collider: { x: spec.position[0], z: spec.position[2], r: 0.52 }
  };
}

export function buildMachines(scene) {
  const built = MACHINES.map(function (spec) {
    const cabinet = buildCabinet(spec);
    scene.add(cabinet.group);
    return cabinet;
  });

  return {
    list: built,
    targets: built.reduce(function (all, cabinet) { return all.concat(cabinet.targets); }, []),
    colliders: built.map(function (cabinet) { return cabinet.collider; }),
    updateHover: function (id, dt) {
      const blend = Math.min(1, dt * 8);
      built.forEach(function (cabinet) {
        const on = cabinet.spec.id === id;
        const glow = on ? 3.8 : 2.2;
        const power = on ? 1.35 : cabinet.lightBase;
        cabinet.neonParts.forEach(function (mat) {
          mat.emissiveIntensity += (glow - mat.emissiveIntensity) * blend;
        });
        cabinet.light.intensity += (power - cabinet.light.intensity) * blend;
      });
    }
  };
}
