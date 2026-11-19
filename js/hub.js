import * as THREE from 'three';
import { ROOM } from './config.js';
import { CONTACT, contactLinks } from './contact.js';

function drawWallScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 1536, 0);
  g.addColorStop(0, '#1a1028');
  g.addColorStop(0.5, '#2a1848');
  g.addColorStop(1, '#1a1028');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1536, 384);

  ctx.strokeStyle = '#ff4ad8';
  ctx.lineWidth = 10;
  ctx.shadowColor = '#ff4ad8';
  ctx.shadowBlur = 16;
  ctx.strokeRect(18, 18, 1500, 348);

  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ff4ad8';
  ctx.font = '800 72px Orbitron, Montserrat, Arial, sans-serif';
  ctx.fillText('CONTACT', 64, 130);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 40px Montserrat, Arial, sans-serif';
  ctx.fillText(CONTACT.name || 'Abdelrahman Hassan', 64, 200);

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '600 26px Montserrat, Arial, sans-serif';
  ctx.fillText(CONTACT.role || '', 64, 250);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#3ad7ff';
  ctx.font = '700 48px Montserrat, Arial, sans-serif';
  ctx.fillText('CLICK TO OPEN', 1472, 160);

  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '500 24px Montserrat, Arial, sans-serif';
  ctx.fillText('LinkedIn · Phone · WhatsApp · Email · GitHub · Behance', 1472, 230);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

// Large contact billboard on the back wall — visible from the entrance.
export function buildContactHub(scene) {
  const group = new THREE.Group();
  const halfD = ROOM.depth / 2;
  // Wide screen just above cabinet tops so the full wall width reads from the entrance.
  group.position.set(0, 2.28, -halfD + 0.14);

  const neon = new THREE.MeshBasicMaterial({ color: 0xff4ad8 });
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x121018 });
  const targets = [];

  function solid(w, h, d, material, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.userData.hub = true;
    group.add(mesh);
    targets.push(mesh);
    return mesh;
  }

  // Near wall-width monitor (~7.6 × 0.9 m).
  const sw = 7.6;
  const sh = 0.9;
  solid(sw, sh, 0.07, frameMat, 0, 0, 0);
  solid(sw + 0.12, 0.07, 0.08, neon, 0, sh / 2 + 0.02, 0.02);
  solid(sw + 0.12, 0.07, 0.08, neon, 0, -sh / 2 - 0.02, 0.02);
  solid(0.07, sh + 0.14, 0.08, neon, -sw / 2 - 0.02, 0, 0.02);
  solid(0.07, sh + 0.14, 0.08, neon, sw / 2 + 0.02, 0, 0.02);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(sw - 0.22, sh - 0.18),
    new THREE.MeshBasicMaterial({ map: drawWallScreen() })
  );
  screen.position.set(0, 0, 0.045);
  screen.userData.hub = true;
  group.add(screen);
  targets.push(screen);

  scene.add(group);

  return {
    group: group,
    targets: targets,
    neon: neon,
    collider: { x: 0, z: -halfD + 0.55, r: 0.45 },
    setHover: function (on) {
      neon.color.set(on ? 0xffffff : 0xff4ad8);
    }
  };
}

function iconSvg(kind) {
  const common = 'width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
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
    if (link.missing) return;
    const a = document.createElement('a');
    a.className = 'contact-link' + (link.download ? ' is-cv' : '');
    a.innerHTML = '<span class="ico">' + iconSvg(link.icon) + '</span><span class="txt">' + link.label + '</span>';
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
