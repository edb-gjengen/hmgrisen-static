import Link from 'next/link';

export interface SectionNavLink {
  label: string;
  href: string;
}

export default function SectionNav({ links }: { links: SectionNavLink[] }) {
  return (
    <nav className="section-nav">
      {links.map(({ label, href }) => (
        <Link key={href} href={href}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
