import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      // ── Den Gyldne Gris' Orden ─────────────────────────────────────────────
      { source: '/presensliste',  destination: '/den-gyldne-gris-orden/presensliste',  permanent: true },
      { source: '/statutter',     destination: '/den-gyldne-gris-orden/statutter',     permanent: true },
      { source: '/hoff',          destination: '/den-gyldne-gris-orden/hoff',          permanent: true },
      { source: '/dgghoff',       destination: '/den-gyldne-gris-orden/dgghoff',       permanent: true },
      { source: '/matrikkel',     destination: '/den-gyldne-gris-orden/matrikkel',     permanent: true },
      { source: '/embedsverket',  destination: '/den-gyldne-gris-orden/embedsverket',  permanent: true },

      // ── Den Hviide Knap ────────────────────────────────────────────────────
      { source: '/dhkhistorie',                     destination: '/den-hviide-knap/historie',    permanent: true },
      { source: '/dhkpresensliste',                 destination: '/den-hviide-knap/presensliste',permanent: true },
      { source: '/dhkmatrikkel',                    destination: '/den-hviide-knap/matrikkel',   permanent: true },
      { source: '/dhkstatutter',                    destination: '/den-hviide-knap/statutter',   permanent: true },
      { source: '/studentteateret-175-r',           destination: '/den-hviide-knap/studentteateret-175-r', permanent: true },

      // ── Bokuglen ───────────────────────────────────────────────────────────
      { source: '/bokuglens-historie',       destination: '/bokuglen/historie', permanent: true },
      { source: '/bupresensliste',           destination: '/bokuglen/presensliste',       permanent: true },
      { source: '/bumatrikkel',              destination: '/bokuglen/matrikkel',          permanent: true },
      { source: '/bustatutter',              destination: '/bokuglen/statutter',          permanent: true },

      // ── Grisefestene ───────────────────────────────────────────────────────
      { source: '/grisefest2004',                 destination: '/grisefestene/2004', permanent: true },
      { source: '/grisefest-2009',                destination: '/grisefestene/2009', permanent: true },
      { source: '/grisefesten-2013',              destination: '/grisefestene/2013', permanent: true },

      // ── Old dated post URLs ────────────────────────────────────────────────
      // Squarespace used /section/YYYY/M/D/slug — redirect to flat /section/slug
      { source: '/nyheter/:year/:month/:day/:slug', destination: '/nyheter/:slug', permanent: true },
      { source: '/historierogmyter/:year/:month/:day/:slug', destination: '/historierogmyter/:slug', permanent: true },
      { source: '/anno-1899/:year/:month/:day/:slug', destination: '/den-hviide-knap/nyheter/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
