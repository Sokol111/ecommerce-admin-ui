import { getAttributeList } from '@/lib/client/attribute-client';
import CategoryEdit from '../_components/CategoryEdit';

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

export default async function CreateCategoryPage() {
  const attributes = await getAllAttributes();

  return (
    <div>
      <CategoryEdit availableAttributes={attributes} />
    </div>
  );
}
