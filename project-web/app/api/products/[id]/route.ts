import { endpoint, getProduct } from '@/lib/engine';

export const dynamic = 'force-dynamic';

// GET /api/products/:id
export const GET = endpoint(async (_request, params) => getProduct(params.id));
