import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage, getPageSlugs } from '@/lib/content';
import { BOKUGLEN_LINKS } from '@/lib/nav';

export async function generateStaticParams() {
  return getPageSlugs('bokuglen').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('bokuglen', slug);
  return { title: page?.title ?? slug };
}

export default async function BokuglenSubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('bokuglen', slug);
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={BOKUGLEN_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
