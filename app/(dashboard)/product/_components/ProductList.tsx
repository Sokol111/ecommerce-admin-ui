import { AppPagination } from '@/components/common/AppPagination';
import { DataTable } from '@/components/ui/data-table';
import { ProductResponse } from '@sokol111/ecommerce-catalog-service-api';
import { productColumns } from './product-columns';

interface ProductListProps {
  products: ProductResponse[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export default function ProductList({
  products,
  currentPage,
  pageSize,
  totalItems,
}: ProductListProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div>
      <DataTable data={products} columns={productColumns} />
      {totalPages > 1 && (
        <div className="mt-4">
          <AppPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
