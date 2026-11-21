'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { APP_NAME } from '@/lib/config';

/* `keys`: kunci halaman yang membuat item ini aktif */
const NAV_ITEMS: { keys: NavKey[]; href: string; label: string }[] = [
  { keys: ['home', 'search'], href: '/', label: 'Beranda' },
  { keys: ['how'], href: '/about#cara-kerja', label: 'Cara Kerja' },
  { keys: ['user'], href: '/about', label: 'Tentang' },
];

/* Wordmark: "Cari" + ".in" berwarna aksen. Tanpa ikon sparkle. */
function Wordmark() {
  const [head, ...rest] = APP_NAME.split('.');
  return rest.length ? <>{head}<span className="logo__dot">.{rest.join('.')}</span></> : APP_NAME;
}

type NavKey = 'home' | 'search' | 'how' | 'user';

function activeKey(pathname: string, hash: string): NavKey {
  if (pathname.startsWith('/about')) return hash === '#cara-kerja' ? 'how' : 'user';
  if (pathname.startsWith('/product')) return 'search';
  return hash === '#cari' ? 'search' : 'home';
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [hash, setHash] = useState('');

  // Navigasi Next.js tidak selalu memicu "hashchange", jadi baca ulang hash saat path berubah juga
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [pathname]);

  const active = activeKey(pathname, hash);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="logo" href="/" aria-label={`${APP_NAME} — beranda`}><Wordmark /></Link>
        <nav className="site-nav" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => {
            const isActive = item.keys.includes(active);
            const itemHash = item.href.includes('#') ? item.href.slice(item.href.indexOf('#')) : '';
            return (
              <Link
                key={item.href}
                className={`nav-item${isActive ? ' is-active' : ''}`}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setHash(itemHash)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
