import AppProductList from "@/components/product/AppProductList";
import { getAllProducts } from "@/lib/client/product-client";

export default async function ProductListPage() {
  const products = await getAllProducts();
  return (
    <div>
      <AppProductList products={products} />
    </div>
  );
}
