import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage } from '@/lib/content';

export const metadata = { title: 'Grisefestene' };

const SECTION_LINKS = [
  { label: 'Grisefestene', href: '/grisefestene' },
  { label: 'Grisefest 2004', href: '/grisefestene/grisefest2004' },
  { label: 'Grisefest 2009', href: '/grisefestene/grisefest-2009' },
  { label: 'Grisefesten 2013', href: '/grisefestene/grisefesten-2013' },
];

export default async function GrisefesteneIndex() {
  const page = await getSectionPage('grisefestene', '');
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={SECTION_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
