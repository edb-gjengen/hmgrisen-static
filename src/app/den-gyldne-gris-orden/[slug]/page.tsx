import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage, getPageSlugs } from '@/lib/content';

export async function generateStaticParams() {
  return getPageSlugs('den-gyldne-gris-orden').map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('den-gyldne-gris-orden', slug);
  return { title: page?.title ?? slug };
}

const SECTION_LINKS = [
  { label: 'Anno 1859', href: '/den-gyldne-gris-orden' },
  { label: 'Presensliste', href: '/den-gyldne-gris-orden/presensliste' },
  { label: 'Statutter', href: '/den-gyldne-gris-orden/statutter' },
  { label: 'Embedsverk', href: '/den-gyldne-gris-orden/hoff' },
  { label: 'Matrikkel', href: '/den-gyldne-gris-orden/matrikkel' },
];

export default async function DGGSubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('den-gyldne-gris-orden', slug);
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={SECTION_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
