import { getAttributeList, getCategoryList, getProductById } from '@/lib/client/catalog-client';
import ProductEdit from '../../_components/ProductEdit';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categoriesResponse, attributesResponse] = await Promise.all([
    getProductById(id),
    getCategoryList({ size: 100 }),
    getAttributeList({ size: 100, enabled: true }),
  ]);

  return (
    <div>
      <ProductEdit
        product={product}
        categories={categoriesResponse.items}
        availableAttributes={attributesResponse.items}
      />
    </div>
  );
}
