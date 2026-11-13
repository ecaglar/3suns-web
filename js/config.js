/*
  3suns website settings. This is the only file to edit for a new release.

  downloads: full https links to each installer. Leave a link empty ("") and the
  button still shows, but a click explains that the file is not online yet.

  The installers live in the Releases of the public repository ecaglar/3suns-web:
    macArm:   "https://github.com/ecaglar/3suns-web/releases/download/v0.5.1/3suns_0.5.1_aarch64.dmg",
    macIntel: "https://github.com/ecaglar/3suns-web/releases/download/v0.5.1/3suns_0.5.1_x64.dmg",
    windows:  "https://github.com/ecaglar/3suns-web/releases/download/v0.5.1/3suns_0.5.1_x64-setup.exe",
*/
window.THREESUNS = {
  version: "0.5.1",
  downloads: {
    macArm: "https://github.com/ecaglar/3suns-web/releases/download/v0.5.1/3suns_0.5.1_aarch64.dmg",
    macIntel: "https://github.com/ecaglar/3suns-web/releases/download/v0.5.1/3suns_0.5.1_x64.dmg",
    windows: "https://github.com/ecaglar/3suns-web/releases/download/v0.5.1/3suns_0.5.1_x64-setup.exe"
  },
  sizes: {
    macArm: "93 MB",
    macIntel: "96 MB",
    windows: "62 MB"
  },
  // Optional contact address, shown in the footer when filled in, e.g. "hello@3suns.app".
  contactEmail: ""
};
