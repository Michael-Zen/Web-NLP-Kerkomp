# Cari.in — Prototipe UI Semantic Search & QA Skincare

Prototipe front-end untuk proyek kelompok dua mata kuliah:

1. **Kecerdasan Komputasional**: _Semantic Search_ katalog skincare (dibandingkan dengan baseline BM25).
2. **NLP**: _Question Answering_ produk berbasis ulasan konsumen (bahasa Inggris).

> ⚠️ Semua data dan skor masih **dummy**. Belum ada model, embedding, atau Python.
> Skor dibuat dari kecocokan kata sederhana + sedikit acak, hanya agar UI terlihat realistis.

## Cara menjalankan

Dibangun dengan **Next.js 16 (App Router)** + React 19 + **TypeScript** (`.tsx`). Syarat: Node.js 20.9 atau lebih baru.

```bash
npm install
npm run dev      # mode pengembangan (hot reload)
```

Lalu buka **http://localhost:3000**.

Untuk versi produksi: `npm run build` lalu `npm start`.

## Struktur folder

```
project-web/
├── app/
│   ├── layout.tsx              # layout global: font, header, footer, CSS
│   ├── page.tsx                # /              Beranda + Semantic Search
│   ├── product/[id]/page.tsx   # /product/:id   Detail produk + Tanya Produk (QA)
│   ├── about/page.tsx          # /about         Tentang proyek & tim
│   ├── api/                   # Route Handlers = API dummy (dulu server.js)
│   │   ├── products/route.ts          GET  /api/products
│   │   ├── products/[id]/route.ts     GET  /api/products/:id
│   │   ├── search/route.ts            POST /api/search
│   │   └── ask/route.ts               POST /api/ask
│   └── styles/
│       ├── tokens.css         # design token (warna, font, radius, shadow) — sesuai Figma
│       └── style.css          # komponen & layout
├── components/                # komponen React (.tsx) (SearchPage, ProductPage, ProductCard, Icon, …)
├── lib/
│   ├── api.ts                 # SATU-SATUNYA tempat fetch ke /api/*
│   ├── config.ts              # APP_NAME, CATEGORIES, RETRIEVER_LABELS
│   ├── format.ts              # format Rupiah, skor, highlight
│   ├── types.ts               # tipe data API (Product, SearchResult, AskResponse, …)
│   └── engine.ts              # logika pencarian & QA dummy (server-only)
└── data/
    ├── products.json          # KOSONG — isi dengan dataset produk kamu
    └── reviews.json           # KOSONG — isi dengan dataset ulasan kamu
```

Desain tidak diubah: CSS lama dipakai apa adanya, dan struktur HTML/kelas CSS di komponen React
sama dengan versi HTML sebelumnya.

## Format data

Kedua file di `data/` sengaja dikosongkan. Isi dengan dataset sendiri mengikuti format berikut,
lalu restart server (`npm run dev` / `npm run build && npm start`), karena data dibaca sekali saat server mulai.

### `data/products.json` — array produk

```json
[
  {
    "id": "p01",
    "name": "Nama Produk",
    "brand": "Nama Brand",
    "category": "Cleanser",
    "price": 89000,
    "size": "120 ml",
    "image": null,
    "skin_types": ["Berminyak", "Berjerawat"],
    "tags": ["salicylic acid", "kontrol minyak"],
    "description": "Deskripsi produk. Dipecah per kalimat menjadi chunk untuk pencarian."
  }
]
```

| Field | Wajib | Keterangan |
|---|---|---|
| `id` | ya | Unik; dipakai di URL `/product/<id>` dan sebagai kunci di `reviews.json` |
| `name`, `brand` | ya | Teks |
| `category` | ya | Salah satu: `Cleanser`, `Toner`, `Serum`, `Moisturizer`, `Sunscreen`, `Exfoliator` (kapital di depan) |
| `price` | ya | Angka dalam Rupiah, tanpa titik (mis. `89000`) |
| `description` | ya | Sumber `matched_chunk`; dipecah per kalimat |
| `image` | tidak | URL gambar, atau `null` untuk placeholder warna + ikon |
| `size`, `skin_types`, `tags` | tidak | Ditampilkan di halaman produk; `tags` ikut dipakai pencarian |

Kalau dataset kamu punya kategori lain, tambahkan juga di `CATEGORIES` (`lib/config.ts`),
`CATEGORY_IDS` (`lib/engine.ts`), dan ikonnya di `CATEGORY_ICON` (`components/Icon.tsx`).

### `data/reviews.json` — objek: `id` produk → array ulasan

```json
{
  "p01": [
    { "review_id": "R0101", "rating": 5, "text": "Review text in English. It does not feel greasy at all." }
  ]
}
```

| Field | Wajib | Keterangan |
|---|---|---|
| `review_id` | ya | Unik; tampil di kartu bukti |
| `text` | ya | Teks ulasan (bahasa Inggris); `answer_start`/`answer_end` adalah offset karakter di teks ini |
| `rating` | tidak | 1–5; tampil sebagai ★ di kartu bukti |

Selama data masih kosong, UI tetap berjalan: katalog menampilkan pesan "belum ada produk",
pencarian menampilkan state "tidak ada hasil", dan halaman produk menampilkan "produk tidak ditemukan".

## Mengganti nama aplikasi

Ubah satu konstanta di `lib/config.ts`:

```js
export const APP_NAME = 'Cari.in';
```

Header, `<title>`, footer, dan halaman Tentang otomatis ikut berubah.

## API dummy

Setiap respons punya delay acak 150–400 ms dan menyertakan `latency_ms`.

| Method | Endpoint | Body / Query | Respons |
|---|---|---|---|
| GET | `/api/products?category=` | `category` opsional | `{ total, products }` |
| GET | `/api/products/:id` | — | `{ product }` |
| POST | `/api/search` | `{ query, mode: "semantic"\|"bm25", topK, category }` | `{ results: [{ id, name, brand, category, price, image, score, matched_chunk, matched_terms }], total }` |
| POST | `/api/ask` | `{ productId, question, retriever: "bm25"\|"pretrained"\|"domain", k: 1\|3\|5 }` | `{ answerable, answer, confidence, evidence: [{ review_id, text, answer_start, answer_end, score }] }` |

Catatan:
- `matched_terms` (tambahan) dipakai UI untuk highlight kata yang cocok di `matched_chunk`.
- Untuk BM25, `score` adalah skor yang dinormalisasi ke 0–1 untuk tampilan; skor mentah ada di `raw_score`.
- `/api/ask` mengembalikan `answerable: false` bila kata kunci pertanyaan tidak ditemukan di ulasan produk tersebut.
- Kueri `__error__` sengaja memicu error 500 untuk menguji state error di UI.

## Menghubungkan ke backend model asli

Semua request lewat `lib/api.ts`. Saat backend Python (FastAPI/Flask) siap:

1. Buat file `.env.local` berisi `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`, lalu restart `npm run dev`.
2. Pastikan backend mengikuti bentuk request/response pada tabel di atas.
3. Aktifkan CORS di backend jika berjalan di port berbeda.

UI tidak perlu diubah.

## Demo yang disarankan saat presentasi

(Setelah dataset diisi.)

- **Semantic vs BM25**: klik *Bandingkan*, lalu coba kueri dengan sinonim, mis. "serum untuk bekas jerawat".
  BM25 hanya menemukan kata yang sama persis, sedangkan mode semantic juga menemukan istilah serupa.
- **QA terjawab**: pilih produk yang ulasannya membahas tekstur, tanya "Does it feel greasy?".
- **QA tidak terjawab**: tanya "Does it leave a white cast?" pada produk non-sunscreen.
- **Pengaruh retriever**: bandingkan retriever BM25 dan Domain-adapted untuk pertanyaan yang memakai sinonim
  (mis. ulasan menulis "sticky", pertanyaan memakai "greasy").
````
