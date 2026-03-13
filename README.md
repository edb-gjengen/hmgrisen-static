# hmgrisen-static

Static Next.js site for [hmgrisen.com](https://hmgrisen.com) — the web presence of Den Gyldne Gris' Orden, Den Hviide Knap, and Bokuglen, three orders affiliated with Det Norske Studentersamfund.

Converted from a Squarespace export (`export-2026-03-09.xml`). Content lives as Markdown in `content/`, images in `public/images/` (not committed), documents in `public/files/` (not committed) . Old Squarespace URLs are preserved via redirects in `next.config.ts`.

## Setup

This project uses [mise](https://mise.jdx.dev) to manage the Node.js version.

```bash
mise trust
mise install
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

Produces a fully static export in `out/`.

## Content structure

```
content/
  posts/
    nyheter/           # Main news
    historierogmyter/  # Stories & myths
    den-hviide-knap/   # DHK news (Knappenytt)
  pages/
    den-gyldne-gris-orden/
    den-hviide-knap/
    bokuglen/
    grisefestene/
    about.md
    chateau-neuf.md
```

Pages and posts use YAML frontmatter (`title`, `date`, `author`, `status`, `oldPermalink`).

See [AGENTS.md](AGENTS.md) for the full architecture and conversion notes.
