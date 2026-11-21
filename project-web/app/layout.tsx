import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Manrope, Playfair_Display } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { APP_NAME } from '@/lib/config';
import './styles/tokens.css';
import './styles/style.css';

// Font sama seperti desain (Manrope untuk teks, Playfair Display untuk judul)
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: 'Cari produk skincare dengan bahasa sehari-hari menggunakan pencarian semantik.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${manrope.variable} ${playfair.variable}`}>
      <body>
        <a className="skip-link" href="#main">Lewati ke konten utama</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
