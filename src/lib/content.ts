import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { visit } from 'unist-util-visit';
import type { Root, Paragraph } from 'mdast';

const YT_WATCH = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/;
const YT_SHORT = /^https?:\/\/youtu\.be\/([\w-]+)/;

function remarkSlideshow() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      const images = node.children.filter((c) => c.type === 'image');
      const nonImageNonSpace = node.children.filter(
        (c) =>
          !(
            c.type === 'image' ||
            (c.type === 'text' && /^\s*$/.test((c as { value: string }).value))
          )
      );
      if (images.length < 2 || nonImageNonSpace.length > 0) return;
      if (index == null || !parent) return;

      const slides = images
        .map(
          (img) =>
            `<figure class="slideshow__slide"><img src="${(img as { url: string }).url}" alt="${(img as { alt: string }).alt ?? ''}" loading="lazy" /></figure>`
        )
        .join('');

      const html = `<div class="slideshow"><div class="slideshow__track">${slides}</div><button class="slideshow__btn slideshow__btn--prev" aria-label="Forrige">&#8249;</button><button class="slideshow__btn slideshow__btn--next" aria-label="Neste">&#8250;</button></div>`;
      (parent.children as unknown[]).splice(index, 1, { type: 'html', value: html });
    });
  };
}

function remarkYouTube() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (node.children.length !== 1) return;
      const child = node.children[0];
      const url =
        child.type === 'text' ? child.value.trim() :
        child.type === 'link' ? child.url : null;
      if (!url) return;
      const videoId = (url.match(YT_WATCH) ?? url.match(YT_SHORT))?.[1];
      if (!videoId || index == null || !parent) return;
      const html = `<div class="video-embed"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" allowfullscreen loading="lazy" title="YouTube video"></iframe></div>`;
      (parent.children as unknown[]).splice(index, 1, { type: 'html', value: html });
    });
  };
}

const CONTENT_ROOT = path.join(process.cwd(), 'content');

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  author: string;
  status: string;
  section: string;
  oldPermalink: string;
  excerpt?: string;
}

export interface PostFull extends PostMeta {
  contentHtml: string;
}

export interface PageFull {
  slug: string;
  title: string;
  date: string;
  status: string;
  section: string | null;
  oldPermalink: string;
  contentHtml: string;
}

function postSlugFromFilename(filename: string): string {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
}

function serializeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? '');
}

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkSlideshow)
    .use(remarkYouTube)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return result.toString();
}

/** Returns published posts sorted newest first. */
export function getPostsBySection(section: string): PostMeta[] {
  const dir = path.join(CONTENT_ROOT, 'posts', section);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  return files
    .map((filename) => {
      const { data } = matter(
        fs.readFileSync(path.join(dir, filename), 'utf8')
      );
      return {
        slug: postSlugFromFilename(filename),
        title: data.title ?? '',
        date: serializeDate(data.date),
        author: data.author ?? '',
        status: data.status ?? '',
        section: data.section ?? section,
        oldPermalink: data.oldPermalink ?? '',
        excerpt: data.excerpt ?? undefined,
      } satisfies PostMeta;
    })
    .filter((p) => p.status === 'publish')
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Returns all slugs for a post section (including drafts, for static params). */
export function getPostSlugs(section: string): string[] {
  const dir = path.join(CONTENT_ROOT, 'posts', section);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map(postSlugFromFilename);
}

export async function getPostBySlug(
  section: string,
  slug: string
): Promise<PostFull | null> {
  const dir = path.join(CONTENT_ROOT, 'posts', section);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const filename = files.find((f) => postSlugFromFilename(f) === slug);
  if (!filename) return null;
  const { data, content } = matter(
    fs.readFileSync(path.join(dir, filename), 'utf8')
  );
  const contentHtml = await markdownToHtml(content);
  return {
    slug,
    title: data.title ?? '',
    date: serializeDate(data.date),
    author: data.author ?? '',
    status: data.status ?? '',
    section: data.section ?? section,
    oldPermalink: data.oldPermalink ?? '',
    excerpt: data.excerpt ?? undefined,
    contentHtml,
  };
}

/** Returns slugs for sub-pages in a section directory (excludes index.md). */
export function getPageSlugs(dir: string): string[] {
  const dirPath = path.join(CONTENT_ROOT, 'pages', dir);
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .map((f) => f.replace(/\.md$/, ''));
}

/**
 * Returns the content of a section page.
 * Pass slug='' to get index.md, otherwise slug='presensliste' etc.
 */
export async function getSectionPage(
  dir: string,
  slug: string
): Promise<PageFull | null> {
  const filename = slug === '' ? 'index.md' : `${slug}.md`;
  const filePath = path.join(CONTENT_ROOT, 'pages', dir, filename);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, 'utf8'));
  const contentHtml = await markdownToHtml(content);
  return {
    slug,
    title: data.title ?? '',
    date: serializeDate(data.date),
    status: data.status ?? '',
    section: data.section ?? null,
    oldPermalink: data.oldPermalink ?? '',
    contentHtml,
  };
}

/** Returns a root-level standalone page (about, chateau-neuf, etc.). */
export async function getRootPage(slug: string): Promise<PageFull | null> {
  const filePath = path.join(CONTENT_ROOT, 'pages', `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const { data, content } = matter(fs.readFileSync(filePath, 'utf8'));
  const contentHtml = await markdownToHtml(content);
  return {
    slug,
    title: data.title ?? '',
    date: serializeDate(data.date),
    status: data.status ?? '',
    section: data.section ?? null,
    oldPermalink: data.oldPermalink ?? '',
    contentHtml,
  };
}
