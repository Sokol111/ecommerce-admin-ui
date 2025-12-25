import { getAttributeList } from '@/lib/client/attribute-client';
import { getListCategories } from '@/lib/client/category-client';
import { getProductById } from '@/lib/client/product-client';
import ProductEdit from '../../_components/ProductEdit';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categoriesResponse, attributesResponse] = await Promise.all([
    getProductById(id),
    getListCategories({ size: 100 }),
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
