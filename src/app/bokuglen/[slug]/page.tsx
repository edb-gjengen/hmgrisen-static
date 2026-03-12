import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage, getPageSlugs } from '@/lib/content';

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

const SECTION_LINKS = [
  { label: 'Anno 1924', href: '/bokuglen' },
  { label: 'Bokuglens historie', href: '/bokuglen/bokuglens-historie' },
  { label: 'Presensliste', href: '/bokuglen/bupresensliste' },
  { label: 'Matrikkel', href: '/bokuglen/bumatrikkel' },
  { label: 'Statutter', href: '/bokuglen/bustatutter' },
];

export default async function BokuglenSubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('bokuglen', slug);
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={SECTION_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
