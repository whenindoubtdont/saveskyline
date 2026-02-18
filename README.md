# Save Skyline Wilderness Park

A static advocacy website urging Napa County residents to oppose the planned 185-unit housing development on 5 acres of Skyline Wilderness Park. The site provides facts, verified sources, a pre-written email template, media contact list, supervisor lookup with direct email and phone, and sharing tools — everything a concerned resident needs to take action in under 5 minutes.

**Live site:** [whenindoubtdont.github.io/saveskyline](https://whenindoubtdont.github.io/saveskyline/)

---

## Table of Contents

- [What This Site Does](#what-this-site-does)
- [How Content Works](#how-content-works)
- [File Inventory](#file-inventory)
- [Hosting](#hosting)
- [External Services](#external-services-no-api-keys-required)
- [For Developers](#for-developers)

---

## What This Site Does

The site is a single-page advocacy tool designed to convert visitors into callers and emailers. It walks them through:

### 1. The Threat

What's happening: the state designated 20 acres of Skyline Park as "surplus" under Executive Order N-06-19, and the first 5-acre slice is slated for 185 high-density housing units by PEP Housing / Collective Operations LLC. Construction could start late 2027.

### 2. Our Park

What's at stake: 874 acres of public open space used for archery ranges (Silverado Archers, est. 1954), Suscol Intertribal Council pow wows, Boy Scout camping, equestrian shows, BottleRock overflow parking, wildfire crew base camps, and more. The county bought the park for $7.26M in December 2024 to protect it.

### 3. Silverado Archers

The archery club that catalyzed this campaign. Their president Matt Petrini's original email to members is reproduced verbatim on the site.

### 4. Take Action (the core of the site)

- **Pre-written email template** — Visitors can copy the full text with one click, or open it directly in Gmail, Yahoo Mail, Outlook, or their default mail app. The template includes a subject line, key facts, and source references.

- **Media contact grid** — 10 newsrooms (Napa Valley Register, KQED, KPIX, KGO, KRON, KCRA, Fox, California Globe, News Netter) each with a one-click email copy button.

- **"Who's My Supervisor?" address lookup** — A resident types in their Napa address, the site geocodes it via ArcGIS and queries Napa County's official GIS FeatureServer to identify their supervisor district. The result card shows:
  - The supervisor's **name** and **district number**
  - An **"Email Supervisor" button** that opens the user's mail app with the email template pre-filled — addressed to their specific supervisor, with the greeting personalized (e.g. "Dear Supervisor Joelle Gallagher") and the full template body included
  - A **"Call" button** with the supervisor's direct office phone number (tap-to-call on mobile)
  - The matched address for confirmation
  - The corresponding supervisor is highlighted in the static list below

- **Static supervisor list** — All 5 supervisors with district number, name, direct phone number (tap-to-call), and official county email address (clickable mailto link). Plus the Clerk of the Board phone number.

- **Share / Forward** — Web Share API button (with clipboard fallback), "Forward to a Neighbor" mailto link, and footer links for X (Twitter) and Facebook sharing.

### 5. Sources & References

12 linked, cited sources backing every claim on the page: Napa Valley Register articles, CA Dept. of General Services project page, Sierra Club opposition letters, KQED coverage, the Governor's Executive Order, and official park/club websites. Rendered as clickable cards.

### 6. AI-Generated Podcast

An audio overview of the issues with a sticky player at the bottom of the page. Features play/pause, seekable progress bar, download button, and close. The audio file (23 MB, M4A) is not fetched until the user clicks "Listen while you read." Includes a disclaimer that it is AI-generated and may contain errors.

---

## How Content Works

**All text on the site is driven by `content.json`.** The HTML contains fallback text that's visible immediately on load, then `script.js` fetches `content.json` and applies values to every element with a `data-content` attribute.

If `content.json` fails to load (e.g. offline, CORS issue), the HTML fallback text remains visible and a hardcoded contact list is used as a safety net.

### Editing Content

To change any text on the site:

1. Open `content.json` in any text editor.
2. Find the key you want to change. Keys are organized by section: `hero.headline`, `threat.paragraph1`, `action.emailTemplate`, etc.
3. Save the file and refresh the page.

The `_editorNote` at the top of `content.json` explains the conventions:
- Use `\n` for line breaks in long strings (like the email template).
- Use `**bold text**` for bold formatting in paragraphs that support it (like `threat.paragraph1`).

### Updating Supervisor Information

After elections or staffing changes, supervisor names, phone numbers, and emails need to be updated in **three places**:

1. **`content.json`** — The `supervisors` array. Each entry has `district`, `name`, `phone`, `tel` (E.164 format for tel: links), and `email`. This data is used by the site but is not currently consumed by JS at runtime (it exists for documentation and potential future use).

2. **`index.html`** — The `#supervisor-list` div in the Take Action section contains the static supervisor grid rendered as HTML. Each supervisor card has hardcoded name, phone number (with `tel:` link), and email (with `mailto:` link). Update the `data-district` attributes, names, phone numbers, and email addresses.

3. **`script.js`** — The `supervisors` object inside the `initDistrictFinder()` function. This is the lookup table used at runtime when a user searches for their address. Each entry has `name`, `phone`, `tel`, and `email`. The email address is used to construct the pre-filled mailto link in the "Email Supervisor" button.

**Why three places?** The HTML provides immediate fallback content (no JS required). The JS lookup table overrides stale data from the county GIS API. The JSON provides a single canonical reference for documentation and potential future automation.

The phone numbers for each district office rarely change between supervisors, but the email addresses always follow the pattern `firstname.lastname@countyofnapa.org`. Verify at [napacounty.gov](https://www.napacounty.gov/1316/Board-of-Supervisors).

### Current Supervisors (as of Feb 2026)

| District | Supervisor | Phone | Email |
|----------|-----------|-------|-------|
| 1 | Joelle Gallagher | (707) 253-4828 | joelle.gallagher@countyofnapa.org |
| 2 | Liz Alessio | (707) 259-8276 | liz.alessio@countyofnapa.org |
| 3 | Anne Cottrell | (707) 253-4827 | anne.cottrell@countyofnapa.org |
| 4 | Amber Manfree | (707) 259-8278 | amber.manfree@countyofnapa.org |
| 5 | Belia Ramos | (707) 259-8277 | belia.ramos@countyofnapa.org |
| Clerk | Board of Supervisors | (707) 253-4580 | — |

### Updating Media Contacts

Edit the `contacts` array in `content.json`. Each entry has a `name` and `email`. These are rendered by `populateContacts()` in `script.js` as a grid of cards with one-click copy buttons.

### Updating Sources

Edit the `sources` array in `content.json`. Each entry has `name`, `url`, and `description`. They render as clickable cards linking to the original source.

---

## File Inventory

| File | Purpose | Size |
|------|---------|------|
| `index.html` | The entire page — all sections, nav, hero, action, footer, audio player | 37 KB |
| `content.json` | All editable text, contacts, sources, supervisor data | 15 KB |
| `script.js` | Source JavaScript — content loader, contacts, district finder + email integration, audio player, share, copy, mobile menu, scroll reveal | 22 KB |
| `script.min.js` | Minified JS served in production (generated by `terser`) | ~14 KB |
| `style.css` | Source CSS — hero parallax, skip link, section reveals, mobile menu, back-to-top, iOS Safari fixes, scrollbar | 3.2 KB |
| `style.min.css` | Minified CSS served in production (generated by `clean-css`) | ~2.3 KB |
| `skylinehillsky.jpeg` | Hero background image (1920x1440, quality 68) | 281 KB |
| `skylinearcheryrange.jpeg` | Archers section photo (1200x900, quality 65) | 175 KB |
| `infographic.png` | Below-fold infographic (1400px wide, optipng optimized) | 1.6 MB |
| `skyline-park-podcast.m4a` | AI-generated audio overview (~12 min) | 23 MB |
| `.gitignore` | Excludes Lighthouse reports, node_modules, .DS_Store, backup originals | — |
| `README.md` | This file | — |

---

## Hosting

The site is hosted on **GitHub Pages** from the repo's root directory. There is no build step required for deployment — push to `main` and GitHub Pages serves it.

- **Canonical URL:** `https://whenindoubtdont.github.io/saveskyline/`
- All OG/Twitter meta tags, the canonical link, and share URLs reference this URL.
- The `skyline-park-podcast.m4a` file is 23 MB. GitHub Pages allows up to 100 MB per file and recommends repos under 1 GB total, so this is fine. Be mindful if adding more large media.

---

## External Services (No API Keys Required)

The site uses two free, public APIs for the "Find Your Supervisor" feature. Neither requires authentication, API keys, or account creation.

### ArcGIS World Geocoder

- **Purpose:** Converts a street address (e.g. "955 School St, Napa") into latitude/longitude coordinates.
- **Endpoint:** `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates`
- **CORS:** Allowed from any origin, including GitHub Pages.
- **Cost:** Free for basic geocoding without an API key (limited to non-stored results).
- **Reliability:** Tested with dozens of Napa addresses. Returns a confidence `score` (0-100); the code requires >= 70 to accept a match.
- **Used by:** `initDistrictFinder()` in `script.js`, step 1 of the lookup.

### Napa County Supervisor Districts FeatureServer

- **Purpose:** Given a lat/lng point, returns which supervisor district polygon contains it, along with district metadata.
- **Endpoint:** `https://gis.napacounty.gov/arcgis/rest/services/Hosted/Supervisor_Districts/FeatureServer/0/query`
- **CORS:** Allowed from GitHub Pages origin. Tested and confirmed.
- **Important caveat:** The GIS layer's `supervisor` field contains **stale names** from previous terms (e.g. "Brad Wagenknecht" for District 1, who left office in 2022). The code intentionally ignores the API-returned supervisor name and instead maps the `sup_district` number to the correct current supervisor from a local lookup table in `script.js`. This is why the supervisor data must be maintained in `script.js` — the GIS API cannot be relied on for names.
- **Used by:** `initDistrictFinder()` in `script.js`, step 2 of the lookup.

### Napa County Official Lookup (Fallback Link)

- **URL:** `https://www.countyofnapa.org/2051/Find-My-Supervisor-and-District`
- Linked at the bottom of the supervisor section for users who prefer the official county tool.

---

## For Developers

### Tech Stack

- **HTML/CSS/JS** — No framework, no build system, no dependencies to install. Zero `npm install` required.
- **Tailwind CSS** via the [Play CDN](https://cdn.tailwindcss.com) (`<script>` tag). This loads ~500 KB of JS on every page to generate utility classes on the fly. Not ideal for production performance, but it works without any build step. Migrating to the Tailwind CLI would be the single biggest performance win (see Future Work).
- **Font Awesome 6.5.1** via cdnjs CDN — icons for buttons, navigation, share links, etc.
- **Google Fonts** — Outfit (weights 400, 600, 700, 800) for headings. Loaded with `preconnect` hints.
- **Custom CSS** in `style.css` — hero parallax with iOS Safari fallback, section reveal animations, mobile hamburger menu, skip link for accessibility, back-to-top button, template scrollbar, safe area insets.

### Local Development

```bash
cd /path/to/saveskyline
python3 -m http.server 8765
# Open http://localhost:8765
```

Any static file server works (e.g. `npx serve`, `php -S localhost:8765`, VS Code Live Server). The site has no server-side requirements. All API calls are made client-side from the browser.

### Rebuilding Minified Files

After editing `style.css` or `script.js`, rebuild the minified production files:

```bash
npx clean-css-cli style.css -o style.min.css
npx terser script.js -o script.min.js -c -m
```

Both commands use `npx` so they work without global installs. They'll auto-download the tools on first run.

The HTML loads `style.min.css` and `script.min.js`. If you forget to rebuild after editing, the site still works — it just serves the previously minified versions. The source files (`style.css`, `script.js`) are **not** loaded in production; they exist only for development.

### Architecture Notes

**Content system:** `script.js` fetches `content.json` on `window.onload`. The `applyContent()` function walks every `[data-content]` element and sets its text content. Special handling exists for specific paths: `threat.heading` uses `<br>` for line breaks, `threat.paragraph1` supports `**bold**` markdown-like syntax via `applyBold()`, `park.closing` appends a bold-styled span, and `action.footerLinkText` injects a link to the supervisors page. If `content.json` fails to load, the HTML fallback text remains visible and a hardcoded contact list is used.

**District finder:** Intentionally **not** a `<form>` element. Using a `<form>` causes native page reloads if JS hasn't loaded or if the submit fires before `preventDefault` can intercept it. Instead, it's a `<div role="search">` with a click handler on the submit button and a `keydown` handler that intercepts Enter on the input field with `e.preventDefault()`. The lookup is a two-step async chain: geocode the address, then spatial-query the district layer. The `district` value returned from the ArcGIS API is coerced to a string (it arrives as a number) for consistent key lookups and DOM comparisons.

**Supervisor email integration:** When a user finds their supervisor via the address lookup, the result card includes an "Email Supervisor" button. This is a `mailto:` link constructed by `buildSupervisorMailto()`, which:
1. Reads the current email template from the DOM (via `getTemplateSubjectAndBody()`)
2. Replaces the `[Media Contact / Supervisor]` placeholder in the body with `Supervisor [Name]`
3. Constructs a `mailto:` URL with the supervisor's email as the recipient, and the subject/body URI-encoded in query parameters
4. The email address itself is **not** percent-encoded (per RFC 6068 — only the query parameters are encoded)

**Section reveals:** Sections with class `section-reveal` start at `opacity: 0; transform: translateY(20px)` and get `.is-visible` added via `IntersectionObserver` when they scroll into view. The observer uses a threshold of 0.05 with a -60px bottom margin. Respects `prefers-reduced-motion: reduce` — if set, all sections are immediately visible with no animation.

**Hero parallax:** Uses `background-attachment: fixed` for the desktop parallax effect. iOS Safari doesn't support this, so a `@supports (-webkit-touch-callout: none)` rule falls back to `background-attachment: scroll`. The hero uses `100dvh` for proper mobile viewport sizing and `env(safe-area-inset-*)` for notched devices.

**Mobile menu:** A CSS-transition-based collapsing menu (`max-height: 0` → `max-height: 80vh`). JavaScript toggles the `.is-open` class, `aria-expanded` on the button, `aria-hidden` on the menu, the button label, and the icon (bars ↔ times). Clicking any nav link auto-closes the menu.

**Audio player:** The podcast uses `preload="none"` so the 23 MB file is not fetched until the user clicks the prompt button. The sticky player slides up from the bottom (`translate-y-full` → removed). Features: play/pause, formatted time display, clickable progress bar for seeking, download link, and close (which pauses audio and re-shows the prompt).

**Share system:** Uses `navigator.share()` where available (primarily mobile browsers). Falls back to `navigator.clipboard.writeText()`. All clipboard calls have `.catch()` handlers so failures show a toast instead of silently breaking. Footer links to X and Facebook use their respective share URL schemes. The "Forward to a Neighbor" link is a `mailto:` with the site URL as the body.

**Toast notifications:** The `showToast()` utility creates a fixed-position notification at the bottom center of the viewport, auto-dismissing after 2.5 seconds. Used for clipboard confirmation, error feedback, and copy success states.

### Lighthouse Scores (Local, as of Feb 17, 2026)

| Category | Score |
|----------|-------|
| Performance | 90 |
| Accessibility | 86 |
| Best Practices | 96 |
| SEO | 100 |

The main performance bottleneck is the Tailwind Play CDN (~500 KB JS). Migrating to a pre-built CSS file would likely push Performance to 95+. The Accessibility gap is primarily contrast ratios on some `text-stone-400`/`text-stone-500` text against dark backgrounds; bumping to `text-stone-300` where needed would close the gap.

### Future Work / Known Issues

1. **Tailwind CLI migration** — Replace `<script src="https://cdn.tailwindcss.com">` with a pre-built CSS file. This eliminates the ~500 KB JS payload and is the single biggest performance win available. Requires adding a build step: `npx tailwindcss -i style.css -o dist.css --minify`. Would also enable purging unused utilities.

2. **Accessibility contrast** — Some `text-stone-400` and `text-stone-500` text on `bg-stone-900`/`bg-stone-950` backgrounds doesn't meet WCAG AA contrast ratios (4.5:1 for normal text). Audit with the axe DevTools extension and bump to `text-stone-300` where needed.

3. **Supervisor data staleness** — The Napa County GIS layer returns outdated supervisor names. The code works around this with a local lookup table, but it means names and emails must be manually updated after elections in three places (see "Updating Supervisor Information" above). A possible improvement would be to move all three sources to read from `content.json` at runtime, reducing the update surface to one file.

4. **Large media files** — The podcast (23 MB) and infographic (1.6 MB) make the repo ~25 MB total. If repo size becomes an issue, consider hosting media on a CDN (e.g. Cloudflare R2, GitHub Releases) or using Git LFS.

5. **Compose URL body truncation** — The Gmail/Yahoo/Outlook compose links truncate the email body to ~700 characters to stay within browser URL length limits. A note `[Template shortened for this link; use Copy for full text.]` is appended. The "Copy Full Email" button and the supervisor-specific mailto link both send the complete untruncated template.

6. **Test on real devices** — The site has been developed and audited in desktop Chrome and headless Lighthouse. Before any major content update, test on:
   - Safari on iPhone (hero parallax fallback, audio player, share API, mailto links)
   - Safari on iPad
   - Chrome on Android (share API, audio player)
   - Desktop Safari, Chrome, Firefox

---

## License

This site was built by Napa County residents to protect public parkland. It is not affiliated with any government agency, political campaign, or developer. Use it, share it, fork it.
