import { APP_NAME } from '@/lib/config';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>© {year} {APP_NAME} · Proyek Kecerdasan Komputasional &amp; NLP, Universitas Pelita Harapan</p>
        <p>Prototipe — data masih dummy</p>
      </div>
    </footer>
  );
}
