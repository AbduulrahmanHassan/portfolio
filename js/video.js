import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { SCREEN, vimeoSrc } from './config.js';

// Vimeo cannot be sampled as a WebGL video texture. Each cabinet screen is a
// DOM iframe posed with CSS3D so it stays on the glass as the camera moves.
export function createPlayback(cssMount) {
  const renderer = new CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  const dom = renderer.domElement;
  dom.style.position = 'absolute';
  dom.style.inset = '0';
  dom.style.pointerEvents = 'none';
  cssMount.appendChild(dom);

  const scene = new THREE.Scene();
  const screens = new Map();
  let active = null;
  const titleEl = document.getElementById('now-title');
  const exitEl = document.getElementById('exit');

  function attach(machine, anchor) {
    const root = document.createElement('div');
    root.className = 'cab-screen';
    root.style.width = (SCREEN.width * SCREEN.pixelsPerMeter) + 'px';
    root.style.height = (SCREEN.height * SCREEN.pixelsPerMeter) + 'px';
    root.style.pointerEvents = 'none';
    root.innerHTML = '<div class="idle" aria-hidden="true"><span class="tri"></span></div>'
      + '<iframe title="Project video" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
    const iframe = root.querySelector('iframe');
    iframe.style.pointerEvents = 'none';
    const object = new CSS3DObject(root);
    root.style.pointerEvents = 'none';
    object.scale.setScalar(1 / SCREEN.pixelsPerMeter);
    scene.add(object);
    screens.set(machine.id, {
      machine: machine,
      anchor: anchor,
      root: root,
      iframe: iframe,
      object: object
    });
  }

  function sync() {
    screens.forEach(function (screen) {
      screen.anchor.updateWorldMatrix(true, false);
      screen.object.position.setFromMatrixPosition(screen.anchor.matrixWorld);
      screen.object.quaternion.setFromRotationMatrix(screen.anchor.matrixWorld);
    });
  }

  function play(machine) {
    if (active && active.id !== machine.id) stop();
    const screen = screens.get(machine.id);
    if (!screen) return;
    // Navigate the iframe inside the click turn so the browser allows autoplay.
    screen.iframe.src = vimeoSrc(machine.vimeoId, true);
    screen.root.classList.add('is-on');
    screen.iframe.style.pointerEvents = 'auto';
    active = machine;
    document.body.classList.add('playing');
    if (document.exitPointerLock) document.exitPointerLock();
    titleEl.textContent = machine.title || '';
    titleEl.hidden = !machine.title;
    exitEl.hidden = false;
  }

  function stop() {
    if (!active) return;
    const screen = screens.get(active.id);
    if (screen) {
      screen.iframe.src = 'about:blank';
      screen.root.classList.remove('is-on');
      screen.iframe.style.pointerEvents = 'none';
    }
    active = null;
    document.body.classList.remove('playing');
    titleEl.hidden = true;
    exitEl.hidden = true;
  }

  exitEl.addEventListener('click', function (event) {
    event.stopPropagation();
    stop();
  });

  return {
    attach: attach,
    sync: sync,
    render: function (camera) { renderer.render(scene, camera); },
    resize: function () { renderer.setSize(window.innerWidth, window.innerHeight); },
    play: play,
    stop: stop,
    get active() { return active; }
  };
}
