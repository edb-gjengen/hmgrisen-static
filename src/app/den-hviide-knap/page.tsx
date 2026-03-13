import SectionNav from '@/components/SectionNav';
import PostListExpanded from '@/components/PostListExpanded';
import { getFullPostsBySection } from '@/lib/content';
import { DHK_LINKS } from '@/lib/nav';

export const metadata = { title: 'Den Hviide Knap – Knappenytt' };

export default async function DHKIndex() {
  const posts = await getFullPostsBySection('den-hviide-knap');
  return (
    <>
      <SectionNav links={DHK_LINKS} />
      <div className="page-content">
        <h1 className="page-content__title">Den Hviide Knap – Anno 1899</h1>
        <h2>Knappenytt</h2>
        <PostListExpanded posts={posts} hrefPrefix="/den-hviide-knap/nyheter" />
      </div>
    </>
  );
}
