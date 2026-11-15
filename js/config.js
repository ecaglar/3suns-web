/*
  3suns website settings. This is the only file to edit for a new release.

  downloads: full https links to each installer. Leave a link empty ("") and the
  button still shows, but a click explains that the file is not online yet.

  The installers live in the Releases of the public repository ecaglar/3suns-web:
    macArm:   "https://github.com/ecaglar/3suns-web/releases/download/v0.5.2/3suns_0.5.2_aarch64.dmg",
    macIntel: "https://github.com/ecaglar/3suns-web/releases/download/v0.5.2/3suns_0.5.2_x64.dmg",
    windows:  "https://github.com/ecaglar/3suns-web/releases/download/v0.5.2/3suns_0.5.2_x64-setup.exe",
*/
window.THREESUNS = {
  version: "0.5.2",
  downloads: {
    macArm: "https://github.com/ecaglar/3suns-web/releases/download/v0.5.2/3suns_0.5.2_aarch64.dmg",
    macIntel: "https://github.com/ecaglar/3suns-web/releases/download/v0.5.2/3suns_0.5.2_x64.dmg",
    windows: "https://github.com/ecaglar/3suns-web/releases/download/v0.5.2/3suns_0.5.2_x64-setup.exe"
  },
  sizes: {
    macArm: "93 MB",
    macIntel: "96 MB",
    windows: "62 MB"
  },
  // Optional contact address, shown in the footer when filled in, e.g. "hello@3suns.app".
  contactEmail: "hello@karia.cc",
  // Visitor analytics with PostHog (project "3suns" in the Karia LLC organization). The project key is
  // public by design. Leave posthogKey empty to switch analytics off. Requests go through /ingest on
  // this site (functions/ingest), so blockers that stop posthog.com do not hide visitors.
  analytics: {
    posthogKey: "phc_veMcMmguSYBRYJRNwJqx2SXzehxxvPZQHtbn5wyVsCDb",
    proxy: "/ingest",
    uiHost: "https://us.posthog.com"
  }
};
