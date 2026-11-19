import * as THREE from 'three';
import { CONTACT, contactLinks } from './contact.js';

function neonMat(hex, intensity) {
  const color = new THREE.Color(hex);
  return new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: intensity == null ? 2 : intensity,
    roughness: 0.4,
    metalness: 0.05
  });
}

function drawScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 384);
  g.addColorStop(0, '#1a1230');
  g.addColorStop(1, '#08060e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 384);
  ctx.strokeStyle = '#ff4ad8';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#ff4ad8';
  ctx.shadowBlur = 14;
  ctx.strokeRect(18, 18, 476, 348);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff4ad8';
  ctx.font = '800 36px Orbitron, Montserrat, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CONTACT HUB', 256, 120);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '600 22px Montserrat, Arial, sans-serif';
  ctx.fillText('CLICK TO OPEN', 256, 190);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '500 16px Montserrat, Arial, sans-serif';
  ctx.fillText(CONTACT.name || 'Portfolio', 256, 250);
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

export function buildContactHub(scene) {
  const group = new THREE.Group();
  // Larger kiosk, easier to find from the entrance.
  group.position.set(1.55, 0, -2.35);
  group.rotation.y = -0.42;

  const body = new THREE.MeshStandardMaterial({ color: 0x14141c, roughness: 0.7, metalness: 0.25 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0a0a10, roughness: 0.85, metalness: 0.1 });
  const neon = neonMat('#ff4ad8', 2.2);
  const targets = [];

  function solid(w, h, d, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.userData.hub = true;
    group.add(mesh);
    targets.push(mesh);
    return mesh;
  }

  solid(0.95, 1.35, 0.5, body, 0, 0.7, 0);
  solid(1.02, 0.1, 0.56, body, 0, 1.42, 0.02);
  solid(0.1, 0.95, 0.1, neon, -0.44, 0.85, 0.22);
  solid(0.1, 0.95, 0.1, neon, 0.44, 0.85, 0.22);
  solid(0.92, 0.05, 0.05, neon, 0, 1.5, 0.24);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.58),
    new THREE.MeshBasicMaterial({ map: drawScreen() })
  );
  screen.position.set(0, 0.95, 0.26);
  screen.userData.hub = true;
  group.add(screen);
  targets.push(screen);

  solid(0.86, 0.66, 0.05, dark, 0, 0.95, 0.23);
  solid(1.05, 0.1, 0.58, body, 0, 0.05, 0);

  scene.add(group);

  return {
    group: group,
    targets: targets,
    neon: neon,
    collider: { x: 1.55, z: -2.35, r: 0.65 },
    setHover: function (on) {
      neon.emissiveIntensity = on ? 3.5 : 2.2;
    }
  };
}

function iconSvg(kind) {
  const common = 'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  if (kind === 'in') return '<svg ' + common + '><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-4.5a2.5 2.5 0 0 1 5 0V17"/></svg>';
  if (kind === 'phone') return '<svg ' + common + '><path d="M6 3h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z"/></svg>';
  if (kind === 'wa') return '<svg ' + common + '><path d="M20 11.5A8.5 8.5 0 0 1 7 18L4 20l2-3a8.5 8.5 0 1 1 14-5.5z"/><path d="M9.5 10c.5 2 2.5 4 4.5 4.5l1.5-1.5 2 .5-.5 2A7 7 0 0 1 8 9.5l2-.5z"/></svg>';
  if (kind === 'mail') return '<svg ' + common + '><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg>';
  if (kind === 'gh') return '<svg ' + common + '><path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.5a3 3 0 0 0-.3-1.8c2.4-.3 5-1.2 5-5.4a4 4 0 0 0-1-2.8 3.8 3.8 0 0 0-.1-2.8s-1.2-.4-3.9 1.3a12 12 0 0 0-7 0C4.6 3.5 3.4 3.9 3.4 3.9a3.8 3.8 0 0 0-.1 2.8 4 4 0 0 0-1 2.8c0 4.2 2.6 5.1 5 5.4a3 3 0 0 0-.3 1.8V21"/></svg>';
  if (kind === 'art') return '<svg ' + common + '><circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/></svg>';
  if (kind === 'cv') return '<svg ' + common + '><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>';
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
    const a = document.createElement(link.missing ? 'div' : 'a');
    a.className = 'contact-link' + (link.download ? ' is-cv' : '') + (link.missing ? ' is-missing' : '');
    a.innerHTML = '<span class="ico">' + iconSvg(link.icon) + '</span><span class="txt">' + link.label + '</span>';
    if (!link.missing) {
      a.href = link.href;
      if (link.external) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      if (link.download) a.setAttribute('download', '');
    }
    list.appendChild(a);
  });

  function show() {
    open = true;
    root.hidden = false;
    document.body.classList.add('contact-open');
    if (document.exitPointerLock) document.exitPointerLock();
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
