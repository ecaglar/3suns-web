/* 3suns website: downloads, reveals, and the depth effects (hero tilt, the assembling workspace,
   the ring of chart wheels, the feature tour, the wall of screens and the report fan). */
(function () {
  "use strict";
  var CFG = window.THREESUNS || { version: "", downloads: {}, sizes: {} };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(function () { t.classList.add("on"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("on"); setTimeout(function () { t.hidden = true; }, 300); }, 4200);
  }

  /* ---------- version, sizes, contact ---------- */
  $$("[data-version]").forEach(function (e) { if (CFG.version) e.textContent = CFG.version; });
  $$("[data-size]").forEach(function (e) { var v = CFG.sizes && CFG.sizes[e.getAttribute("data-size")]; if (v) e.textContent = v; });
  if (CFG.contactEmail) {
    $$("[data-contact]").forEach(function (a) { a.textContent = CFG.contactEmail; a.href = "mailto:" + CFG.contactEmail; });
    var fc = $(".foot-contact"); if (fc) fc.hidden = false;
    $$(".needs-contact").forEach(function (e) { e.hidden = false; });
  }

  /* ---------- which computer is this? ---------- */
  var ua = navigator.userAgent || "";
  var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
  var isIPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isMobile = /iPhone|Android/.test(ua) || isIPad;
  var os = isMobile ? "other" : /Mac/i.test(platform) || /Macintosh/.test(ua) ? "mac" : /Win/i.test(platform) || /Windows/.test(ua) ? "windows" : "other";

  function dlKey(k) { return k === "auto" ? (os === "windows" ? "windows" : os === "mac" ? "macArm" : null) : k; }

  function wireDownloads() {
    $$("[data-dl]").forEach(function (a) {
      var key = dlKey(a.getAttribute("data-dl"));
      if (key === "none") return;
      var url = key && CFG.downloads ? CFG.downloads[key] : "";
      if (url) {
        a.href = url;
        a.removeAttribute("target");
        a.setAttribute("rel", "noopener");
      } else if (key) {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          toast(key === "source" ? "The source code download is not online yet. Please check back shortly." : "This download is not online yet. Please check back shortly.");
        });
      }
    });
  }

  function heroButtons() {
    // A website cannot tell which chip a Mac has, so there is no guess: the Mac group offers both builds and
    // recommends Apple chip. Only a Windows visitor (which the browser does report) gets the Windows button in gold.
    var gold = os === "windows" ? "windows" : "macArm";
    var names = { macArm: "a Mac with an Apple chip", macIntel: "a Mac with an Intel processor", windows: "Windows 10 and 11" };
    $$(".inst").forEach(function (a) {
      var k = a.getAttribute("data-dl");
      a.classList.toggle("is-you", k === gold);
      a.setAttribute("aria-label", "Download 3suns " + (CFG.version || "") + " for " + (names[k] || k));
    });
    var card = $('.dl-card[data-os="' + os + '"]');
    if (card) card.classList.add("is-you");
  }
  heroButtons();
  wireDownloads();

  /* ---------- glyphs in the speculum table ---------- */
  $$(".gl[data-glyph]").forEach(function (e) { if (window.inlineGlyph) e.innerHTML = window.inlineGlyph(e.getAttribute("data-glyph"), e.classList.contains("s") ? 12 : 14); });

  /* ---------- nav shadow ---------- */
  var nav = $("#nav");
  function onScrollNav() { if (nav) nav.classList.toggle("scrolled", (window.scrollY || 0) > 8); }

  /* ---------- reveals: content starts visible, then swings up out of the depth ---------- */
  var io = "IntersectionObserver" in window && !reduce ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var t = en.target;
      t.classList.add("in");
      io.unobserve(t);
      // afterwards drop both classes so an element's own transform (a pointer tilt) applies again
      setTimeout(function () { t.classList.remove("pre", "in"); }, 1100);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }) : null;
  if (io) {
    var vh0 = window.innerHeight;
    $$(".reveal").forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.top < vh0 * 0.92) return; // already on screen: leave it as is
      e.classList.add("pre");
      io.observe(e);
    });
  }

  /* ---------- count-up figures ---------- */
  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-to")), dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var t0 = performance.now(), dur = 1400;
    (function f(now) {
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(f); else el.textContent = to.toFixed(dec);
    })(t0);
  }
  if (!reduce) {
    var counted = false, specs = $(".specs");
    if (specs && "IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !counted) { counted = true; $$(".count", specs).forEach(countUp); cio.disconnect(); }
      }, { threshold: 0.4 });
      cio.observe(specs);
    }
  }

  /* ---------- the live sky wheel tilts with the pointer ---------- */
  var tiltEl = $("#sky-tilt"), hero = $("#live");
  if (tiltEl && hero) {
    var BASE = { rx: 16, ry: -18 };
    var cur = reduce ? { rx: BASE.rx, ry: BASE.ry } : { rx: 62, ry: -46 };
    var mx = 0, my = 0, heroOn = true, heroLoop = false;
    var setTilt = function () {
      tiltEl.style.setProperty("--rx", cur.rx.toFixed(2) + "deg");
      tiltEl.style.setProperty("--ry", cur.ry.toFixed(2) + "deg");
    };
    setTilt();
    var heroFrame = function (t) {
      if (!heroOn) { heroLoop = false; return; }
      var trx = BASE.rx - my * 10 + Math.sin(t / 2600) * 2.2;
      var tryy = BASE.ry + mx * 16 + Math.cos(t / 3400) * 3.2;
      cur.rx += (trx - cur.rx) * 0.055; cur.ry += (tryy - cur.ry) * 0.055;
      setTilt();
      requestAnimationFrame(heroFrame);
    };
    if (!reduce) {
      if (fine) {
        hero.addEventListener("pointermove", function (e) {
          var r = tiltEl.getBoundingClientRect();
          mx = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2), -1, 1);
          my = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2), -1, 1);
        }, { passive: true });
        hero.addEventListener("pointerleave", function () { mx = 0; my = 0; });
      }
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
          heroOn = en[0].isIntersecting;
          if (heroOn && !heroLoop) { heroLoop = true; requestAnimationFrame(heroFrame); }
        }, { threshold: 0 }).observe(hero);
      } else { heroLoop = true; requestAnimationFrame(heroFrame); }
    }
  }
  var suns = $(".suns");
  if (suns && !reduce && fine) {
    window.addEventListener("pointermove", function (e) {
      suns.style.setProperty("--mx", (e.clientX / window.innerWidth - 0.5).toFixed(3));
      suns.style.setProperty("--my", (e.clientY / window.innerHeight - 0.5).toFixed(3));
    }, { passive: true });
  }

  /* ---------- pointer tilt for cards and scenes ---------- */
  if (!reduce && fine) {
    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--tx", clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1).toFixed(3));
        el.style.setProperty("--ty", clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1).toFixed(3));
      }, { passive: true });
      el.addEventListener("pointerleave", function () { el.style.setProperty("--tx", "0"); el.style.setProperty("--ty", "0"); });
    });
  }

  /* ---------- pinned scenes: floating layers settle into one piece as you scroll ---------- */
  var noPin = window.innerHeight > Math.max(screen.width || 0, screen.height || 0) * 1.6;
  if (noPin) document.documentElement.classList.add("no-pin");
  // a layer is a cut-out of one 1600 x 1000 screenshot: data-rect = x,y,w,h
  function cutLayer(l) {
    var r = l.getAttribute("data-rect").split(",").map(Number), x = r[0], y = r[1], w = r[2], h = r[3];
    l.style.left = (x / 16) + "%"; l.style.top = (y / 10) + "%";
    l.style.width = (w / 16) + "%"; l.style.height = (h / 10) + "%";
    l.style.backgroundSize = (1600 / w * 100) + "% " + (1000 / h * 100) + "%";
    l.style.backgroundPosition = (w < 1600 ? x / (1600 - w) * 100 : 0) + "% " + (h < 1000 ? y / (1000 - h) * 100 : 0) + "%";
  }
  function makeScene(sec, stage, win, layerSel, stepsSel, o) {
    if (!sec || !stage || !win) return { update: function () {}, unit: function () {} };
    var ls = $$(layerSel, win), st = $$(stepsSel);
    ls.forEach(function (l) {
      if (l.hasAttribute("data-rect")) cutLayer(l);
      l.style.setProperty("--z", l.getAttribute("data-z"));
      l._d = parseFloat(l.getAttribute("data-d")) || 0;
      l._s = l.getAttribute("data-step");
    });
    return {
      unit: function () { win.style.setProperty("--u", (win.offsetWidth / 100).toFixed(2) + "px"); },
      update: function () {
        var t = 1;
        if (!reduce && !noPin) {
          var r = sec.getBoundingClientRect(), total = Math.max(1, r.height - window.innerHeight);
          t = clamp(-r.top / total, 0, 1);
        }
        var a = clamp((t - o.start) / o.span, 0, 1);
        // the whole piece lies back in space, and straightens between o.tilt[0] and o.tilt[1]
        stage.style.setProperty("--e", (1 - easeInOut(clamp((a - o.tilt[0]) / (o.tilt[1] - o.tilt[0]), 0, 1))).toFixed(4));
        var landed = [];
        ls.forEach(function (l) {
          var q = clamp((a - o.lead - l._d * o.spread) / o.land, 0, 1);
          l.style.setProperty("--k", (1 - easeInOut(q)).toFixed(4));
          if (l._s !== null && q > 0.5) landed[+l._s] = 1;
          if (o.mark) l.classList.toggle("is-new", q > 0.03 && q < 0.97);
        });
        st.forEach(function (x, i) { x.classList.toggle("on", !!landed[i]); });
        sec.classList.toggle("done", a >= 0.995);
        if (o.onT) o.onT(t);
      }
    };
  }
  var ex = $("#top"), xstage = $("#x-stage"), hxCopy = $("#hx-copy");
  var heroScene = makeScene(ex, xstage, $("#x-win"), ".x-layer", "#x-steps li", {
    start: 0.1, span: 0.7, tilt: [0, 1], lead: 0.14, spread: 0.7, land: 0.6,
    onT: function (t) {
      var p = easeInOut(clamp(t / 0.2, 0, 1));
      ex.style.setProperty("--p", p.toFixed(4));
      ex.classList.toggle("copy-off", p > 0.55);
    }
  });
  var layerScene = makeScene($("#charts"), $("#l-stage"), $("#l-win"), ".l-layer", "#l-steps li", {
    start: 0.03, span: 0.85, tilt: [0.74, 1], lead: 0.03, spread: 1, land: 0.2, mark: true
  });
  // where the product sits while the hero copy is on screen: beside it on a wide window, below it on a narrow one
  function pageX(el) { var x = 0; while (el) { x += el.offsetLeft; el = el.offsetParent; } return x; }
  function heroPlace() {
    if (!ex || !xstage || !hxCopy) return;
    var sx = 0, sy = 0, ss = 0.1;
    if (window.innerWidth > 900) {
      // the exploded product is about 0.9 of the window wide: fit it between the copy and the right edge
      var W = xstage.offsetWidth, cx = pageX(xstage) + W / 2, right = window.innerWidth - 16, cr = 0;
      $$("#hx-copy > *").forEach(function (c) { cr = Math.max(cr, c.offsetLeft + c.offsetWidth); });
      var avail = right - (cr + pageX(hxCopy)) + W * 0.02;
      var s = clamp(avail / (W * 0.897), 0.7, Math.min(1.2, (window.innerHeight - 108) / (W * 0.628)));
      var left = right - W * 0.897 * s - Math.max(0, avail - W * 0.897 * s) / 2;
      sx = left + W * 0.4615 * s - cx; sy = window.innerHeight * 0.02; ss = s - 1;
    }
    else { sy = hxCopy.offsetTop + hxCopy.offsetHeight + xstage.offsetWidth * 0.13 - xstage.offsetTop; ss = 0.16; }
    ex.style.setProperty("--sx", sx.toFixed(1) + "px");
    ex.style.setProperty("--sy", sy.toFixed(1) + "px");
    ex.style.setProperty("--ss", String(ss));
  }
  function scenesUnit() { heroScene.unit(); layerScene.unit(); heroPlace(); }
  function xUpdate() { heroScene.update(); layerScene.update(); }

  /* ---------- feature tour: every window is cut into floating layers ---------- */
  var CUT = {
    base: [[0, 972, 1600, 28, 3, 0.34], [0, 0, 1600, 46, 5, 0.27], [0, 46, 76, 926, 8, 0.2], [76, 46, 300, 926, 12, 0.12]],
    plain: [[376, 46, 1224, 926, 18, 0, 1]],
    chart: [[376, 46, 864, 926, 16, 0.05, 1], [1240, 46, 360, 926, 21, 0]]
  };
  $$(".panel").forEach(function (p) {
    var win = $(".win", p), img = win && $("img", win);
    if (!img) return;
    CUT.base.concat(CUT[p.getAttribute("data-cut") || "plain"]).forEach(function (c) {
      var l = document.createElement("div");
      l.className = "wl" + (c[6] ? " main" : "");
      l.setAttribute("data-rect", c.slice(0, 4).join(","));
      cutLayer(l);
      l.style.backgroundImage = 'url("' + img.getAttribute("src") + '")';
      l.style.setProperty("--z", c[4]);
      l.style.setProperty("--d", c[5]);
      win.appendChild(l);
    });
  });
  $$("[data-theme-shot]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.getAttribute("data-theme-shot");
      $$("[data-theme-shot]").forEach(function (x) { var on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
      if (!xstage || xstage.getAttribute("data-shot") === t) return;
      var plate = $(".x-plate", xstage);
      xstage.classList.add("swap");
      setTimeout(function () {
        xstage.setAttribute("data-shot", t);
        if (plate) plate.src = "img/app-" + (t === "paper" ? "paper" : "natal") + ".webp";
        xstage.classList.remove("swap");
      }, reduce ? 0 : 230);
    });
  });
  setTimeout(function () { var i = new Image(); i.src = "img/app-paper.webp"; }, 5000);

  /* ---------- wall of screens: endless rows on a tilted plane ---------- */
  var wall = $("#wall");
  if (wall) $$(".wall-track", wall).forEach(function (t) { t.innerHTML += t.innerHTML; });
  function wallUpdate() {
    if (!wall || reduce) return;
    var r = wall.getBoundingClientRect(), vh = window.innerHeight;
    if (r.bottom < -100 || r.top > vh + 100) return;
    wall.style.setProperty("--wp", clamp((vh - r.top) / (vh + r.height), 0, 1).toFixed(3));
  }

  /* ---------- one scroll handler for everything that follows the page ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScrollNav(); xUpdate(); wallUpdate(); ticking = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { scenesUnit(); ringLayout(); onScroll(); });
  scenesUnit(); onScrollNav(); xUpdate(); wallUpdate();
  window.addEventListener("load", function () { scenesUnit(); xUpdate(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { scenesUnit(); xUpdate(); });

  /* ---------- chart types: a ring of wheels you can spin ---------- */
  var ringStage = $("#ring-stage"), ring = $("#ring"), ringCap = $("#ring-cap");
  var cards = ring ? $$(".wcard", ring) : [], N = cards.length, STEP_A = N ? 360 / N : 0;
  var angle = 0, vel = 0, target = null, dragging = false, moved = 0, lastX = 0, ringOn = false, ringLoop = false, hold = 0, front = -1, perPx = 0.2;
  function ringLayout() {
    if (!N) return;
    var w = cards[0].offsetWidth || 260;
    var R = Math.round(w * 1.1 / (2 * Math.tan(Math.PI / N)));
    perPx = 360 / (2 * Math.PI * R) * 1.25;
    ring.style.setProperty("--r", R + "px");
    cards.forEach(function (c, i) { c.style.transform = "rotateY(" + (i * STEP_A).toFixed(3) + "deg) translateZ(" + R + "px)"; });
    ringRender();
  }
  function ringRender() {
    ring.style.setProperty("--a", angle.toFixed(3) + "deg");
    cards.forEach(function (c, i) {
      var d = Math.abs((((i * STEP_A + angle) % 360) + 540) % 360 - 180); // degrees away from the front
      c.style.setProperty("--dim", Math.min(0.88, d / 96 * 0.88).toFixed(2));
      c.style.visibility = d > 100 ? "hidden" : "visible";
    });
    var f = ((Math.round(-angle / STEP_A) % N) + N) % N;
    if (f !== front) {
      front = f;
      cards.forEach(function (c, i) { c.classList.toggle("is-front", i === f); });
      if (ringCap) {
        ringCap.textContent = "";
        var b = document.createElement("b"), s = document.createElement("span");
        b.textContent = cards[f].getAttribute("data-name"); s.textContent = cards[f].getAttribute("data-desc");
        ringCap.appendChild(b); ringCap.appendChild(s);
      }
    }
  }
  function ringSnap() { target = Math.round(angle / STEP_A) * STEP_A; hold = performance.now() + 5000; }
  function ringGo(n) {
    var from = target !== null ? target : Math.round(angle / STEP_A) * STEP_A;
    target = from - n * STEP_A; vel = 0; hold = performance.now() + 8000;
    if (reduce) { angle = target; target = null; ringRender(); }
    ringStart();
  }
  function ringTick() {
    if (!ringOn) { ringLoop = false; return; }
    if (!dragging) {
      if (target !== null) {
        var d = target - angle;
        angle += d * 0.11;
        if (Math.abs(d) < 0.04) { angle = target; target = null; }
      } else if (Math.abs(vel) > 0.03) {
        angle += vel; vel *= 0.94;
        if (Math.abs(vel) <= 0.03) ringSnap();
      } else if (!reduce && performance.now() > hold) angle -= 0.075;
    }
    ringRender();
    requestAnimationFrame(ringTick);
  }
  function ringStart() { if (ringOn && !ringLoop && !reduce) { ringLoop = true; requestAnimationFrame(ringTick); } }
  if (N && ringStage) {
    ringLayout();
    ringStage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true; moved = 0; lastX = e.clientX; vel = 0; target = null;
      ringStage.classList.add("dragging");
      try { ringStage.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
    });
    ringStage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX; lastX = e.clientX;
      angle += dx * perPx; vel = dx * perPx; moved += Math.abs(dx);
      if (reduce) ringRender();
    });
    var endDrag = function (e) {
      if (!dragging) return;
      dragging = false;
      ringStage.classList.remove("dragging");
      hold = performance.now() + 6000;
      if (moved < 6 && e.type === "pointerup") {
        var hit = document.elementFromPoint(e.clientX, e.clientY);
        var card = hit && hit.closest ? hit.closest(".wcard") : null;
        var i = card ? cards.indexOf(card) : -1;
        if (i >= 0) {
          // turn the shortest way round to that card
          var want = -i * STEP_A, turns = Math.round((angle - want) / 360);
          target = want + turns * 360; vel = 0;
          if (reduce) { angle = target; target = null; ringRender(); }
          return;
        }
      }
      if (Math.abs(vel) < 0.3) { vel = 0; ringSnap(); if (reduce) { angle = target; target = null; ringRender(); } }
    };
    ringStage.addEventListener("pointerup", endDrag);
    ringStage.addEventListener("pointercancel", endDrag);
    var prev = $("#ring-prev"), next = $("#ring-next");
    if (prev) prev.addEventListener("click", function () { ringGo(-1); });
    if (next) next.addEventListener("click", function () { ringGo(1); });
    ringStage.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hold = Infinity; });
    ringStage.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hold = performance.now() + 1500; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { ringOn = en[0].isIntersecting; ringStart(); }, { threshold: 0.1 }).observe(ringStage);
    } else { ringOn = true; ringStart(); }
  }

  /* ---------- feature tour ---------- */
  var rail = $("#tour-rail");
  if (rail) {
    var tabs = $$("[role=tab]", rail);
    var idx = 0, timer = null, paused = false, visible = false, STEP = 7000;
    var select = function (i, focus) {
      idx = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, j) {
        var on = j === idx;
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) {
          if (on) { panel.hidden = false; requestAnimationFrame(function () { panel.classList.add("is-on"); }); }
          else { panel.classList.remove("is-on"); panel.hidden = true; }
        }
      });
      if (focus) tabs[idx].focus();
      // keep the active chip in view on phones, without moving the page
      var tab = tabs[idx];
      if (rail.scrollWidth > rail.clientWidth) rail.scrollTo({ left: tab.offsetLeft - rail.clientWidth / 2 + tab.offsetWidth / 2, behavior: reduce ? "auto" : "smooth" });
      restart();
    };
    var restart = function () {
      clearTimeout(timer);
      rail.classList.remove("running");
      if (reduce || paused || !visible) return;
      void rail.offsetWidth;
      rail.classList.add("running");
      timer = setTimeout(function () { select(idx + 1); }, STEP);
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { paused = true; select(i); });
      t.addEventListener("keydown", function (e) {
        var k = e.key;
        if (k === "ArrowDown" || k === "ArrowRight") { e.preventDefault(); paused = true; select(idx + 1, true); }
        else if (k === "ArrowUp" || k === "ArrowLeft") { e.preventDefault(); paused = true; select(idx - 1, true); }
        else if (k === "Home") { e.preventDefault(); paused = true; select(0, true); }
        else if (k === "End") { e.preventDefault(); paused = true; select(tabs.length - 1, true); }
      });
    });
    var tourEl = $(".tour-grid");
    tourEl.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { paused = true; restart(); } });
    tourEl.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { paused = false; restart(); } });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; restart(); }, { threshold: 0.35 }).observe(tourEl);
    }
  }

  /* ---------- report fan ---------- */
  var fan = $("#fan");
  var REPORTS = {
    natal: { pages: ["r-natal-3", "r-natal-9", "r-natal-1"], alt: "Cover of a natal report for a fictional client, branded with an astrologer's name" },
    year_ahead: { pages: ["r-year_ahead-7", "r-year_ahead-15", "r-year_ahead-1"], alt: "Cover of a Year Ahead report for a fictional client" },
    relationship: { pages: ["r-relationship-3", "r-relationship-13", "r-relationship-1"], alt: "Cover of a Relationship report for two fictional partners" }
  };
  // warm the cache so a switch never shows an empty page
  setTimeout(function () { Object.keys(REPORTS).forEach(function (k) { REPORTS[k].pages.forEach(function (p) { var i = new Image(); i.src = "img/" + p + ".webp"; }); }); }, 3500);
  $$(".rt").forEach(function (b) {
    b.addEventListener("click", function () {
      var key = b.getAttribute("data-report");
      $$(".rt").forEach(function (x) { var on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-selected", on ? "true" : "false"); });
      if (!fan || fan.getAttribute("data-report") === key) return;
      var imgs = [$(".p1", fan), $(".p3", fan), $(".p2", fan)];
      var swap = function () {
        REPORTS[key].pages.forEach(function (p, i) { imgs[i].src = "img/" + p + ".webp"; });
        imgs[2].alt = REPORTS[key].alt;
        fan.setAttribute("data-report", key);
        fan.classList.remove("closing");
      };
      if (reduce) swap();
      else { fan.classList.add("closing"); setTimeout(swap, 420); }
    });
  });
  if (fan && "IntersectionObserver" in window && !reduce) {
    fan.classList.add("folded");
    new IntersectionObserver(function (en, obs) {
      if (en[0].isIntersecting) { fan.classList.remove("folded"); obs.disconnect(); }
    }, { threshold: 0.3 }).observe(fan);
  }
})();
