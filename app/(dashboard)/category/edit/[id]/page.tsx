import { getAttributeList, getCategoryById } from '@/lib/client/catalog-client';
import CategoryEdit from '../../_components/CategoryEdit';

async function getAllAttributes() {
  const allAttributes = [];
  let page = 1;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    const result = await getAttributeList({ enabled: true, size: pageSize, page });
    allAttributes.push(...result.items);
    hasMore = result.items.length === pageSize;
    page++;
  }

  return allAttributes;
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [category, attributes] = await Promise.all([getCategoryById(id), getAllAttributes()]);

  return (
    <div>
      <CategoryEdit category={category} availableAttributes={attributes} />
    </div>
  );
}
