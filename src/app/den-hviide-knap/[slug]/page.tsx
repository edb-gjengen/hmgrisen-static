import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage, getPageSlugs } from '@/lib/content';
import { DHK_LINKS } from '@/lib/nav';

export async function generateStaticParams() {
  return getPageSlugs('den-hviide-knap').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('den-hviide-knap', slug);
  return { title: page?.title ?? slug };
}

export default async function DHKSubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('den-hviide-knap', slug);
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={DHK_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
