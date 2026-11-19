import * as THREE from 'three';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { SCREEN, vimeoSrc } from './config.js';

// Vimeo cannot be sampled as a WebGL video texture. Each cabinet keeps a cheap
// WebGL idle panel; the iframe only mounts while that machine is playing.
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

  function attach(machine, anchor, idleMesh) {
    screens.set(machine.id, {
      machine: machine,
      anchor: anchor,
      idleMesh: idleMesh,
      root: null,
      iframe: null,
      object: null
    });
  }

  function ensureLayer(screen) {
    if (screen.object) return screen;
    const root = document.createElement('div');
    root.className = 'cab-screen is-on';
    root.style.width = (SCREEN.width * SCREEN.pixelsPerMeter) + 'px';
    root.style.height = (SCREEN.height * SCREEN.pixelsPerMeter) + 'px';
    root.style.pointerEvents = 'auto';
    root.style.overflow = 'hidden';
    root.style.background = '#000';
    const iframe = document.createElement('iframe');
    iframe.title = screen.machine.title || 'Project video';
    iframe.setAttribute(
      'allow',
      'autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write'
    );
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.style.pointerEvents = 'auto';
    root.appendChild(iframe);
    const object = new CSS3DObject(root);
    object.scale.setScalar(1 / SCREEN.pixelsPerMeter);
    scene.add(object);
    screen.root = root;
    screen.iframe = iframe;
    screen.object = object;
    return screen;
  }

  function sync() {
    if (!active) return;
    const screen = screens.get(active.id);
    if (!screen || !screen.object) return;
    screen.anchor.updateWorldMatrix(true, false);
    screen.object.position.setFromMatrixPosition(screen.anchor.matrixWorld);
    screen.object.quaternion.setFromRotationMatrix(screen.anchor.matrixWorld);
  }

  function play(machine) {
    if (active && active.id !== machine.id) stop();
    const screen = screens.get(machine.id);
    if (!screen) return;
    ensureLayer(screen);
    if (screen.idleMesh) screen.idleMesh.visible = false;
    // Navigate inside the click turn so the browser allows autoplay.
    screen.iframe.src = vimeoSrc(machine, true);
    screen.iframe.style.pointerEvents = 'auto';
    active = machine;
    document.body.classList.add('playing');
    titleEl.textContent = machine.title || '';
    titleEl.hidden = !machine.title;
    exitEl.hidden = false;
    sync();
  }

  let onStop = null;

  function stop() {
    if (!active) return;
    const screen = screens.get(active.id);
    if (screen) {
      if (screen.iframe) {
        screen.iframe.src = 'about:blank';
        screen.iframe.style.pointerEvents = 'none';
      }
      if (screen.object) {
        scene.remove(screen.object);
        if (screen.root && screen.root.parentNode) screen.root.parentNode.removeChild(screen.root);
        screen.object = null;
        screen.root = null;
        screen.iframe = null;
      }
      if (screen.idleMesh) screen.idleMesh.visible = true;
    }
    active = null;
    document.body.classList.remove('playing');
    titleEl.hidden = true;
    exitEl.hidden = true;
    if (onStop) onStop();
  }

  exitEl.addEventListener('click', function (event) {
    event.stopPropagation();
    stop();
  });

  return {
    attach: attach,
    sync: sync,
    render: function (camera) {
      if (!active) return;
      renderer.render(scene, camera);
    },
    resize: function () { renderer.setSize(window.innerWidth, window.innerHeight); },
    play: play,
    stop: stop,
    setOnStop: function (fn) { onStop = fn; },
    get active() { return active; }
  };
}
