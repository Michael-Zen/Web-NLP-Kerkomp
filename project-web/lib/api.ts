/**
 * lib/api.ts
 * SEMUA pemanggilan data ke backend dikumpulkan di sini.
 * Komponen tidak boleh memanggil fetch() langsung — cukup pakai objek `api`.
 *
 * Saat backend Python (FastAPI/Flask) siap, set NEXT_PUBLIC_API_BASE_URL
 * (mis. 'http://localhost:8000') di file .env.local, selama bentuk request/response tetap sama.
 */
import type {
  AskParams, AskResponse, ProductResponse, ProductsResponse, SearchParams, SearchResponse,
} from './types';

// Kosong = Route Handlers Next.js di app/api/* (API dummy)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const DEFAULT_TIMEOUT_MS = 15000;

// Error terstruktur supaya UI bisa menampilkan pesan yang jelas
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status = 0, data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  timeout?: number;
}

// Pembungkus fetch: JSON, timeout, dan normalisasi error
async function request<T>(path: string, { method = 'GET', body, timeout = DEFAULT_TIMEOUT_MS }: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(API_BASE_URL + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    });

    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* respons bukan JSON */
    }

    if (!res.ok) {
      const message = (data as { error?: string } | null)?.error;
      throw new ApiError(message || `Permintaan gagal (HTTP ${res.status}).`, res.status, data);
    }
    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') throw new ApiError('Server terlalu lama merespons. Coba lagi.');
    throw new ApiError('Tidak dapat terhubung ke server. Pastikan server sudah berjalan.');
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  /** Daftar produk, opsional difilter kategori. */
  getProducts(category = ''): Promise<ProductsResponse> {
    const qs = category ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/api/products${qs}`);
  },

  /** Detail satu produk. */
  getProduct(id: string): Promise<ProductResponse> {
    return request(`/api/products/${encodeURIComponent(id)}`);
  },

  /** Semantic / keyword search. */
  search({ query, mode = 'semantic', topK = 10, category = '' }: SearchParams): Promise<SearchResponse> {
    return request('/api/search', { method: 'POST', body: { query, mode, topK, category } });
  },

  /** Question answering berbasis ulasan. */
  ask({ productId, question, retriever = 'domain', k = 3 }: AskParams): Promise<AskResponse> {
    return request('/api/ask', { method: 'POST', body: { productId, question, retriever, k } });
  },
};
