import Link from 'next/link';
import SectionNav, { type SectionNavLink } from './SectionNav';

interface Props {
  title: string;
  meta?: string;
  sectionNav?: SectionNavLink[];
  backLink?: { label: string; href: string };
  children: React.ReactNode;
}

export default function PageLayout({
  title,
  meta,
  sectionNav,
  backLink,
  children,
}: Props) {
  return (
    <>
      {sectionNav && <SectionNav links={sectionNav} />}
      <div className="page-content">
        {backLink && (
          <Link href={backLink.href} className="page-content__back">
            ← {backLink.label}
          </Link>
        )}
        <h1 className="page-content__title">{title}</h1>
        {meta && <p className="page-content__meta">{meta}</p>}
        <div className="article-body">{children}</div>
      </div>
    </>
  );
}
