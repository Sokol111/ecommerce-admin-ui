import { getProductById } from '@/lib/client/product-client';
import ProductEdit from '../../_components/ProductEdit';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await getProductById(id);

  return (
    <div>
      <ProductEdit product={product} />
    </div>
  );
}
