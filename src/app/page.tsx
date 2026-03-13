import { getFullPostsBySection } from '@/lib/content';
import PostListExpanded from '@/components/PostListExpanded';

export default async function NyheterIndex() {
  const posts = await getFullPostsBySection('nyheter');
  return (
    <div className="page-content">
      <h1 className="page-content__title">Nyheter</h1>
      <PostListExpanded posts={posts} hrefPrefix="/nyheter" />
    </div>
  );
}
