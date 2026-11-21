import { endpoint, listProducts } from '@/lib/engine';

export const dynamic = 'force-dynamic';

// GET /api/products?category=
export const GET = endpoint(async (request) =>
  listProducts(request.nextUrl.searchParams.get('category')));
