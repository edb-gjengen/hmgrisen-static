import Link from 'next/link';
import { NAV } from '@/lib/nav';

export default function Nav() {
  return (
    <nav className="main-nav">
      <ul className="main-nav__list">
        {NAV.map((item) =>
          'children' in item ? (
            <li key={item.label} className="main-nav__item">
              {item.href ? (
                <Link href={item.href} className="main-nav__link">{item.label}</Link>
              ) : (
                <span className="main-nav__link" style={{ cursor: 'default' }}>{item.label}</span>
              )}
              <ul className="main-nav__dropdown">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link href={child.href}>{child.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={item.href} className="main-nav__item">
              <Link href={item.href} className="main-nav__link">
                {item.label}
              </Link>
            </li>
          )
        )}
      </ul>
    </nav>
  );
}
