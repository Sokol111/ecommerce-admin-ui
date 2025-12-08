import { getCategoryById } from '@/lib/client/category-client';
import CategoryEdit from '../../_components/CategoryEdit';

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const category = await getCategoryById(id);

  return (
    <div>
      <CategoryEdit category={category} />
    </div>
  );
}
