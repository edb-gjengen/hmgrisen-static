/**
 * Reorganizes content/ into section subdirectories and adds a `section`
 * frontmatter field to every file, based on the site's navigation structure.
 *
 * Run ONCE after convert-xml.mjs:
 *   node scripts/reorganize-content.mjs [--dry-run]
 *
 * Directory structure produced:
 *
 *   content/
 *     posts/
 *       nyheter/          ← oldPermalink starts with /nyheter/
 *       historierogmyter/ ← oldPermalink starts with /historierogmyter/
 *       den-hviide-knap/  ← oldPermalink starts with /anno-1899/
 *     pages/
 *       den-gyldne-gris-orden/
 *       den-hviide-knap/
 *       bokuglen/
 *       grisefestene/
 *       _squarespace/     ← Squarespace design template pages (kept for reference)
 *       (root)            ← about, chateau-neuf, contact, etc.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const PAGES_DIR = path.join(ROOT, 'content', 'pages');

// ─── Section mapping ──────────────────────────────────────────────────────────

// For posts: keyed on the first segment of oldPermalink
const POST_SECTION_BY_PREFIX = {
  nyheter:          { section: 'nyheter',          dir: 'nyheter' },
  historierogmyter: { section: 'historierogmyter',  dir: 'historierogmyter' },
  'anno-1899':      { section: 'den-hviide-knap',   dir: 'den-hviide-knap' },
};

// For pages: keyed on oldPermalink (exact match)
const PAGE_SECTION_BY_PERMALINK = {
  // Den Gyldne Gris' Orden
  '/den-gyldne-gris-orden': { section: 'den-gyldne-gris-orden', dir: 'den-gyldne-gris-orden', rename: 'index.md' },
  '/presensliste':           { section: 'den-gyldne-gris-orden', dir: 'den-gyldne-gris-orden' },
  '/statutter':              { section: 'den-gyldne-gris-orden', dir: 'den-gyldne-gris-orden' },
  '/hoff':                   { section: 'den-gyldne-gris-orden', dir: 'den-gyldne-gris-orden' },
  '/dgghoff':                { section: 'den-gyldne-gris-orden', dir: 'den-gyldne-gris-orden' },
  '/matrikkel':              { section: 'den-gyldne-gris-orden', dir: 'den-gyldne-gris-orden' },
  '/embedsverket':           { section: 'den-gyldne-gris-orden', dir: 'den-gyldne-gris-orden' },

  // Den Hviide Knap
  '/dhkhistorie':    { section: 'den-hviide-knap', dir: 'den-hviide-knap' },
  '/dhkpresensliste':{ section: 'den-hviide-knap', dir: 'den-hviide-knap' },
  '/dhkmatrikkel':   { section: 'den-hviide-knap', dir: 'den-hviide-knap' },
  '/dhkstatutter':   { section: 'den-hviide-knap', dir: 'den-hviide-knap' },

  // Bokuglen
  '/anno-1924':         { section: 'bokuglen', dir: 'bokuglen', rename: 'index.md' },
  '/bokuglens-historie':{ section: 'bokuglen', dir: 'bokuglen' },
  '/bupresensliste':    { section: 'bokuglen', dir: 'bokuglen' },
  '/bumatrikkel':       { section: 'bokuglen', dir: 'bokuglen' },
  '/bustatutter':       { section: 'bokuglen', dir: 'bokuglen' },

  // Grisefestene
  '/grisefestene':    { section: 'grisefestene', dir: 'grisefestene', rename: 'index.md' },
  '/grisefest2004':   { section: 'grisefestene', dir: 'grisefestene' },
  '/grisefest-2009':  { section: 'grisefestene', dir: 'grisefestene' },
  '/grisefesten-2013':{ section: 'grisefestene', dir: 'grisefestene' },

  // Squarespace design template pages – keep but quarantine
  '/grid':      { section: null, dir: '_squarespace' },
  '/slider':    { section: null, dir: '_squarespace' },
  '/slideshow': { section: null, dir: '_squarespace' },
  '/portfolio': { section: null, dir: '_squarespace' },
  '/archive':   { section: null, dir: '_squarespace' },

  // Den Hviide Knap (continued)
  '/studentteateret-175-r':  { section: 'den-hviide-knap', dir: 'den-hviide-knap' },

  // Root standalone pages – no section, stay at root
  '/about':       { section: null, dir: null },
  '/chateau-neuf':{ section: null, dir: null },
  '/contact':     { section: null, dir: null },
};

// ─── Frontmatter helpers ──────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  return { raw: match[1], body: match[2] };
}

function getField(raw, key) {
  const m = raw.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

function setField(raw, key, value) {
  const line = `${key}: ${value}`;
  // Replace existing field
  if (new RegExp(`^${key}:`, 'm').test(raw)) {
    return raw.replace(new RegExp(`^${key}:.*$`, 'm'), line);
  }
  // Insert after `type:` line (or at end)
  if (/^type:/m.test(raw)) {
    return raw.replace(/^(type:.*)$/m, `$1\n${line}`);
  }
  return raw + `\n${line}`;
}

function rebuildFile(raw, body) {
  return `---\n${raw.trimEnd()}\n---\n${body}`;
}

// ─── File operations ──────────────────────────────────────────────────────────

function moveFile(src, dest) {
  if (DRY_RUN) {
    console.log(`  move  ${path.relative(ROOT, src)}`);
    console.log(`     →  ${path.relative(ROOT, dest)}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.renameSync(src, dest);
}

function updateFrontmatter(filePath, section) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = parseFrontmatter(content);
  if (!parsed) return;
  let { raw, body } = parsed;
  if (section) {
    raw = setField(raw, 'section', section);
  }
  if (!DRY_RUN) {
    fs.writeFileSync(filePath, rebuildFile(raw, body), 'utf8');
  }
}

// ─── Process posts ────────────────────────────────────────────────────────────
console.log('── Posts ─────────────────────────────────────────────────────────');

const postFiles = fs.readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md') && !fs.statSync(path.join(POSTS_DIR, f)).isDirectory());

let movedPosts = 0, unknownPosts = 0;

for (const file of postFiles) {
  const src = path.join(POSTS_DIR, file);
  const content = fs.readFileSync(src, 'utf8');
  const parsed = parseFrontmatter(content);
  if (!parsed) { console.warn(`  skip (no frontmatter): ${file}`); continue; }

  const permalink = getField(parsed.raw, 'oldPermalink') || '';
  // First path segment (strip leading slash, take up to next slash)
  const prefix = permalink.replace(/^\//, '').split('/')[0];
  const mapping = POST_SECTION_BY_PREFIX[prefix];

  if (!mapping) {
    console.log(`  ??? (unknown section) ${file}  ← ${permalink}`);
    unknownPosts++;
    continue;
  }

  const destDir = path.join(POSTS_DIR, mapping.dir);
  const dest = path.join(destDir, file);
  console.log(`  [${mapping.section}] ${file}`);
  moveFile(src, dest);
  updateFrontmatter(DRY_RUN ? src : dest, mapping.section);
  movedPosts++;
}

// ─── Process pages ────────────────────────────────────────────────────────────
console.log('\n── Pages ─────────────────────────────────────────────────────────');

const pageFiles = fs.readdirSync(PAGES_DIR)
  .filter((f) => f.endsWith('.md') && !fs.statSync(path.join(PAGES_DIR, f)).isDirectory());

let movedPages = 0, rootPages = 0, unknownPages = 0;

for (const file of pageFiles) {
  const src = path.join(PAGES_DIR, file);
  const content = fs.readFileSync(src, 'utf8');
  const parsed = parseFrontmatter(content);
  if (!parsed) { console.warn(`  skip (no frontmatter): ${file}`); continue; }

  const permalink = getField(parsed.raw, 'oldPermalink') || '';
  const mapping = PAGE_SECTION_BY_PERMALINK[permalink];

  if (!mapping) {
    console.log(`  ??? (unmapped) ${file}  ← ${permalink}`);
    unknownPages++;
    continue;
  }

  if (mapping.dir === null) {
    // Stays at root — just add section field if present
    console.log(`  [root] ${file}`);
    updateFrontmatter(src, mapping.section);
    rootPages++;
    continue;
  }

  const filename = mapping.rename ?? file;
  const destDir = path.join(PAGES_DIR, mapping.dir);
  const dest = path.join(destDir, filename);

  const sectionLabel = mapping.section ?? '_squarespace';
  console.log(`  [${sectionLabel}] ${file}${mapping.rename ? ` → ${filename}` : ''}`);
  moveFile(src, dest);
  updateFrontmatter(DRY_RUN ? src : dest, mapping.section);
  movedPages++;
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`
Summary${DRY_RUN ? ' (dry run — no files changed)' : ''}:
  Posts moved:    ${movedPosts}  (unknown: ${unknownPosts})
  Pages moved:    ${movedPages}  (stayed at root: ${rootPages}, unmapped: ${unknownPages})
`);

if (!DRY_RUN) {
  console.log('New structure:');
  for (const [base, label] of [[POSTS_DIR, 'posts'], [PAGES_DIR, 'pages']]) {
    const list = fs.readdirSync(base, { withFileTypes: true });
    for (const entry of list) {
      if (entry.isDirectory()) {
        const count = fs.readdirSync(path.join(base, entry.name)).filter(f => f.endsWith('.md')).length;
        console.log(`  content/${label}/${entry.name}/  (${count} files)`);
      } else if (entry.name.endsWith('.md')) {
        console.log(`  content/${label}/${entry.name}`);
      }
    }
  }
}
