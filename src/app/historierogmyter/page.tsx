import Link from 'next/link';
import { getPostsBySection } from '@/lib/content';

export const metadata = { title: 'Historier og myter' };

export default function HistorierIndex() {
  const posts = getPostsBySection('historierogmyter');
  return (
    <div className="page-content">
      <h1 className="page-content__title">Historier og myter</h1>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.slug}>
            <p className="post-list__title">
              <Link href={`/historierogmyter/${post.slug}`}>{post.title}</Link>
            </p>
            <p className="post-list__meta">
              {post.date}
              {post.author && ` · ${post.author}`}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
