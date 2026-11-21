import { endpoint, readJson, search } from '@/lib/engine';

export const dynamic = 'force-dynamic';

// POST /api/search  { query, mode: "semantic"|"bm25", topK, category }
export const POST = endpoint(async (request) => search(await readJson(request)));
