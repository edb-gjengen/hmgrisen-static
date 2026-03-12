import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getRootPage } from '@/lib/content';

export const metadata = { title: 'Om' };

export default async function AboutPage() {
  const page = await getRootPage('about');
  if (!page) notFound();

  return (
    <PageLayout title={page.title}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
