import { AppPagination } from '@/components/common/AppPagination';
import { DataTable } from '@/components/ui/data-table';
import { CategoryResponse } from '@sokol111/ecommerce-catalog-service-api';
import { categoryColumns } from './category-columns';

interface CategoryListProps {
  categories: CategoryResponse[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export default function CategoryList({
  categories,
  currentPage,
  pageSize,
  totalItems,
}: CategoryListProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div>
      <DataTable data={categories} columns={categoryColumns} />
      {totalPages > 1 && (
        <div className="mt-4">
          <AppPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
