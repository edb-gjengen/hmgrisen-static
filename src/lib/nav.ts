export type NavLink = { label: string; href: string };

export type NavItem =
  | NavLink
  | { label: string; href?: string; children: NavLink[] };

export const DGG_LINKS: NavLink[] = [
  { label: 'Anno 1859', href: '/den-gyldne-gris-orden' },
  { label: 'Presensliste', href: '/den-gyldne-gris-orden/presensliste' },
  { label: 'Statutter', href: '/den-gyldne-gris-orden/statutter' },
  { label: 'Embedsverk', href: '/den-gyldne-gris-orden/hoff' },
  { label: 'Matrikkel', href: '/den-gyldne-gris-orden/matrikkel' },
];

export const DHK_LINKS: NavLink[] = [
  { label: 'Knappenytt', href: '/den-hviide-knap' },
  { label: 'Historie', href: '/den-hviide-knap/dhkhistorie' },
  { label: 'Presensliste', href: '/den-hviide-knap/dhkpresensliste' },
  { label: 'Matrikkel', href: '/den-hviide-knap/dhkmatrikkel' },
  { label: 'Statutter', href: '/den-hviide-knap/dhkstatutter' },
  { label: 'Studentteateret 175 år', href: '/den-hviide-knap/studentteateret-175-r' },
];

export const GRISEFESTENE_LINKS: NavLink[] = [
  { label: 'Grisefestene', href: '/grisefestene' },
  { label: 'Grisefest 2004', href: '/grisefestene/grisefest2004' },
  { label: 'Grisefest 2009', href: '/grisefestene/grisefest-2009' },
  { label: 'Grisefesten 2013', href: '/grisefestene/grisefesten-2013' },
];

export const BOKUGLEN_LINKS: NavLink[] = [
  { label: 'Bokuglen', href: '/bokuglen' },
  { label: 'Bokuglens historie', href: '/bokuglen/bokuglens-historie' },
  { label: 'Presensliste', href: '/bokuglen/bupresensliste' },
  { label: 'Matrikkel', href: '/bokuglen/bumatrikkel' },
  { label: 'Statutter', href: '/bokuglen/bustatutter' },
];

export const NAV: NavItem[] = [
  { label: 'Nyheter', href: '/' },
  { label: 'Historier og myter', href: '/historierogmyter' },
  { label: 'Om', href: '/about' },
  { label: 'Grisefestene', href: '/grisefestene' },
  {
    label: "Den Gyldne Gris' Orden",
    href: '/den-gyldne-gris-orden',
    children: DGG_LINKS,
  },
  {
    label: 'Den Hviide Knap',
    href: '/den-hviide-knap',
    children: DHK_LINKS,
  },
  {
    label: 'Bokuglen',
    href: '/bokuglen',
    children: BOKUGLEN_LINKS,
  },
  {
    label: 'Det Norske Studentersamfund',
    href: 'https://studentersamfundet.no',
    children: [
      { label: 'Chateau Neuf', href: '/chateau-neuf' },
      { label: 'Det Norske Studentersamfund', href: 'https://studentersamfundet.no' },
    ],
  },
];
