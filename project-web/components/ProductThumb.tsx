import Icon, { CATEGORY_ICON } from './Icon';

export function CategoryTag({ category }: { category: string }) {
  return <span className="tag">{category}</span>;
}

interface ProductThumbProps {
  product: { category: string; image?: string | null };
  size?: 'md' | 'lg';
  rank?: number | null;
  showCategory?: boolean;
}

/** Gambar produk; tanpa gambar -> latar abu muda + ikon garis kategori. */
export default function ProductThumb({ product, size = 'md', rank = null, showCategory = false }: ProductThumbProps) {
  const sizeClass = size === 'lg' ? ' thumb--lg' : '';
  return (
    <div className={`thumb${sizeClass}`}>
      {showCategory && <span className="thumb__tag">{product.category}</span>}
      {rank ? <span className="thumb__rank" title="Peringkat relevansi">#{rank}</span> : null}
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image} alt="" loading="lazy" />
      ) : (
        <span className="thumb__icon" aria-hidden="true">
          <Icon name={CATEGORY_ICON[product.category] || 'droplet'} size={size === 'lg' ? 72 : 48} />
        </span>
      )}
    </div>
  );
}
