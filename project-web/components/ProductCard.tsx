import Link from 'next/link';
import Icon from './Icon';
import Highlight from './Highlight';
import ScoreBar from './ScoreBar';
import ProductThumb, { CategoryTag } from './ProductThumb';
import { formatRupiah, highlightSegments } from '@/lib/format';
import type { Product, SearchMode, SearchResult } from '@/lib/types';

export const productHref = (id: string) => `/product/${encodeURIComponent(id)}`;

/** Kartu bisa menampilkan produk katalog (tanpa skor) atau hasil pencarian (dengan skor). */
export type CardItem = Product | SearchResult;

interface ProductCardProps {
  item: CardItem;
  mode?: SearchMode;
  rank?: number | null;
  compact?: boolean;
  query?: string;
}

/**
 * Kartu produk.
 * Jika `score` tidak ada (mode katalog), skor disembunyikan dan potongan teks diganti deskripsi.
 */
export default function ProductCard({ item, mode = 'semantic', rank = null, compact = false, query = '' }: ProductCardProps) {
  const variant = mode === 'bm25' ? 'bm25' : 'semantic';
  const result = 'score' in item && typeof item.score === 'number' ? item : null;
  const terms = result && result.matched_terms.length ? result.matched_terms : String(query).split(/\s+/);
  const titleId = `pc-${variant}-${item.id}-${rank ?? 'x'}`;
  const href = productHref(item.id);
  const description = 'description' in item ? item.description : '';

  return (
    <article className={`product-card${compact ? ' product-card--compact' : ''}`} aria-labelledby={titleId}>
      <ProductThumb product={item} rank={compact ? null : rank} showCategory={!compact} />
      <div className="product-card__body">
        {compact && (
          <div className="product-card__row">
            <CategoryTag category={item.category} />
            {rank ? <span className="meta-chip">#{rank}</span> : null}
          </div>
        )}
        <h3 className="product-card__name" id={titleId}><Link href={href}>{item.name}</Link></h3>
        <p className="product-card__brand">{item.brand}</p>
        <p className="product-card__price">{formatRupiah(item.price)}</p>
        {result && result.matched_chunk ? (
          <p className="product-card__match">
            <span className="product-card__match-label">Cocok dengan:</span>{' '}
            <Highlight segments={highlightSegments(result.matched_chunk, terms)} />
          </p>
        ) : description ? (
          <p className="product-card__desc">{description}</p>
        ) : null}
        {result && <ScoreBar score={result.score} variant={variant} label="Relevansi" />}
        <Link className="product-card__ask" href={href}>
          Tanya soal produk ini <Icon name="arrowRight" size={15} />
        </Link>
      </div>
    </article>
  );
}
