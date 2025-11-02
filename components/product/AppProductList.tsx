import { DataTable } from '@/components/ui/data-table';
import { ProductResponse } from '@sokol111/ecommerce-product-service-api';
import { columns } from './columns';
import { ProductPagination } from './ProductPagination';

interface AppProductListProps {
  products: ProductResponse[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export default function AppProductList({
  products,
  currentPage,
  pageSize,
  totalItems,
}: AppProductListProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div>
      <DataTable data={products} columns={columns} />
      {totalPages > 1 && (
        <div className="mt-4">
          <ProductPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
