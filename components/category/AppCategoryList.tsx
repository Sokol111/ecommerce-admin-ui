import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Category } from '@/lib/model/category-model';

export default function AppCategoryList({
  categories,
}: {
  categories: Category[];
}) {
  return (
    <div>
      <DataTable data={categories} columns={columns} />
    </div>
  );
}
