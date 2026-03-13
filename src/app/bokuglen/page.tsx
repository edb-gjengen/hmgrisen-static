import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage } from '@/lib/content';
import { BOKUGLEN_LINKS } from '@/lib/nav';

export const metadata = { title: 'Bokuglen' };

export default async function BokuglenIndex() {
  const page = await getSectionPage('bokuglen', '');
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={BOKUGLEN_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
