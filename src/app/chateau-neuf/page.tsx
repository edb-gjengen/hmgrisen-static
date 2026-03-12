import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getRootPage } from '@/lib/content';

export const metadata = { title: 'Chateau Neuf' };

export default async function ChateauNeufPage() {
  const page = await getRootPage('chateau-neuf');
  if (!page) notFound();

  return (
    <PageLayout title={page.title}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
