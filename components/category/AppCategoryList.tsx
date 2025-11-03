import { AppPagination } from '@/components/global/AppPagination';
import { DataTable } from '@/components/ui/data-table';
import { CategoryResponse } from '@sokol111/ecommerce-category-service-api';
import { columns } from './columns';

interface AppCategoryListProps {
  categories: CategoryResponse[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export default function AppCategoryList({
  categories,
  currentPage,
  pageSize,
  totalItems,
}: AppCategoryListProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div>
      <DataTable data={categories} columns={columns} />
      {totalPages > 1 && (
        <div className="mt-4">
          <AppPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
