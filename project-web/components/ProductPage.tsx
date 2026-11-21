'use client';

/**
 * components/ProductPage.js
 * Halaman Detail Produk + Tanya Produk (QA berbasis ulasan):
 * memuat produk, mengirim pertanyaan, menampilkan jawaban + bukti,
 * state no-answer, dan riwayat pertanyaan sesi ini.
 */
import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { APP_NAME, RETRIEVER_LABELS } from '@/lib/config';
import { formatRupiah, formatScore, spanSegments } from '@/lib/format';
import type { AskParams, AskResponse, Evidence, Product, Retriever } from '@/lib/types';
import Highlight from './Highlight';
import Icon from './Icon';
import ProductThumb, { CategoryTag } from './ProductThumb';
import ScoreBar from './ScoreBar';
import StateBlock from './StateBlock';

const EXAMPLE_QUESTIONS = [
  'Does it feel greasy?',
  'Is it good for sensitive skin?',
  'How does it smell?',
  'Does it leave a white cast?',
];

const MAX_LEN = 300;

// Kata umum bahasa Indonesia — untuk memberi petunjuk bahwa model memakai bahasa Inggris
const ID_HINT_WORDS = ['apakah', 'apa', 'tidak', 'kulit', 'bagaimana', 'untuk', 'yang', 'bikin', 'lengket', 'berminyak', 'cocok', 'bau', 'wangi'];

type QaResult =
  | { kind: 'loading' }
  | { kind: 'answer'; data: AskResponse; params: Required<AskParams> }
  | { kind: 'error'; message: string };

interface HistoryItem {
  question: string;
  answerable: boolean;
  answer: string | null;
  retriever: Retriever;
  k: number;
  time: Date;
}

const timeFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });

function ConfidenceBadge({ conf }: { conf: number }) {
  const level = conf >= 0.75 ? 'high' : conf >= 0.5 ? 'medium' : 'low';
  return <span className={`badge badge--${level}`}>Confidence {formatScore(conf)}</span>;
}

function EvidenceCard({ ev, index, answerable }: { ev: Evidence; index: number; answerable: boolean }) {
  const isPrimary = answerable && index === 0;
  return (
    <li className={`evidence-card${isPrimary ? ' is-primary' : ''}`}>
      <div className="evidence-card__head">
        {isPrimary
          ? <span className="badge badge--evidence">Bukti utama</span>
          : <span className="badge badge--muted">#{index + 1}</span>}
        <span className="review-id">{ev.review_id}</span>
        {ev.rating ? <span className="stars" aria-label={`Rating ${ev.rating} dari 5`}>★ {ev.rating}/5</span> : null}
      </div>
      <p className="evidence-card__text" lang="en">
        {answerable
          ? <Highlight segments={spanSegments(ev.text, ev.answer_start, ev.answer_end)} className="answer-span" />
          : ev.text}
      </p>
      <ScoreBar score={ev.score} variant="qa" label="Skor relevansi" />
    </li>
  );
}

function ProductInfo({ product: p }: { product: Product }) {
  return (
    <>
      <ProductThumb product={p} size="lg" />
      <div className="product-info__body">
        <div><CategoryTag category={p.category} /></div>
        <h1 className="product-info__name">{p.name}</h1>
        <p className="product-info__brand">{p.brand}</p>
        <p className="product-info__price">{formatRupiah(p.price)}</p>
        <p className="product-info__desc">{p.description}</p>
        <table className="spec-table">
          <caption className="visually-hidden">Spesifikasi produk</caption>
          <tbody>
            <tr><th scope="row">Merek</th><td>{p.brand || '—'}</td></tr>
            <tr><th scope="row">Ukuran</th><td>{p.size || '—'}</td></tr>
            <tr><th scope="row">Jenis kulit</th><td>{(p.skin_types || []).join(', ') || '—'}</td></tr>
            <tr><th scope="row">Ulasan tersedia</th><td>{p.review_count ?? 0} ulasan</td></tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function ProductPage({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [productError, setProductError] = useState('');
  const [question, setQuestion] = useState('');
  const [retriever, setRetriever] = useState<Retriever>('domain');
  const [k, setK] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QaResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]); // disimpan di memori saja (hilang saat halaman ditutup)

  const seqRef = useRef(0);
  const inputEl = useRef<HTMLTextAreaElement>(null);

  /* ---------- Produk ---------- */
  useEffect(() => {
    if (!productId) {
      setProductError('ID produk tidak ada di URL. Buka produk dari halaman pencarian.');
      return;
    }
    let cancelled = false;
    api.getProduct(productId)
      .then(({ product: p }) => {
        if (cancelled) return;
        setProduct(p);
        document.title = `${p.name} · ${APP_NAME}`;
      })
      .catch((err: Error) => { if (!cancelled) setProductError(err.message); });
    return () => { cancelled = true; };
  }, [productId]);

  const trimmed = question.trim();
  const canSubmit = Boolean(product) && !loading && trimmed.length >= 3;
  const words = question.toLowerCase().split(/[^a-z]+/);
  const looksIndonesian = words.some((w) => ID_HINT_WORDS.includes(w));

  /* ---------- QA ---------- */
  async function ask(text = question) {
    const q = text.trim();
    if (!product || q.length < 3) {
      inputEl.current?.focus();
      return;
    }

    const seq = ++seqRef.current;
    setLoading(true);
    setResult({ kind: 'loading' });

    const params: Required<AskParams> = { productId: product.id, question: q, retriever, k };

    try {
      const data = await api.ask(params);
      if (seq !== seqRef.current) return;
      setResult({ kind: 'answer', data, params });
      setHistory((h) => [
        { question: q, answerable: data.answerable, answer: data.answer, retriever: params.retriever, k: params.k, time: new Date() },
        ...h,
      ].slice(0, 20));
    } catch (err) {
      if (seq !== seqRef.current) return;
      setResult({ kind: 'error', message: err instanceof Error ? err.message : '' });
    } finally {
      if (seq === seqRef.current) setLoading(false);
    }
  }

  const askExample = (q: string) => {
    setQuestion(q);
    ask(q);
  };

  // Tombol pensil di riwayat -> isi ulang pertanyaan untuk diedit
  const editHistory = (item: HistoryItem) => {
    setQuestion(item.question);
    requestAnimationFrame(() => {
      const el = inputEl.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  /* ---------- Render jawaban ---------- */
  let resultBody = null;
  if (result && result.kind === 'loading') {
    resultBody = (
      <>
        <div className="answer-card" aria-hidden="true">
          <span className="skeleton skeleton--line skeleton--w40" />
          <span className="skeleton skeleton--title" />
          <span className="skeleton skeleton--line skeleton--w60" />
        </div>
        <h3 className="evidence-title"><Icon name="quote" size={16} /><span>Mengambil ulasan yang relevan…</span></h3>
        <div className="evidence-list">
          {Array.from({ length: Math.min(k, 3) }, (_, i) => (
            <div className="evidence-card" aria-hidden="true" key={i}>
              <span className="skeleton skeleton--line skeleton--w40" />
              <span className="skeleton skeleton--block" />
              <span className="skeleton skeleton--bar" />
            </div>
          ))}
        </div>
      </>
    );
  } else if (result && result.kind === 'error') {
    resultBody = (
      <div className="qa-error" role="alert">
        <Icon name="alert" size={18} />
        <div>
          <p>Gagal mengambil jawaban. {result.message}</p>
          <button type="button" className="btn btn--inverted btn--sm" style={{ marginTop: 8 }} onClick={() => ask()}>
            <Icon name="refresh" size={14} /><span>Coba lagi</span>
          </button>
        </div>
      </div>
    );
  } else if (result && result.kind === 'answer') {
    const { data, params } = result;
    const evidence = data.evidence || [];
    const settings = `Retriever: ${RETRIEVER_LABELS[params.retriever]} · K = ${params.k}`;
    const meta = (
      <div className="answer-card__meta">
        {data.answerable ? <ConfidenceBadge conf={data.confidence} /> : <span className="badge badge--low">Tidak terjawab</span>}
        <span className="meta-chip"><Icon name="clock" size={14} />{data.latency_ms} ms</span>
      </div>
    );

    if (data.answerable) {
      const top = evidence[0];
      resultBody = (
        <>
          <article className="answer-card" aria-label="Jawaban">
            <div className="answer-card__head">
              <span className="eyebrow answer-card__label">Jawaban</span>
              {meta}
            </div>
            <p className="answer-card__text" lang="en">“{data.answer}”</p>
            <p className="answer-card__foot">{settings}{top ? ` · diekstrak dari ulasan ${top.review_id}` : ''}</p>
          </article>
          <h3 className="evidence-title"><Icon name="quote" size={16} /><span>Bukti ulasan ({evidence.length})</span></h3>
          <ol className="evidence-list">
            {evidence.map((ev, i) => <EvidenceCard key={ev.review_id} ev={ev} index={i} answerable />)}
          </ol>
        </>
      );
    } else {
      // State no-answer: kartu netral + ulasan paling mendekati (redup)
      resultBody = (
        <>
          <article className="answer-card answer-card--empty" aria-label="Jawaban tidak ditemukan">
            <div className="answer-card__head">
              <span className="eyebrow">Hasil</span>
              {meta}
            </div>
            <div className="no-answer">
              <span className="no-answer__icon"><Icon name="info" size={22} /></span>
              <div>
                <p className="no-answer__title">Informasi tidak ditemukan dalam ulasan yang tersedia.</p>
                <p className="no-answer__text">Coba ubah kata dalam pertanyaan, naikkan nilai K, atau ganti retriever di pengaturan lanjutan.</p>
              </div>
            </div>
            <p className="answer-card__foot">{settings}</p>
          </article>
          {evidence.length > 0 && (
            <>
              <h3 className="evidence-title"><Icon name="quote" size={16} /><span>Ulasan yang paling mendekati</span></h3>
              <ol className="evidence-list is-dim">
                {evidence.map((ev, i) => <EvidenceCard key={ev.review_id} ev={ev} index={i} answerable={false} />)}
              </ol>
            </>
          )}
        </>
      );
    }
  }

  return (
    <main id="main" className="container">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Beranda</Link>
        {product && (
          <>
            <span className="breadcrumb__sep" aria-hidden="true">/</span>
            <Link href={`/?cat=${encodeURIComponent(product.category)}`}>{product.category}</Link>
            <span className="breadcrumb__sep" aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </>
        )}
      </nav>

      <div className="product-layout">
        {/* ===== Kolom kiri: info produk ===== */}
        <article className="product-info" aria-busy={!product && !productError} aria-live="polite">
          {product ? (
            <ProductInfo product={product} />
          ) : productError ? (
            <StateBlock tone="danger" compact title="Produk tidak dapat dimuat" text={productError} />
          ) : (
            <>
              <span className="skeleton skeleton--thumb skeleton--thumb-lg" />
              <div className="product-info__body">
                <span className="skeleton skeleton--line skeleton--w40" />
                <span className="skeleton skeleton--title" />
                <span className="skeleton skeleton--line skeleton--w60" />
                <span className="skeleton skeleton--block" />
              </div>
            </>
          )}
        </article>

        {/* ===== Kolom kanan: Tanya produk (QA) ===== */}
        <section className="card qa-panel" aria-labelledby="qa-title">
          <div>
            <p className="eyebrow">Tanya jawab dari ulasan</p>
            <h2 className="qa-title" id="qa-title">Tanya tentang produk ini</h2>
            <p className="qa-note">
              <Icon name="info" size={16} />
              <span>Pertanyaan dalam bahasa Inggris. Jawaban diambil dari ulasan konsumen, bukan saran medis.</span>
            </p>
          </div>

          <form className="qa-form" noValidate onSubmit={(e) => { e.preventDefault(); ask(); }}>
            <label htmlFor="qa-input" className="visually-hidden">Pertanyaan tentang produk (bahasa Inggris)</label>
            <textarea
              ref={inputEl}
              id="qa-input"
              className="textarea"
              maxLength={MAX_LEN}
              rows={3}
              placeholder="e.g. Does this moisturizer feel greasy?"
              aria-describedby="qa-help qa-count lang-hint"
              value={question}
              disabled={Boolean(productError)}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                // Enter = kirim, Shift+Enter = baris baru
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  ask();
                }
              }}
            />
            <p id="qa-help" className="visually-hidden">Tekan Enter untuk bertanya, Shift+Enter untuk baris baru.</p>

            <div className="qa-form__foot">
              <div>
                <span className="char-count" id="qa-count">{question.length}/{MAX_LEN}</span>
                <p className="lang-hint" id="lang-hint" hidden={!looksIndonesian}>
                  <Icon name="alert" size={14} />
                  <span>Sepertinya bukan bahasa Inggris. Model QA memakai ulasan berbahasa Inggris.</span>
                </p>
              </div>
              <button type="submit" className="btn btn--primary" disabled={!canSubmit}>
                {loading
                  ? <><Icon name="clock" size={18} /><span>Mencari jawaban…</span></>
                  : <><Icon name="send" size={18} /><span>Tanya</span></>}
              </button>
            </div>

            <div className="chip-row" aria-label="Contoh pertanyaan">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button type="button" className="chip chip--example" key={q} disabled={Boolean(productError)} onClick={() => askExample(q)}>
                  {q}
                </button>
              ))}
            </div>

            {/* Pengaturan lanjutan (bisa dilipat) */}
            <details className="advanced">
              <summary>
                <Icon name="sliders" size={18} />
                <span>Pengaturan lanjutan</span>
                <span className="advanced__summary-meta">· {RETRIEVER_LABELS[retriever]} · K = {k}</span>
                <Icon name="chevronDown" size={18} className="chev" />
              </summary>
              <div className="advanced__body">
                <div className="control-group">
                  <span className="field-label" id="retriever-label">Retriever</span>
                  <fieldset className="segmented" aria-labelledby="retriever-label">
                    {Object.entries(RETRIEVER_LABELS).map(([value, label]) => (
                      <Fragment key={value}>
                        <input type="radio" name="retriever" id={`ret-${value}`} value={value} checked={retriever === value} onChange={() => setRetriever(value as Retriever)} />
                        <label htmlFor={`ret-${value}`}>{label}</label>
                      </Fragment>
                    ))}
                  </fieldset>
                </div>
                <div className="control-group">
                  <span className="field-label" id="k-label">K (jumlah bukti)</span>
                  <fieldset className="segmented" aria-labelledby="k-label">
                    {[1, 3, 5].map((value) => (
                      <Fragment key={value}>
                        <input type="radio" name="k" id={`k-${value}`} value={value} checked={k === value} onChange={() => setK(value)} />
                        <label htmlFor={`k-${value}`}>{value}</label>
                      </Fragment>
                    ))}
                  </fieldset>
                </div>
              </div>
            </details>
          </form>

          {/* Area jawaban + bukti */}
          <div aria-live="polite" aria-busy={loading}>{resultBody}</div>

          <hr className="divider" />

          {/* Riwayat pertanyaan (sesi ini saja) */}
          <section aria-labelledby="history-title">
            <div className="history-head">
              <h3 className="history-title" id="history-title"><Icon name="history" size={18} /><span>Riwayat pertanyaan</span></h3>
              <button
                type="button"
                className="link-btn link-btn--danger"
                aria-label="Hapus riwayat pertanyaan"
                disabled={history.length === 0}
                onClick={() => setHistory([])}
              >
                hapus semua
              </button>
            </div>
            <div>
              {history.length === 0 ? (
                <p className="history-empty">Belum ada pertanyaan di sesi ini.</p>
              ) : (
                <ul className="history-list">
                  {history.map((h) => (
                    <li className="history-item" key={h.time.getTime() + h.question}>
                      <div className="history-item__body">
                        <p className="history-q" lang="en">{h.question}</p>
                        <p className={`history-a ${h.answerable ? 'history-a--ok' : ''}`}>
                          {h.answerable ? `“${h.answer}”` : 'Informasi tidak ditemukan'}
                          {` · ${RETRIEVER_LABELS[h.retriever]} · K=${h.k} · ${timeFmt.format(h.time)}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="icon-btn-square"
                        aria-label={`Edit pertanyaan: ${h.question}`}
                        title="Edit pertanyaan"
                        onClick={() => editHistory(h)}
                      >
                        <Icon name="pencil" size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
