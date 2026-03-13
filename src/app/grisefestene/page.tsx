import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage } from '@/lib/content';
import { GRISEFESTENE_LINKS } from '@/lib/nav';

export const metadata = { title: 'Grisefestene' };

export default async function GrisefesteneIndex() {
  const page = await getSectionPage('grisefestene', '');
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={GRISEFESTENE_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
