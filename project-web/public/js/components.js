/**
 * components.js
 * Konstanta global + komponen UI yang dipakai bersama:
 * header, footer, ikon, kartu produk, progress bar skor, state block, dll.
 */

/* Nama aplikasi. Ganti di sini saja —
 * header, <title>, dan footer otomatis ikut berubah. */
export const APP_NAME = 'Cari.in';

export const CATEGORIES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliator'];

export const RETRIEVER_LABELS = {
  bm25: 'BM25',
  pretrained: 'Pretrained',
  domain: 'Domain-adapted',
};

/* ---------- Ikon (path dari Lucide, MIT) — inline supaya tanpa dependensi ---------- */
export const ICONS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  wand: '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>',
  shapes: '<path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
  shuffle: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.096 1.468l.39.432"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>',
  columns: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  keyboard: '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
  list: '<path d="M10 12h11"/><path d="M10 18h11"/><path d="M10 6h11"/><path d="M4 10h2"/><path d="M4 6h1v4"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
  searchX: '<path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  sliders: '<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
  quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  /* ikon kategori untuk placeholder gambar */
  waves: '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  flask: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
};

const CATEGORY_ICON = {
  Cleanser: 'waves',
  Toner: 'droplet',
  Serum: 'flask',
  Moisturizer: 'leaf',
  Sunscreen: 'sun',
  Exfoliator: 'sparkles',
};

/** Render ikon SVG. Tanpa `label` ikon dianggap dekoratif (aria-hidden). */
export function icon(name, { size = 20, label = '', className = '' } = {}) {
  const a11y = label ? `role="img" aria-label="${escapeHtml(label)}"` : 'aria-hidden="true"';
  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" focusable="false" ${a11y}>${ICONS[name] || ''}</svg>`;
}

/* ---------- Utilitas ---------- */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export const formatScore = (s) => Number(s).toFixed(2);

/** Debounce: tunda pemanggilan fn sampai pengguna berhenti mengetik. Ada .cancel(). */
export function debounce(fn, wait = 400) {
  let timer = null;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * Highlight kata/frasa yang cocok (case-insensitive, per kata utuh).
 * Teks di-escape per segmen sehingga aman dari injeksi HTML.
 */
export function highlightText(text, terms = [], className = 'hl') {
  const src = String(text ?? '');
  const clean = [...new Set(terms.map((t) => String(t).trim()).filter((t) => t.length >= 3))]
    .sort((a, b) => b.length - a.length);
  if (!clean.length) return escapeHtml(src);

  // spasi di frasa boleh cocok dengan spasi atau tanda hubung (mis. "pori pori" ~ "pori-pori")
  const pattern = clean.map((t) => escapeRegExp(t).replace(/\s+/g, '[\\s-]+')).join('|');
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${pattern})(?![\\p{L}\\p{N}])`, 'giu');

  let html = '';
  let last = 0;
  for (const m of src.matchAll(re)) {
    html += escapeHtml(src.slice(last, m.index));
    html += `<mark class="${className}">${escapeHtml(m[0])}</mark>`;
    last = m.index + m[0].length;
  }
  return html + escapeHtml(src.slice(last));
}

/** Highlight satu rentang karakter [start, end) — dipakai untuk span jawaban QA. */
export function highlightSpan(text, start, end, className = 'answer-span') {
  const src = String(text ?? '');
  if (start == null || end == null || start < 0 || end <= start || end > src.length) return escapeHtml(src);
  return (
    escapeHtml(src.slice(0, start)) +
    `<mark class="${className}">${escapeHtml(src.slice(start, end))}</mark>` +
    escapeHtml(src.slice(end))
  );
}
/* ---------- Komponen ---------- */

/** Tingkat skor relevansi (DESIGN.md): ≥0.80 tinggi, 0.50–0.79 sedang, <0.50 rendah */
export function scoreLevel(score) {
  const v = Number(score) || 0;
  return v >= 0.8 ? 'high' : v >= 0.5 ? 'mid' : 'low';
}

/**
 * Bar skor.
 * variant: 'semantic' | 'bm25' -> warna mengikuti tingkat skor (hijau / kuning / abu)
 *          'qa'                -> selalu oranye (aksen jawaban ulasan)
 */
export function scoreBar(score, variant = 'semantic', label = 'Relevansi') {
  const value = clamp(Number(score) || 0, 0, 1);
  const pct = Math.round(value * 100);
  return `
    <div class="score">
      <div class="score-head"><span>${escapeHtml(label)}</span><span class="score-value">${formatScore(value)}</span></div>
      <div class="progress progress--${variant} progress--${scoreLevel(value)}" role="progressbar" aria-label="${escapeHtml(label)}"
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-valuetext="${formatScore(value)}">
        <span class="progress-fill" style="width:${pct}%"></span>
      </div>
    </div>`;
}

export function categoryTag(category) {
  return `<span class="tag">${escapeHtml(category)}</span>`;
}

/** Gambar produk; tanpa gambar -> latar abu muda + ikon garis kategori. */
export function productThumb(product, { size = 'md', rank = null, showCategory = false } = {}) {
  const sizeClass = size === 'lg' ? ' thumb--lg' : '';
  const overlay = `${showCategory ? `<span class="thumb__tag">${escapeHtml(product.category)}</span>` : ''}${rank ? `<span class="thumb__rank" title="Peringkat relevansi">#${rank}</span>` : ''}`;
  if (product.image) {
    return `<div class="thumb${sizeClass}">${overlay}<img src="${escapeHtml(product.image)}" alt="" loading="lazy"></div>`;
  }
  const iconSize = size === 'lg' ? 72 : 48;
  return `<div class="thumb${sizeClass}">${overlay}
      <span class="thumb__icon" aria-hidden="true">${icon(CATEGORY_ICON[product.category] || 'droplet', { size: iconSize })}</span>
    </div>`;
}

/**
 * Kartu produk.
 * Jika `score` tidak ada (mode katalog), skor disembunyikan dan potongan teks diganti deskripsi.
 */
export function productCard(item, { mode = 'semantic', rank = null, compact = false, query = '' } = {}) {
  const variant = mode === 'bm25' ? 'bm25' : 'semantic';
  const hasScore = typeof item.score === 'number';
  const terms = item.matched_terms && item.matched_terms.length
    ? item.matched_terms
    : String(query).split(/\s+/);
  const titleId = `pc-${variant}-${item.id}-${rank ?? 'x'}`;
  const href = `product.html?id=${encodeURIComponent(item.id)}`;

  const text = hasScore && item.matched_chunk
    ? `<p class="product-card__match"><span class="product-card__match-label">Cocok dengan:</span> ${highlightText(item.matched_chunk, terms)}</p>`
    : (item.description ? `<p class="product-card__desc">${escapeHtml(item.description)}</p>` : '');

  return `
    <article class="product-card${compact ? ' product-card--compact' : ''}" aria-labelledby="${titleId}">
      ${productThumb(item, { rank: compact ? null : rank, showCategory: !compact })}
      <div class="product-card__body">
        ${compact ? `<div class="product-card__row">${categoryTag(item.category)}${rank ? `<span class="meta-chip">#${rank}</span>` : ''}</div>` : ''}
        <h3 class="product-card__name" id="${titleId}"><a href="${href}">${escapeHtml(item.name)}</a></h3>
        <p class="product-card__brand">${escapeHtml(item.brand)}</p>
        <p class="product-card__price">${formatRupiah(item.price)}</p>
        ${text}
        ${hasScore ? scoreBar(item.score, variant, 'Relevansi') : ''}
        <a class="product-card__ask" href="${href}">Tanya soal produk ini ${icon('arrowRight', { size: 15 })}</a>
      </div>
    </article>`;
}

/** Skeleton card untuk loading state */
export function skeletonCards(count = 6) {
  const card = `
    <div class="skeleton-card" aria-hidden="true">
      <span class="skeleton skeleton--thumb"></span>
      <div class="skeleton-card__body">
        <span class="skeleton skeleton--title"></span>
        <span class="skeleton skeleton--line skeleton--w40"></span>
        <span class="skeleton skeleton--line"></span>
        <span class="skeleton skeleton--line skeleton--w60"></span>
        <span class="skeleton skeleton--bar"></span>
      </div>
    </div>`;
  return Array.from({ length: count }, () => card).join('');
}

/* Ilustrasi garis sederhana untuk state kosong / error (bukan ikon dalam lingkaran) */
const ILLUSTRATIONS = {
  empty: `<svg width="96" height="80" viewBox="0 0 96 80" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="40" cy="36" r="22"/><path d="m56 52 16 16"/>
      <path d="M34 30a6 6 0 1 1 8.5 5.5c-1.6.8-2.5 2-2.5 3.5v1.5"/><path d="M40 46h.01"/>
      <path d="M8 72h80" stroke-dasharray="2 5"/></svg>`,
  error: `<svg width="96" height="80" viewBox="0 0 96 80" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M48 12 82 66H14Z"/><path d="M48 32v14"/><path d="M48 55h.01"/>
      <path d="M8 72h80" stroke-dasharray="2 5"/></svg>`,
};

/**
 * Blok state umum (kosong / tidak ada hasil / error).
 * actions: [{ label, action, variant }] — variant 'chip' menampilkan chip contoh kueri.
 */
export function stateBlock({ illustration = '', title, text = '', actions = [], tone = '', compact = false }) {
  const toneClass = tone ? ` state--${tone}` : '';
  const btns = actions
    .map((a) => a.variant === 'chip'
      ? `<button type="button" class="chip chip--example" data-action="${escapeHtml(a.action)}">${escapeHtml(a.label)}</button>`
      : `<button type="button" class="btn btn--${a.variant || 'secondary'}" data-action="${escapeHtml(a.action)}">${escapeHtml(a.label)}</button>`)
    .join('');
  const art = illustration && !compact ? `<span class="state__art">${ILLUSTRATIONS[illustration] || ''}</span>` : '';
  return `
    <div class="state${toneClass}${compact ? ' state--compact' : ''}" ${tone === 'danger' ? 'role="alert"' : ''}>
      ${art}
      <h3 class="state__title">${escapeHtml(title)}</h3>
      ${text ? `<p class="state__text">${escapeHtml(text)}</p>` : ''}
      ${btns ? `<div class="state__actions">${btns}</div>` : ''}
    </div>`;
}

/* ---------- Header, footer, layout ---------- */
/* `keys`: kunci halaman yang membuat item ini aktif */
const NAV_ITEMS = [
  { keys: ['home', 'search'], href: 'index.html', label: 'Beranda' },
  { keys: ['how'], href: 'about.html#cara-kerja', label: 'Cara Kerja' },
  { keys: ['user'], href: 'about.html', label: 'Tentang' },
];

/* Wordmark: "Cari" + ".in" berwarna aksen. Tanpa ikon sparkle. */
function wordmark() {
  const [head, ...rest] = APP_NAME.split('.');
  return rest.length
    ? `${escapeHtml(head)}<span class="logo__dot">.${escapeHtml(rest.join('.'))}</span>`
    : escapeHtml(APP_NAME);
}

export function renderHeader(active) {
  const items = NAV_ITEMS.map((item) => {
    const isActive = item.keys.includes(active);
    return `<a class="nav-item${isActive ? ' is-active' : ''}" href="${item.href}" data-nav="${item.keys.join(' ')}"
              ${isActive ? 'aria-current="page"' : ''}>${item.label}</a>`;
  }).join('');

  return `
    <div class="container header-inner">
      <a class="logo" href="index.html" aria-label="${escapeHtml(APP_NAME)} — beranda">${wordmark()}</a>
      <nav class="site-nav" aria-label="Navigasi utama">${items}</nav>
    </div>`;
}

export function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <div class="container footer-inner">
      <p>© ${year} ${escapeHtml(APP_NAME)} · Proyek Kecerdasan Komputasional &amp; NLP, Universitas Pelita Harapan</p>
      <p>Prototipe — data masih dummy</p>
    </div>`;
}

/** Tandai item navigasi aktif tanpa render ulang header */
export function setActiveNav(key) {
  document.querySelectorAll('.nav-item').forEach((el) => {
    const on = el.dataset.nav.split(' ').includes(key);
    el.classList.toggle('is-active', on);
    if (on) el.setAttribute('aria-current', 'page');
    else el.removeAttribute('aria-current');
  });
}

/** Dipanggil di setiap halaman: isi header, footer, title, dan semua [data-app-name]. */
export function initLayout(active, pageTitle = '') {
  document.title = pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME;
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');
  if (header) header.innerHTML = renderHeader(active);
  if (footer) footer.innerHTML = renderFooter();
  document.querySelectorAll('[data-app-name]').forEach((el) => { el.textContent = APP_NAME; });
}
