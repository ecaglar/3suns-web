# 3suns

Professional astrology software for Mac and Windows, published by Karia LLC.

- Installers: the [Releases](https://github.com/ecaglar/3suns-web/releases) of this repository

This repository holds the website files and the installers. The rest of this page is for whoever maintains the site.

## The website

A static site (plain HTML, CSS and JavaScript, no build step), hosted as a Cloudflare Worker with static
assets (Workers Builds runs `npx wrangler deploy`): every push to `main` goes live at https://3suns.app within
a minute or two. Internal links use the site's clean addresses (`/`, `/download`). `wrangler.jsonc` serves the
repository root as the site, `.assetsignore` keeps the maintenance files out of it, and `worker/index.js` only
answers `/ingest/*` (the analytics proxy below). Do not add a `functions/` folder: the Workers build stops on
it.

The look is "Daylight": the pages are set in the app's Paper palette, so the app's Night windows read as
objects on them, and night returns in three bands with a curved horizon. The logo's three suns are the only
accents. There are two pages:

- `index.html`, the product demo: a hero with the download buttons (one Mac button with a menu for Apple
  Silicon or Intel; Windows) beside the chart wheel in front of the gold sun, the figures, the workspace with
  four numbered points and a Night/Paper switch, the wheel in six layers and one wheel that switches between
  the 14 kinds of chart, a 17-part feature tour, the accuracy table with the live sky wheel, the reports, and
  a closing band with the download buttons.
- `download.html`, for visitors who are about to install: a card per system, the questions, and the full
  feature list.

| Path | What it is |
|---|---|
| `index.html` | the home page |
| `download.html` | the download page: installers, FAQ, full feature list |
| `css/site.css` | all styles for both pages; colours and fonts are the tokens at the top |
| `js/config.js` | **the only file to edit per release**: version, download links, file sizes, optional contact email |
| `js/site.js` | both pages: version, sizes and links from `config.js`, OS detection for the install buttons, the Mac menu, the Night/Paper switch, the kinds of chart, the feature tour, the report fan, reveals |
| `js/analytics.js` | PostHog visitor analytics for both pages and the 404 page (see "Analytics" below) |
| `wrangler.jsonc`, `.assetsignore` | how Cloudflare deploys the site, and the files it leaves out |
| `worker/index.js` | the Worker script: passes `/ingest/*` on to PostHog; everything else is a static file |
| `privacy.html` | the privacy policy (3suns.app/privacy), linked in every footer; it has the switch that turns analytics off for a browser. Update it, and its date, whenever the app or the site starts sending something new |
| `404.html` | the page for addresses that do not exist (answered with status 404, not indexed) |
| `robots.txt`, `sitemap.xml`, `llms.txt` | for search engines and AI search: rules, the two pages, a plain summary of 3suns |
| `_headers` | response headers: caching for images, fonts, styles and scripts; safety headers |
| `_redirects` | short links: `3suns.app/video` opens the current product video on YouTube; change the target there when the video is replaced |
| `js/sky.js` | the live "sky right now" chart wheel in the Accuracy section (its starfield code needs a `#stars` canvas, which the Daylight pages do not have) |
| `js/astronomy.browser.min.js` | Astronomy Engine 2.1.19 (MIT licence, header kept), used only by the live wheel |
| `js/glyphs.js` | the astrology glyph outlines the app itself uses (from DejaVu Sans) |
| `fonts/` | Cormorant Garamond and Inter, self-hosted (SIL Open Font License files next to them) |
| `img/app-*.webp` | the workspace in the night and paper themes (the window in the Workspace section) |
| `img/l-*.webp` | one multiwheel as six transparent layers (zodiac, houses, planets, aspects, progressions, transits): stacked in the hero, and one by one in the six-step strip of the Charts section |
| `img/w-*.webp` | the 14 chart wheels the Charts section switches between |
| `img/t-*.webp`, `img/d-*.webp` | feature tour: the window of each feature and the detail that sits in front of it |
| `img/s-*.webp` | small screens of the previous design's moving wall; not used by the Daylight pages |
| `img/r-*.webp` | report pages (three per report, for the fan in the Reports section) |
| `img/og-daylight.jpg` | the link preview image (1200 × 630), rendered from the hero |

Every image is a capture of the real 3suns app. All charts belong to fictional people.

## Releasing a new version

1. Create a release in this repository with the tag `v<version>` and attach the installers, the Windows
   updater files (`.sig`, `latest.json`).
2. In `js/config.js`, set `version`, the three links in `downloads`, and `sizes`.
3. Commit, push, and upload the changed files to the web host.

A download link left empty still shows its button; a click then explains that the file is not online yet.
`contactEmail` (now `hello@karia.cc`) shows the address in the footer of both pages and in the licence key
answer of the FAQ; emptied, both disappear. The version on the pages (`data-version`), the file sizes
(`data-size`) and every download link (`data-dl`) are filled in from `config.js` when the page loads.
Browsers check `css/` and `js/` for a newer copy on every visit (`_headers`), so a release shows at once; the
`?r=2` on the `config.js` script tags only pushed out copies cached before that rule and needs no change.

## Things to keep

- The desktop app's updater reads `https://github.com/ecaglar/3suns-web/releases/latest/download/latest.json`,
  so the newest release must always carry that file.
- No source code anywhere: not on the page and not in the releases (Emre, 2026-11-13).
- The site lives at https://3suns.app. Link previews (Slack, WhatsApp, X) use the full address
  `https://3suns.app/img/og-daylight.jpg`, and the page names https://3suns.app/ as its canonical address.
  If the address ever changes, update `og:url`, `og:image` and the canonical link in `index.html` and in
  `download.html` (which names https://3suns.app/download).

## Analytics

PostHog, project "3suns" (id 736450) in the Karia LLC organization at https://us.posthog.com. The project
key in `js/config.js` (`analytics.posthogKey`) is public by design; empty it to switch analytics off.

- It runs only on 3suns.app (not on Cloudflare preview addresses or a local copy) and sets no cookies: a visit
  is kept in the tab's session storage, so one visit is followed across pages, and a returning visitor counts
  again.
- Requests go to `/ingest` on the site itself and the Worker passes them on to PostHog, so blockers
  that stop posthog.com do not hide visitors. `/ingest/static/*` and `/ingest/array/*` go to
  us-assets.i.posthog.com, the rest to us.i.posthog.com, with the visitor's address for the country.
- Events: `$pageview` and `$pageleave` (with how far the page was read), `$autocapture` clicks, and
  `download_clicked` for every installer link, with `installer` (macArm, macIntel, windows), `platform`,
  `mac_chip`, `placement` (hero, hero_mac_menu, closing, download_page) and `version`. Every event also
  carries `offered_version` and `page`.
- Visitors can turn analytics off for their browser with the switch on the privacy page (`#analytics-choice`): it
  stores `3suns.analytics` = `off` in local storage, and `analytics.js` then does not load PostHog at all.
- Traffic sources come from the referrer and from `utm_*` tags: link to the site as
  `https://3suns.app/?utm_source=reddit&utm_campaign=<post>` to tell posts apart.

## Search

Each page has its own title, description, canonical address, Open Graph and X card tags. The home page
describes 3suns as a `SoftwareApplication` (with its publisher and feature list) in JSON-LD, and the download
page carries a breadcrumb and the FAQ as `FAQPage`, word for word as on the page. Keep the FAQ JSON-LD in step
when the questions change. `sitemap.xml` lists both pages; update its `lastmod` dates when a page changes a lot.

## Motion and behaviour

- Visitors who ask their system for reduced motion get the same pages without the entrances and the loops.
- Nothing depends on scrolling: every section is laid out in place. Content below the fold rises in once;
  without JavaScript everything is simply visible and the download buttons lead to `download.html`.
- The pages never guess which chip a Mac has (a browser cannot tell). The main Mac button downloads the
  Apple Silicon build, the chevron next to it opens a menu with Apple Silicon and Intel, and the text tells
  anyone who is not sure to choose Apple Silicon. Windows visitors get the Windows button first and filled,
  and on the download page the card for the visitor's system is marked "Your system".
- The bar stays at the top of the window and takes a paper background once the page has moved.

## Accuracy note

The live wheel computes apparent geocentric tropical longitudes in the browser. Checked on 2026-11-11 against
`swetest` for five dates between 1985 and 2045: largest difference 14 arc seconds (mean node included). The
speculum table on the page (fictional chart Lena Hart, 17 April 1994 06:23 Lisbon) comes from the 3suns
engine and `swetest`; they agree to 0.00 arc seconds.
