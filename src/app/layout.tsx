import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant_SC } from "next/font/google";
import Image from "next/image";
import Nav from "@/components/Nav";
import SlideshowInit from "@/components/SlideshowInit";
import "@/css/main.scss";

const garamond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

const cormorantSC = Cormorant_SC({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hans Majestet den Gyldne Gris",
    template: "%s · Hans Majestet den Gyldne Gris",
  },
  description:
    "af høi Stegen Magt og Fedme, Hersker over Soon, Swinemünde og Sylt, Ribbungers og Galtungers Ætlig, Herre over Grisehusets Ynglige, de dunede og børstede, de Poters og Lenders, Folks Første, Skovens allerstørste",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no" className={`${garamond.variable} ${cormorantSC.variable}`}>
      <body>
        <header className="site-header">
          <div className="site-header__logo">
            <Image
              src="/images/hm-grisen-sign.png"
              alt="Hans Majestet den Gyldne Gris"
              width={840}
              height={428}
              priority
            />
          </div>
          <p className="site-header__title">Hans Majestet den Gyldne Gris</p>
          <p className="site-header__tagline">
            af høi Stegen Magt og Fedme, Hersker over Soon, Swinemünde og Sylt,
            Ribbungers og Galtungers Ætlig, Herre over Grisehusets Ynglige, de
            dunede og børstede, de Poters og Lenders, Folks Første, Skovens
            allerstørste
          </p>
          <Nav />
        </header>
        <main className="page-wrapper">{children}</main>
        <SlideshowInit />
      </body>
    </html>
  );
}
