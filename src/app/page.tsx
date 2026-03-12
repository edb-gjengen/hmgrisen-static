import Link from 'next/link';
import { getPostsBySection } from '@/lib/content';

export default function NyheterIndex() {
  const posts = getPostsBySection('nyheter');
  return (
    <div className="page-content">
      <h1 className="page-content__title">Nyheter</h1>
      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.slug}>
            <p className="post-list__title">
              <Link href={`/nyheter/${post.slug}`}>{post.title}</Link>
            </p>
            <p className="post-list__meta">
              {post.date}
              {post.author && ` · ${post.author}`}
            </p>
            {post.excerpt && (
              <p className="post-list__excerpt">{post.excerpt}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
