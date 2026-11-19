/**
 * search.js
 * Logika halaman Beranda + Pencarian:
 * state pencarian, sidebar filter (metode, kategori, skor minimum, jumlah hasil),
 * urutan hasil, mode bandingkan, drawer filter di tablet,
 * dan semua state UI (kosong, loading, tidak ada hasil, error).
 */
import { api } from './api.js';
import {
  initLayout, setActiveNav, icon, escapeHtml, debounce,
  productCard, skeletonCards, stateBlock, CATEGORIES,
} from './components.js';

const EXAMPLE_QUERIES = [
  'sabun cuci muka untuk kulit berminyak',
  'sunscreen yang tidak lengket',
  'serum untuk bekas jerawat',
  'pelembap ringan untuk cuaca panas',
];

const MODE_LABEL = { semantic: 'Semantik', bm25: 'Kata kunci (BM25)' };
const SORTS = ['relevance', 'price-asc', 'price-desc'];
const MIN_AUTO_SEARCH_CHARS = 3;

// State halaman (sumber kebenaran tunggal)
const state = {
  query: '',
  mode: 'semantic',
  topK: 10,
  category: 'Semua',
  compare: false,
  minScore: 0,
  sort: 'relevance',
};

// Penanda request terbaru, supaya respons lama yang datang terlambat diabaikan
let requestSeq = 0;
// Respons terakhir, supaya ganti urutan / skor minimum tidak perlu request ulang
let lastView = null;
// Jumlah produk per kategori (diisi dari katalog)
let categoryCounts = null;

const els = {
  form: document.getElementById('search-form'),
  input: document.getElementById('search-input'),
  clearBtn: document.getElementById('search-clear'),
  exampleChips: document.getElementById('example-chips'),
  modeGroup: document.getElementById('mode-group'),
  compare: document.getElementById('compare-toggle'),
  categoryList: document.getElementById('category-list'),
  minScore: document.getElementById('min-score'),
  minScoreValue: document.getElementById('min-score-value'),
  topK: document.getElementById('topk-select'),
  resetBtn: document.getElementById('btn-reset-filters'),
  sort: document.getElementById('sort-select'),
  filters: document.getElementById('filters'),
  filtersOpen: document.getElementById('filters-open'),
  filtersClose: document.getElementById('filters-close'),
  backdrop: document.getElementById('filters-backdrop'),
  info: document.getElementById('results-info'),
  results: document.getElementById('results'),
};

/* ---------- Inisialisasi ---------- */
function init() {
  initLayout(location.hash === '#cari' ? 'search' : 'home', 'Pencarian Produk Semantik');

  els.clearBtn.innerHTML = icon('x', { size: 18 });
  els.filtersClose.innerHTML = icon('x', { size: 18 });
  els.filtersOpen.innerHTML = `${icon('sliders', { size: 16 })}<span>Filter</span>`;

  readStateFromUrl();
  renderExampleChips();
  renderCategoryList();
  syncControls();
  bindEvents();
  loadCategoryCounts();

  if (state.query) {
    els.input.value = state.query;
    toggleClearButton();
    runSearch();
  } else {
    renderEmpty();
  }

  if (location.hash === '#cari') els.input.focus();
}

/* ---------- URL <-> state (supaya tombol "kembali" dari halaman produk tetap rapi) ---------- */
function readStateFromUrl() {
  const p = new URLSearchParams(location.search);
  state.query = (p.get('q') || '').trim();
  if (p.get('mode') === 'bm25') state.mode = 'bm25';
  const k = Number(p.get('k'));
  if ([5, 10, 20].includes(k)) state.topK = k;
  const cat = p.get('cat');
  if (cat && CATEGORIES.includes(cat)) state.category = cat;
  state.compare = p.get('compare') === '1';
  const min = Number(p.get('min'));
  if (min > 0 && min <= 1) state.minScore = min;
  if (SORTS.includes(p.get('sort'))) state.sort = p.get('sort');
}

function syncUrl() {
  const p = new URLSearchParams();
  if (state.query) p.set('q', state.query);
  if (state.mode !== 'semantic') p.set('mode', state.mode);
  if (state.topK !== 10) p.set('k', String(state.topK));
  if (state.category !== 'Semua') p.set('cat', state.category);
  if (state.compare) p.set('compare', '1');
  if (state.minScore > 0) p.set('min', state.minScore.toFixed(2));
  if (state.sort !== 'relevance') p.set('sort', state.sort);
  const qs = p.toString();
  history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
}

/* ---------- Render kontrol ---------- */
function renderExampleChips() {
  els.exampleChips.innerHTML = EXAMPLE_QUERIES.map((q) =>
    `<button type="button" class="chip chip--example" data-query="${escapeHtml(q)}">${escapeHtml(q)}</button>`
  ).join('');
}

function countFor(category) {
  if (!categoryCounts) return '';
  return category === 'Semua' ? categoryCounts.total : (categoryCounts.byCategory[category] || 0);
}

function renderCategoryList() {
  els.categoryList.innerHTML = ['Semua', ...CATEGORIES].map((c) => `
    <button type="button" class="cat-option" data-category="${c}" aria-pressed="${c === state.category}">
      <span>${c}</span><span class="cat-option__count">${countFor(c)}</span>
    </button>`).join('');
}

async function loadCategoryCounts() {
  try {
    const data = await api.getProducts();
    const byCategory = {};
    (data.products || []).forEach((p) => { byCategory[p.category] = (byCategory[p.category] || 0) + 1; });
    categoryCounts = { total: data.total ?? (data.products || []).length, byCategory };
    renderCategoryList();
  } catch {
    /* jumlah per kategori hanya pelengkap; abaikan jika gagal */
  }
}

const filtersAreDefault = () => state.category === 'Semua' && state.minScore === 0 && state.sort === 'relevance';

function syncControls() {
  els.modeGroup.querySelector(`input[value="${state.mode}"]`).checked = true;
  els.modeGroup.disabled = state.compare; // saat bandingkan, kedua mode dijalankan
  els.compare.checked = state.compare;
  els.topK.value = String(state.topK);
  els.minScore.value = String(state.minScore);
  els.minScoreValue.textContent = state.minScore.toFixed(2);
  els.sort.value = state.sort;
  els.categoryList.querySelectorAll('.cat-option').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.category === state.category));
  });
  els.resetBtn.disabled = filtersAreDefault();
}

function toggleClearButton() {
  els.clearBtn.hidden = !els.input.value;
}

/* ---------- Drawer filter (tablet & mobile) ---------- */
function openFilters() {
  els.filters.classList.add('is-open');
  els.backdrop.hidden = false;
  els.filtersOpen.setAttribute('aria-expanded', 'true');
  els.filtersClose.focus();
}

function closeFilters({ restoreFocus = true } = {}) {
  if (!els.filters.classList.contains('is-open')) return;
  els.filters.classList.remove('is-open');
  els.backdrop.hidden = true;
  els.filtersOpen.setAttribute('aria-expanded', 'false');
  if (restoreFocus) els.filtersOpen.focus();
}

/* ---------- Event ---------- */
const debouncedSearch = debounce(() => {
  const q = els.input.value.trim();
  if (!q || q.length >= MIN_AUTO_SEARCH_CHARS) runSearch();
}, 450);

function bindEvents() {
  // Enter / tombol Cari -> langsung cari (batalkan debounce)
  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    debouncedSearch.cancel();
    runSearch();
  });

  els.input.addEventListener('input', () => {
    toggleClearButton();
    debouncedSearch();
  });

  els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && els.input.value) {
      e.preventDefault();
      clearQuery();
    }
  });

  els.clearBtn.addEventListener('click', clearQuery);

  els.exampleChips.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-query]');
    if (chip) fillAndSearch(chip.dataset.query);
  });

  els.modeGroup.addEventListener('change', (e) => {
    state.mode = e.target.value;
    rerunIfQuery();
  });

  els.compare.addEventListener('change', () => {
    state.compare = els.compare.checked;
    syncControls();
    rerunIfQuery();
  });

  els.topK.addEventListener('change', () => {
    state.topK = Number(els.topK.value);
    rerunIfQuery();
  });

  els.categoryList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]');
    if (btn) setCategory(btn.dataset.category);
  });

  // Skor minimum & urutan: cukup render ulang data terakhir
  els.minScore.addEventListener('input', () => {
    state.minScore = Number(els.minScore.value);
    syncControls();
    syncUrl();
    rerender();
  });

  els.sort.addEventListener('change', () => {
    state.sort = els.sort.value;
    syncControls();
    syncUrl();
    rerender();
  });

  els.resetBtn.addEventListener('click', () => {
    const categoryChanged = state.category !== 'Semua';
    state.category = 'Semua';
    state.minScore = 0;
    state.sort = 'relevance';
    syncControls();
    if (categoryChanged && state.query) runSearch();
    else { syncUrl(); rerender(); }
  });

  els.filtersOpen.addEventListener('click', openFilters);
  els.filtersClose.addEventListener('click', () => closeFilters());
  els.backdrop.addEventListener('click', () => closeFilters());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFilters();
  });

  // Tombol aksi di dalam state block (coba lagi, hapus filter, dll.)
  els.results.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'retry') runSearch();
    if (action === 'reset-category') setCategory('Semua');
    if (action === 'reset-min') { state.minScore = 0; syncControls(); syncUrl(); rerender(); }
    if (action === 'use-semantic') { state.mode = 'semantic'; syncControls(); runSearch(); }
    if (action === 'focus') els.input.focus();
    if (action.startsWith('example:')) fillAndSearch(EXAMPLE_QUERIES[Number(action.split(':')[1])]);
  });

  window.addEventListener('hashchange', () => {
    if (location.hash === '#cari') {
      setActiveNav('search');
      els.input.focus();
    } else {
      setActiveNav('home');
    }
  });
}

function fillAndSearch(query) {
  els.input.value = query;
  toggleClearButton();
  debouncedSearch.cancel();
  runSearch();
}

function clearQuery() {
  els.input.value = '';
  toggleClearButton();
  debouncedSearch.cancel();
  runSearch(); // kueri kosong -> state kosong
  els.input.focus();
}

function setCategory(category) {
  state.category = category;
  syncControls();
  closeFilters({ restoreFocus: false });
  if (state.query) runSearch();
  else { syncUrl(); renderEmpty(); }
}

function rerunIfQuery() {
  if (els.input.value.trim()) runSearch();
  else syncUrl();
}

/** Render ulang tanpa request baru (dipakai saat urutan / skor minimum berubah). */
function rerender() {
  if (!lastView) {
    if (!state.query) renderEmpty();
    return;
  }
  if (lastView.kind === 'results') renderResults(lastView.query, lastView.data);
  else renderCompare(lastView.query, lastView.semantic, lastView.bm25);
}

/* ---------- Pencarian ---------- */
async function runSearch() {
  const query = els.input.value.trim();
  state.query = query;
  lastView = null;
  syncUrl();

  if (!query) {
    renderEmpty();
    return;
  }

  const seq = ++requestSeq;
  renderLoading();

  const params = {
    query,
    topK: state.topK,
    category: state.category === 'Semua' ? '' : state.category,
  };

  try {
    if (state.compare) {
      const [semantic, bm25] = await Promise.all([
        api.search({ ...params, mode: 'semantic' }),
        api.search({ ...params, mode: 'bm25' }),
      ]);
      if (seq !== requestSeq) return;
      renderCompare(query, semantic, bm25);
    } else {
      const data = await api.search({ ...params, mode: state.mode });
      if (seq !== requestSeq) return;
      renderResults(query, data);
    }
  } catch (err) {
    if (seq !== requestSeq) return;
    renderError(err);
  } finally {
    if (seq === requestSeq) els.results.setAttribute('aria-busy', 'false');
  }
}

/* ---------- Filter & urutan di sisi klien ---------- */
// Peringkat asli (berdasarkan relevansi) disimpan dulu, supaya tetap benar setelah diurutkan ulang
function applyView(results) {
  const ranked = results.map((r, i) => ({ ...r, rank: i + 1 }));
  const shown = ranked.filter((r) => typeof r.score !== 'number' || r.score >= state.minScore);
  return sortItems(shown);
}

function sortItems(items) {
  if (state.sort === 'price-asc') return [...items].sort((a, b) => a.price - b.price);
  if (state.sort === 'price-desc') return [...items].sort((a, b) => b.price - a.price);
  return items;
}

/* ---------- Render state ---------- */
function setInfo(html) {
  els.info.innerHTML = html || '';
}

const sep = '<span class="sep" aria-hidden="true">·</span>';
const seconds = (ms) => (ms == null ? '' : `${sep}<span>${(ms / 1000).toFixed(3)} detik</span>`);

function exampleActions() {
  return EXAMPLE_QUERIES.slice(0, 3).map((q, i) => ({ label: q, action: `example:${i}`, variant: 'chip' }));
}

// State kosong (sebelum mencari) + katalog sebagai inspirasi
async function renderEmpty() {
  const seq = ++requestSeq;
  lastView = null;
  els.results.setAttribute('aria-busy', 'false');

  const label = state.category === 'Semua' ? 'Semua produk' : state.category;
  setInfo(`<span>Belum ada kueri. Menampilkan katalog: <strong>${escapeHtml(label)}</strong></span>`);
  els.results.innerHTML = `<div class="results-grid" id="catalog-grid">${skeletonCards(3)}</div>`;

  try {
    const data = await api.getProducts(state.category === 'Semua' ? '' : state.category);
    if (seq !== requestSeq) return;
    const products = sortItems(data.products || []);
    setInfo(`<span>Belum ada kueri. Menampilkan katalog: <strong>${escapeHtml(label)}</strong> (${data.total} produk)</span>`);
    els.results.innerHTML = products.length
      ? `<div class="results-grid">${products.slice(0, 9).map((p) => productCard(p)).join('')}</div>`
      : stateBlock({
          illustration: 'empty',
          title: 'Katalog masih kosong',
          text: 'Isi file data/products.json dengan dataset kamu, lalu muat ulang halaman ini.',
        });
  } catch {
    if (seq !== requestSeq) return;
    els.results.innerHTML = stateBlock({
      illustration: 'error',
      tone: 'danger',
      title: 'Katalog belum bisa dimuat',
      text: 'Pastikan server sudah berjalan, lalu coba lagi.',
    });
  }
}

function renderLoading() {
  els.results.setAttribute('aria-busy', 'true');
  setInfo('<span>Memahami pencarianmu…</span>');
  const n = Math.min(state.topK, 6);
  if (state.compare) {
    const col = (mode) => `
      <section class="compare-col">
        <div class="compare-col__head"><span class="compare-col__title">${MODE_LABEL[mode]}</span></div>
        <div class="compare-list">${skeletonCards(2)}</div>
      </section>`;
    els.results.innerHTML = `<div class="compare-grid">${col('semantic')}${col('bm25')}</div>`;
  } else {
    els.results.innerHTML = `<div class="results-grid">${skeletonCards(n)}</div>`;
  }
}

function hiddenNote(total, shown) {
  const hidden = total - shown;
  return hidden > 0 ? `${sep}<span>${hidden} disembunyikan (skor &lt; ${state.minScore.toFixed(2)})</span>` : '';
}

function belowMinState(compact = false) {
  return stateBlock({
    illustration: 'empty',
    compact,
    title: 'Semua hasil di bawah skor minimum',
    text: `Tidak ada produk dengan skor relevansi ${state.minScore.toFixed(2)} ke atas.`,
    actions: [{ label: 'Kembalikan skor minimum ke 0', action: 'reset-min', variant: 'secondary' }],
  });
}

function renderResults(query, data) {
  lastView = { kind: 'results', query, data };
  const all = data.results || [];
  if (!all.length) {
    renderNoResults(query, data);
    return;
  }

  const shown = applyView(all);
  setInfo(`
    <span>Menampilkan <strong>${shown.length} hasil</strong> untuk <strong>“${escapeHtml(query)}”</strong></span>
    ${seconds(data.latency_ms)}
    ${hiddenNote(all.length, shown.length)}`);

  els.results.innerHTML = shown.length
    ? `<div class="results-grid">${shown.map((r) => productCard(r, { mode: state.mode, rank: r.rank, query })).join('')}</div>`
    : belowMinState();
}

function renderNoResults(query, data) {
  setInfo(`<span><strong>0 hasil</strong> untuk <strong>“${escapeHtml(query)}”</strong></span>${seconds(data.latency_ms)}`);

  const actions = [];
  if (state.category !== 'Semua') actions.push({ label: 'Hapus filter kategori', action: 'reset-category', variant: 'secondary' });
  if (state.mode === 'bm25') actions.push({ label: 'Coba pencarian semantik', action: 'use-semantic', variant: 'primary' });

  els.results.innerHTML = stateBlock({
    illustration: 'empty',
    title: 'Belum ada produk yang cocok',
    text: state.mode === 'bm25'
      ? 'Pencarian kata kunci hanya menemukan produk yang memuat kata yang sama persis. Coba pencarian semantik atau pakai kata lain.'
      : 'Coba gunakan kata lain atau kurangi filter. Atau mulai dari salah satu contoh ini:',
    actions: actions.length ? actions : exampleActions(),
  });
}

function renderError(err) {
  setInfo('');
  els.results.innerHTML = stateBlock({
    illustration: 'error',
    tone: 'danger',
    title: 'Pencarian gagal dimuat',
    text: err && err.message ? err.message : 'Terjadi kesalahan yang tidak diketahui.',
    actions: [{ label: 'Coba lagi', action: 'retry', variant: 'primary' }],
  });
}

// Mode bandingkan: dua kolom Semantik vs Kata kunci
function renderCompare(query, semantic, bm25) {
  lastView = { kind: 'compare', query, semantic, bm25 };
  setInfo(`
    <span>Membandingkan dua metode untuk <strong>“${escapeHtml(query)}”</strong></span>
    ${sep}<span>Semantik ${(semantic.latency_ms / 1000).toFixed(3)} dtk</span>
    ${sep}<span>Kata kunci ${(bm25.latency_ms / 1000).toFixed(3)} dtk</span>`);

  const column = (mode, data) => {
    const all = data.results || [];
    const shown = applyView(all);
    let body;
    if (!all.length) {
      body = stateBlock({
        compact: true,
        title: 'Tidak ada hasil',
        text: mode === 'bm25' ? 'Tidak ada produk yang memuat kata kueri secara persis.' : 'Tidak ada produk yang cukup mirip secara makna.',
      });
    } else if (!shown.length) {
      body = belowMinState(true);
    } else {
      body = `<div class="compare-list">${shown.map((r) => productCard(r, { mode, rank: r.rank, compact: true, query })).join('')}</div>`;
    }
    return `
      <section class="compare-col" aria-label="Hasil ${MODE_LABEL[mode]}">
        <div class="compare-col__head">
          <h3 class="compare-col__title">${MODE_LABEL[mode]}</h3>
          <span class="meta-chip">${shown.length} hasil</span>
        </div>
        ${body}
      </section>`;
  };

  els.results.innerHTML = `<div class="compare-grid">${column('semantic', semantic)}${column('bm25', bm25)}</div>`;
}

init();
