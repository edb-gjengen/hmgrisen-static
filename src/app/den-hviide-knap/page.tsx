import Link from 'next/link';
import SectionNav from '@/components/SectionNav';
import { getPostsBySection } from '@/lib/content';
import { DHK_LINKS } from '@/lib/nav';

export const metadata = { title: 'Den Hviide Knap – Knappenytt' };

export default function DHKIndex() {
  const posts = getPostsBySection('den-hviide-knap');
  return (
    <>
      <SectionNav links={DHK_LINKS} />
      <div className="page-content">
        <h1 className="page-content__title">Den Hviide Knap – Anno 1899</h1>
        <h2>Knappenytt</h2>
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <p className="post-list__title">
                <Link href={`/den-hviide-knap/nyheter/${post.slug}`}>{post.title}</Link>
              </p>
              <p className="post-list__meta">
                {post.date}
                {post.author && ` · ${post.author}`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
