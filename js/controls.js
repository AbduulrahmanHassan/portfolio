import * as THREE from 'three';
import { PLAYER } from './config.js';

// WASD / arrow movement, pointer-lock look, and a drag fallback when the
// browser will not lock the pointer. Collision is circular against the
// cabinets plus a box inset from the walls.
export function createControls(camera, canvas, colliders, bounds) {
  const yawPitch = { yaw: 0, pitch: 0, locked: false };
  const keys = Object.create(null);
  const velocity = new THREE.Vector3();
  const wish = new THREE.Vector3();
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  function setLook(yaw, pitch) {
    yawPitch.yaw = yaw;
    yawPitch.pitch = pitch;
    applyLook();
  }

  function applyLook() {
    yawPitch.pitch = Math.max(-1.15, Math.min(1.15, yawPitch.pitch));
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yawPitch.yaw;
    camera.rotation.x = yawPitch.pitch;
    camera.rotation.z = 0;
  }

  function tryLock() {
    if (!canvas.requestPointerLock) return;
    try {
      const pending = canvas.requestPointerLock();
      if (pending && pending.catch) pending.catch(function () {});
    } catch (err) { /* pointer lock is optional */ }
  }

  document.addEventListener('pointerlockchange', function () {
    yawPitch.locked = document.pointerLockElement === canvas;
  });

  window.addEventListener('keydown', function (event) {
    keys[event.code] = true;
    if (event.code.indexOf('Arrow') === 0 || event.code === 'Space') event.preventDefault();
  });
  window.addEventListener('keyup', function (event) {
    keys[event.code] = false;
  });

  document.addEventListener('mousemove', function (event) {
    if (!yawPitch.locked) return;
    yawPitch.yaw -= event.movementX * 0.0022;
    yawPitch.pitch -= event.movementY * 0.002;
    applyLook();
  });

  canvas.addEventListener('pointerdown', function (event) {
    if (event.button !== 0) return;
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });
  window.addEventListener('pointerup', function () { dragging = false; });
  window.addEventListener('pointermove', function (event) {
    if (!dragging || yawPitch.locked) return;
    yawPitch.yaw -= (event.clientX - lastX) * 0.0032;
    yawPitch.pitch -= (event.clientY - lastY) * 0.0026;
    lastX = event.clientX;
    lastY = event.clientY;
    applyLook();
  });

  function resolve(x, z) {
    x = Math.max(bounds.minX, Math.min(bounds.maxX, x));
    z = Math.max(bounds.minZ, Math.min(bounds.maxZ, z));
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < colliders.length; i++) {
        const blocker = colliders[i];
        const dx = x - blocker.x;
        const dz = z - blocker.z;
        const dist = Math.hypot(dx, dz) || 0.0001;
        const min = blocker.r + PLAYER.radius;
        if (dist < min) {
          const push = (min - dist) / dist;
          x += dx * push;
          z += dz * push;
        }
      }
      x = Math.max(bounds.minX, Math.min(bounds.maxX, x));
      z = Math.max(bounds.minZ, Math.min(bounds.maxZ, z));
    }
    return { x: x, z: z };
  }

  function update(dt) {
    const forward = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
    const strafe = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
    const sin = Math.sin(yawPitch.yaw);
    const cos = Math.cos(yawPitch.yaw);
    wish.set(
      -sin * forward + cos * strafe,
      0,
      -cos * forward - sin * strafe
    );
    if (wish.lengthSq() > 1) wish.normalize();
    wish.multiplyScalar(PLAYER.speed);
    const damp = 1 - Math.exp(-10 * dt);
    velocity.lerp(wish, damp);
    const next = resolve(
      camera.position.x + velocity.x * dt,
      camera.position.z + velocity.z * dt
    );
    camera.position.x = next.x;
    camera.position.z = next.z;
    camera.position.y = PLAYER.eye;
    applyLook();
  }

  return {
    update: update,
    setLook: setLook,
    tryLock: tryLock,
    get locked() { return yawPitch.locked; }
  };
}
