import Link from "next/link";

type NavItem =
  | { label: string; href: string }
  | {
      label: string;
      href?: string;
      children: { label: string; href: string }[];
    };

const NAV: NavItem[] = [
  { label: "Nyheter", href: "/" },
  { label: "Historier og myter", href: "/historierogmyter" },
  { label: "Om", href: "/about" },
  { label: "Grisefestene", href: "/grisefestene" },
  {
    label: "Den Gyldne Gris' Orden",
    href: "/den-gyldne-gris-orden",
    children: [
      { label: "Anno 1859", href: "/den-gyldne-gris-orden" },
      { label: "Presensliste", href: "/den-gyldne-gris-orden/presensliste" },
      { label: "Statutter", href: "/den-gyldne-gris-orden/statutter" },
      { label: "Embedsverk", href: "/den-gyldne-gris-orden/hoff" },
      { label: "Matrikkel", href: "/den-gyldne-gris-orden/matrikkel" },
    ],
  },
  {
    label: "Den Hviide Knap",
    href: "/den-hviide-knap",
    children: [
      { label: "Knappenytt", href: "/den-hviide-knap" },
      { label: "Historie", href: "/den-hviide-knap/dhkhistorie" },
      { label: "Presensliste", href: "/den-hviide-knap/dhkpresensliste" },
      { label: "Matrikkel", href: "/den-hviide-knap/dhkmatrikkel" },
      { label: "Statutter", href: "/den-hviide-knap/dhkstatutter" },
    ],
  },
  {
    label: "Bokuglen",
    href: "/bokuglen",
    children: [
      { label: "Bokuglen", href: "/bokuglen" },
      { label: "Bokuglens historie", href: "/bokuglen/bokuglens-historie" },
      { label: "Presensliste", href: "/bokuglen/bupresensliste" },
      { label: "Matrikkel", href: "/bokuglen/bumatrikkel" },
      { label: "Statutter", href: "/bokuglen/bustatutter" },
    ],
  },
  {
    label: "Det Norske Studentersamfund",
    href: "https://studentersamfundet.no",
    children: [
      { label: "Chateau Neuf", href: "/chateau-neuf" },
      {
        label: "Det Norske Studentersamfund",
        href: "https://studentersamfundet.no",
      },
    ],
  },
];

export default function Nav() {
  return (
    <nav className="main-nav">
      <ul className="main-nav__list">
        {NAV.map((item) =>
          "href" in item ? (
            <li key={item.href} className="main-nav__item">
              <Link href={item.href} className="main-nav__link">
                {item.label}
              </Link>
            </li>
          ) : (
            <li key={item.label} className="main-nav__item">
              {item.href ? (
                <Link href={item.href} className="main-nav__link">
                  {item.label}
                </Link>
              ) : (
                <span className="main-nav__link" style={{ cursor: "default" }}>
                  {item.label}
                </span>
              )}
              <ul className="main-nav__dropdown">
                {item.children.map((child) => (
                  <li key={child.href}>
                    <Link href={child.href}>{child.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
