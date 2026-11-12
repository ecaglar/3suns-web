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
  var macArch = "arm";
  function guessMacArch() {
    try {
      var c = document.createElement("canvas");
      var gl = c.getContext("webgl") || c.getContext("experimental-webgl");
      var ext = gl && gl.getExtension("WEBGL_debug_renderer_info");
      var r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
      if (/Intel|AMD|Radeon|NVIDIA/i.test(r)) macArch = "intel";
    } catch (e) { /* keep Apple Silicon */ }
  }
  if (os === "mac") guessMacArch();

  function dlKey(k) { return k === "auto" ? (os === "windows" ? "windows" : os === "mac" ? (macArch === "intel" ? "macIntel" : "macArm") : null) : k; }

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
    var p = $("#cta-primary");
    if (!p) return;
    var main = $(".cta-main", p), sub = $(".cta-sub", p);
    var v = CFG.version ? "version " + CFG.version : "";
    if (os === "mac") {
      main.textContent = "Download for Mac";
      sub.textContent = (macArch === "intel" ? "Intel" : "Apple Silicon") + " · " + v;
    } else if (os === "windows") {
      main.textContent = "Download for Windows";
      sub.textContent = "64-bit installer · " + v;
    } else {
      p.setAttribute("data-dl", "none");
      p.href = "#download";
      main.textContent = "Download 3suns";
      sub.textContent = "for Mac and Windows · " + v;
    }
    var card = $('.dl-card[data-os="' + os + '"]');
    if (card) card.classList.add("is-you");
    if (os === "mac") {
      var pri = $('.dl-card[data-os="mac"] [data-dl="' + (macArch === "intel" ? "macIntel" : "macArm") + '"]');
      var other = $('.dl-card[data-os="mac"] [data-dl="' + (macArch === "intel" ? "macArm" : "macIntel") + '"]');
      if (pri && other) { pri.className = "btn btn-gold dl-btn"; other.className = "btn btn-ghost dl-btn"; pri.parentNode.insertBefore(pri, other); }
    }
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

  /* ---------- hero: the sky wheel tilts with the pointer and lies back as you scroll ---------- */
  var tiltEl = $("#sky-tilt"), hero = $(".hero");
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
      var sc = clamp((window.scrollY || 0) / 700, 0, 1);
      var trx = BASE.rx - my * 10 + Math.sin(t / 2600) * 2.2 + sc * 24;
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

  /* ---------- workspace: floating layers settle into one window as you scroll ---------- */
  var ex = $("#app"), xstage = $("#x-stage"), xwin = $("#x-win");
  var noPin = window.innerHeight > Math.max(screen.width || 0, screen.height || 0) * 1.6;
  if (noPin) document.documentElement.classList.add("no-pin");
  var layers = xwin ? $$(".x-layer", xwin) : [], steps = $$("#x-steps li");
  layers.forEach(function (l) {
    var r = l.getAttribute("data-rect").split(",").map(Number), x = r[0], y = r[1], w = r[2], h = r[3];
    l.style.left = (x / 16) + "%"; l.style.top = (y / 10) + "%";
    l.style.width = (w / 16) + "%"; l.style.height = (h / 10) + "%";
    l.style.backgroundSize = (1600 / w * 100) + "% " + (1000 / h * 100) + "%";
    l.style.backgroundPosition = (w < 1600 ? x / (1600 - w) * 100 : 0) + "% " + (h < 1000 ? y / (1000 - h) * 100 : 0) + "%";
    l.style.setProperty("--z", l.getAttribute("data-z"));
    l._d = parseFloat(l.getAttribute("data-d")) || 0;
    l._s = l.getAttribute("data-step");
  });
  function xUnit() { if (xwin) xwin.style.setProperty("--u", (xwin.offsetWidth / 100).toFixed(2) + "px"); }
  function xUpdate() {
    if (!ex || !xstage) return;
    var a = 1;
    if (!reduce && !noPin) {
      var r = ex.getBoundingClientRect(), total = Math.max(1, r.height - window.innerHeight);
      a = clamp(clamp(-r.top / total, 0, 1) / 0.8, 0, 1);
    }
    xstage.style.setProperty("--e", (1 - easeInOut(a)).toFixed(4));
    var landed = [0, 0, 0, 0];
    layers.forEach(function (l) {
      var q = clamp((a - 0.14 - l._d * 0.7) / 0.6, 0, 1);
      l.style.setProperty("--k", (1 - easeInOut(q)).toFixed(4));
      if (l._s !== null && q > 0.5) landed[+l._s] = 1;
    });
    steps.forEach(function (s, i) { s.classList.toggle("on", !!landed[i]); });
    ex.classList.toggle("done", a >= 0.995);
  }
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
  window.addEventListener("resize", function () { xUnit(); ringLayout(); onScroll(); });
  xUnit(); onScrollNav(); xUpdate(); wallUpdate();

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
