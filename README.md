# 3suns

Professional astrology software for Mac and Windows, published by Karia LLC.

- Installers: the [Releases](https://github.com/ecaglar/3suns-web/releases) of this repository

This repository holds the website files and the installers. The rest of this page is for whoever maintains the site.

## The website

A static site (plain HTML, CSS and JavaScript, no build step). Upload the files as they are to any web host
or static hosting service, into the site root or any folder; every path in the site is relative. It is a
product demo: a hero with the download buttons (one Mac button with a menu for Apple Silicon or Intel; Windows) and the
workspace assembling in 3D as you scroll,
a chart wheel that builds up layer by layer, a ring of the kinds of chart, a 14-part feature tour, the
reports, an accuracy table with a live sky wheel, the full feature list and the downloads.

| Path | What it is |
|---|---|
| `index.html` | the page |
| `css/site.css` | all styles; colours and fonts are the tokens at the top |
| `js/config.js` | **the only file to edit per release**: version, download links, file sizes, optional contact email |
| `js/site.js` | navigation, OS detection for the install buttons, the 3D scenes (hero and workspace, chart in layers, ring of wheels, tour windows, wall, report fan), reveals |
| `js/sky.js` | the live "sky right now" chart wheel in the Accuracy section, and the starfield |
| `js/astronomy.browser.min.js` | Astronomy Engine 2.1.19 (MIT licence, header kept), used only by the live wheel |
| `js/glyphs.js` | the astrology glyph outlines the app itself uses (from DejaVu Sans) |
| `fonts/` | Cormorant Garamond and Inter, self-hosted (SIL Open Font License files next to them) |
| `img/app-*.webp` | the workspace in the night and paper themes (the window that assembles on scroll) |
| `img/l-*.webp` | one multiwheel as six transparent layers (zodiac, houses, planets, aspects, progressions, transits) for the chart scene |
| `img/w-*.webp` | the 14 chart wheels of the ring |
| `img/t-*.webp`, `img/d-*.webp` | feature tour: the window of each feature and the detail that floats in front of it |
| `img/s-*.webp` | small screens for the moving wall above the feature list |
| `img/r-*.webp` | report pages |

Every image is a capture of the real 3suns app. All charts belong to fictional people.

## Releasing a new version

1. Create a release in this repository with the tag `v<version>` and attach the installers, the Windows
   updater files (`.sig`, `latest.json`).
2. In `js/config.js`, set `version`, the three links in `downloads`, and `sizes`.
3. Commit, push, and upload the changed files to the web host.

A download link left empty still shows its button; a click then explains that the file is not online yet.
Filling in `contactEmail` shows the address in the footer and in the licence key answer of the FAQ.

## Things to keep

- The desktop app's updater reads `https://github.com/ecaglar/3suns-web/releases/latest/download/latest.json`,
  so the newest release must always carry that file.
- No source code anywhere: not on the page and not in the releases (Emre, 2026-11-13).
- The site lives at https://3suns.app. Link previews (Slack, WhatsApp, X) use the full address
  `https://3suns.app/img/og-image.jpg`, and the page names https://3suns.app/ as its canonical address.
  If the address ever changes, update `og:url`, `og:image` and the canonical link in `index.html`.

## Motion

- Visitors who ask their system for reduced motion get the same page without the scroll scenes and the loops.
- The hero and the chart scene are pinned while they assemble. Inside a frame that is as tall as the whole
  page (some embeds), they are laid out flat instead.
- The page never guesses which chip a Mac has (a browser cannot tell). The main Mac button downloads the
  Apple Silicon build, the chevron next to it opens a menu with Apple Silicon and Intel, and the text tells
  anyone who is not sure to choose Apple Silicon. Windows visitors get the Windows button first and in gold.

## Accuracy note

The live wheel computes apparent geocentric tropical longitudes in the browser. Checked on 2026-11-11 against
`swetest` for five dates between 1985 and 2045: largest difference 14 arc seconds (mean node included). The
speculum table on the page (fictional chart Lena Hart, 17 April 1994 06:23 Lisbon) comes from the 3suns
engine and `swetest`; they agree to 0.00 arc seconds.
