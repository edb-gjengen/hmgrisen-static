import { getFullPostsBySection } from '@/lib/content';
import PostListExpanded from '@/components/PostListExpanded';

export const metadata = { title: 'Historier og myter' };

export default async function HistorierIndex() {
  const posts = await getFullPostsBySection('historierogmyter');
  return (
    <div className="page-content">
      <h1 className="page-content__title">Historier og myter</h1>
      <PostListExpanded posts={posts} hrefPrefix="/historierogmyter" />
    </div>
  );
}
