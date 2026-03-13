import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getSectionPage, getPageSlugs } from '@/lib/content';
import { DGG_LINKS } from '@/lib/nav';

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

export default async function DGGSubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('den-gyldne-gris-orden', slug);
  if (!page) notFound();

  return (
    <PageLayout title={page.title} sectionNav={DGG_LINKS}>
      <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
    </PageLayout>
  );
}
