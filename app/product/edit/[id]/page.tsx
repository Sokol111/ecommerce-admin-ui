import AppProductEdit from '@/components/product/AppProductEdit';
import { getProductById } from '@/lib/client/product-client';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await getProductById(id);

  return (
    <div>
      <AppProductEdit product={product} />
    </div>
  );
}
