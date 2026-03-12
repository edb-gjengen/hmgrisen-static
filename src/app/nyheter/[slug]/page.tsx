import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getPostBySlug, getPostSlugs } from '@/lib/content';

export async function generateStaticParams() {
  return getPostSlugs('nyheter').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug('nyheter', slug);
  return { title: post?.title ?? slug };
}

export default async function NyheterPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug('nyheter', slug);
  if (!post) notFound();

  return (
    <PageLayout
      title={post.title}
      meta={`${post.date}${post.author ? ` · ${post.author}` : ''}`}
      backLink={{ label: 'Nyheter', href: '/' }}
    >
      <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </PageLayout>
  );
}
