import Link from 'next/link';
import SectionNav from '@/components/SectionNav';
import { getPostsBySection } from '@/lib/content';

export const metadata = { title: 'Den Hviide Knap – Knappenytt' };

const SECTION_LINKS = [
  { label: 'Knappenytt', href: '/den-hviide-knap' },
  { label: 'Historie', href: '/den-hviide-knap/dhkhistorie' },
  { label: 'Presensliste', href: '/den-hviide-knap/dhkpresensliste' },
  { label: 'Matrikkel', href: '/den-hviide-knap/dhkmatrikkel' },
  { label: 'Statutter', href: '/den-hviide-knap/dhkstatutter' },
  { label: 'Studentteateret 175 år', href: '/den-hviide-knap/studentteateret-175-r' },
];

export default function DHKIndex() {
  const posts = getPostsBySection('den-hviide-knap');
  return (
    <>
      <SectionNav links={SECTION_LINKS} />
      <div className="page-content">
        <h1 className="page-content__title">Den Hviide Knap – Knappenytt</h1>
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <p className="post-list__title">
                <Link href={`/anno-1899/${post.slug}`}>{post.title}</Link>
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
