import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage } from '@/lib/content';

export const metadata = { title: "Den Gyldne Gris' Orden" };

const SECTION_LINKS = [
  { label: 'Anno 1859', href: '/den-gyldne-gris-orden' },
  { label: 'Presensliste', href: '/den-gyldne-gris-orden/presensliste' },
  { label: 'Statutter', href: '/den-gyldne-gris-orden/statutter' },
  { label: 'Embedsverk', href: '/den-gyldne-gris-orden/hoff' },
  { label: 'Matrikkel', href: '/den-gyldne-gris-orden/matrikkel' },
];

export default async function DGGIndex() {
  const page = await getSectionPage('den-gyldne-gris-orden', '');
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={SECTION_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
