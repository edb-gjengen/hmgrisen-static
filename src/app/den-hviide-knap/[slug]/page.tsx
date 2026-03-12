import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { getPostBySlug, getPostSlugs, getSectionPage, getPageSlugs } from '@/lib/content';

export async function generateStaticParams() {
  const postSlugs = getPostSlugs('den-hviide-knap').map((slug) => ({ slug }));
  const pageSlugs = getPageSlugs('den-hviide-knap').map((slug) => ({ slug }));
  return [...postSlugs, ...pageSlugs];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getSectionPage('den-hviide-knap', slug);
  if (page) return { title: page.title };
  const post = await getPostBySlug('den-hviide-knap', slug);
  return { title: post?.title ?? slug };
}

const SECTION_LINKS = [
  { label: 'Knappenytt', href: '/den-hviide-knap' },
  { label: 'Historie', href: '/den-hviide-knap/dhkhistorie' },
  { label: 'Presensliste', href: '/den-hviide-knap/dhkpresensliste' },
  { label: 'Matrikkel', href: '/den-hviide-knap/dhkmatrikkel' },
  { label: 'Statutter', href: '/den-hviide-knap/dhkstatutter' },
  { label: 'Studentteateret 175 år', href: '/den-hviide-knap/studentteateret-175-r' },
];

export default async function DHKSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await getSectionPage('den-hviide-knap', slug);
  if (page) {
    return (
      <PageLayout title={page.title} sectionNav={SECTION_LINKS}>
        <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
      </PageLayout>
    );
  }

  const post = await getPostBySlug('den-hviide-knap', slug);
  if (post) {
    return (
      <PageLayout
        title={post.title}
        meta={`${post.date}${post.author ? ` · ${post.author}` : ''}`}
        backLink={{ label: 'Knappenytt', href: '/den-hviide-knap' }}
      >
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </PageLayout>
    );
  }

  notFound();
}
