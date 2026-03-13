import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage } from '@/lib/content';
import { DGG_LINKS } from '@/lib/nav';

export const metadata = { title: "Den Gyldne Gris' Orden" };

export default async function DGGIndex() {
  const page = await getSectionPage('den-gyldne-gris-orden', '');
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={DGG_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
