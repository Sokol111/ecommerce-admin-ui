import { Product } from '@/lib/model/product-model';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';

export default function AppProductList({ products }: { products: Product[] }) {
  return (
    <div>
      <DataTable data={products} columns={columns} />
    </div>
  );
}
