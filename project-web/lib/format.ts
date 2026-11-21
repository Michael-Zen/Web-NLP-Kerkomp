/**
 * lib/format.ts
 * Utilitas format & highlight (aman dipakai di server maupun klien).
 */

/** Potongan teks; `hl: true` dirender sebagai <mark>. */
export interface Segment {
  text: string;
  hl: boolean;
}

export type ScoreLevel = 'high' | 'mid' | 'low';

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export const formatScore = (s: number | string) => Number(s).toFixed(2);

/** Tingkat skor relevansi (DESIGN.md): ≥0.80 tinggi, 0.50–0.79 sedang, <0.50 rendah */
export function scoreLevel(score: number): ScoreLevel {
  const v = Number(score) || 0;
  return v >= 0.8 ? 'high' : v >= 0.5 ? 'mid' : 'low';
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Pecah teks jadi segmen untuk kata/frasa yang cocok
 * (case-insensitive, per kata utuh). Dirender sebagai <mark> oleh komponen.
 */
export function highlightSegments(text: string | null | undefined, terms: string[] = []): Segment[] {
  const src = String(text ?? '');
  const clean = [...new Set(terms.map((t) => String(t).trim()).filter((t) => t.length >= 3))]
    .sort((a, b) => b.length - a.length);
  if (!clean.length) return [{ text: src, hl: false }];

  // spasi di frasa boleh cocok dengan spasi atau tanda hubung (mis. "pori pori" ~ "pori-pori")
  const pattern = clean.map((t) => escapeRegExp(t).replace(/\s+/g, '[\\s-]+')).join('|');
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${pattern})(?![\\p{L}\\p{N}])`, 'giu');

  const out: Segment[] = [];
  let last = 0;
  for (const m of src.matchAll(re)) {
    const index = m.index ?? 0;
    if (index > last) out.push({ text: src.slice(last, index), hl: false });
    out.push({ text: m[0], hl: true });
    last = index + m[0].length;
  }
  if (last < src.length) out.push({ text: src.slice(last), hl: false });
  return out;
}

/** Segmen untuk satu rentang karakter [start, end) — dipakai untuk span jawaban QA. */
export function spanSegments(text: string | null | undefined, start: number | null, end: number | null): Segment[] {
  const src = String(text ?? '');
  if (start == null || end == null || start < 0 || end <= start || end > src.length) {
    return [{ text: src, hl: false }];
  }
  return [
    { text: src.slice(0, start), hl: false },
    { text: src.slice(start, end), hl: true },
    { text: src.slice(end), hl: false },
  ];
}
