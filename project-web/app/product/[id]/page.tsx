import type { Metadata } from 'next';
import ProductPage from '@/components/ProductPage';

export const metadata: Metadata = {
  title: 'Tanya Produk',
  description: 'Detail produk skincare dan tanya-jawab berbasis ulasan konsumen.',
};

export default async function Page({ params }: PageProps<'/product/[id]'>) {
  const { id } = await params;
  return <ProductPage productId={decodeURIComponent(id)} />;
}
