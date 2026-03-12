import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage } from '@/lib/content';

export const metadata = { title: 'Bokuglen' };

const SECTION_LINKS = [
  { label: 'Bokuglen', href: '/bokuglen' },
  { label: 'Bokuglens historie', href: '/bokuglen/bokuglens-historie' },
  { label: 'Presensliste', href: '/bokuglen/bupresensliste' },
  { label: 'Matrikkel', href: '/bokuglen/bumatrikkel' },
  { label: 'Statutter', href: '/bokuglen/bustatutter' },
];

export default async function BokuglenIndex() {
  const page = await getSectionPage('bokuglen', '');
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={SECTION_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
