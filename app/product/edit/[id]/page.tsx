import { getListCategories } from '@/lib/client/category-client';
import { getProductById } from '@/lib/client/product-client';
import ProductEdit from '../../_components/ProductEdit';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categoriesResponse] = await Promise.all([
    getProductById(id),
    getListCategories({ size: 100 }),
  ]);

  return (
    <div>
      <ProductEdit product={product} categories={categoriesResponse.items} />
    </div>
  );
}
