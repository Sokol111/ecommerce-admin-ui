import { DataTable } from "../ui/data-table";
import { Product } from "@/lib/model/product-model";
import { columns } from "./columns";

export default function AppProductList({ products }: { products: Product[] }) {
  return (
    <div>
      <DataTable data={products} columns={columns} />
    </div>
  );
}
