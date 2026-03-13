import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage, getPageSlugs } from '@/lib/content';
import { GRISEFESTENE_LINKS } from '@/lib/nav';

export async function generateStaticParams() {
  return getPageSlugs('grisefestene').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('grisefestene', slug);
  return { title: page?.title ?? slug };
}

export default async function GrisefesteneSubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('grisefestene', slug);
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={GRISEFESTENE_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
