/* Toolnes coloring page engine */

var TAU = Math.PI * 2;
function hashSeed(str, n) {
  var h = 2166136261 >>> 0;
  for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= n >>> 0; h = Math.imul(h ^ (h >>> 13), 0x5bd1e995); h ^= h >>> 15;
  return h >>> 0;
}
function makeRng(seed) {
  var a = seed >>> 0;
  var f = function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.range = function (lo, hi) { return lo + f() * (hi - lo); };
  f.int = function (lo, hi) { return lo + Math.floor(f() * (hi - lo + 1)); };
  f.pick = function (arr) { return arr[Math.floor(f() * arr.length)]; };
  f.chance = function (p) { return f() < p; };
  return f;
}
function makeHelpers(c) {
  return {
    line: function (x1, y1, x2, y2) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); },
    circle: function (x, y, r, fill) {
      c.beginPath(); c.arc(x, y, r, 0, TAU);
      if (fill) { c.fillStyle = fill === 'k' ? '#000' : '#fff'; c.fill(); }
      c.stroke();
    },
    dot: function (x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = '#000'; c.fill(); },
    ell: function (x, y, rx, ry, rot, fill) {
      c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
      if (fill) { c.fillStyle = fill === 'k' ? '#000' : '#fff'; c.fill(); }
      c.stroke();
    },
    path: function (fn, fill, close) {
      c.beginPath(); fn(); if (close) c.closePath();
      if (fill) { c.fillStyle = '#fff'; c.fill(); }
      c.stroke();
    },
    arc: function (x, y, r, a0, a1) { c.beginPath(); c.arc(x, y, r, a0, a1); c.stroke(); }
  };
}
function bez(p0, p1, p2, p3, t) {
  var u = 1 - t;
  return [u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
          u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]];
}
function pol(cx, cy, r, a) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }

function petalRing(c, h, cx, cy, r0, r1, n, spread, off, veins) {
  for (var i = 0; i < n; i++) {
    var a = off + TAU * i / n;
    var b = pol(cx, cy, r0, a), t = pol(cx, cy, r1, a);
    var l1 = pol(cx, cy, r0 + (r1 - r0) * 0.3, a - spread), l2 = pol(cx, cy, r0 + (r1 - r0) * 0.85, a - spread * 0.55);
    var q1 = pol(cx, cy, r0 + (r1 - r0) * 0.3, a + spread), q2 = pol(cx, cy, r0 + (r1 - r0) * 0.85, a + spread * 0.55);
    h.path(function () { c.moveTo(b[0], b[1]); c.bezierCurveTo(l1[0], l1[1], l2[0], l2[1], t[0], t[1]); c.bezierCurveTo(q2[0], q2[1], q1[0], q1[1], b[0], b[1]); }, true, false);
    if (veins) { var v0 = pol(cx, cy, r0 + (r1 - r0) * 0.2, a), v1 = pol(cx, cy, r0 + (r1 - r0) * 0.75, a); h.line(v0[0], v0[1], v1[0], v1[1]); }
  }
}
function starPoly(c, h, cx, cy, rad, n, k, off) {
  h.path(function () {
    var i = 0, p = pol(cx, cy, rad, off); c.moveTo(p[0], p[1]);
    for (var s = 0; s < n; s++) { i = (i + k) % n; p = pol(cx, cy, rad, off + TAU * i / n); c.lineTo(p[0], p[1]); }
  }, false, true);
}
function eyOf(rx, ry, dx) { var q = 1 - (dx / rx) * (dx / rx); return ry * Math.sqrt(q < 0 ? 0 : q); }

function butterfly(c, r, h) {
  var uw = r.range(.85, 1.15), uh = r.range(.85, 1.12), lw = r.range(.8, 1.15), lh = r.range(.8, 1.15);
  var upper = function (k) {
    c.moveTo(0, -12 * k);
    c.bezierCurveTo(30*uw*k, -300*uh*k, 380*uw*k, -430*uh*k, 440*uw*k, -290*uh*k);
    c.bezierCurveTo(480*uw*k, -170*uh*k, 330*uw*k, -50*uh*k, 0, -2 * k);
  };
  var lower = function (k) {
    c.moveTo(0, 4 * k);
    c.bezierCurveTo(260*lw*k, -40*lh*k, 420*lw*k, 70*lh*k, 340*lw*k, 210*lh*k);
    c.bezierCurveTo(280*lw*k, 320*lh*k, 80*lw*k, 300*lh*k, 0, 60 * k);
  };
  var nest = r.int(2, 4), dn = r.int(7, 11), style = r.int(0, 2), L = [.8, .62, .46, .32];
  var U = [[0,-12],[30*uw,-300*uh],[380*uw,-430*uh],[440*uw,-290*uh]].map(function (p) { return [p[0]*.9, p[1]*.9]; });
  var Lw = [[0,4],[260*lw,-40*lh],[420*lw,70*lh],[340*lw,210*lh]].map(function (p) { return [p[0]*.9, p[1]*.9]; });
  var dr = r.range(7, 12);
  c.save(); c.translate(500, 470);
  [1, -1].forEach(function (sx) {
    c.save(); c.scale(sx, 1);
    h.path(function () { upper(1); }, true, true);
    h.path(function () { lower(1); }, true, true);
    for (var i = 0; i < nest; i++) {
      (function (k) { h.path(function () { upper(k); }, false, true); h.path(function () { lower(k); }, false, true); })(L[i]);
    }
    for (var d = 1; d <= dn; d++) {
      var t = d / (dn + 1), p = bez(U[0], U[1], U[2], U[3], t), q = bez(Lw[0], Lw[1], Lw[2], Lw[3], t);
      h.circle(p[0], p[1], dr); h.circle(q[0], q[1], dr * .9);
    }
    var ux = 230*uw, uy = -205*uh, lx = 190*lw, ly = 130*lh;
    if (style === 0) { h.circle(ux, uy, 46); h.circle(ux, uy, 26); h.dot(ux, uy, 9); h.circle(lx, ly, 36); h.dot(lx, ly, 10); }
    else if (style === 1) { for (var s = 0; s < 6; s++) { var a = TAU*s/6; h.circle(ux+Math.cos(a)*38, uy+Math.sin(a)*38, 13); } h.dot(ux, uy, 13); h.circle(lx, ly, 30); h.circle(lx, ly, 14); }
    else { h.circle(ux, uy, 40); h.circle(lx, ly, 32); for (var z = 0; z < 5; z++) { h.dot(ux - 60 + z*30, uy + 90, 6); } }
    c.restore();
  });
  h.ell(0, -10, 22, 165, 0, true); h.circle(0, -192, 30, true);
  for (var y = -90; y <= 100; y += 38) h.line(-19, y, 19, y);
  [1, -1].forEach(function (sx) {
    h.path(function () { c.moveTo(sx*10, -215); c.quadraticCurveTo(sx*60, -300, sx*115, -330); }, false, false);
    h.circle(sx*115, -332, 10, 'k');
  });
  c.restore();
}

function fish(c, r, h) {
  var cx = 520, cy = 500, rx = r.range(240, 290), ry = r.range(140, 195);
  var tx = cx - rx + 15, tl = r.range(150, 185), pat = r.int(0, 2);
  h.path(function () {
    c.moveTo(tx, cy);
    c.bezierCurveTo(tx-60, cy-40, tx-110, cy-120, tx-tl, cy-140);
    c.quadraticCurveTo(tx-90, cy, tx-tl, cy+140);
    c.bezierCurveTo(tx-110, cy+120, tx-60, cy+40, tx, cy);
  }, true, true);
  h.line(tx-10, cy, tx-tl+30, cy-95); h.line(tx-10, cy, tx-100, cy); h.line(tx-10, cy, tx-tl+30, cy+95);
  var fh = r.range(90, 130);
  var d0 = -rx*.4, d1 = rx*.3;
  h.path(function () { c.moveTo(cx+d0, cy-eyOf(rx,ry,d0)); c.bezierCurveTo(cx+d0+20, cy-ry-fh, cx+d1-40, cy-ry-fh, cx+d1, cy-eyOf(rx,ry,d1)); }, true, false);
  for (var f = 1; f <= 3; f++) { var xx = d0 + (d1 - d0) * f / 4; h.line(cx+xx, cy-eyOf(rx,ry,xx), cx+xx, cy-eyOf(rx,ry,xx)-fh*.7); }
  h.path(function () { c.moveTo(cx+d0*.4, cy+eyOf(rx,ry,d0*.4)); c.quadraticCurveTo(cx+d0*.4-10, cy+ry+90, cx+d0*.4-70, cy+ry+90); c.quadraticCurveTo(cx+d0*.4+10, cy+ry+40, cx+rx*.2, cy+eyOf(rx,ry,rx*.2)); }, true, false);
  h.ell(cx, cy, rx, ry, 0, true);
  var gx = cx + rx*.42;
  if (pat === 0) {
    for (var row = 0, y = cy-ry+36; y < cy+ry-30; y += 40, row++) {
      for (var x = tx+40 + (row%2)*20; x < gx-40; x += 40) {
        var q = ((x-cx)/rx)*((x-cx)/rx) + ((y-cy)/ry)*((y-cy)/ry);
        if (q < .78) h.arc(x, y, 20, Math.PI*.5, Math.PI*1.5);
      }
    }
  } else if (pat === 1) {
    var ns = r.int(4, 6);
    for (var k = 0; k < ns; k++) { var sx = -rx*.6 + k*((gx-cx+rx*.5)/ns); var e = eyOf(rx,ry,sx)-10; h.path(function () { c.moveTo(cx+sx, cy-e); c.quadraticCurveTo(cx+sx+45, cy, cx+sx, cy+e); }, false, false); }
  } else {
    var placed = [];
    for (var m = 0; m < 90 && placed.length < 14; m++) {
      var px = cx + r.range(-rx*.65, rx*.15), py = cy + r.range(-ry*.65, ry*.65), rr = r.range(10, 22), ok = true;
      if (Math.sqrt((px-cx-rx*.05)*(px-cx-rx*.05) + (py-cy-ry*.35)*(py-cy-ry*.35)) < 95) ok = false;
      for (var q = 0; ok && q < placed.length; q++) { var ddx = placed[q][0]-px, ddy = placed[q][1]-py; if (Math.sqrt(ddx*ddx+ddy*ddy) < placed[q][2]+rr+14) ok = false; }
      if (ok) { placed.push([px, py, rr]); h.circle(px, py, rr); }
    }
  }
  h.arc(cx+rx*.5, cy, ry*.8, Math.PI-.9, Math.PI+.9);
  h.circle(cx+rx*.66, cy-ry*.2, 27, true); h.dot(cx+rx*.68, cy-ry*.2, 13); h.circle(cx+rx*.7, cy-ry*.25, 4, 'w');
  h.path(function () { c.moveTo(cx+rx-6, cy+12); c.quadraticCurveTo(cx+rx-30, cy+28, cx+rx-55, cy+16); }, false, false);
  h.ell(cx+rx*.05, cy+ry*.35, 70, 26, -.55, true);
  var nb = r.int(3, 6);
  for (var b = 0; b < nb; b++) h.circle(cx + rx + r.range(30, 110), r.range(180, 470), r.range(10, 28));
  if (r.chance(.8)) {
    var sw = r.int(2, 3);
    for (var s2 = 0; s2 < sw; s2++) {
      var bx = r.range(120, 880), hh = r.range(130, 200);
      h.path(function () { c.moveTo(bx, 990); c.bezierCurveTo(bx-45, 990-hh*.35, bx+45, 990-hh*.7, bx, 990-hh); }, false, false);
      h.path(function () { c.moveTo(bx+22, 990); c.bezierCurveTo(bx-23, 990-hh*.3, bx+67, 990-hh*.6, bx+22, 990-hh*.85); }, false, false);
    }
  }
}

function owl(c, r, h) {
  var bx = 500, by = 560, rx = 240, ry = 320, ER = r.range(68, 92);
  [1, -1].forEach(function (sx) {
    var d0 = -160, d1 = -70, tipX = r.range(285, 330), tipY = r.range(165, 205);
    var p0 = [500 + sx*d0, by - eyOf(rx,ry,d0)], p1 = [500 + sx*d1, by - eyOf(rx,ry,d1)];
    h.path(function () { c.moveTo(p0[0], p0[1]); c.lineTo(sx>0 ? tipX : 1000-tipX, tipY); c.lineTo(p1[0], p1[1]); }, true, false);
  });
  h.ell(bx, by, rx, ry, 0, true);
  [[392, 420], [608, 420]].forEach(function (e) {
    h.circle(e[0], e[1], ER+16); h.circle(e[0], e[1], ER, true); h.circle(e[0], e[1], ER*.55); h.dot(e[0]+6, e[1]+4, ER*.28); h.circle(e[0]+16, e[1]-8, 7, 'w');
  });
  h.path(function () { c.moveTo(470, 478); c.lineTo(530, 478); c.lineTo(500, 540); }, true, true);
  var rows = r.int(3, 5);
  for (var k = 0; k < rows; k++) {
    var y = 600 + k * 50;
    for (var x = 380 + (k % 2) * 24; x <= 620; x += 48) { if (Math.abs(x-500) < eyOf(rx,ry,y-by)-20) h.arc(x, y, 24, 0, Math.PI); }
  }
  [1, -1].forEach(function (sx) {
    var X = function (x) { return sx > 0 ? 1000 - x : x; };
    h.path(function () { c.moveTo(X(300), 500); c.bezierCurveTo(X(235), 590, X(250), 730, X(335), 810); c.bezierCurveTo(X(360), 720, X(350), 600, X(300), 500); }, false, true);
    for (var f = 0; f < 3; f++) h.line(X(305 - f*8), 560 + f*55, X(335 - f*5), 640 + f*50);
    var fx = 500 + sx * -80;
    h.line(fx, 880, fx - 22, 928); h.line(fx, 880, fx + 4, 934); h.line(fx, 880, fx + 28, 926);
  });
  h.path(function () { c.moveTo(120, 940); c.quadraticCurveTo(500, 915, 880, 940); }, false, false);
  h.path(function () { c.moveTo(120, 978); c.quadraticCurveTo(500, 953, 880, 978); }, false, false);
  h.arc(120, 959, 19, Math.PI*.5, Math.PI*1.5); h.arc(880, 959, 19, -Math.PI*.5, Math.PI*.5);
  var ns = r.int(3, 5);
  for (var s = 0; s < ns; s++) {
    var sx2 = r.chance(.5) ? r.range(70, 190) : r.range(810, 930), sy = r.range(90, 800), sr = r.range(22, 38);
    starPoly(c, h, sx2, sy, sr, 5, 2, -Math.PI/2);
  }
  if (r.chance(.6)) { h.arc(860, 160, 60, Math.PI*.55, Math.PI*1.55); h.arc(885, 160, 48, Math.PI*.6, Math.PI*1.4); }
}

function turtle(c, r, h) {
  var cx = 500, cy = 540, R = 230, sy = 1.17;
  [[310, 350, 85, 38, -.8], [690, 350, 85, 38, .8], [330, 745, 75, 34, .7], [670, 745, 75, 34, -.7]].forEach(function (f) {
    h.ell(f[0], f[1], f[2], f[3], f[4], true);
    var dx = Math.cos(f[4]) * (f[0] < 500 ? -1 : 1) * (f[2] - 18);
    for (var i = -1; i <= 1; i++) h.dot(f[0] + dx + i*8, f[1] + Math.sin(f[4]) * (f[0] < 500 ? -1 : 1) * (f[2] - 18) + i*12, 4);
  });
  h.path(function () { c.moveTo(468, 800); c.lineTo(500, 885); c.lineTo(532, 800); }, true, true);
  h.circle(500, 212, 66, true);
  h.dot(475, 198, 8); h.dot(525, 198, 8);
  h.path(function () { c.moveTo(472, 232); c.quadraticCurveTo(500, 256, 528, 232); }, false, false);
  if (r.chance(.5)) { h.circle(452, 226, 11); h.circle(548, 226, 11); }
  c.save(); c.translate(cx, cy); c.scale(1, sy);
  h.circle(0, 0, R, true);
  var rim = r.int(12, 20), hx = r.range(68, 92), off = r.pick([0, Math.PI/6]);
  h.circle(0, 0, 196);
  for (var i = 0; i < rim; i++) { var a = TAU*i/rim, p0 = pol(0,0,196,a), p1 = pol(0,0,R,a); h.line(p0[0], p0[1], p1[0], p1[1]); }
  h.path(function () { for (var k = 0; k < 6; k++) { var p = pol(0, 0, hx, off + TAU*k/6); k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } }, false, true);
  var mode = r.int(0, 2);
  for (var k2 = 0; k2 < 6; k2++) {
    var a2 = off + TAU*k2/6, q0 = pol(0,0,hx,a2), q1 = pol(0,0,196,a2); h.line(q0[0], q0[1], q1[0], q1[1]);
    var mid = pol(0, 0, (hx+196)/2, a2 + Math.PI/6);
    if (mode === 0) { h.circle(mid[0], mid[1], 17); h.dot(mid[0], mid[1], 5); }
    else if (mode === 1) { starPoly(c, h, mid[0], mid[1], 24, 6, 2, a2); }
    else { h.circle(mid[0], mid[1], 22); h.circle(mid[0], mid[1], 10); }
  }
  if (r.chance(.6)) h.path(function () { for (var k = 0; k < 6; k++) { var p = pol(0, 0, hx*.5, off + TAU*k/6); k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } }, false, true);
  c.restore();
  var ns = r.int(2, 4);
  for (var s = 0; s < ns; s++) h.circle(r.range(80, 200) , r.range(120, 900), r.range(14, 30));
  for (var w = 0; w < 3; w++) { var wy = 930 + w * 22; h.path(function () { c.moveTo(60, wy); for (var x = 60; x < 940; x += 80) c.quadraticCurveTo(x + 20, wy - 14, x + 40, wy), c.quadraticCurveTo(x + 60, wy + 14, x + 80, wy); }, false, false); }
}

function cat(c, r, h) {
  var cx = 500, cy = 540, rx = 290, ry = 250;
  [1, -1].forEach(function (sx) {
    var tipX = r.range(220, 255), tipY = r.range(145, 195), d0 = -205, d1 = -80;
    var X = function (x) { return sx > 0 ? 1000 - x : x; };
    var A = [500 + d0, cy - eyOf(rx,ry,d0)], B = [500 + d1, cy - eyOf(rx,ry,d1)];
    h.path(function () { c.moveTo(X(A[0]), A[1]); c.lineTo(X(tipX), tipY); c.lineTo(X(B[0]), B[1]); }, true, false);
    h.path(function () { c.moveTo(X(A[0]+30), A[1]-18); c.lineTo(X(tipX+22), tipY+55); c.lineTo(X(B[0]-22), B[1]-4); }, false, false);
  });
  h.ell(cx, cy, rx, ry, 0, true);
  var eye = r.int(0, 2);
  [385, 615].forEach(function (x, i) {
    if (eye === 0) { h.circle(x, 500, 52, true); h.ell(x, 500, 15, 32, 0, 'k'); h.circle(x + 14, 480, 8, 'w'); }
    else if (eye === 1) { h.path(function () { c.moveTo(x-55, 505); c.quadraticCurveTo(x, 440, x+55, 505); }, false, false); }
    else { h.path(function () { c.moveTo(x-58, 500); c.quadraticCurveTo(x, 440, x+58, 500); c.quadraticCurveTo(x, 545, x-58, 500); }, true, true); h.dot(x, 500, 20); h.circle(x+8, 492, 6, 'w'); }
  });
  h.path(function () { c.moveTo(470, 585); c.lineTo(530, 585); c.lineTo(500, 622); }, false, true);
  h.dot(500, 596, 9);
  h.line(500, 622, 500, 648);
  h.path(function () { c.moveTo(500, 648); c.quadraticCurveTo(470, 690, 425, 660); }, false, false);
  h.path(function () { c.moveTo(500, 648); c.quadraticCurveTo(530, 690, 575, 660); }, false, false);
  [1, -1].forEach(function (sx) {
    for (var i = 0; i < 3; i++) h.line(500 + sx*190, 610 + i*26, 500 + sx*(380 + 8*i), 575 + i*60);
  });
  var st = r.int(0, 2);
  if (st >= 1) { h.line(500, 300, 500, 375); h.line(450, 310, 462, 365); h.line(550, 310, 538, 365); }
  if (st === 2) { [1, -1].forEach(function (sx) { for (var i = 0; i < 3; i++) h.line(500 + sx*268, 480 + i*32, 500 + sx*215, 490 + i*32); }); }
  if (r.chance(.6)) { h.circle(325, 600, 20); h.circle(675, 600, 20); }
  var acc = r.int(0, 1);
  if (acc === 0) {
    h.path(function () { c.moveTo(500, 835); c.lineTo(395, 790); c.lineTo(395, 880); }, true, true);
    h.path(function () { c.moveTo(500, 835); c.lineTo(605, 790); c.lineTo(605, 880); }, true, true);
    h.circle(500, 835, 20, true);
  } else {
    h.path(function () { c.moveTo(310, 745); c.quadraticCurveTo(500, 840, 690, 745); c.lineTo(675, 780); c.quadraticCurveTo(500, 880, 325, 780); }, true, true);
    h.circle(500, 845, 26, true); h.line(480, 845, 520, 845); h.dot(500, 858, 5);
  }
}

function bird(c, r, h) {
  var nT = r.int(3, 4), i;
  for (i = 0; i < nT; i++) {
    var a = -.4 + i * (.8 / (nT - 1));
    h.ell(300 - 110*Math.cos(a), 590 - 110*Math.sin(a) + 30, 120, 34, a, true);
  }
  h.ell(470, 540, 255, 205, -.05, true);
  var cr = r.int(0, 2);
  for (i = 0; i < cr + 2; i++) { var cxx = 600 + i*28; h.path(function () { c.moveTo(cxx, 312); c.quadraticCurveTo(cxx - 14, 235, cxx - 52 + i*8, 225); }, false, false); }
  h.circle(655, 425, 125, true);
  h.path(function () { c.moveTo(765, 405); c.lineTo(852, 445); c.lineTo(765, 485); }, true, true);
  h.line(765, 445, 825, 445);
  h.dot(700, 400, 22); h.circle(708, 392, 7, 'w');
  if (r.chance(.6)) h.circle(690, 468, 18);
  h.ell(440, 540, 150, 85, .35, true); h.ell(450, 545, 100, 52, .35);
  for (i = 0; i < 4; i++) h.arc(330 + i*40, 580 + i*10, 20, 0, Math.PI);
  for (var row = 0; row < 2; row++) for (var x = 400 + row*25; x < 620; x += 50) h.arc(x, 650 + row*45, 22, 0, Math.PI);
  [430, 530].forEach(function (lx) {
    h.line(lx, 742, lx, 835); h.line(lx, 835, lx - 28, 850); h.line(lx, 835, lx + 4, 856); h.line(lx, 835, lx + 30, 848);
  });
  h.path(function () { c.moveTo(60, 868); c.quadraticCurveTo(450, 842, 940, 872); }, false, false);
  h.path(function () { c.moveTo(60, 915); c.quadraticCurveTo(450, 889, 940, 919); }, false, false);
  h.arc(60, 891, 23, Math.PI*.5, Math.PI*1.5); h.arc(940, 895, 23, -Math.PI*.5, Math.PI*.5);
  var nl = r.int(2, 4);
  for (i = 0; i < nl; i++) { var lx2 = r.range(120, 900), la = r.range(-.9, -.3); h.ell(lx2, 858, 70, 24, la, true); h.line(lx2 - Math.cos(la)*55, 858 - Math.sin(la)*55, lx2 + Math.cos(la)*55, 858 + Math.sin(la)*55); }
  var ns = r.int(2, 4);
  for (i = 0; i < ns; i++) starPoly(c, h, r.range(70, 330), r.range(90, 300), r.range(18, 30), 5, 2, -Math.PI/2);
  if (r.chance(.5)) { h.circle(880, 150, 55); h.circle(880, 150, 30); }
}

function flower(c, r, h) {
  var cx = 500, cy = 500, n1 = r.int(6, 12), n2 = r.int(5, 10), v = r.chance(.6);
  petalRing(c, h, cx, cy, 70, 440, n1, r.range(.22, .4), 0, v);
  petalRing(c, h, cx, cy, 55, 300, n2, r.range(.25, .45), Math.PI / n2, v);
  h.circle(cx, cy, 85, true); h.circle(cx, cy, 55);
  var nd = r.int(8, 14);
  for (var i = 0; i < nd; i++) { var p = pol(cx, cy, 70, TAU*i/nd); h.dot(p[0], p[1], 5); }
  h.dot(cx, cy, 14);
  var k = r.int(0, 3);
  for (var j = 0; j < k; j++) h.circle(r.range(60, 140), r.range(60, 940), r.range(10, 22));
}

function mandala(c, r, h) {
  var cx = 500, cy = 500, rad = r.range(24, 40), layers = 0, i;
  h.circle(cx, cy, rad);
  h.dot(cx, cy, 9);
  while (rad < 395 || layers < 5) {
    var w = r.range(42, 78), t = r.int(0, 5), n = r.pick([8, 10, 12, 16, 20, 24]), r1 = rad + w;
    if (r1 > 470) break;
    if (t === 0) petalRing(c, h, cx, cy, rad + 3, r1, n, r.range(.12, .4), r.pick([0, Math.PI / n]), r.chance(.4));
    else if (t === 1) for (i = 0; i < n; i++) { var pc = pol(cx, cy, rad + w * .5, TAU*i/n); h.circle(pc[0], pc[1], Math.min(w * .42, Math.PI * (rad + w*.5) / n * .8)); }
    else if (t === 2) { for (i = 0; i < n * 2; i++) { var pd = pol(cx, cy, rad + w * .5, TAU*i/(n*2)); h.dot(pd[0], pd[1], r.range(3, 7)); } }
    else if (t === 3) { var k = r.pick([2, 3]); if (n % k === 0) k = 1 + k; starPoly(c, h, cx, cy, r1, n, Math.max(2, Math.min(k, Math.floor(n / 2) - 1)), -Math.PI/2); }
    else if (t === 4) h.path(function () { for (var z = 0; z < n * 2; z++) { var q = pol(cx, cy, z % 2 ? rad : r1, TAU*z/(n*2)); z ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } }, false, true);
    else for (i = 0; i < n * 2; i++) { var l0 = pol(cx, cy, rad, TAU*i/(n*2)), l1 = pol(cx, cy, r1, TAU*i/(n*2)); h.line(l0[0], l0[1], l1[0], l1[1]); }
    h.circle(cx, cy, r1);
    rad = r1 + r.range(0, 10); layers++;
  }
  h.circle(cx, cy, 478);
}

function heart(c, h, x, y, s) {
  h.path(function () {
    c.moveTo(x, y + s * .9);
    c.bezierCurveTo(x - s * 1.4, y - s * .1, x - s * .6, y - s * 1.1, x, y - s * .3);
    c.bezierCurveTo(x + s * .6, y - s * 1.1, x + s * 1.4, y - s * .1, x, y + s * .9);
  }, false, true);
}
function sprinkle(c, h, r, n, y0, y1) {
  for (var i = 0; i < n; i++) {
    var x = r.chance(.5) ? r.range(60, 175) : r.range(825, 940), y = r.range(y0, y1);
    if (r.chance(.5)) heart(c, h, x, y, r.range(14, 24)); else starPoly(c, h, x, y, r.range(18, 30), 5, 2, -Math.PI / 2);
  }
}
function waves(c, h, y, amp) {
  h.path(function () {
    c.moveTo(40, y);
    for (var x = 40; x < 940; x += 80) { c.quadraticCurveTo(x + 20, y - amp, x + 40, y); c.quadraticCurveTo(x + 60, y + amp, x + 80, y); }
  }, false, false);
}
function sun(c, h, x, y, rr) {
  h.circle(x, y, rr);
  for (var i = 0; i < 12; i++) { var a = TAU * i / 12, p = pol(x, y, rr + 14, a), q = pol(x, y, rr + 34, a); h.line(p[0], p[1], q[0], q[1]); }
}
function bowTie(c, h, x, y) {
  h.path(function () { c.moveTo(x, y); c.lineTo(x - 100, y - 45); c.lineTo(x - 100, y + 45); }, true, true);
  h.path(function () { c.moveTo(x, y); c.lineTo(x + 100, y - 45); c.lineTo(x + 100, y + 45); }, true, true);
  h.circle(x, y, 20, true);
}

function dog(c, r, h) {
  var rot = r.range(.15, .4), eL = r.range(170, 210), eW = r.range(70, 90);
  [1, -1].forEach(function (sx) {
    h.ell(500 - sx * 255, 470, eW, eL, sx * rot, true);
    h.ell(500 - sx * 262, 482, eW * .55, eL * .65, sx * rot);
  });
  h.ell(500, 520, 265, 235, 0, true);
  if (r.chance(.8)) { var side = r.chance(.5) ? 1 : -1; h.ell(500 - side * 118, 455, 92, 102, side * .3); }
  [395, 605].forEach(function (x) { h.circle(x, 460, 40, true); h.dot(x, 466, 21); h.circle(x + 9, 456, 6, 'w'); });
  if (r.chance(.5)) [395, 605].forEach(function (x, i) { h.path(function () { c.moveTo(x - 45, 392 + i * 4); c.quadraticCurveTo(x, 365, x + 45, 392 + (1 - i) * 4); }, false, false); });
  h.ell(500, 618, 135, 98, 0, true);
  h.ell(500, 568, 54, 34, 0, 'k'); h.circle(486, 558, 7, 'w');
  h.line(500, 601, 500, 642);
  h.path(function () { c.moveTo(500, 642); c.quadraticCurveTo(468, 680, 424, 652); }, false, false);
  h.path(function () { c.moveTo(500, 642); c.quadraticCurveTo(532, 680, 576, 652); }, false, false);
  if (r.chance(.6)) { h.path(function () { c.moveTo(468, 664); c.quadraticCurveTo(468, 735, 500, 735); c.quadraticCurveTo(532, 735, 532, 664); }, true, false); h.line(500, 670, 500, 715); }
  [[440, 598], [420, 624], [452, 628]].forEach(function (p) { h.dot(p[0], p[1], 4); h.dot(1000 - p[0], p[1], 4); });
  if (r.chance(.5)) {
    h.path(function () { c.moveTo(300, 720); c.quadraticCurveTo(500, 820, 700, 720); c.lineTo(690, 765); c.quadraticCurveTo(500, 865, 310, 765); }, true, true);
    h.circle(500, 840, 28, true); h.dot(500, 840, 6);
  } else {
    h.path(function () { c.moveTo(320, 740); c.quadraticCurveTo(500, 790, 680, 740); c.lineTo(500, 930); }, true, true);
    h.dot(450, 790, 8); h.dot(550, 790, 8); h.dot(500, 850, 8);
  }
  sprinkle(c, h, r, r.int(2, 4), 100, 700);
}

function rabbit(c, r, h) {
  var tilt = r.range(.05, .22), eH = r.range(175, 205);
  [1, -1].forEach(function (sx) {
    h.ell(500 - sx * 95, 245, 62, eH, -sx * tilt, true);
    h.ell(500 - sx * 95, 255, 32, eH * .72, -sx * tilt);
  });
  h.ell(500, 600, 245, 215, 0, true);
  [405, 595].forEach(function (x) { h.dot(x, 560, 25); h.circle(x + 9, 551, 8, 'w'); });
  h.ell(500, 632, 24, 16, 0, 'k');
  h.line(500, 646, 500, 676);
  h.path(function () { c.moveTo(500, 676); c.quadraticCurveTo(470, 708, 432, 682); }, false, false);
  h.path(function () { c.moveTo(500, 676); c.quadraticCurveTo(530, 708, 568, 682); }, false, false);
  h.path(function () { c.moveTo(472, 688); c.lineTo(528, 688); c.lineTo(528, 740); c.lineTo(472, 740); }, true, true);
  h.line(500, 688, 500, 740);
  h.circle(335, 655, 32); h.circle(665, 655, 32);
  [1, -1].forEach(function (sx) { for (var i = 0; i < 3; i++) h.line(500 + sx * 170, 640 + i * 22, 500 + sx * 360, 600 + i * 42); });
  if (r.chance(.55)) {
    h.path(function () { c.moveTo(730, 790); c.lineTo(870, 790); c.lineTo(800, 940); }, true, true);
    h.line(750, 825, 795, 832); h.line(790, 860, 835, 866); h.line(780, 895, 810, 900);
    for (var i = -1; i <= 1; i++) h.path(function () { c.moveTo(800, 790); c.quadraticCurveTo(800 + i * 30, 740, 800 + i * 55, 705); }, false, false);
  } else bowTie(c, h, 500, 875);
  sprinkle(c, h, r, r.int(2, 4), 100, 700);
}

function elephant(c, r, h) {
  var eW = r.range(135, 158), eH = r.range(175, 205);
  [1, -1].forEach(function (sx) {
    h.ell(500 - sx * 255, 470, eW, eH, sx * .12, true);
    h.ell(500 - sx * 255, 480, eW * .65, eH * .68, sx * .12);
    if (r.chance(.5)) for (var k = -1; k <= 1; k++) h.line(500 - sx * 255 + k * 28, 400, 500 - sx * 255 + k * 24, 560);
  });
  h.circle(500, 450, 232, true);
  if (r.chance(.75)) [1, -1].forEach(function (sx) {
    h.path(function () { c.moveTo(500 + sx * -65, 590); c.quadraticCurveTo(500 + sx * -160, 690, 500 + sx * -118, 800); c.quadraticCurveTo(500 + sx * -118, 700, 500 + sx * -42, 625); }, true, true);
  });
  h.path(function () {
    c.moveTo(438, 545);
    c.bezierCurveTo(422, 690, 438, 800, 474, 872);
    c.quadraticCurveTo(508, 925, 548, 868);
    c.bezierCurveTo(572, 830, 578, 690, 562, 545);
  }, true, true);
  for (var y = 610; y <= 790; y += 45) h.path(function () { c.moveTo(447 + (y - 610) * .06, y); c.quadraticCurveTo(500, y + 18, 553 - (y - 610) * .06, y); }, false, false);
  [408, 592].forEach(function (x) { h.dot(x, 420, 15); h.circle(x + 5, 414, 4, 'w'); });
  if (r.chance(.5)) [408, 592].forEach(function (x) { for (var q = -1; q <= 1; q++) h.line(x + q * 9, 400, x + q * 17, 378); });
  h.circle(330, 520, 28); h.circle(670, 520, 28);
  if (r.chance(.55)) {
    h.path(function () { c.moveTo(420, 235); c.lineTo(580, 235); c.lineTo(500, 70); }, true, true);
    h.line(442, 190, 558, 190); h.line(466, 140, 534, 140); h.circle(500, 62, 18, true);
  } else {
    for (var i = 0; i < 5; i++) { var p = pol(500, 190, 32, TAU * i / 5 - Math.PI / 2); h.circle(p[0], p[1], 22); }
    h.circle(500, 190, 16, true); h.dot(500, 190, 5);
  }
}

function dolphin(c, r, h) {
  c.save(); c.translate(0, 5);
  if (r.chance(.5)) sun(c, h, 140, 150, 48);
  h.path(function () { c.moveTo(560, 335); c.bezierCurveTo(545, 275, 505, 240, 455, 225); c.bezierCurveTo(475, 270, 465, 310, 445, 345); }, true, false);
  h.path(function () {
    c.moveTo(915, 505);
    c.bezierCurveTo(880, 492, 840, 470, 805, 432);
    c.bezierCurveTo(780, 392, 740, 362, 690, 352);
    c.bezierCurveTo(580, 322, 440, 335, 330, 420);
    c.bezierCurveTo(280, 455, 240, 490, 200, 500);
    c.bezierCurveTo(170, 470, 130, 420, 90, 410);
    c.bezierCurveTo(130, 460, 150, 490, 150, 510);
    c.bezierCurveTo(150, 530, 130, 570, 90, 610);
    c.bezierCurveTo(130, 590, 175, 560, 210, 545);
    c.bezierCurveTo(300, 590, 450, 660, 600, 650);
    c.bezierCurveTo(720, 642, 790, 600, 830, 552);
    c.bezierCurveTo(855, 535, 885, 522, 915, 505);
  }, true, true);
  h.path(function () { c.moveTo(915, 505); c.quadraticCurveTo(860, 530, 800, 528); }, false, false);
  h.path(function () { c.moveTo(250, 505); c.bezierCurveTo(400, 590, 600, 600, 800, 540); }, false, false);
  h.circle(745, 448, 22, true); h.dot(747, 450, 11); h.circle(753, 443, 4, 'w');
  h.ell(640, 610, 85, 28, .75, true);
  var pat = r.int(0, 2);
  if (pat === 0) for (var x = 400; x < 700; x += 55) h.circle(x + r.range(-8, 8), 405 + r.range(-5, 25), r.range(8, 14));
  else if (pat === 1) for (var k = 0; k < 4; k++) { var sx = 420 + k * 70; h.path(function () { c.moveTo(sx, 372 + k * 3); c.quadraticCurveTo(sx + 25, 430, sx - 10, 480); }, false, false); }
  c.restore();
  waves(c, h, 780, 14); waves(c, h, 835, 14); waves(c, h, 890, 14);
  var nd = r.int(3, 6);
  for (var i = 0; i < nd; i++) h.circle(r.range(60, 230), r.range(610, 740), r.range(8, 18));
  for (var j = 0; j < r.int(2, 4); j++) h.circle(r.range(720, 930), r.range(600, 740), r.range(10, 24));
}

function snail(c, r, h) {
  if (r.chance(.5)) sun(c, h, 150, 140, 46);
  [[770, 478, 745, 382, 743, 366], [818, 478, 852, 388, 854, 372]].forEach(function (s) {
    h.line(s[0], s[1], s[2], s[3]); h.circle(s[4], s[5], 21, true); h.dot(s[4] + 2, s[5] + 2, 8);
  });
  h.path(function () {
    c.moveTo(110, 810);
    c.bezierCurveTo(260, 740, 420, 715, 580, 712);
    c.bezierCurveTo(700, 705, 745, 650, 742, 560);
    c.bezierCurveTo(745, 470, 840, 470, 850, 550);
    c.bezierCurveTo(860, 640, 830, 790, 740, 810);
    c.lineTo(110, 810);
  }, true, true);
  h.path(function () { c.moveTo(783, 565); c.quadraticCurveTo(806, 592, 832, 560); }, false, false);
  h.circle(770, 590, 12); 
  var R = 190, sx = 430, sy = 505, turns = r.pick([3, 3.5, 4, 4.5]);
  h.circle(sx, sy, R, true);
  h.path(function () {
    for (var t = 0; t <= turns * TAU; t += .08) {
      var rr = 12 + (t / (turns * TAU)) * (R - 22), p = pol(sx, sy, rr, t + 1.2);
      t === 0 ? c.moveTo(p[0], p[1]) : c.lineTo(p[0], p[1]);
    }
  }, false, false);
  h.circle(sx, sy, R - 20);
  if (r.chance(.6)) for (var i = 0; i < 9; i++) { var q = pol(sx, sy, R + 18, -Math.PI * .95 + i * .3); h.dot(q[0], q[1], 4); }
  h.line(40, 815, 960, 815);
  var g = r.int(5, 8);
  for (var k = 0; k < g; k++) {
    var gx = r.range(60, 940), gh = r.range(30, 55);
    h.path(function () { c.moveTo(gx - 14, 892); c.quadraticCurveTo(gx - 10, 892 - gh * .6, gx - 18, 892 - gh); }, false, false);
    h.path(function () { c.moveTo(gx, 892); c.lineTo(gx, 892 - gh * 1.15); }, false, false);
    h.path(function () { c.moveTo(gx + 14, 892); c.quadraticCurveTo(gx + 10, 892 - gh * .6, gx + 18, 892 - gh); }, false, false);
  }
  if (r.chance(.7)) {
    var fx = r.range(870, 930);
    h.line(fx, 950, fx, 880);
    for (var f = 0; f < 5; f++) { var fp = pol(fx, 862, 20, TAU * f / 5 - Math.PI / 2); h.circle(fp[0], fp[1], 14); }
    h.circle(fx, 862, 10, true);
  }
}

function duck(c, r, h) {
  if (r.chance(.5)) sun(c, h, 130, 140, 48);
  h.path(function () { c.moveTo(240, 570); c.bezierCurveTo(175, 525, 125, 485, 95, 440); c.bezierCurveTo(155, 430, 235, 470, 270, 520); }, true, false);
  h.ell(480, 620, 270, 170, 0, true);
  h.ell(450, 610, 165, 98, .12, true);
  for (var i = 0; i < 3; i++) h.arc(380 + i * 55, 625 + i * 4, 26, 0, Math.PI);
  h.line(300, 580, 520, 575);
  h.circle(690, 420, 130, true);
  h.path(function () { c.moveTo(800, 395); c.bezierCurveTo(880, 385, 935, 420, 928, 452); c.bezierCurveTo(900, 482, 830, 472, 800, 452); }, true, true);
  h.path(function () { c.moveTo(808, 428); c.quadraticCurveTo(870, 440, 922, 440); }, false, false);
  h.dot(722, 382, 17); h.circle(729, 375, 6, 'w');
  if (r.chance(.4)) h.circle(742, 455, 18);
  if (r.chance(.55)) {
    for (var f = 0; f < 5; f++) { var p = pol(625, 300, 22, TAU * f / 5 - Math.PI / 2); h.circle(p[0], p[1], 15); }
    h.circle(625, 300, 11, true);
  } else {
    h.path(function () { c.moveTo(650, 300); c.quadraticCurveTo(690, 270, 720, 292); }, false, false);
  }
  waves(c, h, 815, 13); waves(c, h, 868, 13); waves(c, h, 921, 13);
  var nr = r.int(1, 3);
  for (var k = 0; k < nr; k++) {
    var rx = 880 + k * 36 - (nr - 1) * 18;
    h.line(rx, 960, rx - 6, 620); h.ell(rx - 6, 600, 14, 40, 0, true);
  }
  for (var b = 0; b < r.int(2, 4); b++) h.circle(r.range(80, 220), r.range(700, 780), r.range(8, 16));
}

var PAGE_TYPES = {
  butterfly: { name: 'Butterflies', one: 'Butterfly', fn: butterfly },
  fish: { name: 'Fish', one: 'Fish', fn: fish },
  owl: { name: 'Owls', one: 'Owl', fn: owl },
  bird: { name: 'Birds', one: 'Bird', fn: bird },
  cat: { name: 'Cats', one: 'Cat', fn: cat },
  dog: { name: 'Dogs', one: 'Dog', fn: dog },
  rabbit: { name: 'Rabbits', one: 'Rabbit', fn: rabbit },
  elephant: { name: 'Elephants', one: 'Elephant', fn: elephant },
  dolphin: { name: 'Dolphins', one: 'Dolphin', fn: dolphin },
  duck: { name: 'Ducks', one: 'Duck', fn: duck },
  snail: { name: 'Snails', one: 'Snail', fn: snail },
  turtle: { name: 'Turtles', one: 'Turtle', fn: turtle },
  flower: { name: 'Flowers', one: 'Flower', fn: flower },
  mandala: { name: 'Mandalas', one: 'Mandala', fn: mandala }
};

function drawPage(ctx, size, type, n, mark) {
  var r = makeRng(hashSeed(type, n));
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
  ctx.scale(size / 1000, size / 1000);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  PAGE_TYPES[type].fn(ctx, r, makeHelpers(ctx));
  if (mark) {
    ctx.fillStyle = '#888'; ctx.font = '15px Arial'; ctx.textAlign = 'center';
    ctx.fillText('toolnes.netlify.app - free coloring pages', 500, 992);
  }
  ctx.restore();
}

function initCategoryPage(cat) {
  var $ = function (id) { return document.getElementById(id); };
  var types = Object.keys(PAGE_TYPES);
  var DAY = Math.floor(Date.now() / 86400000), PER = 24;
  var state = { mode: 'today', count: 0 };
  var cur = { type: cat, n: 1 };
  function base() { return state.mode === 'today' ? DAY * 1000 : 1; }
  function label(type, n) { return PAGE_TYPES[type].one + ' #' + n; }
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); thumb(e.target); } });
  }, { rootMargin: '300px' }) : null;
  function thumb(cv) {
    cv.width = 360; cv.height = 360;
    drawPage(cv.getContext('2d'), 360, cv.getAttribute('data-type'), +cv.getAttribute('data-n'), false);
  }
  function addCards() {
    var grid = $('grid');
    for (var k = 0; k < PER; k++) {
      var n = base() + state.count++;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'card';
      var cv = document.createElement('canvas');
      cv.setAttribute('data-type', cat); cv.setAttribute('data-n', n);
      cv.setAttribute('aria-label', label(cat, n) + ' coloring page');
      var cap = document.createElement('span'); cap.className = 'cap'; cap.textContent = label(cat, n);
      b.appendChild(cv); b.appendChild(cap);
      (function (nn) { b.addEventListener('click', function () { openPage(cat, nn); }); })(n);
      grid.appendChild(b);
      if (io) io.observe(cv); else thumb(cv);
    }
  }
  function reset() { $('grid').innerHTML = ''; state.count = 0; addCards(); }
  function setMode(m) {
    state.mode = m;
    $('mToday').classList.toggle('on', m === 'today');
    $('mClassic').classList.toggle('on', m === 'classic');
    reset();
  }
  function openPage(type, n) {
    if (!PAGE_TYPES[type]) return;
    cur = { type: type, n: Math.max(1, n) };
    var big = $('big'); big.width = 1400; big.height = 1400;
    drawPage(big.getContext('2d'), 1400, cur.type, cur.n, true);
    $('mTitle').textContent = label(cur.type, cur.n) + ' - free coloring page';
    $('toast').textContent = '';
    $('modal').classList.add('open');
    try { history.replaceState(null, '', '#' + cur.type + '-' + cur.n); } catch (e) {}
  }
  function closeModal() {
    $('modal').classList.remove('open');
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
  }
  function toast(t) { $('toast').textContent = t; }
  $('close').addEventListener('click', closeModal);
  $('modal').addEventListener('click', function (e) { if (e.target === $('modal')) closeModal(); });
  $('prev').addEventListener('click', function () { openPage(cur.type, cur.n - 1); });
  $('next').addEventListener('click', function () { openPage(cur.type, cur.n + 1); });
  $('rand').addEventListener('click', function () { openPage(cat, 1 + Math.floor(Math.random() * 99999)); });
  document.addEventListener('keydown', function (e) {
    if (!$('modal').classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') openPage(cur.type, cur.n - 1);
    if (e.key === 'ArrowRight') openPage(cur.type, cur.n + 1);
  });
  $('dl').addEventListener('click', function () {
    var cv = document.createElement('canvas'); cv.width = 2400; cv.height = 2400;
    drawPage(cv.getContext('2d'), 2400, cur.type, cur.n, true);
    cv.toBlob(function (blob) {
      if (!blob) { toast('Could not create the file. Please try again.'); return; }
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'toolnes-' + cur.type + '-coloring-page-' + cur.n + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
      toast('Your download has started.');
    }, 'image/png');
  });
  $('pr').addEventListener('click', function () { window.print(); });
  $('copy').addEventListener('click', function () {
    var url = location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast('Link copied.'); }, function () { toast(url); });
    } else { toast(url); }
  });
  $('more').addEventListener('click', addCards);
  $('mToday').addEventListener('click', function () { setMode('today'); });
  $('mClassic').addEventListener('click', function () { setMode('classic'); });
  $('year').textContent = new Date().getFullYear();
  addCards();
  var m = /^#([a-z]+)-(\d+)$/.exec(location.hash);
  if (m && PAGE_TYPES[m[1]]) openPage(m[1], parseInt(m[2], 10));
}
