/* 3suns website: visitor analytics with PostHog.
   Runs only on 3suns.app and only when js/config.js has a project key. It keeps no cookies: the visit is
   remembered in the tab's session storage, so a visitor is followed from page to page within one visit only.
   Recorded: page views and page leaves (with how far the page was read), clicks through autocapture, and a
   "download_clicked" event for every installer link, with the installer, where on the site it was clicked and
   the version on offer.
   A visitor can turn analytics off for their browser on the privacy page (#analytics-choice): the choice is kept
   in local storage under "3suns.analytics" = "off", and then PostHog is not even loaded. */
(function () {
  "use strict";
  var site = window.THREESUNS || {};
  var cfg = site.analytics || {};
  var OFF_KEY = "3suns.analytics";
  function isOff() { try { return localStorage.getItem(OFF_KEY) === "off"; } catch (e) { return false; } }

  /* the switch on the privacy page */
  function wireChoice() {
    var box = document.getElementById("analytics-choice");
    if (!box) return;
    var state = box.querySelector("[data-analytics-state]"), btn = box.querySelector("[data-analytics-toggle]");
    var active = !!cfg.posthogKey && (/(^|\.)3suns\.app$/.test(location.hostname) || !!cfg.anyHost);
    function show() {
      var off = isOff();
      state.textContent = !active ? "Analytics does not run on this copy of the site." :
        off ? "Analytics is off in this browser. Nothing is sent to PostHog." : "Analytics is on in this browser.";
      btn.textContent = off ? "Turn analytics back on" : "Turn off analytics";
      btn.hidden = !active;
    }
    btn.addEventListener("click", function () {
      var ph = window.posthog;
      try {
        if (isOff()) {
          localStorage.removeItem(OFF_KEY);
          localStorage.removeItem("__ph_opt_in_out_" + cfg.posthogKey);
        } else {
          localStorage.setItem(OFF_KEY, "off");
          if (ph && ph.opt_out_capturing) ph.opt_out_capturing();
        }
      } catch (e) { /* storage blocked: then nothing persists, and analytics stays as it was */ }
      show();
    });
    show();
    box.hidden = false;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wireChoice); else wireChoice();

  if (!cfg.posthogKey) return;
  if (!/(^|\.)3suns\.app$/.test(location.hostname) && !cfg.anyHost) return;   // not on previews or a laptop
  if (isOff()) return;                                                         // the visitor turned it off

  var apiHost = cfg.proxy ? location.origin + cfg.proxy : (cfg.apiHost || "https://us.i.posthog.com");

  /* the PostHog loader: a stub that queues calls until the library from <apiHost>/static/array.js arrives */
  (function (doc, ph) {
    if (ph.__SV) return;
    window.posthog = ph;
    ph._i = [];
    ph.init = function (key, opts, name) {
      function stub(target, method) {
        var parts = method.split(".");
        if (parts.length === 2) { target = target[parts[0]]; method = parts[1]; }
        target[method] = function () { target.push([method].concat(Array.prototype.slice.call(arguments, 0))); };
      }
      var s = doc.createElement("script");
      s.type = "text/javascript";
      s.crossOrigin = "anonymous";
      s.async = true;
      s.src = opts.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
      var first = doc.getElementsByTagName("script")[0];
      first.parentNode.insertBefore(s, first);
      var inst = ph;
      if (name !== undefined) inst = ph[name] = []; else name = "posthog";
      inst.people = inst.people || [];
      inst.toString = function (noStub) { var n = "posthog"; if (name !== "posthog") n += "." + name; if (!noStub) n += " (stub)"; return n; };
      inst.people.toString = function () { return inst.toString(1) + ".people (stub)"; };
      ("capture register register_once register_for_session unregister unregister_for_session identify " +
       "setPersonProperties reset get_distinct_id get_session_id get_property getSessionProperty " +
       "opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing " +
       "startSessionRecording stopSessionRecording onFeatureFlags getFeatureFlag isFeatureEnabled debug").split(" ")
        .forEach(function (m) { stub(inst, m); });
      ph._i.push([key, opts, name]);
    };
    ph.__SV = 1;
  })(document, window.posthog || []);

  window.posthog.init(cfg.posthogKey, {
    api_host: apiHost,
    ui_host: cfg.uiHost || "https://us.posthog.com",
    persistence: "sessionStorage",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true
  });
  window.posthog.register({ offered_version: site.version || "", page: location.pathname === "/" ? "home" : location.pathname.replace(/^\/|\.html$/g, "") });

  /* every installer link carries data-dl="macArm" | "macIntel" | "windows" */
  var PLATFORM = { macArm: ["mac", "apple_silicon"], macIntel: ["mac", "intel"], windows: ["windows", null] };
  function placement(a) {
    if (a.closest("#inst-menu")) return "hero_mac_menu";
    if (a.closest("#install")) return "hero";
    if (a.closest(".closing-row")) return "closing";
    if (a.closest(".dl-top, .dl-card")) return "download_page";
    var sec = a.closest("section[id]");
    return sec ? sec.id : "other";
  }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-dl]") : null;
    if (!a) return;
    var key = a.getAttribute("data-dl"), p = PLATFORM[key] || [key, null];
    window.posthog.capture("download_clicked", {
      installer: key,
      platform: p[0],
      mac_chip: p[1],
      placement: placement(a),
      version: site.version || "",
      file_url: a.href
    }, { transport: "sendBeacon", send_instantly: true });
  }, true);
})();
