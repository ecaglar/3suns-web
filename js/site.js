/* 3suns website: downloads, the Mac menu, the theme switch, the kinds of chart, the feature tour,
   the report fan and the reveals. Used by index.html and download.html; every part checks that its
   elements are on the page. */
(function () {
  "use strict";
  var CFG = window.THREESUNS || { version: "", downloads: {}, sizes: {} };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var preload = function (src) { var i = new Image(); i.src = src; };

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
    $$(".needs-contact").forEach(function (e) { e.hidden = false; });
  }

  /* ---------- which computer is this? ---------- */
  var ua = navigator.userAgent || "";
  var platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
  var isIPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isMobile = /iPhone|Android/.test(ua) || isIPad;
  var os = isMobile ? "other" : /Mac/i.test(platform) || /Macintosh/.test(ua) ? "mac" : /Win/i.test(platform) || /Windows/.test(ua) ? "windows" : "other";

  function wireDownloads() {
    $$("[data-dl]").forEach(function (a) {
      var key = a.getAttribute("data-dl");
      var url = CFG.downloads ? CFG.downloads[key] : "";
      if (url) {
        a.href = url;
        a.removeAttribute("target");
        a.setAttribute("rel", "noopener");
      } else {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          toast("This download is not online yet. Please check back shortly.");
        });
      }
    });
  }

  function systemButtons() {
    // A website cannot tell which chip a Mac has, so nothing is guessed: the Mac button downloads the Apple Silicon
    // build and its arrow lists both builds. Only Windows (which the browser does report) moves the filled button.
    var win = os === "windows", inst = $("#install"), mac = $("#inst-mac"), wbtn = $('#install > .inst[data-dl="windows"]');
    if (inst) inst.classList.toggle("win-first", win);
    if (mac) mac.classList.toggle("is-you", !win);
    if (wbtn) wbtn.classList.toggle("is-you", win);
    // the pair of buttons in the closing band: the visitor's system first and in gold
    if (win) $$(".dl-pair").forEach(function (p) {
      var m = $(".dl-mac", p), w = $(".dl-win", p);
      if (!m || !w) return;
      m.classList.remove("btn-gold"); m.classList.add("btn-ghost");
      w.classList.remove("btn-ghost"); w.classList.add("btn-gold");
      p.insertBefore(w, m);
    });
    var card = $('.dl-card[data-os="' + os + '"]');
    if (card) card.classList.add("is-you");
  }
  systemButtons();
  wireDownloads();

  /* ---------- the arrow on the Mac button: a small menu with both Mac builds ---------- */
  var macSplit = $("#inst-mac"), macMore = $("#inst-more"), macList = $("#inst-menu");
  function macMenu(on, focusFirst) {
    if (!macSplit || !macMore || !macList || macList.hidden === !on) return;
    macList.hidden = !on;
    macMore.setAttribute("aria-expanded", on ? "true" : "false");
    macSplit.classList.toggle("open", on);
    if (on && focusFirst) { var f = $("a", macList); if (f) f.focus(); }
  }
  if (macSplit && macMore && macList) {
    macMore.addEventListener("click", function (e) { macMenu(macList.hidden, e.detail === 0); });
    document.addEventListener("click", function (e) { if (!macSplit.contains(e.target)) macMenu(false); });
    macSplit.addEventListener("keydown", function (e) {
      var items = $$("a", macList), i = items.indexOf(document.activeElement);
      if (e.key === "Escape" && !macList.hidden) { macMenu(false); macMore.focus(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (e.target !== macMore && i < 0) return;
        e.preventDefault();
        macMenu(true);
        var n = i < 0 ? (e.key === "ArrowDown" ? 0 : items.length - 1) : (i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
        items[n].focus();
      }
    });
    $$("a", macList).forEach(function (a) { a.addEventListener("click", function () { macMenu(false); }); });
    macSplit.addEventListener("focusout", function (e) { if (e.relatedTarget && !macSplit.contains(e.relatedTarget)) macMenu(false); });
  }

  /* ---------- glyphs in the speculum table ---------- */
  $$(".gl[data-glyph]").forEach(function (e) { if (window.inlineGlyph) e.innerHTML = window.inlineGlyph(e.getAttribute("data-glyph"), e.classList.contains("s") ? 12 : 14); });

  /* ---------- the bar gets a paper background once the page has moved ---------- */
  var nav = $("#nav"), ticking = false;
  function onScrollNav() { if (nav) nav.classList.toggle("scrolled", (window.scrollY || 0) > 8); }
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScrollNav(); if ((window.scrollY || 0) > 200) macMenu(false); ticking = false; });
  }, { passive: true });
  onScrollNav();

  /* ---------- reveals: content starts visible; what is below the fold rises in once ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        t.classList.add("in");
        io.unobserve(t);
        setTimeout(function () { t.classList.remove("pre", "in"); }, 900);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    var vh0 = window.innerHeight;
    $$(".reveal").forEach(function (e) {
      if (e.getBoundingClientRect().top < vh0 * 0.92) return; // already on screen: leave it as is
      e.classList.add("pre");
      io.observe(e);
    });
  }

  /* ---------- workspace: the same window in the Night or the Paper theme ---------- */
  var shot = $("#shot"), shotName = $("#shot-theme");
  $$("[data-theme-shot]").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.getAttribute("data-theme-shot");
      $$("[data-theme-shot]").forEach(function (x) { var on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
      if (!shot || shot.getAttribute("data-shot") === t) return;
      var win = shot.parentNode;
      win.classList.add("swap");
      setTimeout(function () {
        shot.setAttribute("data-shot", t);
        shot.src = "img/app-" + (t === "paper" ? "paper" : "natal") + ".webp";
        if (shotName) shotName.textContent = t === "paper" ? "Paper" : "Night";
        win.classList.remove("swap");
      }, reduce ? 0 : 200);
    });
  });
  if (shot) setTimeout(function () { preload("img/app-paper.webp"); }, 5000);

  /* ---------- kinds of chart: one wheel, switched by the buttons beside it ---------- */
  var kindFig = $("#kind-fig");
  if (kindFig) {
    var kindImg = $("img", kindFig), kindBtns = $$(".kind-btn");
    var warm = function () { kindBtns.forEach(function (b) { preload("img/" + b.getAttribute("data-img") + ".webp"); }); warm = function () {}; };
    kindBtns.forEach(function (b) {
      b.addEventListener("pointerenter", function () { warm(); });
      b.addEventListener("focus", function () { warm(); });
      b.addEventListener("click", function () {
        if (b.getAttribute("aria-pressed") === "true") return;
        kindBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        kindFig.classList.add("swap");
        setTimeout(function () {
          kindImg.src = "img/" + b.getAttribute("data-img") + ".webp";
          kindImg.alt = b.getAttribute("data-alt");
          $(".kind-tag", kindFig).textContent = b.getAttribute("data-tag");
          $(".kind-name", kindFig).textContent = b.textContent;
          $(".kind-desc", kindFig).textContent = b.getAttribute("data-desc");
          kindFig.classList.remove("swap");
        }, reduce ? 0 : 200);
      });
    });
  }

  /* ---------- feature tour ---------- */
  var rail = $("#tour-rail");
  if (rail) {
    var tabs = $$("[role=tab]", rail), idx = 0;
    var panelOf = function (t) { return document.getElementById(t.getAttribute("aria-controls")); };
    var select = function (i, focus) {
      idx = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, j) {
        var on = j === idx, panel = panelOf(t);
        t.classList.toggle("is-on", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (panel) { panel.hidden = !on; panel.classList.toggle("is-on", on); }
      });
      if (focus) tabs[idx].focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      // fetch a feature's window as soon as the pointer is over its name
      t.addEventListener("pointerenter", function () { var p = panelOf(t); $$("img", p).forEach(function (im) { preload(im.getAttribute("src")); }); });
      t.addEventListener("keydown", function (e) {
        var k = e.key;
        if (k === "ArrowDown" || k === "ArrowRight") { e.preventDefault(); select(idx + 1, true); }
        else if (k === "ArrowUp" || k === "ArrowLeft") { e.preventDefault(); select(idx - 1, true); }
        else if (k === "Home") { e.preventDefault(); select(0, true); }
        else if (k === "End") { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });
  }

  /* ---------- report fan ---------- */
  var fan = $("#fan");
  var REPORTS = {
    natal: { pages: ["r-natal-3", "r-natal-9", "r-natal-1"], alt: "Cover of a natal report for a fictional client, branded with an astrologer's name" },
    year_ahead: { pages: ["r-year_ahead-7", "r-year_ahead-15", "r-year_ahead-1"], alt: "Cover of a Year Ahead report for a fictional client" },
    relationship: { pages: ["r-relationship-3", "r-relationship-13", "r-relationship-1"], alt: "Cover of a Relationship report for two fictional partners" }
  };
  if (fan) {
    var warmReports = function () { Object.keys(REPORTS).forEach(function (k) { REPORTS[k].pages.forEach(function (p) { preload("img/" + p + ".webp"); }); }); warmReports = function () {}; };
    $$(".rt").forEach(function (b) {
      b.addEventListener("pointerenter", function () { warmReports(); });
      b.addEventListener("focus", function () { warmReports(); });
      b.addEventListener("click", function () {
        var key = b.getAttribute("data-report");
        $$(".rt").forEach(function (x) { var on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
        if (fan.getAttribute("data-report") === key) return;
        var imgs = [$(".p1", fan), $(".p3", fan), $(".p2", fan)];
        var swap = function () {
          REPORTS[key].pages.forEach(function (p, i) { imgs[i].src = "img/" + p + ".webp"; });
          imgs[2].alt = REPORTS[key].alt;
          fan.setAttribute("data-report", key);
          fan.classList.remove("closing");
        };
        if (reduce) swap();
        else { fan.classList.add("closing"); setTimeout(swap, 380); }
      });
    });
    // the pages fan out the first time they come into view
    if ("IntersectionObserver" in window && !reduce) {
      fan.classList.add("folded");
      new IntersectionObserver(function (en, obs) {
        if (en[0].isIntersecting) { fan.classList.remove("folded"); obs.disconnect(); }
      }, { threshold: 0.3 }).observe(fan);
    }
  }
})();
