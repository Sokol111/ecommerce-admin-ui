import AppProductList from "@/components/product/AppProductList";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/client/product-client";
import Link from "next/link";

export default async function ProductListPage() {
  const products = await getAllProducts();
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Link href="/product/create">
          <Button>Create product</Button>
        </Link>
      </div>
      <AppProductList products={products} />
    </div>
  );
}
