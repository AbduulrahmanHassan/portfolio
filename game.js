(function () {
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var hint = document.getElementById("hint");

  var TILE = 16;
  var COLS = 36;
  var ROWS = 26;
  var MAP_W = COLS * TILE;
  var MAP_H = ROWS * TILE;
  var FW = 48;
  var FH = 64;
  var SPEED = 52;

  var ROWS_ANIM = {
    down: { idle: 0, walk: 1 },
    up: { idle: 2, walk: 3 },
    right: { idle: 4, walk: 5 },
    left: { idle: 6, walk: 7 }
  };
  var VEC = {
    down: [0, 1],
    up: [0, -1],
    left: [-1, 0],
    right: [1, 0]
  };

  var GLYPH = {
    A: ["010", "101", "111", "101", "101"],
    B: ["110", "101", "110", "101", "110"],
    D: ["110", "101", "101", "101", "110"],
    E: ["111", "100", "110", "100", "111"],
    H: ["101", "101", "111", "101", "101"],
    L: ["100", "100", "100", "100", "111"],
    M: ["101", "111", "101", "101", "101"],
    N: ["101", "111", "101", "101", "101"],
    R: ["110", "101", "110", "101", "101"],
    S: ["011", "100", "010", "001", "110"]
  };

  var hero = new Image();
  var ready = false;
  hero.onload = function () { ready = true; };
  hero.src = "assets/hero.png";

  var player = { x: 18 * TILE, y: 15 * TILE, dir: "down" };
  var stack = [];
  var camX = 0;
  var camY = 0;
  var idleT = 0;
  var walkT = 0;
  var moving = false;
  var viewW = 320;
  var viewH = 180;
  var scale = 3;
  var dpr = 1;

  var solids = [];
  var actors = [];
  var ground = document.createElement("canvas");
  ground.width = MAP_W;
  ground.height = MAP_H;

  function hash(x, y) {
    var n = (x * 374761393 + y * 668265263) | 0;
    n = (n ^ (n >> 13)) | 0;
    n = Math.imul(n, 1274126177);
    return (n ^ (n >> 16)) >>> 0;
  }

  function paintText(g, text, x, y, color) {
    g.fillStyle = color;
    var cx = x;
    for (var i = 0; i < text.length; i++) {
      var rows = GLYPH[text[i]];
      if (!rows) { cx += 4; continue; }
      for (var ry = 0; ry < rows.length; ry++) {
        for (var rx = 0; rx < rows[ry].length; rx++) {
          if (rows[ry][rx] === "1") g.fillRect(cx + rx, y + ry, 1, 1);
        }
      }
      cx += 4;
    }
  }

  function drawGrass(g, x, y, tx, ty) {
    var h = hash(tx, ty);
    g.fillStyle = (h & 3) === 0 ? "#63a248" : "#74b356";
    g.fillRect(x, y, TILE, TILE);
    g.fillStyle = (h & 8) ? "#8bc86a" : "#5d9840";
    g.fillRect(x + (h % 10), y + ((h >> 4) % 10), 2, 2);
    if ((h & 32) === 0) {
      g.fillStyle = "#d8e38a";
      g.fillRect(x + (h % 12), y + ((h >> 6) % 11), 1, 2);
    }
  }

  function drawStone(g, x, y, tx, ty) {
    var h = hash(tx + 9, ty + 3);
    g.fillStyle = ((tx + ty) & 1) ? "#e4d8c4" : "#d9cdb6";
    g.fillRect(x, y, TILE, TILE);
    g.fillStyle = "#c4b59a";
    g.fillRect(x, y, TILE, 1);
    g.fillRect(x, y, 1, TILE);
    if ((h & 7) === 0) {
      g.fillStyle = "#b7a78c";
      g.fillRect(x + 4, y + 6, 3, 2);
    }
  }

  function drawTree(g, x, y) {
    g.fillStyle = "#6b4428";
    g.fillRect(x - 2, y - 14, 5, 14);
    g.fillStyle = "#245c32";
    g.beginPath();
    g.arc(x, y - 22, 14, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#3e8a48";
    g.beginPath();
    g.arc(x - 4, y - 26, 8, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#1c3d22";
    g.fillRect(x - 14, y - 24, 2, 2);
    g.fillRect(x + 8, y - 18, 2, 2);
    g.fillRect(x - 2, y - 34, 2, 2);
  }

  function drawSign(g, x, y) {
    g.fillStyle = "#6b4428";
    g.fillRect(x - 2, y - 28, 4, 28);
    g.fillStyle = "#e7d3a4";
    g.fillRect(x - 28, y - 46, 56, 20);
    g.fillStyle = "#2a2118";
    g.fillRect(x - 28, y - 46, 56, 1);
    g.fillRect(x - 28, y - 27, 56, 1);
    g.fillRect(x - 28, y - 46, 1, 20);
    g.fillRect(x + 27, y - 46, 1, 20);
    paintText(g, "ABDELRAHMAN", x - 22, y - 43, "#2a2118");
    paintText(g, "HASSAN", x - 12, y - 36, "#6b3a2a");
  }

  function drawBench(g, x, y) {
    g.fillStyle = "#8a5a32";
    g.fillRect(x - 14, y - 8, 28, 5);
    g.fillRect(x - 14, y - 14, 28, 3);
    g.fillStyle = "#5c3a22";
    g.fillRect(x - 12, y - 3, 3, 6);
    g.fillRect(x + 9, y - 3, 3, 6);
  }

  function buildWorld() {
    var g = ground.getContext("2d");
    g.imageSmoothingEnabled = false;
    var x, y;
    for (y = 0; y < ROWS; y++) {
      for (x = 0; x < COLS; x++) drawGrass(g, x * TILE, y * TILE, x, y);
    }
    for (y = 6; y < 20; y++) {
      for (x = 5; x < 31; x++) drawStone(g, x * TILE, y * TILE, x, y);
    }
    for (x = 8; x < 28; x++) drawStone(g, x * TILE, 20 * TILE, x, 20);
    // Flower dots along the grass edge.
    g.fillStyle = "#e07a8c";
    for (x = 4; x < 32; x += 2) {
      g.fillRect(x * TILE + 6, 5 * TILE + 8, 2, 2);
      g.fillRect(x * TILE + 8, 21 * TILE + 4, 2, 2);
    }
    g.fillStyle = "#f2d56b";
    for (y = 8; y < 18; y += 3) {
      g.fillRect(4 * TILE + 8, y * TILE + 4, 2, 2);
      g.fillRect(31 * TILE + 4, y * TILE + 6, 2, 2);
    }

    // Studio front across the north edge. The player can't walk through it.
    g.fillStyle = "#d7c4a4";
    g.fillRect(3 * TILE, 1 * TILE, 30 * TILE, 4 * TILE);
    g.fillStyle = "#8d5a3c";
    g.fillRect(3 * TILE, 1 * TILE, 30 * TILE, 6);
    g.fillStyle = "#f4efe2";
    for (x = 5; x < 31; x += 3) {
      g.fillRect(x * TILE, 2 * TILE + 4, 12, 10);
      g.fillStyle = "#9fd0e4";
      g.fillRect(x * TILE + 2, 2 * TILE + 6, 8, 6);
      g.fillStyle = "#f4efe2";
    }
    g.fillStyle = "#6b4428";
    g.fillRect(17 * TILE, 3 * TILE, 16, 2 * TILE);
    g.fillStyle = "#3d2a1c";
    g.fillRect(17 * TILE + 7, 3 * TILE + 8, 2, 2);

    solids.push({ x: 3 * TILE, y: 1 * TILE, w: 30 * TILE, h: 4 * TILE + 6 });
    solids.push({ x: 8, y: 8, w: MAP_W - 16, h: 8 });
    solids.push({ x: 8, y: MAP_H - 16, w: MAP_W - 16, h: 10 });
    solids.push({ x: 0, y: 0, w: 10, h: MAP_H });
    solids.push({ x: MAP_W - 10, y: 0, w: 10, h: MAP_H });

    function addTree(tx, ty) {
      var px = tx * TILE + 8;
      var py = ty * TILE + 12;
      solids.push({ x: px - 4, y: py - 6, w: 8, h: 8 });
      actors.push({
        y: py,
        draw: function (c) { drawTree(c, px, py); }
      });
    }
    addTree(7, 8);
    addTree(10, 17);
    addTree(27, 9);
    addTree(29, 16);
    addTree(14, 21);

    var signX = 12 * TILE;
    var signY = 12 * TILE;
    solids.push({ x: signX - 4, y: signY - 8, w: 8, h: 10 });
    actors.push({
      y: signY,
      draw: function (c) { drawSign(c, signX, signY); }
    });

    var benchX = 24 * TILE;
    var benchY = 14 * TILE;
    solids.push({ x: benchX - 14, y: benchY - 8, w: 28, h: 12 });
    actors.push({
      y: benchY,
      draw: function (c) { drawBench(c, benchX, benchY); }
    });
  }

  function blocked(px, py) {
    var box = { x: px - 7, y: py - 4, w: 14, h: 8 };
    for (var i = 0; i < solids.length; i++) {
      var s = solids[i];
      if (box.x < s.x + s.w && box.x + box.w > s.x && box.y < s.y + s.h && box.y + box.h > s.y) {
        return true;
      }
    }
    return false;
  }

  function press(dir) {
    if (stack.indexOf(dir) === -1) stack.push(dir);
    var btn = document.querySelector('#pad button[data-dir="' + dir + '"]');
    if (btn) btn.classList.add("held");
  }
  function release(dir) {
    var i = stack.indexOf(dir);
    if (i !== -1) stack.splice(i, 1);
    var btn = document.querySelector('#pad button[data-dir="' + dir + '"]');
    if (btn) btn.classList.remove("held");
  }

  var keyDir = {
    ArrowUp: "up", KeyW: "up",
    ArrowDown: "down", KeyS: "down",
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right"
  };
  document.addEventListener("keydown", function (e) {
    var dir = keyDir[e.code];
    if (!dir) return;
    e.preventDefault();
    if (!e.repeat) press(dir);
  });
  document.addEventListener("keyup", function (e) {
    var dir = keyDir[e.code];
    if (!dir) return;
    release(dir);
  });
  window.addEventListener("blur", function () {
    stack.slice().forEach(release);
  });

  var pad = document.getElementById("pad");
  pad.querySelectorAll("button").forEach(function (btn) {
    var dir = btn.getAttribute("data-dir");
    function down(e) {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      press(dir);
    }
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", function () { release(dir); });
    btn.addEventListener("pointercancel", function () { release(dir); });
  });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    scale = Math.max(2, Math.min(4, Math.round(window.innerHeight / 230)));
    viewW = canvas.width / (dpr * scale);
    viewH = canvas.height / (dpr * scale);
  }
  window.addEventListener("resize", resize);
  resize();

  function idleFrame(t) {
    var x = t % 3.4;
    if (x < 1.3) return 0;
    if (x < 2.3) return 1;
    if (x < 3.15) return 0;
    return 2;
  }

  function update(dt) {
    var dir = stack.length ? stack[stack.length - 1] : null;
    var beforeX = player.x;
    var beforeY = player.y;
    if (dir) {
      player.dir = dir;
      var v = VEC[dir];
      var step = SPEED * dt;
      var nx = player.x + v[0] * step;
      var ny = player.y + v[1] * step;
      if (!blocked(nx, player.y)) player.x = nx;
      if (!blocked(player.x, ny)) player.y = ny;
    }
    moving = player.x !== beforeX || player.y !== beforeY;
    if (moving) {
      walkT += dt;
      idleT = 0;
    } else {
      idleT += dt;
      walkT = 0;
    }
    var targetX = player.x - viewW / 2;
    var targetY = player.y - viewH / 2 - 10;
    camX += (targetX - camX) * Math.min(1, dt * 5);
    camY += (targetY - camY) * Math.min(1, dt * 5);
    var maxX = MAP_W - viewW;
    var maxY = MAP_H - viewH;
    camX = maxX > 0 ? Math.max(0, Math.min(maxX, camX)) : maxX / 2;
    camY = maxY > 0 ? Math.max(0, Math.min(maxY, camY)) : maxY / 2;
  }

  function drawHero(c) {
    var anim = ROWS_ANIM[player.dir];
    var row = moving ? anim.walk : anim.idle;
    var col = moving ? (Math.floor(walkT * 8) % 4) : idleFrame(idleT);
    var dx = Math.round(player.x - FW / 2);
    var dy = Math.round(player.y - FH + 3);
    c.fillStyle = "rgba(40, 50, 24, 0.28)";
    c.fillRect(Math.round(player.x) - 9, Math.round(player.y) - 2, 18, 4);
    c.drawImage(hero, col * FW, row * FH, FW, FH, dx, dy, FW, FH);
  }

  function draw() {
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#6eaa4e";
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.save();
    ctx.translate(-Math.round(camX), -Math.round(camY));
    ctx.drawImage(ground, 0, 0);
    var list = actors.slice();
    list.push({ y: player.y, draw: drawHero });
    list.sort(function (a, b) { return a.y - b.y; });
    for (var i = 0; i < list.length; i++) list[i].draw(ctx);
    ctx.restore();
  }

  buildWorld();
  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    if (ready) draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  var coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse) hint.innerHTML = "D-PAD TO WALK<br>UP · DOWN · LEFT · RIGHT";

  window.addEventListener("error", function (e) {
    var pre = document.createElement("pre");
    pre.id = "err";
    pre.textContent = e.message;
    document.body.appendChild(pre);
  });
})();
