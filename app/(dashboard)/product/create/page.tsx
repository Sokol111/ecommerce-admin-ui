import { getAttributeList } from '@/lib/client/attribute-client';
import { getListCategories } from '@/lib/client/category-client';
import ProductEdit from '../_components/ProductEdit';

export default async function CreateProductPage() {
  const [categoriesResponse, attributesResponse] = await Promise.all([
    getListCategories({ size: 100 }),
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
