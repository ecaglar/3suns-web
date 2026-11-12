/*
  3suns website settings. This is the only file to edit for a new release.

  downloads: full https links to each installer. Leave a link empty ("") and the
  button still shows, but a click explains that the file is not online yet.

  The installers live in the Releases of the public repository ecaglar/3suns-web:
    macArm:   "https://github.com/ecaglar/3suns-web/releases/download/v0.4.1/3suns_0.4.1_aarch64.dmg",
    macIntel: "https://github.com/ecaglar/3suns-web/releases/download/v0.4.1/3suns_0.4.1_x64.dmg",
    windows:  "https://github.com/ecaglar/3suns-web/releases/download/v0.4.1/3suns_0.4.1_x64-setup.exe",
    source:   "https://github.com/ecaglar/3suns-web/releases/download/v0.4.1/3suns-source.zip",
*/
window.THREESUNS = {
  version: "0.4.1",
  downloads: {
    macArm: "",
    macIntel: "",
    windows: "",
    source: ""
  },
  sizes: {
    macArm: "about 90 MB",
    macIntel: "about 90 MB",
    windows: "62 MB"
  },
  // Optional contact address, shown in the footer when filled in, e.g. "hello@3suns.app".
  contactEmail: ""
};
