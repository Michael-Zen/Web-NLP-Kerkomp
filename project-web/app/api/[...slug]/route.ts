import { NextResponse } from 'next/server';

// Endpoint /api lain yang tidak dikenal -> 404 JSON
const notFound = () => NextResponse.json({ error: 'Endpoint tidak ditemukan.' }, { status: 404 });

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
