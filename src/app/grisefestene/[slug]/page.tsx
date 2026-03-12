import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage, getPageSlugs } from '@/lib/content';

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

const SECTION_LINKS = [
  { label: 'Grisefestene', href: '/grisefestene' },
  { label: 'Grisefest 2004', href: '/grisefestene/grisefest2004' },
  { label: 'Grisefest 2009', href: '/grisefestene/grisefest-2009' },
  { label: 'Grisefesten 2013', href: '/grisefestene/grisefesten-2013' },
];

export default async function GrisefesteneSubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('grisefestene', slug);
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={SECTION_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
