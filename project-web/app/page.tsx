import type { Metadata } from 'next';
import SearchPage from '@/components/SearchPage';
import { APP_NAME } from '@/lib/config';

// Template judul di layout tidak berlaku untuk halaman di segmen yang sama, jadi ditulis lengkap
export const metadata: Metadata = { title: { absolute: `Pencarian Produk Semantik · ${APP_NAME}` } };

export default async function HomePage({ searchParams }: PageProps<'/'>) {
  const params = await searchParams;
  return <SearchPage initialParams={params} />;
}
