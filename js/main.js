import * as THREE from 'three';
import { START } from './config.js';
import { buildRoom } from './room.js';
import { buildMachines } from './machines.js';
import { createPlayback } from './video.js';
import { createControls } from './controls.js';

const stage = document.getElementById('stage');
const cssMount = document.getElementById('css');
const prompt = document.getElementById('prompt');
const welcome = document.getElementById('welcome');
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = false;
renderer.domElement.id = 'c';
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 28);
camera.position.set(START.position[0], START.position[1], START.position[2]);

const playback = createPlayback(cssMount);
const room = buildRoom(scene);
const machines = buildMachines(scene);
machines.list.forEach(function (cabinet) {
  playback.attach(cabinet.spec, cabinet.anchor, cabinet.idle);
});

const colliders = room.colliders.concat(machines.colliders);
const controls = createControls(camera, renderer.domElement, colliders, room.bounds);

const dx = START.lookAt[0] - START.position[0];
const dy = START.lookAt[1] - START.position[1];
const dz = START.lookAt[2] - START.position[2];
controls.setLook(Math.atan2(-dx, -dz), Math.atan2(dy, Math.hypot(dx, dz)));

let started = false;
let last = performance.now();
let hovered = null;

function pick(clientX, clientY) {
  if (!started || playback.active) return null;
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
  const hits = raycaster.intersectObjects(machines.targets, false);
  if (!hits.length) return null;
  return hits[0].object.userData.machine || null;
}

function setHover(machine) {
  hovered = machine;
  prompt.hidden = !(machine && !playback.active);
}

renderer.domElement.addEventListener('pointerdown', function (event) {
  if (!started || event.button !== 0 || playback.active) return;
  const machine = pick(event.clientX, event.clientY);
  if (machine) {
    playback.play(machine);
    setHover(null);
    return;
  }
  controls.tryLock();
});

renderer.domElement.addEventListener('pointermove', function (event) {
  if (!started || controls.locked || playback.active) return;
  setHover(pick(event.clientX, event.clientY));
});

document.getElementById('enter').addEventListener('click', function () {
  welcome.classList.add('hide');
  document.body.classList.add('started');
  started = true;
  controls.tryLock();
});

window.addEventListener('keydown', function (event) {
  if (event.code === 'Escape' && playback.active) playback.stop();
});

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  playback.resize();
});

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (started) controls.update(dt);
  if (playback.active) prompt.hidden = true;
  else if (started && controls.locked) setHover(pick(null, null));
  machines.updateHover(hovered && !playback.active ? hovered.id : null, dt);
  playback.sync();
  playback.render(camera);
  renderer.render(scene, camera);
}

frame(last);
window.__arcadeReady = true;
