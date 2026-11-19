import * as THREE from 'three';
import { START } from './config.js';
import { buildRoom } from './room.js';
import { buildMachines } from './machines.js';
import { createPlayback } from './video.js';
import { createControls } from './controls.js';
import { buildContactHub, createContactUi } from './hub.js';

const stage = document.getElementById('stage');
const cssMount = document.getElementById('css');
const prompt = document.getElementById('prompt');
const welcome = document.getElementById('welcome');
const loader = document.getElementById('loader');
const loaderMsg = document.getElementById('loader-msg');
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const maxDpr = Math.min(1.5, window.devicePixelRatio || 1);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(maxDpr);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x07060c, 1);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'c';
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.15, 28);
camera.position.set(START.position[0], START.position[1], START.position[2]);

const playback = createPlayback(cssMount);
const contactUi = createContactUi();

let machines = null;
let hub = null;
let controls = null;
let started = false;
let last = performance.now();
let hovered = null;
let hubHover = false;
let ready = false;

function setLoader(msg) {
  if (loaderMsg) loaderMsg.textContent = msg;
}

function finishLoader() {
  if (!loader) return;
  loader.classList.add('hide');
  setTimeout(function () {
    if (loader.parentNode) loader.parentNode.removeChild(loader);
  }, 500);
}

function boot() {
  setLoader('Building arcade…');
  const room = buildRoom(scene);
  setLoader('Placing machines…');
  machines = buildMachines(scene);
  machines.list.forEach(function (cabinet) {
    playback.attach(cabinet.spec, cabinet.anchor, cabinet.idle);
  });
  setLoader('Opening contact hub…');
  hub = buildContactHub(scene);
  const colliders = room.colliders.concat(machines.colliders, [hub.collider]);
  controls = createControls(camera, renderer.domElement, colliders, room.bounds);
  const dx = START.lookAt[0] - START.position[0];
  const dy = START.lookAt[1] - START.position[1];
  const dz = START.lookAt[2] - START.position[2];
  controls.setLook(Math.atan2(-dx, -dz), Math.atan2(dy, Math.hypot(dx, dz)));
  contactUi.setOnClose(function () {
    // Return focus to the room after closing the hub.
  });
  ready = true;
  window.__arcadeReady = true;
  finishLoader();
}

const fontReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
setLoader('Loading fonts…');
fontReady.then(boot).catch(boot);

function pick(clientX, clientY) {
  if (!ready || !started || playback.active || contactUi.open) return null;
  if (controls.locked) {
    pointer.set(0, 0);
  } else if (clientX == null) {
    return null;
  } else {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  }
  camera.updateMatrixWorld();
  raycaster.setFromCamera(pointer, camera);

  const hubHits = raycaster.intersectObjects(hub.targets, false);
  if (hubHits.length) return { type: 'hub' };

  const hits = raycaster.intersectObjects(machines.targets, false);
  if (!hits.length) return null;
  return { type: 'machine', machine: hits[0].object.userData.machine || null };
}

function setHover(result) {
  const machine = result && result.type === 'machine' ? result.machine : null;
  const onHub = !!(result && result.type === 'hub');
  hovered = machine;
  hubHover = onHub;
  hub.setHover(onHub);
  if (onHub) {
    prompt.hidden = false;
    prompt.textContent = 'CLICK · OPEN CONTACT';
  } else if (machine && !playback.active) {
    prompt.hidden = false;
    prompt.textContent = 'CLICK · PLAY  ' + String(machine.title).toUpperCase();
  } else {
    prompt.hidden = true;
  }
}

renderer.domElement.addEventListener('pointerdown', function (event) {
  if (!ready || !started || event.button !== 0 || playback.active || contactUi.open) return;
  const result = pick(event.clientX, event.clientY);
  if (result && result.type === 'hub') {
    contactUi.show();
    setHover(null);
    return;
  }
  if (result && result.type === 'machine' && result.machine) {
    playback.play(result.machine);
    setHover(null);
    return;
  }
  controls.tryLock();
});

renderer.domElement.addEventListener('pointermove', function (event) {
  if (!ready || !started || controls.locked || playback.active || contactUi.open) return;
  setHover(pick(event.clientX, event.clientY));
});

document.getElementById('enter').addEventListener('click', function () {
  if (!ready) return;
  welcome.classList.add('hide');
  document.body.classList.add('started');
  started = true;
  controls.tryLock();
});

window.addEventListener('keydown', function (event) {
  if (event.code !== 'Escape') return;
  if (contactUi.open) {
    contactUi.hide();
    return;
  }
  if (playback.active) playback.stop();
});

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(maxDpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  playback.resize();
});

let hoverTick = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!ready) {
    renderer.render(scene, camera);
    return;
  }
  if (started && !contactUi.open) controls.update(dt);
  if (playback.active || contactUi.open) prompt.hidden = true;
  else if (started && controls.locked) {
    hoverTick += dt;
    if (hoverTick > 0.08) {
      hoverTick = 0;
      setHover(pick(null, null));
    }
  }
  machines.updateHover(hovered && !playback.active && !contactUi.open ? hovered.id : null, dt);
  if (!hubHover && !contactUi.open) hub.setHover(false);
  playback.sync();
  playback.render(camera);
  renderer.render(scene, camera);
}

frame(last);
