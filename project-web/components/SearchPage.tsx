'use client';

/**
 * components/SearchPage.js
 * Halaman Beranda + Pencarian:
 * state pencarian, sidebar filter (metode, kategori, skor minimum, jumlah hasil),
 * urutan hasil, mode bandingkan, drawer filter di tablet,
 * dan semua state UI (kosong, loading, tidak ada hasil, error).
 */
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/config';
import type { Product, SearchMode, SearchResponse, SearchResult } from '@/lib/types';
import Icon from './Icon';
import ProductCard from './ProductCard';
import StateBlock, { type StateAction } from './StateBlock';
import { SkeletonCards } from './Skeleton';

const EXAMPLE_QUERIES = [
  'sabun cuci muka untuk kulit berminyak',
  'sunscreen yang tidak lengket',
  'serum untuk bekas jerawat',
  'pelembap ringan untuk cuaca panas',
];

const MODE_LABEL: Record<SearchMode, string> = { semantic: 'Semantik', bm25: 'Kata kunci (BM25)' };
type Sort = 'relevance' | 'price-asc' | 'price-desc';
const SORTS: Sort[] = ['relevance', 'price-asc', 'price-desc'];

type InitialParams = Record<string, string | string[] | undefined>;

interface SearchState {
  query: string;
  mode: SearchMode;
  topK: number;
  category: string;
  compare: boolean;
  minScore: number;
  sort: Sort;
}

type View =
  | { kind: 'catalog'; category?: string; loading?: boolean; error?: boolean; products?: Product[]; total?: number }
  | { kind: 'loading'; compare: boolean; topK: number }
  | { kind: 'results'; query: string; mode: SearchMode; category: string; data: SearchResponse }
  | { kind: 'compare'; query: string; semantic: SearchResponse; bm25: SearchResponse }
  | { kind: 'error'; message: string };

interface CategoryCounts {
  total: number;
  byCategory: Record<string, number>;
}
const MIN_AUTO_SEARCH_CHARS = 3;

const DEFAULTS: SearchState = {
  query: '',
  mode: 'semantic',
  topK: 10,
  category: 'Semua',
  compare: false,
  minScore: 0,
  sort: 'relevance',
};

/* ---------- URL <-> state (supaya tombol "kembali" dari halaman produk tetap rapi) ---------- */
function stateFromParams(p: InitialParams = {}): SearchState {
  const get = (k: string): string | undefined => (Array.isArray(p[k]) ? p[k][0] : p[k]);
  const s = { ...DEFAULTS };
  s.query = String(get('q') || '').trim();
  if (get('mode') === 'bm25') s.mode = 'bm25';
  const k = Number(get('k'));
  if ([5, 10, 20].includes(k)) s.topK = k;
  const cat = get('cat');
  if (cat && CATEGORIES.includes(cat)) s.category = cat;
  s.compare = get('compare') === '1';
  const min = Number(get('min'));
  if (min > 0 && min <= 1) s.minScore = min;
  const sort = get('sort');
  if (sort && (SORTS as string[]).includes(sort)) s.sort = sort as Sort;
  return s;
}

function syncUrl(s: SearchState) {
  const p = new URLSearchParams();
  if (s.query) p.set('q', s.query);
  if (s.mode !== 'semantic') p.set('mode', s.mode);
  if (s.topK !== 10) p.set('k', String(s.topK));
  if (s.category !== 'Semua') p.set('cat', s.category);
  if (s.compare) p.set('compare', '1');
  if (s.minScore > 0) p.set('min', s.minScore.toFixed(2));
  if (s.sort !== 'relevance') p.set('sort', s.sort);
  const qs = p.toString();
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`);
}

/* ---------- Filter & urutan di sisi klien ---------- */
function sortItems<T extends { price: number }>(items: T[], sort: Sort): T[] {
  if (sort === 'price-asc') return [...items].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') return [...items].sort((a, b) => b.price - a.price);
  return items;
}

// Peringkat asli (berdasarkan relevansi) disimpan dulu, supaya tetap benar setelah diurutkan ulang
function applyView(results: SearchResult[], s: SearchState) {
  const ranked = results.map((r, i) => ({ ...r, rank: i + 1 }));
  const shown = ranked.filter((r) => r.score >= s.minScore);
  return sortItems(shown, s.sort);
}

const Sep = () => <span className="sep" aria-hidden="true">·</span>;
const Seconds = ({ ms }: { ms?: number | null }) => (ms == null ? null : <><Sep /><span>{(ms / 1000).toFixed(3)} detik</span></>);

export default function SearchPage({ initialParams }: { initialParams: InitialParams }) {
  const [s, setS] = useState(() => stateFromParams(initialParams));
  const [input, setInput] = useState(s.query);
  // view: { kind: 'catalog' | 'loading' | 'results' | 'compare' | 'error', ... }
  const [view, setView] = useState<View>({ kind: 'catalog', loading: true });
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Ref untuk nilai terbaru (dipakai di callback async / debounce)
  const sRef = useRef(s);
  const inputRef = useRef(input);
  // Penanda request terbaru, supaya respons lama yang datang terlambat diabaikan
  const seqRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const inputEl = useRef<HTMLInputElement>(null);
  const filtersOpenBtn = useRef<HTMLButtonElement>(null);
  const filtersCloseBtn = useRef<HTMLButtonElement>(null);

  /** Ubah state + sinkronkan URL. Mengembalikan state baru. */
  const commit = useCallback((changes: Partial<SearchState>): SearchState => {
    const next = { ...sRef.current, ...changes };
    sRef.current = next;
    setS(next);
    syncUrl(next);
    return next;
  }, []);

  const setInputValue = (value: string) => {
    inputRef.current = value;
    setInput(value);
  };

  const cancelDebounce = () => clearTimeout(debounceRef.current);

  /* ---------- Pencarian ---------- */
  const run = useCallback(async (next: SearchState) => {
    const seq = ++seqRef.current;
    const category = next.category === 'Semua' ? '' : next.category;

    // Kueri kosong -> state kosong + katalog sebagai inspirasi
    if (!next.query) {
      setView({ kind: 'catalog', loading: true, category: next.category });
      try {
        const data = await api.getProducts(category);
        if (seq !== seqRef.current) return;
        setView({ kind: 'catalog', category: next.category, products: data.products || [], total: data.total });
      } catch {
        if (seq !== seqRef.current) return;
        setView({ kind: 'catalog', category: next.category, error: true });
      }
      return;
    }

    setView({ kind: 'loading', compare: next.compare, topK: next.topK });
    const params = { query: next.query, topK: next.topK, category };

    try {
      if (next.compare) {
        const [semantic, bm25] = await Promise.all([
          api.search({ ...params, mode: 'semantic' }),
          api.search({ ...params, mode: 'bm25' }),
        ]);
        if (seq !== seqRef.current) return;
        setView({ kind: 'compare', query: next.query, semantic, bm25 });
      } else {
        const data = await api.search({ ...params, mode: next.mode });
        if (seq !== seqRef.current) return;
        setView({ kind: 'results', query: next.query, mode: next.mode, category: next.category, data });
      }
    } catch (err) {
      if (seq !== seqRef.current) return;
      setView({ kind: 'error', message: err instanceof Error && err.message ? err.message : 'Terjadi kesalahan yang tidak diketahui.' });
    }
  }, []);

  /** Cari dengan kueri dari kotak input (seperti tombol Cari). */
  const searchNow = (changes: Partial<SearchState> = {}) => run(commit({ ...changes, query: inputRef.current.trim() }));

  /* ---------- Inisialisasi ---------- */
  useEffect(() => {
    run(sRef.current);

    api.getProducts()
      .then((data) => {
        const byCategory: Record<string, number> = {};
        (data.products || []).forEach((p) => { byCategory[p.category] = (byCategory[p.category] || 0) + 1; });
        setCategoryCounts({ total: data.total ?? (data.products || []).length, byCategory });
      })
      .catch(() => { /* jumlah per kategori hanya pelengkap; abaikan jika gagal */ });

    const focusIfCari = () => { if (window.location.hash === '#cari') inputEl.current?.focus(); };
    focusIfCari();
    window.addEventListener('hashchange', focusIfCari);
    return () => {
      window.removeEventListener('hashchange', focusIfCari);
      clearTimeout(debounceRef.current);
    };
  }, [run]);

  /* ---------- Drawer filter (tablet & mobile) ---------- */
  const filtersOpenRef = useRef(false);
  const openFilters = () => {
    filtersOpenRef.current = true;
    setFiltersOpen(true);
  };
  const closeFilters = useCallback(({ restoreFocus = true }: { restoreFocus?: boolean } = {}) => {
    if (!filtersOpenRef.current) return;
    filtersOpenRef.current = false;
    setFiltersOpen(false);
    if (restoreFocus) filtersOpenBtn.current?.focus();
  }, []);

  useEffect(() => {
    if (filtersOpen) filtersCloseBtn.current?.focus();
  }, [filtersOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeFilters(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeFilters]);

  /* ---------- Event ---------- */
  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    cancelDebounce();
    debounceRef.current = setTimeout(() => {
      const q = inputRef.current.trim();
      if (!q || q.length >= MIN_AUTO_SEARCH_CHARS) searchNow();
    }, 450);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    cancelDebounce();
    searchNow();
  };

  const fillAndSearch = (query: string) => {
    setInputValue(query);
    cancelDebounce();
    run(commit({ query }));
  };

  const clearQuery = () => {
    setInputValue('');
    cancelDebounce();
    run(commit({ query: '' })); // kueri kosong -> state kosong
    inputEl.current?.focus();
  };

  // Ganti metode / bandingkan / jumlah hasil: cari ulang jika ada kueri
  const rerunIfQuery = (changes: Partial<SearchState>) => {
    if (inputRef.current.trim()) searchNow(changes);
    else commit(changes);
  };

  const setCategory = (category: string) => {
    closeFilters({ restoreFocus: false });
    if (sRef.current.query) searchNow({ category });
    else run(commit({ category }));
  };

  const resetFilters = () => {
    const categoryChanged = sRef.current.category !== 'Semua';
    const next = commit({ category: 'Semua', minScore: 0, sort: 'relevance' });
    if (categoryChanged) run(next);
  };

  // Tombol aksi di dalam state block (coba lagi, hapus filter, dll.)
  const onAction = (action: string) => {
    if (action === 'retry') searchNow();
    if (action === 'reset-category') setCategory('Semua');
    if (action === 'reset-min') commit({ minScore: 0 });
    if (action === 'use-semantic') searchNow({ mode: 'semantic' });
    if (action.startsWith('example:')) fillAndSearch(EXAMPLE_QUERIES[Number(action.split(':')[1])]);
  };

  const countFor = (category: string) => {
    if (!categoryCounts) return '';
    return category === 'Semua' ? categoryCounts.total : (categoryCounts.byCategory[category] || 0);
  };

  const filtersAreDefault = s.category === 'Semua' && s.minScore === 0 && s.sort === 'relevance';

  /* ---------- Render hasil ---------- */
  const belowMinState = (compact = false) => (
    <StateBlock
      illustration="empty"
      compact={compact}
      title="Semua hasil di bawah skor minimum"
      text={`Tidak ada produk dengan skor relevansi ${s.minScore.toFixed(2)} ke atas.`}
      actions={[{ label: 'Kembalikan skor minimum ke 0', action: 'reset-min', variant: 'secondary' }]}
      onAction={onAction}
    />
  );

  const hiddenNote = (total: number, shown: number) => {
    const hidden = total - shown;
    return hidden > 0 ? <><Sep /><span>{hidden} disembunyikan (skor &lt; {s.minScore.toFixed(2)})</span></> : null;
  };

  let info: ReactNode = null;
  let body: ReactNode = null;

  if (view.kind === 'catalog') {
    const label = s.category === 'Semua' ? 'Semua produk' : s.category;
    info = (
      <span>
        Belum ada kueri. Menampilkan katalog: <strong>{label}</strong>
        {!view.loading && !view.error ? ` (${view.total} produk)` : ''}
      </span>
    );
    if (view.loading) {
      body = <div className="results-grid"><SkeletonCards count={3} /></div>;
    } else if (view.error) {
      body = (
        <StateBlock
          illustration="error"
          tone="danger"
          title="Katalog belum bisa dimuat"
          text="Pastikan server sudah berjalan, lalu coba lagi."
        />
      );
    } else {
      const products = sortItems(view.products ?? [], s.sort);
      body = products.length ? (
        <div className="results-grid">
          {products.slice(0, 9).map((p) => <ProductCard key={p.id} item={p} />)}
        </div>
      ) : (
        <StateBlock
          illustration="empty"
          title="Katalog masih kosong"
          text="Isi file data/products.json dengan dataset kamu, lalu muat ulang halaman ini."
        />
      );
    }
  } else if (view.kind === 'loading') {
    info = <span>Memahami pencarianmu…</span>;
    body = view.compare ? (
      <div className="compare-grid">
        {(['semantic', 'bm25'] as const).map((mode) => (
          <section className="compare-col" key={mode}>
            <div className="compare-col__head"><span className="compare-col__title">{MODE_LABEL[mode]}</span></div>
            <div className="compare-list"><SkeletonCards count={2} /></div>
          </section>
        ))}
      </div>
    ) : (
      <div className="results-grid"><SkeletonCards count={Math.min(view.topK, 6)} /></div>
    );
  } else if (view.kind === 'results') {
    const { query, data, mode } = view;
    const all = data.results || [];
    if (!all.length) {
      info = <><span><strong>0 hasil</strong> untuk <strong>“{query}”</strong></span><Seconds ms={data.latency_ms} /></>;
      const actions: StateAction[] = [];
      if (view.category !== 'Semua') actions.push({ label: 'Hapus filter kategori', action: 'reset-category', variant: 'secondary' });
      if (mode === 'bm25') actions.push({ label: 'Coba pencarian semantik', action: 'use-semantic', variant: 'primary' });
      body = (
        <StateBlock
          illustration="empty"
          title="Belum ada produk yang cocok"
          text={mode === 'bm25'
            ? 'Pencarian kata kunci hanya menemukan produk yang memuat kata yang sama persis. Coba pencarian semantik atau pakai kata lain.'
            : 'Coba gunakan kata lain atau kurangi filter. Atau mulai dari salah satu contoh ini:'}
          actions={actions.length
            ? actions
            : EXAMPLE_QUERIES.slice(0, 3).map((q, i) => ({ label: q, action: `example:${i}`, variant: 'chip' }))}
          onAction={onAction}
        />
      );
    } else {
      const shown = applyView(all, s);
      info = (
        <>
          <span>Menampilkan <strong>{shown.length} hasil</strong> untuk <strong>“{query}”</strong></span>
          <Seconds ms={data.latency_ms} />
          {hiddenNote(all.length, shown.length)}
        </>
      );
      body = shown.length ? (
        <div className="results-grid">
          {shown.map((r) => <ProductCard key={r.id} item={r} mode={mode} rank={r.rank} query={query} />)}
        </div>
      ) : belowMinState();
    }
  } else if (view.kind === 'compare') {
    // Mode bandingkan: dua kolom Semantik vs Kata kunci
    const { query, semantic, bm25 } = view;
    info = (
      <>
        <span>Membandingkan dua metode untuk <strong>“{query}”</strong></span>
        <Sep /><span>Semantik {(semantic.latency_ms / 1000).toFixed(3)} dtk</span>
        <Sep /><span>Kata kunci {(bm25.latency_ms / 1000).toFixed(3)} dtk</span>
      </>
    );
    const column = (mode: SearchMode, data: SearchResponse) => {
      const all = data.results || [];
      const shown = applyView(all, s);
      let colBody: ReactNode;
      if (!all.length) {
        colBody = (
          <StateBlock
            compact
            title="Tidak ada hasil"
            text={mode === 'bm25' ? 'Tidak ada produk yang memuat kata kueri secara persis.' : 'Tidak ada produk yang cukup mirip secara makna.'}
          />
        );
      } else if (!shown.length) {
        colBody = belowMinState(true);
      } else {
        colBody = (
          <div className="compare-list">
            {shown.map((r) => <ProductCard key={r.id} item={r} mode={mode} rank={r.rank} compact query={query} />)}
          </div>
        );
      }
      return (
        <section className="compare-col" aria-label={`Hasil ${MODE_LABEL[mode]}`} key={mode}>
          <div className="compare-col__head">
            <h3 className="compare-col__title">{MODE_LABEL[mode]}</h3>
            <span className="meta-chip">{shown.length} hasil</span>
          </div>
          {colBody}
        </section>
      );
    };
    body = <div className="compare-grid">{column('semantic', semantic)}{column('bm25', bm25)}</div>;
  } else if (view.kind === 'error') {
    body = (
      <StateBlock
        illustration="error"
        tone="danger"
        title="Pencarian gagal dimuat"
        text={view.message}
        actions={[{ label: 'Coba lagi', action: 'retry', variant: 'primary' }]}
        onAction={onAction}
      />
    );
  }

  return (
    <main id="main">
      {/* ===== Hero + Search ===== */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-inner">
          <p className="eyebrow">Pencarian semantik</p>
          <h1 className="hero-title" id="hero-title">Temukan skincare dengan <em>bahasa kamu sendiri.</em></h1>
          <p className="hero-subtitle">
            Tulis kebutuhan kulitmu seperti sedang cerita ke teman. Sistem mencari produk yang maksudnya paling dekat, bukan yang kebetulan memuat kata yang sama.
          </p>

          <form className="search-form" role="search" autoComplete="off" onSubmit={onSubmit}>
            <div className="search-field" id="cari">
              <label htmlFor="search-input" className="visually-hidden">Kueri pencarian produk</label>
              <Icon name="search" size={20} className="search-field__icon" />
              <input
                ref={inputEl}
                id="search-input"
                className="search-input"
                type="search"
                name="q"
                maxLength={300}
                placeholder="Contoh: pelembap ringan untuk kulit berminyak"
                aria-describedby="search-help"
                value={input}
                onChange={onInput}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && input) {
                    e.preventDefault();
                    clearQuery();
                  }
                }}
              />
              <button type="button" className="search-clear" aria-label="Hapus kueri" hidden={!input} onClick={clearQuery}>
                <Icon name="x" size={18} />
              </button>
              <button type="submit" className="btn btn--primary search-submit">Cari</button>
            </div>
          </form>
          <p id="search-help" className="visually-hidden">Tekan Enter untuk mencari. Hasil juga diperbarui otomatis saat kamu berhenti mengetik.</p>

          <div className="example-row" aria-label="Contoh kueri">
            {EXAMPLE_QUERIES.map((q) => (
              <button type="button" className="chip chip--example" key={q} onClick={() => fillAndSearch(q)}>{q}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Filter + Hasil ===== */}
      <section className="results-section" aria-labelledby="results-heading">
        <div className="container search-layout">
          <aside className={`filters${filtersOpen ? ' is-open' : ''}`} id="filters" aria-label="Filter pencarian">
            <div className="filters__head">
              <h2 className="filters__title">Filter</h2>
              <button type="button" className="icon-btn filters__close" aria-label="Tutup filter" ref={filtersCloseBtn} onClick={() => closeFilters()}>
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="filter-group">
              <span className="field-label" id="mode-label">Metode</span>
              <fieldset className="segmented" aria-labelledby="mode-label" disabled={s.compare}>
                <input type="radio" name="mode" id="mode-semantic" value="semantic" checked={s.mode === 'semantic'} onChange={() => rerunIfQuery({ mode: 'semantic' })} />
                <label htmlFor="mode-semantic">Semantik</label>
                <input type="radio" name="mode" id="mode-bm25" value="bm25" checked={s.mode === 'bm25'} onChange={() => rerunIfQuery({ mode: 'bm25' })} />
                <label htmlFor="mode-bm25">Kata kunci</label>
              </fieldset>
              <label className="check">
                <input type="checkbox" checked={s.compare} onChange={(e) => rerunIfQuery({ compare: e.target.checked })} />
                <span>Bandingkan keduanya</span>
              </label>
            </div>

            <div className="filter-group">
              <span className="field-label" id="category-label">Kategori</span>
              <div className="cat-list" role="group" aria-labelledby="category-label">
                {['Semua', ...CATEGORIES].map((c) => (
                  <button type="button" className="cat-option" key={c} aria-pressed={c === s.category} onClick={() => setCategory(c)}>
                    <span>{c}</span><span className="cat-option__count">{countFor(c)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-group__row">
                <label className="field-label" htmlFor="min-score">Skor relevansi minimum</label>
                <output className="range-value" htmlFor="min-score">{s.minScore.toFixed(2)}</output>
              </div>
              {/* Skor minimum & urutan: cukup render ulang data terakhir (tanpa request baru) */}
              <input
                type="range"
                className="range"
                id="min-score"
                min="0"
                max="1"
                step="0.05"
                value={s.minScore}
                onChange={(e) => commit({ minScore: Number(e.target.value) })}
              />
              <div className="range-scale" aria-hidden="true"><span>0.0</span><span>1.0</span></div>
            </div>

            <div className="filter-group">
              <label className="field-label" htmlFor="topk-select">Jumlah hasil</label>
              <select id="topk-select" className="select select--block" value={String(s.topK)} onChange={(e) => rerunIfQuery({ topK: Number(e.target.value) })}>
                <option value="5">5 teratas</option>
                <option value="10">10 teratas</option>
                <option value="20">20 teratas</option>
              </select>
            </div>

            <button type="button" className="link-btn" disabled={filtersAreDefault} onClick={resetFilters}>Reset filter</button>
          </aside>
          <div className="filters-backdrop" hidden={!filtersOpen} onClick={() => closeFilters()} />

          <div className="results-main">
            <h2 id="results-heading" className="visually-hidden">Hasil pencarian</h2>
            <div className="results-head">
              <button
                type="button"
                className="btn btn--secondary btn--sm filter-toggle"
                aria-controls="filters"
                aria-expanded={filtersOpen}
                ref={filtersOpenBtn}
                onClick={openFilters}
              >
                <Icon name="sliders" size={16} /><span>Filter</span>
              </button>
              <div className="results-info" aria-live="polite">{info}</div>
              <div className="sort">
                <label htmlFor="sort-select" className="visually-hidden">Urutkan hasil</label>
                <select id="sort-select" className="select" value={s.sort} onChange={(e) => commit({ sort: e.target.value as Sort })}>
                  <option value="relevance">Paling relevan</option>
                  <option value="price-asc">Harga terendah</option>
                  <option value="price-desc">Harga tertinggi</option>
                </select>
              </div>
            </div>
            <div aria-busy={view.kind === 'loading'}>{body}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
