# 3suns

Professional astrology software for Mac and Windows, published by Karia LLC.

- Website: https://ecaglar.github.io/3suns-web/
- Installers: the [Releases](https://github.com/ecaglar/3suns-web/releases) of this repository
- Source code: attached to every release as `3suns-source.zip` (GNU AGPL v3)

This repository holds the website and the installers. The rest of this page is for whoever maintains the site.

## The website

A static site (plain HTML, CSS and JavaScript, no build step), served by GitHub Pages from the root of the
`main` branch. It is a product demo: a live sky wheel, the workspace assembling in 3D as you scroll, a ring of
chart wheels, a 14-part feature tour, the reports, an accuracy table, the full feature list and the downloads.

| Path | What it is |
|---|---|
| `index.html` | the page |
| `css/site.css` | all styles; colours and fonts are the tokens at the top |
| `js/config.js` | **the only file to edit per release**: version, download links, file sizes, optional contact email |
| `js/site.js` | navigation, OS detection for the download buttons, the 3D scenes (hero tilt, workspace, ring of wheels, tour, wall, report fan), reveals |
| `js/sky.js` | the live "sky right now" chart wheel in the hero, and the starfield |
| `js/astronomy.browser.min.js` | Astronomy Engine 2.1.19 (MIT licence, header kept), used only by the live wheel |
| `js/glyphs.js` | the astrology glyph outlines the app itself uses (from DejaVu Sans) |
| `fonts/` | Cormorant Garamond and Inter, self-hosted (SIL Open Font License files next to them) |
| `img/app-*.webp` | the workspace in the night and paper themes (the window that assembles on scroll) |
| `img/w-*.webp` | the 14 chart wheels of the ring |
| `img/t-*.webp`, `img/d-*.webp` | feature tour: the window of each feature and the detail that floats in front of it |
| `img/s-*.webp` | small screens for the moving wall above the feature list |
| `img/r-*.webp` | report pages |
| `.nojekyll` | tells GitHub Pages to serve the files as they are |

Every image is a capture of the real 3suns app. All charts belong to fictional people.

## Releasing a new version

1. Create a release in this repository with the tag `v<version>` and attach the installers, the Windows
   updater files (`.sig`, `latest.json`) and `3suns-source.zip`.
2. In `js/config.js`, set `version`, the four links in `downloads`, and `sizes`.
3. Commit and push. GitHub Pages publishes the change within a minute or two.

A download link left empty still shows its button; a click then explains that the file is not online yet.
Filling in `contactEmail` shows the address in the footer and in the licence key answer of the FAQ.

## Things to keep

- The desktop app's updater reads `https://github.com/ecaglar/3suns-web/releases/latest/download/latest.json`,
  so the newest release must always carry that file.
- Keep the source code link on the page: 3suns is released under the GNU AGPL v3.
- After choosing a domain, change `og:image` and `og:url` in `index.html` to the new address so link previews
  keep working.

## Motion

- Visitors who ask their system for reduced motion get the same page without the scroll scene and the loops.
- The workspace scene is pinned while it assembles. Inside a frame that is as tall as the whole page (some
  embeds), it is laid out flat instead.

## Accuracy note

The live wheel computes apparent geocentric tropical longitudes in the browser. Checked on 2026-11-11 against
`swetest` for five dates between 1985 and 2045: largest difference 14 arc seconds (mean node included). The
speculum table on the page (fictional chart Lena Hart, 17 April 1994 06:23 Lisbon) comes from the 3suns
engine and `swetest`; they agree to 0.00 arc seconds.
