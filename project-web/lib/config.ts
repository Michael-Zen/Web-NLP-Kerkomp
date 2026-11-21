/**
 * lib/config.ts
 * Konstanta global. Ganti APP_NAME di sini saja —
 * header, <title>, dan footer otomatis ikut berubah.
 */
import type { Retriever } from './types';

export const APP_NAME = 'Cari.in';

export const CATEGORIES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Exfoliator'];

export const RETRIEVER_LABELS: Record<Retriever, string> = {
  bm25: 'BM25',
  pretrained: 'Pretrained',
  domain: 'Domain-adapted',
};
