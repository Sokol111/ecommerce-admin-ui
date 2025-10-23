import { DataTable } from '@/components/ui/data-table';
import { CategoryResponse } from '@sokol111/ecommerce-category-service-api';
import { columns } from './columns';

export default function AppCategoryList({ categories }: { categories: CategoryResponse[] }) {
  return (
    <div>
      <DataTable data={categories} columns={columns} />
    </div>
  );
}
