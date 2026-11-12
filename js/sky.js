/* 3suns website: the live "sky right now" chart wheel and the starfield.
   Positions: apparent geocentric tropical longitudes from Astronomy Engine (MIT),
   checked against the Swiss Ephemeris reference program to within 15 arc seconds. */
(function () {
  "use strict";
  var SVGNS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SIGNS = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
  var SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  var ELEMENT = ["fire", "earth", "air", "water"];
  var BODIES = [
    { key: "sun", name: "Sun", body: "Sun" },
    { key: "moon", name: "Moon", body: "Moon" },
    { key: "mercury", name: "Mercury", body: "Mercury" },
    { key: "venus", name: "Venus", body: "Venus" },
    { key: "mars", name: "Mars", body: "Mars" },
    { key: "jupiter", name: "Jupiter", body: "Jupiter" },
    { key: "saturn", name: "Saturn", body: "Saturn" },
    { key: "uranus", name: "Uranus", body: "Uranus" },
    { key: "neptune", name: "Neptune", body: "Neptune" },
    { key: "pluto", name: "Pluto", body: "Pluto" },
    { key: "mean_node", name: "North Node", body: null }
  ];
  var ASPECTS = [
    { name: "opposition", angle: 180, orb: 8, cls: "hard" },
    { name: "trine", angle: 120, orb: 7, cls: "soft" },
    { name: "square", angle: 90, orb: 7, cls: "hard" },
    { name: "sextile", angle: 60, orb: 5, cls: "soft" }
  ];

  function norm(a) { a %= 360; return a < 0 ? a + 360 : a; }
  function sep(a, b) { var d = Math.abs(norm(a) - norm(b)); return d > 180 ? 360 - d : d; }

  /* ---------- positions ---------- */
  var A = window.Astronomy;
  function lonOf(b, date) {
    if (!b.body) {
      var T = A.MakeTime(date).tt / 36525;
      return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441);
    }
    return A.Ecliptic(A.GeoVector(A.Body[b.body], date, true)).elon;
  }
  function positions(date) {
    var later = new Date(date.getTime() + 6 * 3600 * 1000);
    return BODIES.map(function (b) {
      var lon = lonOf(b, date);
      var retro = false;
      if (b.body && b.key !== "sun" && b.key !== "moon") {
        var d = norm(lonOf(b, later) - lon);
        retro = d > 180;
      }
      return { key: b.key, name: b.name, lon: lon, retro: retro };
    });
  }
  function fmtDeg(lon, withSeconds) {
    var s = Math.floor(lon / 30), d = lon - s * 30;
    var D = Math.floor(d), m = (d - D) * 60, M = Math.floor(m), sec = Math.floor((m - M) * 60);
    var out = D + "°" + (M < 10 ? "0" : "") + M + "′";
    if (withSeconds) out += (sec < 10 ? "0" : "") + sec + "″";
    return { text: out, sign: s };
  }

  /* ---------- drawing helpers ---------- */
  function el(name, attrs, parent) {
    var e = document.createElementNS(SVGNS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function glyph(key, x, y, size, parent, cls) {
    var g = window.GLYPHS && window.GLYPHS[key];
    var grp = el("g", { "class": cls || "" }, parent);
    if (!g) return grp;
    var b = g.b, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
    var p = el("path", { d: g.d }, grp);
    p.setAttribute("transform", "translate(" + (-cx) + " " + (-cy) + ")");
    grp.setAttribute("transform", "translate(" + x + " " + y + ") scale(" + size + ")");
    return grp;
  }
  function inlineGlyph(key, size) {
    var g = window.GLYPHS && window.GLYPHS[key];
    if (!g) return "";
    var b = g.b, pad = 0.06, w = b[2] - b[0] + 2 * pad, h = b[3] - b[1] + 2 * pad;
    return '<svg class="ig" aria-hidden="true" viewBox="' + (b[0] - pad) + " " + (b[1] - pad) + " " + w + " " + h +
      '" width="' + (size * w / h).toFixed(1) + '" height="' + size + '"><path d="' + g.d + '"/></svg>';
  }
  window.inlineGlyph = inlineGlyph;

  /* Wheel geometry, natural wheel: 0° Aries on the left, signs run counter-clockwise. */
  var C = 320, R_OUT = 304, R_SIGN = 256, R_TICK = 256, R_PLANET = 214, R_LABEL = 184, R_IN = 160;
  function pt(lon, r) {
    var t = (180 + lon) * Math.PI / 180;
    return [C + r * Math.cos(t), C - r * Math.sin(t)];
  }

  /* Spread glyphs that sit too close together so none overlap. */
  function spread(list, minGap) {
    var items = list.map(function (p) { return { key: p.key, lon: p.lon, show: p.lon }; })
      .sort(function (a, b) { return a.lon - b.lon; });
    for (var iter = 0; iter < 60; iter++) {
      var moved = false;
      for (var i = 0; i < items.length; i++) {
        var a = items[i], b = items[(i + 1) % items.length];
        var gap = norm(b.show - a.show);
        if (items.length > 1 && gap < minGap) {
          var push = (minGap - gap) / 2;
          a.show = norm(a.show - push); b.show = norm(b.show + push); moved = true;
        }
      }
      if (!moved) break;
    }
    var out = {};
    items.forEach(function (it) { out[it.key] = it.show; });
    return out;
  }

  function buildWheel(svg) {
    svg.innerHTML = "";
    var defs = el("defs", {}, svg);
    var rg = el("radialGradient", { id: "wheelCore", cx: "50%", cy: "50%", r: "50%" }, defs);
    el("stop", { offset: "0%", "stop-color": "#1b2142" }, rg);
    el("stop", { offset: "100%", "stop-color": "#10142a" }, rg);
    var glow = el("filter", { id: "sunGlow", x: "-100%", y: "-100%", width: "300%", height: "300%" }, defs);
    el("feGaussianBlur", { stdDeviation: "6" }, glow);

    var root = el("g", { "class": "wheel-root" }, svg);
    // discs
    el("circle", { cx: C, cy: C, r: R_OUT, "class": "w-disc" }, root);
    var ringG = el("g", { "class": "w-signs" }, root);
    for (var s = 0; s < 12; s++) {
      var a0 = s * 30, a1 = a0 + 30;
      var p0 = pt(a0, R_OUT), p1 = pt(a1, R_OUT), p2 = pt(a1, R_SIGN), p3 = pt(a0, R_SIGN);
      // counter-clockwise on screen = sweep flag 0 for the outer arc
      var d = "M" + p0[0] + " " + p0[1] + " A" + R_OUT + " " + R_OUT + " 0 0 0 " + p1[0] + " " + p1[1] +
        " L" + p2[0] + " " + p2[1] + " A" + R_SIGN + " " + R_SIGN + " 0 0 1 " + p3[0] + " " + p3[1] + " Z";
      var seg = el("path", { d: d, "class": "w-seg el-" + ELEMENT[s % 4] }, ringG);
      seg.style.setProperty("--i", s);
      var gp = pt(a0 + 15, (R_OUT + R_SIGN) / 2);
      var sg = glyph(SIGNS[s], gp[0], gp[1], 25, ringG, "w-sign el-" + ELEMENT[s % 4]);
      sg.style.setProperty("--i", s);
      var tl = el("title", {}, sg); tl.textContent = SIGN_NAMES[s];
      var l0 = pt(a0, R_OUT), l1 = pt(a0, R_IN);
      el("line", { x1: l0[0], y1: l0[1], x2: pt(a0, R_SIGN)[0], y2: pt(a0, R_SIGN)[1], "class": "w-div" }, ringG);
    }
    el("circle", { cx: C, cy: C, r: R_OUT, "class": "w-ring w-draw" }, root);
    el("circle", { cx: C, cy: C, r: R_SIGN, "class": "w-ring w-draw" }, root);
    // degree ticks
    var ticks = el("g", { "class": "w-ticks" }, root);
    for (var dgr = 0; dgr < 360; dgr++) {
      var len = dgr % 10 === 0 ? 12 : dgr % 5 === 0 ? 8 : 4;
      var q0 = pt(dgr, R_TICK), q1 = pt(dgr, R_TICK - len);
      el("line", { x1: q0[0].toFixed(2), y1: q0[1].toFixed(2), x2: q1[0].toFixed(2), y2: q1[1].toFixed(2), "class": dgr % 5 ? "t1" : "t5" }, ticks);
    }
    el("circle", { cx: C, cy: C, r: R_IN, fill: "url(#wheelCore)", "class": "w-core" }, root);
    el("circle", { cx: C, cy: C, r: R_IN, "class": "w-ring w-draw" }, root);
    el("circle", { cx: C, cy: C, r: R_IN - 46, "class": "w-ring faint" }, root);
    // equinox and solstice axes, faint
    [0, 90].forEach(function (a) {
      var e0 = pt(a, R_IN - 46), e1 = pt(a + 180, R_IN - 46);
      el("line", { x1: e0[0], y1: e0[1], x2: e1[0], y2: e1[1], "class": "w-axis" }, root);
    });
    // The wheel is drawn in layers so the page can set them at different depths:
    // ring and ticks at the back, aspect lines above them, planets in front.
    var aspSvg = document.getElementById("wheel-asp"), plSvg = document.getElementById("wheel-pl");
    if (aspSvg) aspSvg.innerHTML = "";
    if (plSvg) plSvg.innerHTML = "";
    return {
      root: root,
      markers: el("g", { "class": "w-markers" }, root),
      aspects: el("g", { "class": "w-aspects" }, aspSvg || root),
      dots: el("g", { "class": "w-dots" }, aspSvg || root),
      planets: el("g", { "class": "w-planets" }, plSvg || root)
    };
  }

  function initSky() {
    var svg = document.getElementById("wheel");
    if (!svg || !window.Astronomy || !window.GLYPHS) return;
    var fig = svg.closest(".sky");
    var tip = fig && fig.querySelector(".sky-tip");
    var timeEl = document.getElementById("sky-time");
    var tickerEl = document.getElementById("moon-ticker");
    var sunEl = document.getElementById("sun-ticker");
    var layers = buildWheel(svg);
    var nodes = {};
    var current = positions(new Date());
    var shown = spread(current, 8.5);

    current.forEach(function (p, i) {
      var g = el("g", { "class": "pl pl-" + p.key, tabindex: "0", role: "img" }, layers.planets);
      g.style.setProperty("--i", i);
      var hit = el("circle", { r: 20, cx: 0, cy: 0, "class": "pl-hit" }, g);
      var gl = glyph(p.key, 0, 0, p.key === "mean_node" ? 22 : 26, g, "pl-glyph");
      var lbl = el("text", { "class": "pl-deg", "text-anchor": "middle", "dominant-baseline": "central" }, layers.planets);
      var mk = el("line", { "class": "pl-mark" }, layers.markers);
      var dot = el("circle", { r: 2.6, "class": "pl-dot pl-dot-" + p.key }, layers.dots);
      nodes[p.key] = { g: g, lbl: lbl, mk: mk, dot: dot };
      g.addEventListener("pointerenter", function () { showTip(p.key); });
      g.addEventListener("focus", function () { showTip(p.key); });
      g.addEventListener("pointerleave", hideTip);
      g.addEventListener("blur", hideTip);
      g.addEventListener("click", function () { showTip(p.key); });
    });

    function place(p, showLon, alpha) {
      var n = nodes[p.key];
      var gp = pt(showLon, R_PLANET);
      n.g.setAttribute("transform", "translate(" + gp[0].toFixed(2) + " " + gp[1].toFixed(2) + ")");
      var lp = pt(showLon, R_LABEL);
      n.lbl.setAttribute("x", lp[0].toFixed(2)); n.lbl.setAttribute("y", lp[1].toFixed(2));
      var f = fmtDeg(p.lon);
      n.lbl.textContent = Math.floor(p.lon % 30) + "°";
      var m0 = pt(p.lon, R_TICK - 13), m1 = pt(p.lon, R_IN + 2);
      n.mk.setAttribute("x1", m0[0]); n.mk.setAttribute("y1", m0[1]);
      n.mk.setAttribute("x2", m1[0]); n.mk.setAttribute("y2", m1[1]);
      var dp = pt(p.lon, R_IN);
      n.dot.setAttribute("cx", dp[0]); n.dot.setAttribute("cy", dp[1]);
      var label = p.name + " " + f.text + " " + SIGN_NAMES[f.sign] + (p.retro ? ", retrograde" : "");
      n.g.setAttribute("aria-label", label);
      if (alpha !== undefined) { n.g.style.opacity = alpha; n.lbl.style.opacity = alpha; n.dot.style.opacity = alpha; n.mk.style.opacity = alpha; }
    }

    function drawAspects(list, animate) {
      layers.aspects.innerHTML = "";
      var pl = list.filter(function (p) { return p.key !== "mean_node"; });
      for (var i = 0; i < pl.length; i++) for (var j = i + 1; j < pl.length; j++) {
        var d = sep(pl[i].lon, pl[j].lon);
        for (var k = 0; k < ASPECTS.length; k++) {
          var asp = ASPECTS[k];
          if (Math.abs(d - asp.angle) <= asp.orb) {
            var a = pt(pl[i].lon, R_IN), b = pt(pl[j].lon, R_IN);
            var len = Math.hypot(a[0] - b[0], a[1] - b[1]);
            var ln = el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], "class": "asp " + asp.cls, "data-a": pl[i].key, "data-b": pl[j].key }, layers.aspects);
            ln.style.setProperty("--len", len.toFixed(1));
            ln.style.opacity = (1 - Math.abs(d - asp.angle) / asp.orb * 0.6).toFixed(2);
            if (animate) ln.classList.add("draw");
            var t = el("title", {}, ln);
            t.textContent = pl[i].name + " " + asp.name + " " + pl[j].name;
          }
        }
      }
    }

    function showTip(key) {
      if (!tip) return;
      var p = current.filter(function (x) { return x.key === key; })[0];
      if (!p) return;
      var f = fmtDeg(p.lon, true);
      tip.innerHTML = '<span class="tip-g">' + inlineGlyph(p.key, 16) + "</span><b>" + p.name + "</b> " + f.text + " " +
        inlineGlyph(SIGNS[f.sign], 13) + " " + SIGN_NAMES[f.sign] + (p.retro ? ' <span class="rx">retrograde</span>' : "");
      // where the glyph is on screen now (the wheel may be tilted), relative to the tooltip's own box
      var gb = nodes[key].g.getBoundingClientRect(), fb = (tip.offsetParent || fig).getBoundingClientRect();
      tip.style.left = (gb.left + gb.width / 2 - fb.left) + "px"; tip.style.top = (gb.top + gb.height / 2 - fb.top) + "px";
      tip.hidden = false;
      layers.aspects.querySelectorAll(".asp").forEach(function (l) {
        var on = l.getAttribute("data-a") === key || l.getAttribute("data-b") === key;
        l.classList.toggle("dim", !on); l.classList.toggle("hi", on);
      });
    }
    function hideTip() {
      if (tip) tip.hidden = true;
      layers.aspects.querySelectorAll(".asp").forEach(function (l) { l.classList.remove("dim", "hi"); });
    }

    function renderAll(list, animateAspects) {
      shown = spread(list, 8.5);
      list.forEach(function (p) { place(p, shown[p.key]); });
      drawAspects(list, animateAspects);
    }

    function chip(elm, name, key, lon) {
      var f = fmtDeg(lon, true);
      elm.innerHTML = '<span class="chip-g">' + inlineGlyph(key, 15) + "</span><b>" + name + '</b> <span class="num">' + f.text + "</span> " + inlineGlyph(SIGNS[f.sign], 13);
    }
    function updateClock(now, moon) {
      if (timeEl) {
        try {
          timeEl.textContent = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now);
        } catch (e) { timeEl.textContent = now.toUTCString(); }
        timeEl.setAttribute("datetime", now.toISOString());
      }
      if (tickerEl && moon) chip(tickerEl, "Moon", "moon", moon.lon);
      if (sunEl) chip(sunEl, "Sun", "sun", lonOf(BODIES[0], now));
    }

    // Opening sequence: planets sweep in from a quarter turn back, then the aspects draw.
    svg.classList.add("is-ready");
    if (reduce) {
      renderAll(current, false);
      svg.classList.add("is-done");
    } else {
      svg.classList.add("is-intro");
      var start = performance.now(), dur = 2600;
      var ease = function (t) { return 1 - Math.pow(1 - t, 4); };
      (function frame(now) {
        var all = true;
        current.forEach(function (p, i) {
          var t = Math.min(1, Math.max(0, (now - start - 500 - i * 90) / dur));
          if (t < 1) all = false;
          var e = ease(t);
          var from = shown[p.key] - 140;
          place(p, from + 140 * e, Math.min(1, t * 2.5));
        });
        if (!all) requestAnimationFrame(frame);
        else {
          drawAspects(current, true);
          svg.classList.add("is-done");
        }
      })(start);
    }
    updateClock(new Date(), current[1]);

    // Live: the Moon and the clock tick every second, everything is recalculated every 30 s.
    var lastFull = Date.now();
    setInterval(function () {
      var now = new Date();
      var moon = current[1];
      moon.lon = lonOf(BODIES[1], now);
      if (Date.now() - lastFull > 30000) {
        lastFull = Date.now();
        current = positions(now);
        if (svg.classList.contains("is-done")) renderAll(current, false);
      } else if (svg.classList.contains("is-done")) {
        place(moon, spread(current, 8.5).moon);
      }
      updateClock(now, current[1]);
    }, 1000);
  }

  /* ---------- starfield ---------- */
  function initStars() {
    var cv = document.getElementById("stars");
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d");
    var stars = [], w = 0, h = 0, dpr = 1, shoot = null, nextShoot = performance.now() + 6000;
    var tints = ["255,255,255", "255,232,190", "214,204,255", "200,220,255"];
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(520, Math.round(w * h / 2600));
      stars = [];
      for (var i = 0; i < n; i++) {
        var depth = Math.random();
        stars.push({
          x: Math.random() * w, y: Math.random() * h * 1.6,
          r: 0.3 + Math.pow(Math.random(), 3) * 1.4,
          a: 0.25 + Math.random() * 0.65,
          sp: 0.4 + Math.random() * 1.6, ph: Math.random() * 6.3,
          depth: 0.03 + depth * 0.12,
          c: tints[Math.random() < 0.82 ? 0 : 1 + Math.floor(Math.random() * 3)]
        });
      }
      if (reduce) draw(0);
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      var sy = window.scrollY || 0, H = h * 1.6;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var y = ((s.y - sy * s.depth) % H + H) % H;
        if (y > h + 2) continue;
        var tw = reduce ? 1 : 0.6 + 0.4 * Math.sin(t / 1000 * s.sp + s.ph);
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = "rgb(" + s.c + ")";
        ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, 6.2832); ctx.fill();
      }
      if (shoot) {
        var k = (t - shoot.t0) / 900;
        if (k >= 1) shoot = null;
        else {
          var hx = shoot.x + shoot.dx * k, hy = shoot.y + shoot.dy * k;
          var grd = ctx.createLinearGradient(hx, hy, hx - shoot.dx * 0.25, hy - shoot.dy * 0.25);
          grd.addColorStop(0, "rgba(255,236,200," + (0.85 * (1 - k)) + ")");
          grd.addColorStop(1, "rgba(255,236,200,0)");
          ctx.globalAlpha = 1; ctx.strokeStyle = grd; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - shoot.dx * 0.25, hy - shoot.dy * 0.25); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) {
      if (!document.hidden) {
        if (!shoot && t > nextShoot) {
          shoot = { t0: t, x: Math.random() * w * 0.8 + w * 0.1, y: Math.random() * h * 0.35, dx: 260 + Math.random() * 180, dy: 90 + Math.random() * 80 };
          if (Math.random() < 0.5) shoot.dx = -shoot.dx;
          nextShoot = t + 9000 + Math.random() * 9000;
        }
        draw(t);
      }
      requestAnimationFrame(loop);
    }
    window.addEventListener("resize", resize);
    resize();
    if (!reduce) requestAnimationFrame(loop);
    else window.addEventListener("scroll", function () { draw(0); }, { passive: true });
  }

  function boot() { initStars(); initSky(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
