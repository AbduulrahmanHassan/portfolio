import * as THREE from 'three';
import { CONTACT, contactLinks } from './contact.js';

function drawTerminalScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  const g = ctx.createLinearGradient(0, 0, 0, 480);
  g.addColorStop(0, '#1c1230');
  g.addColorStop(1, '#07050e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 640, 480);

  ctx.strokeStyle = '#ff4ad8';
  ctx.lineWidth = 8;
  ctx.shadowColor = '#ff4ad8';
  ctx.shadowBlur = 14;
  ctx.strokeRect(16, 16, 608, 448);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#3ad7ff';
  ctx.font = '700 20px Montserrat, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CONTACT HUB', 320, 68);

  ctx.fillStyle = '#ff4ad8';
  ctx.font = '800 72px Orbitron, Montserrat, Arial, sans-serif';
  ctx.shadowColor = '#ff4ad8';
  ctx.shadowBlur = 16;
  ctx.fillText('CONTACT', 320, 175);

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 30px Montserrat, Arial, sans-serif';
  ctx.fillText(CONTACT.name || 'Abdelrahman Hassan', 320, 250);

  ctx.fillStyle = '#3ad7ff';
  ctx.font = '800 32px Orbitron, Montserrat, Arial, sans-serif';
  ctx.fillText('CLICK TO OPEN', 320, 360);

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '600 16px Montserrat, Arial, sans-serif';
  ctx.fillText('Links · Phone · Social', 320, 410);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

// Compact contact terminal under the arcade sign — readable, not wall-filling.
export function buildContactHub(scene) {
  const group = new THREE.Group();
  group.position.set(0, 0, -2.52);

  const neon = new THREE.MeshStandardMaterial({
    color: 0xff4ad8,
    emissive: 0xff4ad8,
    emissiveIntensity: 2.4,
    roughness: 0.35,
    metalness: 0.1
  });
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x141018,
    roughness: 0.55,
    metalness: 0.45
  });
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1c1824,
    roughness: 0.4,
    metalness: 0.55
  });
  const targets = [];

  function solid(w, h, d, material, x, y, z, cast) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.userData.hub = true;
    mesh.castShadow = !!cast;
    mesh.receiveShadow = true;
    group.add(mesh);
    targets.push(mesh);
    return mesh;
  }

  // Pedestal
  solid(0.72, 0.12, 0.48, bodyMat, 0, 0.06, 0, true);
  solid(0.42, 0.92, 0.28, bodyMat, 0, 0.58, -0.02, true);
  solid(0.78, 0.08, 0.42, panelMat, 0, 1.08, 0.06, true);

  // Neon trim on pedestal
  solid(0.76, 0.02, 0.02, neon, 0, 0.13, 0.23);
  solid(0.02, 0.9, 0.02, neon, -0.22, 0.58, 0.12);
  solid(0.02, 0.9, 0.02, neon, 0.22, 0.58, 0.12);

  // Angled monitor
  const monitor = new THREE.Group();
  monitor.position.set(0, 1.42, 0.1);
  monitor.rotation.x = -0.28;
  group.add(monitor);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.68, 0.07), panelMat);
  frame.userData.hub = true;
  frame.castShadow = true;
  monitor.add(frame);
  targets.push(frame);

  function rim(w, h, d, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), neon);
    mesh.position.set(x, y, z);
    mesh.userData.hub = true;
    monitor.add(mesh);
    targets.push(mesh);
  }
  rim(0.9, 0.035, 0.04, 0, 0.36, 0.03);
  rim(0.9, 0.035, 0.04, 0, -0.36, 0.03);
  rim(0.035, 0.72, 0.04, -0.44, 0, 0.03);
  rim(0.035, 0.72, 0.04, 0.44, 0, 0.03);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.58),
    new THREE.MeshBasicMaterial({ map: drawTerminalScreen() })
  );
  screen.position.set(0, 0, 0.04);
  screen.userData.hub = true;
  monitor.add(screen);
  targets.push(screen);

  // Soft neon point for the terminal
  const glow = new THREE.PointLight(0xff4ad8, 0.55, 4.5, 2);
  glow.position.set(0, 1.5, 0.35);
  group.add(glow);

  scene.add(group);

  return {
    group: group,
    targets: targets,
    neon: neon,
    collider: { x: 0, z: -2.52, r: 0.55 },
    setHover: function (on) {
      neon.emissiveIntensity = on ? 3.6 : 2.4;
    }
  };
}

function iconSvg(kind) {
  const common = 'width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"';
  if (kind === 'in') {
    return '<svg ' + common + '><path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.05c.53-1 1.82-2.05 3.75-2.05 4 0 4.75 2.64 4.75 6.07V23h-4v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.48V23h-4V8.5z"/></svg>';
  }
  if (kind === 'phone') {
    return '<svg ' + common + '><path d="M6.6 10.8a15.5 15.5 0 006.6 6.6l2.2-2.2a1 1 0 011-.24c1.1.36 2.3.56 3.5.56a1 1 0 011 1V21a1 1 0 01-1 1C10.6 22 2 13.4 2 2.9A1 1 0 013 1.9h3.5a1 1 0 011 1c0 1.2.2 2.4.56 3.5a1 1 0 01-.25 1l-2.2 2.4z"/></svg>';
  }
  if (kind === 'wa') {
    return '<svg ' + common + '><path d="M12 2a10 10 0 00-8.7 14.9L2 22l5.3-1.4A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3A8 8 0 1112 20zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.5 6.5 0 01-1.9-1.2 7.2 7.2 0 01-1.3-1.6c-.1-.3 0-.4.1-.5l.4-.4.2-.4c.1-.1 0-.3 0-.4s-.5-1.3-.7-1.8-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.4a2.1 2.1 0 00-.7 1.6 3.7 3.7 0 00.8 2c.9 1.4 2.2 2.5 3.7 3.2 1.4.6 1.7.5 2 .5a1.8 1.8 0 001.2-.6 1.5 1.5 0 00.3-1c0-.1-.2-.2-.4-.3z"/></svg>';
  }
  if (kind === 'mail') {
    return '<svg ' + common + '><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5L4 8V6l8 5 8-5v2z"/></svg>';
  }
  if (kind === 'gh') {
    return '<svg ' + common + '><path d="M12 .5A11.5 11.5 0 008.4 23c.6.1.8-.2.8-.5v-2c-3.3.7-4-1.4-4-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.7 1.7 2.7 1.2.1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5A11.5 11.5 0 0012 .5z"/></svg>';
  }
  if (kind === 'art') {
    return '<svg ' + common + '><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.3-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4c3.1 0 5.6-2.5 5.6-5.6C23 6.2 18 2 12 2zM6.5 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>';
  }
  if (kind === 'cv') {
    return '<svg ' + common + '><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm1 7V3.5L18.5 9H15zM8 13h8v2H8v-2zm0 4h8v2H8v-2zm0-8h5v2H8V9z"/></svg>';
  }
  return '';
}

export function createContactUi() {
  const root = document.getElementById('contact');
  const list = document.getElementById('contact-links');
  const intro = document.getElementById('contact-intro');
  const nameEl = document.getElementById('contact-name');
  const roleEl = document.getElementById('contact-role');
  const closeBtn = document.getElementById('contact-close');
  let open = false;
  let onClose = null;

  nameEl.textContent = CONTACT.name || 'Contact';
  roleEl.textContent = CONTACT.role || '';
  intro.textContent = CONTACT.intro || '';

  list.innerHTML = '';
  contactLinks().forEach(function (link) {
    if (link.missing) return;
    const a = document.createElement('a');
    a.className = 'contact-link' + (link.download ? ' is-cv' : '');
    a.innerHTML =
      '<span class="ico ico-' + link.icon + '">' + iconSvg(link.icon) + '</span>' +
      '<span class="txt">' + link.label + '</span>';
    a.href = link.href;
    if (link.external) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    if (link.download) a.setAttribute('download', '');
    list.appendChild(a);
  });

  function show() {
    open = true;
    root.hidden = false;
    document.body.classList.add('contact-open');
    if (document.exitPointerLock) document.exitPointerLock();
    closeBtn.focus();
  }

  function hide() {
    const wasOpen = open;
    open = false;
    root.hidden = true;
    document.body.classList.remove('contact-open');
    if (wasOpen && onClose) onClose();
  }

  closeBtn.addEventListener('click', function (event) {
    event.stopPropagation();
    hide();
  });

  root.addEventListener('click', function (event) {
    if (event.target === root) hide();
  });

  return {
    show: show,
    hide: hide,
    get open() { return open; },
    setOnClose: function (fn) { onClose = fn; }
  };
}
