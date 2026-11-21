import type { Metadata } from 'next';
import Icon from '@/components/Icon';
import { APP_NAME } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Tentang',
  description: `Cara kerja dan latar belakang proyek ${APP_NAME}: pencarian semantik dan tanya-jawab ulasan produk skincare.`,
};

const STEPS = [
  { icon: 'keyboard', title: 'Kamu mengetik kebutuhan', text: 'Kalimat biasa, misalnya "sunscreen yang tidak bikin wajah mengilap".' },
  { icon: 'layers', title: 'Teks diubah jadi vektor makna', text: 'Kueri dan potongan deskripsi produk diubah menjadi embedding.' },
  { icon: 'columns', title: 'Dibandingkan dengan katalog', text: 'Kemiripan dihitung dengan cosine similarity untuk setiap potongan.' },
  { icon: 'list', title: 'Diurutkan berdasarkan relevansi', text: 'Produk dengan skor tertinggi tampil paling atas, lengkap dengan skornya.' },
];

const TEAM = [
  { initials: 'GE', name: 'Gabriel Emil' },
  { initials: 'DL', name: 'Daniel G.O. Latupeirissa' },
  { initials: 'KL', name: 'Kenny Lay' },
];

function Metric({ label, note }: { label: string; note: string }) {
  return (
    <div className="metric">
      <p className="metric__label">{label}</p>
      <p className="metric__value">—</p>
      <p className="metric__note">{note}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main id="main" className="container">
      {/* ===== Intro ===== */}
      <section className="about-hero" aria-labelledby="about-title">
        <p className="eyebrow">Tentang proyek</p>
        <h1 className="page-title" id="about-title">Dua sistem, <em>satu katalog skincare.</em></h1>
        <p className="section-lead">
          {APP_NAME} adalah prototipe proyek kelompok untuk mata kuliah
          Kecerdasan Komputasional dan Natural Language Processing di Universitas Pelita Harapan.
          Data di halaman ini masih dummy; model aslinya nanti dihubungkan lewat API.
        </p>
      </section>

      {/* ===== Cara kerja ===== */}
      <section className="section" id="cara-kerja" aria-labelledby="how-title">
        <p className="eyebrow">Cara kerja</p>
        <h2 className="section-title" id="how-title">Bagaimana {APP_NAME} memahami pencarianmu?</h2>

        <ol className="steps" aria-label="Alur pencarian semantik">
          {STEPS.map((s) => (
            <li className="step" key={s.icon}>
              <span className="step__icon"><Icon name={s.icon} size={20} /></span>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__text">{s.text}</p>
            </li>
          ))}
        </ol>

        {/* Perbandingan kata kunci vs semantik (ilustrasi) */}
        <article className="versus card">
          <div className="versus__head">
            <h3 className="versus__title">Kata kunci vs semantik</h3>
            <p className="versus__query">Kueri: <strong>“wajah gampang mengilap di siang hari”</strong></p>
          </div>
          <div className="versus__cols">
            <div className="versus__col">
              <p className="field-label">Pencarian kata kunci (BM25)</p>
              <ul className="versus__list">
                <li className="is-bad"><span className="versus__mark"><Icon name="x" size={16} /></span><span>Masker &quot;Siang Hari Glow&quot; — cocok karena kata <em>siang hari</em></span></li>
                <li className="is-bad"><span className="versus__mark"><Icon name="x" size={16} /></span><span>Sabun &quot;Wajah Cerah&quot; — cocok karena kata <em>wajah</em></span></li>
              </ul>
            </div>
            <div className="versus__col">
              <p className="field-label">Pencarian semantik</p>
              <ul className="versus__list">
                <li className="is-good"><span className="versus__mark"><Icon name="check" size={16} /></span><span>Toner pengontrol minyak — maknanya sama dengan <em>mengilap</em></span></li>
                <li className="is-good"><span className="versus__mark"><Icon name="check" size={16} /></span><span>Sunscreen matte untuk kulit berminyak</span></li>
              </ul>
            </div>
          </div>
          <p className="versus__note">Contoh ilustrasi, bukan hasil model sungguhan.</p>
        </article>
      </section>

      {/* ===== Dua komponen ===== */}
      <section className="section" aria-labelledby="components-title">
        <p className="eyebrow">Komponen</p>
        <h2 className="section-title" id="components-title">Apa saja yang dibangun</h2>
        <div className="grid-2 section-body">
          <article className="card feature-card">
            <p className="field-label">Kecerdasan Komputasional</p>
            <h3>Pencarian semantik</h3>
            <p>Pengguna mengetik kueri bahasa alami, lalu sistem mengembalikan produk yang paling relevan berdasarkan kemiripan makna.</p>
            <ul>
              <li>Teks produk dipecah menjadi potongan (chunk)</li>
              <li>Custom text embedding untuk kueri dan chunk</li>
              <li>Peringkat dengan cosine similarity</li>
              <li>Dibandingkan dengan baseline kata kunci (BM25)</li>
            </ul>
          </article>

          <article className="card feature-card">
            <p className="field-label">Natural Language Processing</p>
            <h3>Tanya jawab dari ulasan</h3>
            <p>Pengguna memilih produk dan bertanya dalam bahasa Inggris. Sistem menjawab dari ulasan konsumen dan menampilkan kutipannya sebagai bukti.</p>
            <ul>
              <li>Retriever: BM25, pretrained, atau domain-adapted</li>
              <li>Reader mengekstrak rentang jawaban dari ulasan</li>
              <li>Bukti ulasan ditampilkan bersama skor relevansi</li>
              <li>Menjawab &quot;informasi tidak ditemukan&quot; bila bukti kurang</li>
            </ul>
          </article>
        </div>
      </section>

      {/* ===== Metrik evaluasi ===== */}
      <section className="section" aria-labelledby="metrics-title">
        <p className="eyebrow">Evaluasi</p>
        <h2 className="section-title" id="metrics-title">Metrik evaluasi</h2>
        <p className="section-lead">Nilai diisi setelah eksperimen selesai.</p>

        <div className="grid-2 section-body">
          <article className="card metric-group">
            <h3 className="metric-group__title">Pencarian semantik</h3>
            <div className="metric-grid">
              <Metric label="MRR" note="Mean Reciprocal Rank" />
              <Metric label="P@5" note="Precision di 5 teratas" />
              <Metric label="Latency" note="Rata-rata per kueri (ms)" />
            </div>
          </article>

          <article className="card metric-group">
            <h3 className="metric-group__title">Tanya jawab ulasan</h3>
            <div className="metric-grid">
              <Metric label="Recall@K" note="Retriever" />
              <Metric label="EM" note="Exact Match" />
              <Metric label="F1" note="Token-level F1" />
              <Metric label="Macro-F1" note="Keterjawaban" />
            </div>
          </article>
        </div>
      </section>

      {/* ===== Tim ===== */}
      <section className="section" aria-labelledby="team-title">
        <p className="eyebrow">Tim</p>
        <h2 className="section-title" id="team-title">Yang mengerjakan</h2>
        <p className="section-lead">Program Studi Informatika, Universitas Pelita Harapan.</p>

        <div className="grid-3 section-body">
          {TEAM.map((m) => (
            <article className="card team-card" key={m.initials}>
              <span className="avatar" aria-hidden="true">{m.initials}</span>
              <div><h3>{m.name}</h3><p>Informatika, UPH</p></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
