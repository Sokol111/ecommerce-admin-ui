import { getAttributeList, getCategoryList } from '@/lib/client/catalog-client';
import ProductEdit from '../_components/ProductEdit';

export default async function CreateProductPage() {
  const [categoriesResponse, attributesResponse] = await Promise.all([
    getCategoryList({ size: 100 }),
    getAttributeList({ size: 100, enabled: true }),
  ]);

  return (
    <div>
      <ProductEdit
        categories={categoriesResponse.items}
        availableAttributes={attributesResponse.items}
      />
    </div>
  );
}
