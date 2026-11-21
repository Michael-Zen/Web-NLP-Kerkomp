/**
 * lib/types.ts
 * Tipe data bersama antara API (lib/engine.ts / backend Python nanti) dan UI.
 * Kalau backend asli mengubah bentuk respons, cukup sesuaikan di sini — TypeScript
 * akan menunjukkan bagian UI yang perlu ikut diubah.
 */

export type SearchMode = 'semantic' | 'bm25';
export type Retriever = 'bm25' | 'pretrained' | 'domain';

/** Satu produk di data/products.json */
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  size?: string | null;
  image?: string | null;
  skin_types?: string[];
  tags?: string[];
  /** Ditambahkan oleh API */
  review_count?: number;
}

/** Satu ulasan di data/reviews.json */
export interface Review {
  review_id: string;
  text: string;
  rating?: number;
}

export interface SearchResult {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image?: string | null;
  score: number;
  raw_score?: number;
  matched_chunk: string;
  matched_terms: string[];
}

export interface Evidence {
  review_id: string;
  text: string;
  rating?: number;
  answer_start: number | null;
  answer_end: number | null;
  score: number;
}

/* ---------- Bentuk respons API ---------- */
export interface ProductsBody { total: number; products: Product[] }
export interface ProductBody { product: Product }
export interface SearchBody {
  query: string;
  mode: SearchMode;
  topK: number;
  category: string;
  total: number;
  results: SearchResult[];
}
export interface AskBody {
  product_id: string;
  question: string;
  retriever: Retriever;
  k: number;
  answerable: boolean;
  answer: string | null;
  confidence: number;
  message: string | null;
  evidence: Evidence[];
}

/** Setiap respons API menyertakan latency_ms */
export type WithLatency<T> = T & { latency_ms: number };

export type ProductsResponse = WithLatency<ProductsBody>;
export type ProductResponse = WithLatency<ProductBody>;
export type SearchResponse = WithLatency<SearchBody>;
export type AskResponse = WithLatency<AskBody>;

/* ---------- Parameter request ---------- */
export interface SearchParams {
  query: string;
  mode?: SearchMode;
  topK?: number;
  category?: string;
}

export interface AskParams {
  productId: string;
  question: string;
  retriever?: Retriever;
  k?: number;
}
