# Implementation Overview

This document describes the architecture and implementation plan for converting the Squarespace/WordPress XML export into a Next.js static site.

See [EXPORT_XML_STRUCTURE.md](EXPORT_XML_STRUCTURE.md) for a detailed description of the XML format.

---

## Project layout

```
.
├── content/
│   ├── posts/
│   │   ├── nyheter/          # Main news posts  (34 files)
│   │   ├── historierogmyter/ # Stories & myths  ( 7 files)
│   │   └── den-hviide-knap/  # DHK-specific news (10 files)
│   ├── pages/
│   │   ├── den-gyldne-gris-orden/  # DGG section (7 files, index.md = anno 1859)
│   │   ├── den-hviide-knap/        # DHK section (5 files)
│   │   ├── bokuglen/               # Bokuglen section (5 files, index.md = anno 1924)
│   │   ├── grisefestene/           # Festival pages (4 files, index.md)
│   │   └── _squarespace/           # Squarespace template pages – not for rendering
│   └── image-manifest.json   # CDN URL → local path mapping for all 394 images
├── public/
│   ├── images/         # Downloaded images (not committed)
│   └── files/          # Document files, e.g. PDFs (not committed)
├── scripts/
│   ├── convert-xml.mjs        # Step 1: XML → Markdown
│   ├── reorganize-content.mjs # Step 2: sort into section subdirectories (run once)
│   └── download-images.mjs    # Step 3: fetch images from CDN
├── src/                # Next.js app source
└── export-2026-03-09.xml  # Original Squarespace XML export
```

## Site navigation (from hmgrisen.com)

The old site's top-level navigation, which determines the section structure above:

| Menu item                   | URL(s)                   | Content type                                     |
| --------------------------- | ------------------------ | ------------------------------------------------ |
| Nyheter                     | `/`                      | Posts in `posts/nyheter/`                        |
| Historier og myter          | `/historierogmyter`      | Posts in `posts/historierogmyter/`               |
| Om                          | `/about`                 | Static page                                      |
| **Den Gyldne Gris' Orden**  | `/den-gyldne-gris-orden` | Section index + sub-pages                        |
| ↳ Anno 1859                 | `/den-gyldne-gris-orden` | `pages/den-gyldne-gris-orden/index.md`           |
| ↳ Presensliste              | `/presensliste`          | `pages/den-gyldne-gris-orden/presensliste.md`    |
| ↳ Statutter                 | `/statutter`             | `pages/den-gyldne-gris-orden/statutter.md`       |
| ↳ Embedsverk                | `/hoff`                  | `pages/den-gyldne-gris-orden/hoff.md`            |
| ↳ Matrikkel                 | `/matrikkel`             | `pages/den-gyldne-gris-orden/matrikkel.md`       |
| **Den Hviide Knap**         | `/anno-1899`             | Posts + static sub-pages                         |
| ↳ Knappenytt (news)         | `/anno-1899`             | Posts in `posts/den-hviide-knap/`                |
| ↳ Historie                  | `/dhkhistorie`           | `pages/den-hviide-knap/dhkhistorie.md`           |
| ↳ Presensliste              | `/dhkpresensliste`       | `pages/den-hviide-knap/dhkpresensliste.md`       |
| ↳ Matrikkel                 | `/dhkmatrikkel`          | `pages/den-hviide-knap/dhkmatrikkel.md`          |
| ↳ Statutter                 | `/dhkstatutter`          | `pages/den-hviide-knap/dhkstatutter.md`          |
| ↳ Studentteateret 175 år    | `/studentteateret-175-r` | `pages/den-hviide-knap/studentteateret-175-r.md` |
| **Bokuglen**                | `/anno-1924`             | Section index + sub-pages                        |
| ↳ Anno 1924                 | `/anno-1924`             | `pages/bokuglen/index.md`                        |
| ↳ Bokuglens historie        | `/bokuglens-historie`    | `pages/bokuglen/bokuglens-historie.md`           |
| ↳ Presensliste              | `/bupresensliste`        | `pages/bokuglen/bupresensliste.md`               |
| ↳ Matrikkel                 | `/bumatrikkel`           | `pages/bokuglen/bumatrikkel.md`                  |
| ↳ Statutter                 | `/bustatutter`           | `pages/bokuglen/bustatutter.md`                  |
| **Grisefestene**            | `/grisefestene`          | Section index + per-festival pages               |
| Chateau Neuf                | `/chateau-neuf`          | Static page                                      |
| Det Norske Studentersamfund | `studentersamfundet.no`  | External link                                    |

---

## Step 1: XML → Markdown conversion (`scripts/convert-xml.mjs`)

> **Note:** Steps 1–3 are one-time setup scripts, not part of the build pipeline.

**Run:**

```bash
node scripts/convert-xml.mjs                    # convert only
node scripts/convert-xml.mjs --download-images  # convert + fetch all images
```

### What it does

1. **Parses XML** using `fast-xml-parser` (handles CDATA, namespaces).
2. **Builds an author map** from `<wp:author>` entries: `email → display name`.
3. **Processes each `post` and `page` item:**
   - Resolves the author display name via the author map.
   - Pre-processes WordPress `[caption]` shortcodes → plain `<img>` with alt text.
   - Rewrites Squarespace CDN image URLs to local `/images/FILENAME` paths.
   - Converts HTML → Markdown using `turndown`.
   - Writes a `.md` file with YAML frontmatter.
4. **Skips `attachment` items** (images are embedded in content and handled inline).
5. **Writes `content/image-manifest.json`** mapping every unique CDN URL to its local filename.

### Frontmatter fields

| Field          | Source                      | Notes                                               |
| -------------- | --------------------------- | --------------------------------------------------- |
| `title`        | `<title>`                   |                                                     |
| `date`         | `<wp:post_date>`            | ISO date, truncated to `YYYY-MM-DD`                 |
| `author`       | `<dc:creator>` → author map | Display name resolved from email                    |
| `status`       | `<wp:status>`               | `publish` or `draft`                                |
| `type`         | `<wp:post_type>`            | `post` or `page`                                    |
| `oldPermalink` | `<link>`                    | **Original relative URL** — used for redirect rules |
| `postName`     | `<wp:post_name>`            | Original WP slug (may include path)                 |
| `excerpt`      | `<excerpt:encoded>`         | Only present when non-empty                         |

### Output filename conventions

- Posts: `content/posts/YYYY-MM-DD-<last-slug-segment>.md`
- Pages: `content/pages/<slug>.md`

The last path segment of `<wp:post_name>` is used as the slug.

### Image handling

- All `<img src="...">` URLs in content are collected and deduplicated (by URL without query string).
- Each gets a local filename derived from the last path segment of the CDN URL.
- The HTML is rewritten with local paths _before_ HTML→Markdown conversion, so the Markdown references `/images/FILENAME`.
- `content/image-manifest.json` maps CDN URL → `{ localPath, filename, downloadUrl }`.
- Actual file downloads happen only with `--download-images` (supports one redirect hop).

---

## Step 2: Content reorganization (`scripts/reorganize-content.mjs`)

Moves Markdown files into section subdirectories and adds a `section` frontmatter field.
Run once, after `convert-xml.mjs`. The section assignment uses the first path segment of
`oldPermalink` for posts, and exact `oldPermalink` matching for pages.

---

## Step 3: Old permalink redirects

The `oldPermalink` frontmatter field contains the original Squarespace URL path (e.g. `/nyheter/2013/10/6/nye-riddere-kommandrer-og-storkors`). This enables a redirect map to be generated if the new URL structure differs.

**Planned:** A script or Next.js `next.config.ts` redirect generator that reads all Markdown frontmatter and emits `redirects()` entries mapping `oldPermalink → newPath`.

---

## Step 3: Next.js rendering

### Tech stack

| Layer            | Choice                                                 |
| ---------------- | ------------------------------------------------------ |
| Framework        | Next.js 16 App Router, static export (SSG)             |
| Markdown parsing | `gray-matter` (frontmatter) + `remark` + `remark-html` |
| Styling          | SASS — `src/css/main.scss` (no Tailwind)               |
| Fonts            | `next/font/google` — Cormorant Garamond + Cormorant SC |

### Source layout

```
src/
  app/                          # Next.js App Router routes
    layout.tsx                  # Root layout: header with logo + nav, imports main.scss
    page.tsx                    # / → Nyheter post index (full content, paginated)
    nyheter/[slug]/page.tsx     # Single nyheter post
    historierogmyter/
      page.tsx                  # Post index (full content, paginated)
      [slug]/page.tsx           # Single post
    den-gyldne-gris-orden/
      page.tsx                  # index.md (Anno 1859)
      [slug]/page.tsx           # presensliste, statutter, hoff, matrikkel, …
    den-hviide-knap/
      page.tsx                  # Post index (Knappenytt, full content, paginated)
      [slug]/page.tsx           # Static sub-pages: historie, presensliste, matrikkel, …
      nyheter/[slug]/page.tsx   # Single DHK post
    bokuglen/
      page.tsx                  # index.md (Anno 1924)
      [slug]/page.tsx           # historie, presensliste, matrikkel, statutter, …
    grisefestene/
      page.tsx                  # index.md
      [slug]/page.tsx           # 2004, 2009, 2013
    about/page.tsx
    chateau-neuf/page.tsx
  components/
    Nav.tsx                     # Site-wide nav with CSS hover dropdowns
    SectionNav.tsx              # Sub-section tab nav (takes links prop)
    PageLayout.tsx              # Wraps page: optional SectionNav + title + article body
    PostListExpanded.tsx        # Client component: paginated full-content post list
    SlideshowInit.tsx           # Client component: initialises image slideshows
  css/
    main.scss                   # All styles; variables at top
  lib/
    content.ts                  # FS helpers: getPostsBySection, getFullPostsBySection,
                                # getPostBySlug, getSectionPage, getPostSlugs, getPageSlugs
    nav.ts                      # Centralised nav config: NAV, DGG_LINKS, DHK_LINKS, …
```

### URL → content mapping

| URL                              | Source file                                               |
| -------------------------------- | --------------------------------------------------------- |
| `/`                              | `posts/nyheter/` index (full content, paginated)          |
| `/nyheter/:slug`                 | `posts/nyheter/YYYY-MM-DD-{slug}.md`                      |
| `/historierogmyter`              | `posts/historierogmyter/` index (full content, paginated) |
| `/historierogmyter/:slug`        | `posts/historierogmyter/YYYY-MM-DD-{slug}.md`             |
| `/den-gyldne-gris-orden`         | `pages/den-gyldne-gris-orden/index.md`                    |
| `/den-gyldne-gris-orden/:slug`   | `pages/den-gyldne-gris-orden/{slug}.md`                   |
| `/den-hviide-knap`               | `posts/den-hviide-knap/` index (full content, paginated)  |
| `/den-hviide-knap/nyheter/:slug` | `posts/den-hviide-knap/YYYY-MM-DD-{slug}.md`              |
| `/den-hviide-knap/:slug`         | `pages/den-hviide-knap/{slug}.md`                         |
| `/bokuglen`                      | `pages/bokuglen/index.md`                                 |
| `/bokuglen/:slug`                | `pages/bokuglen/{slug}.md`                                |
| `/grisefestene`                  | `pages/grisefestene/index.md`                             |
| `/grisefestene/:slug`            | `pages/grisefestene/{slug}.md`                            |
| `/about`                         | `pages/about.md`                                          |
| `/chateau-neuf`                  | `pages/chateau-neuf.md`                                   |

Old Squarespace flat URLs are redirected in `next.config.ts` (`redirects()`).

### Header

Logo image: `public/images/hm-grisen-sign.png` (downloaded from Squarespace CDN).
Tagline: the full royal proclamation from the live site.
Nav: CSS-only hover dropdowns matching live site structure.

---

## Dependencies added

| Package                  | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `fast-xml-parser`        | XML parsing with CDATA and namespace support |
| `turndown`               | HTML → Markdown conversion                   |
| `gray-matter`            | Frontmatter parsing at build time            |
| `remark` + `remark-html` | Markdown → HTML                              |
| `sass`                   | SCSS compilation                             |

---

## Known content quirks to handle in rendering

1. **Gallery images** — multiple `<img>` tags with no captions appear inline in Markdown. A custom renderer could display them as a grid.
2. **`<br>` / `&nbsp;` artefacts** — Squarespace content sometimes contains empty paragraphs and non-breaking spaces; rendering should collapse these gracefully.
3. **Some posts have no content** — only a title and metadata (e.g. very old posts that were images-only on Squarespace).
4. **Draft posts** are included in the output — filter by `status: publish` if needed.
