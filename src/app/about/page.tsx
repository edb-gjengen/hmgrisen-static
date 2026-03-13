import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getRootPage } from '@/lib/content';

export const metadata = { title: 'Om Hans Majestet den Gyldne Gris' };

export default async function AboutPage() {
  const page = await getRootPage('about');
  if (!page) notFound();

  return (
    <PageLayout title={page.title}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
