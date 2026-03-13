import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getPostBySlug, getPostSlugs } from '@/lib/content';

export async function generateStaticParams() {
  return getPostSlugs('den-hviide-knap').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug('den-hviide-knap', slug);
  return { title: post?.title ?? slug };
}

export default async function DHKNyheterPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug('den-hviide-knap', slug);
  if (!post) notFound();

  return (
    <PageLayout
      title={post.title}
      meta={`${post.date}${post.author ? ` · ${post.author}` : ''}`}
      backLink={{ label: 'Knappenytt', href: '/den-hviide-knap' }}
    >
      <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </PageLayout>
  );
}
