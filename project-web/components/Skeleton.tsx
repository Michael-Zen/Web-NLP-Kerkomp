/** Skeleton card untuk loading state */
export function SkeletonCards({ count = 6 }: { count?: number }) {
  return Array.from({ length: count }, (_, i) => (
    <div className="skeleton-card" aria-hidden="true" key={i}>
      <span className="skeleton skeleton--thumb" />
      <div className="skeleton-card__body">
        <span className="skeleton skeleton--title" />
        <span className="skeleton skeleton--line skeleton--w40" />
        <span className="skeleton skeleton--line" />
        <span className="skeleton skeleton--line skeleton--w60" />
        <span className="skeleton skeleton--bar" />
      </div>
    </div>
  ));
}
