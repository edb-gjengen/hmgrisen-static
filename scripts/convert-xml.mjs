/**
 * Converts a Squarespace/WordPress XML export to Markdown files with frontmatter.
 *
 * Usage:
 *   node scripts/convert-xml.mjs [path/to/export.xml] [--download-images]
 *
 * Output:
 *   content/posts/YYYY-MM-DD-slug.md   — blog posts
 *   content/pages/slug.md              — static pages
 *   public/images/<filename>           — downloaded images (with --download-images)
 */

import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as https from 'node:https';
import * as http from 'node:http';
import * as crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const xmlPath = args.find((a) => !a.startsWith('--')) ?? path.join(ROOT, 'export-2026-03-09.xml');
const downloadImages = args.includes('--download-images');

// ─── Output directories ──────────────────────────────────────────────────────
const OUT_POSTS = path.join(ROOT, 'content', 'posts');
const OUT_PAGES = path.join(ROOT, 'content', 'pages');
const OUT_IMAGES = path.join(ROOT, 'public', 'images');

fs.mkdirSync(OUT_POSTS, { recursive: true });
fs.mkdirSync(OUT_PAGES, { recursive: true });
if (downloadImages) fs.mkdirSync(OUT_IMAGES, { recursive: true });

// ─── XML parsing ─────────────────────────────────────────────────────────────
const xmlRaw = fs.readFileSync(xmlPath, 'utf8');
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  // Keep namespaced tags as-is; fast-xml-parser strips the colon by default
  // so  <wp:post_type> becomes  wp:post_type  when we set:
  parseAttributeValue: true,
  allowBooleanAttributes: true,
});
const parsed = parser.parse(xmlRaw);
const channel = parsed.rss.channel;

// fast-xml-parser flattens namespace prefixes with ':', but the key names
// include the full prefix, e.g.  "wp:post_type", "content:encoded", etc.
// However, colons in keys require bracket notation.

// Build author map  email → display name
const authorMap = {};
const rawAuthors = Array.isArray(channel['wp:author'])
  ? channel['wp:author']
  : [channel['wp:author']].filter(Boolean);
for (const a of rawAuthors) {
  const email = a['wp:author_login'];
  const name = a['wp:author_display_name']?.['__cdata'] ?? a['wp:author_display_name'] ?? email;
  if (email) authorMap[email] = name;
}

// ─── Turndown (HTML → Markdown) ──────────────────────────────────────────────
const td = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
});

// Strip Squarespace wrapper divs but keep their children
td.addRule('sqs-wrapper', {
  filter: (node) =>
    node.nodeName === 'DIV' &&
    (node.getAttribute('class')?.includes('sqs-html-content') ||
      node.getAttribute('class')?.includes('image-gallery-wrapper')),
  replacement: (_content, node, options) => {
    // Just return content — the div itself doesn't add meaning
    return `\n\n${_content}\n\n`;
  },
});

// Gallery images wrapped in a plain <div class="image-gallery-wrapper">
// are handled by the rule above; individual <img> tags are handled by default.

// ─── WordPress shortcode handling ────────────────────────────────────────────
/**
 * Convert [caption ...] shortcodes to Markdown image syntax with alt text.
 * Input:  [caption id="" align="alignnone" width="1000"]<img src="..." alt="X"/> caption text[/caption]
 * Output: ![caption text](url)
 */
function processShortcodes(html) {
  return html.replace(
    /\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi,
    (_match, inner) => {
      // Extract the img tag
      const imgMatch = inner.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (!imgMatch) return inner; // fallback: return inner HTML
      const src = imgMatch[1];

      // Alt from img tag
      const altMatch = imgMatch[0].match(/alt=["']([^"']*)["']/i);
      // Caption text is everything after the img tag, stripped of HTML
      const afterImg = inner.slice(inner.indexOf(imgMatch[0]) + imgMatch[0].length);
      const captionText = afterImg.replace(/<[^>]+>/g, '').trim();
      const altText = captionText || (altMatch ? altMatch[1] : '');

      return `<img src="${src}" alt="${altText.replace(/"/g, '&quot;')}">`;
    }
  );
}

// ─── Image URL collection ─────────────────────────────────────────────────────
// imageMap:  original URL (without query) → local path relative to /public
const imageMap = new Map(); // url (no query) → { localPath, filename }

function collectImages(html) {
  const urls = [];
  const re = /src=["'](https?:\/\/[^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    urls.push(m[1]);
  }
  return urls;
}

function normalizeImageUrl(url) {
  // Strip query string for deduplication, but keep it for downloading
  try {
    const u = new URL(url);
    u.search = '';
    return u.toString();
  } catch {
    return url;
  }
}

function deriveImageFilename(url) {
  try {
    const u = new URL(url);
    // Path looks like: /content/v1/SITE_ID/HASH/ORIGINAL_FILENAME.ext
    const parts = u.pathname.split('/');
    const rawName = parts[parts.length - 1]; // last segment = filename
    // Sanitise
    return rawName.replace(/[^a-zA-Z0-9.\-_]/g, '_').toLowerCase() || 'image';
  } catch {
    return 'image_' + crypto.randomBytes(4).toString('hex');
  }
}

function registerImage(rawUrl) {
  const normUrl = normalizeImageUrl(rawUrl);
  if (imageMap.has(normUrl)) return imageMap.get(normUrl);

  let filename = deriveImageFilename(rawUrl);
  // Ensure uniqueness among registered filenames
  const taken = new Set([...imageMap.values()].map((v) => v.filename));
  if (taken.has(filename)) {
    const hash = crypto.createHash('md5').update(normUrl).digest('hex').slice(0, 6);
    const ext = path.extname(filename);
    filename = path.basename(filename, ext) + '_' + hash + ext;
  }

  const entry = { normUrl, downloadUrl: rawUrl, filename, localPath: `/images/${filename}` };
  imageMap.set(normUrl, entry);
  return entry;
}

function rewriteImagesInHtml(html) {
  return html.replace(/src=["'](https?:\/\/[^"']+)["']/gi, (_m, rawUrl) => {
    const entry = registerImage(rawUrl);
    return `src="${entry.localPath}"`;
  });
}

// ─── Markdown generation ──────────────────────────────────────────────────────
function toFrontmatter(fields) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(fields)) {
    if (v == null || v === '') continue;
    // Scalar value — quote strings that need it
    if (typeof v === 'string') {
      const needsQuote = v.includes(':') || v.includes('#') || v.includes("'") || v.startsWith('>') || v.startsWith('|');
      lines.push(needsQuote ? `${k}: "${v.replace(/"/g, '\\"')}"` : `${k}: ${v}`);
    } else if (Array.isArray(v)) {
      if (v.length === 0) continue;
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${item}`);
    } else {
      lines.push(`${k}: ${v}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

function cdata(val) {
  if (!val) return '';
  if (typeof val === 'object' && '__cdata' in val) return val.__cdata ?? '';
  return String(val);
}

function convertItem(item) {
  const type = item['wp:post_type'];
  if (!['post', 'page'].includes(type)) return null;

  const status = item['wp:status'];
  if (!['publish', 'draft'].includes(status)) return null;

  const title = cdata(item.title) || '(untitled)';
  const rawLink = cdata(item.link) || '';
  // For posts/pages the link is relative (e.g. /nyheter/2013/10/6/some-slug)
  // For attachments it's a full URL — we skip those above
  const oldPermalink = rawLink.startsWith('http') ? new URL(rawLink).pathname : rawLink;

  const postName = cdata(item['wp:post_name']) || '';
  const rawDate = item['wp:post_date'] || item.pubDate || '';
  const date = typeof rawDate === 'string' ? rawDate.slice(0, 10) : '';
  const authorLogin = cdata(item['dc:creator']) || '';
  const author = authorMap[authorLogin] ?? authorLogin;
  const excerpt = cdata(item['excerpt:encoded']) || '';

  let html = cdata(item['content:encoded']) || '';
  // Pre-process shortcodes before handing off to turndown
  html = processShortcodes(html);
  // Register & rewrite image URLs (replace CDN URLs with local paths)
  html = rewriteImagesInHtml(html);

  // Convert HTML → Markdown
  let markdown = '';
  try {
    markdown = td.turndown(html || '').trim();
  } catch (e) {
    console.warn(`  Warning: HTML conversion failed for "${title}": ${e.message}`);
    markdown = html; // fallback: keep raw HTML
  }

  const frontmatter = toFrontmatter({
    title,
    date,
    author,
    status,
    type,
    oldPermalink,
    postName,
    ...(excerpt ? { excerpt } : {}),
  });

  return { frontmatter, markdown, type, date, postName, title };
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[æåä]/g, 'a')
    .replace(/[øö]/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function outputFilename(item, type, date, postName) {
  // Use the last path segment of postName as slug
  const slugRaw = postName ? postName.split('/').pop() : slugify(item.title ?? 'untitled');
  const slug = slugRaw || 'untitled';

  if (type === 'post') {
    const prefix = date || '0000-00-00';
    return path.join(OUT_POSTS, `${prefix}-${slug}.md`);
  } else {
    return path.join(OUT_PAGES, `${slug}.md`);
  }
}

// ─── Download images ──────────────────────────────────────────────────────────
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve(); // already downloaded
    const file = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow one redirect
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);

console.log(`Parsing ${items.length} items from ${path.basename(xmlPath)}…\n`);

let countPosts = 0;
let countPages = 0;
const skipped = [];

for (const item of items) {
  const result = convertItem(item);
  if (!result) continue;

  const { frontmatter, markdown, type, date, postName } = result;
  const outFile = outputFilename(item, type, date, postName);

  const content = `${frontmatter}\n\n${markdown}\n`;
  fs.writeFileSync(outFile, content, 'utf8');

  if (type === 'post') countPosts++;
  else countPages++;

  const display = path.relative(ROOT, outFile);
  console.log(`  [${type.padEnd(4)}] ${display}`);
}

console.log(`\nDone: ${countPosts} posts, ${countPages} pages written.`);
console.log(`Found ${imageMap.size} unique images referenced in content.`);

// Write an image manifest so we know which CDN URLs map to which local paths
const manifestPath = path.join(ROOT, 'content', 'image-manifest.json');
const manifest = Object.fromEntries(
  [...imageMap.entries()].map(([normUrl, entry]) => [
    normUrl,
    { localPath: entry.localPath, filename: entry.filename, downloadUrl: entry.downloadUrl },
  ])
);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Image manifest written to content/image-manifest.json`);

if (downloadImages) {
  console.log(`\nDownloading ${imageMap.size} images to public/images/ …`);
  let ok = 0;
  let fail = 0;
  for (const [, entry] of imageMap) {
    const dest = path.join(OUT_IMAGES, entry.filename);
    try {
      await downloadFile(entry.downloadUrl, dest);
      process.stdout.write('.');
      ok++;
    } catch (e) {
      process.stdout.write('x');
      fail++;
      if (process.env.VERBOSE) console.warn(`\n  Failed: ${entry.downloadUrl}: ${e.message}`);
    }
  }
  console.log(`\nImages: ${ok} downloaded, ${fail} failed.`);
} else {
  console.log(`\nRun with --download-images to fetch all images to public/images/.`);
}
