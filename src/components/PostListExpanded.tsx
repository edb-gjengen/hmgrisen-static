'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PostFull } from '@/lib/content';

const PAGE_SIZE = 6;

export default function PostListExpanded({
  posts,
  hrefPrefix,
}: {
  posts: PostFull[];
  hrefPrefix: string;
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = posts.slice(0, visible);

  return (
    <>
      <ul className="post-list">
        {shown.map((post) => (
          <li key={post.slug}>
            <p className="post-list__title">
              <Link href={`${hrefPrefix}/${post.slug}`}>{post.title}</Link>
            </p>
            <p className="post-list__meta">
              {post.date}
              {post.author && ` · ${post.author}`}
            </p>
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </li>
        ))}
      </ul>
      {visible < posts.length && (
        <button className="show-more-btn" onClick={() => setVisible(visible + PAGE_SIZE)}>
          Vis mer
        </button>
      )}
    </>
  );
}
