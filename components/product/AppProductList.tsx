import { DataTable } from '@/components/ui/data-table';
import { ProductResponse } from '@sokol111/ecommerce-product-service-api';
import { columns } from './columns';

export default function AppProductList({ products }: { products: ProductResponse[] }) {
  return (
    <div>
      <DataTable data={products} columns={columns} />
    </div>
  );
}
