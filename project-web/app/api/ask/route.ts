import { endpoint, readJson, ask } from '@/lib/engine';

export const dynamic = 'force-dynamic';

// POST /api/ask  { productId, question, retriever: "bm25"|"pretrained"|"domain", k: 1|3|5 }
export const POST = endpoint(async (request) => ask(await readJson(request)));
