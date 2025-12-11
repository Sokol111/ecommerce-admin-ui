import { getListCategories } from '@/lib/client/category-client';
import ProductEdit from '../_components/ProductEdit';

export default async function CreateProductPage() {
  const categoriesResponse = await getListCategories({ size: 100 });

  return (
    <div>
      <ProductEdit categories={categoriesResponse.items} />
    </div>
  );
}
