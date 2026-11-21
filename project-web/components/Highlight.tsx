import type { Segment } from '@/lib/format';

interface HighlightProps {
  segments: Segment[];
  className?: string;
}

/** Render segmen dari lib/format.ts; segmen `hl` dibungkus <mark>. */
export default function Highlight({ segments, className = 'hl' }: HighlightProps) {
  return segments.map((s, i) =>
    s.hl ? <mark key={i} className={className}>{s.text}</mark> : <span key={i}>{s.text}</span>);
}
