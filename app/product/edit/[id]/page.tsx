import AppProductEdit from "@/components/product/AppProductEdit";
import { getProductById } from "@/lib/client/product-client";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);

  return (
    <div>
      <AppProductEdit product={product} />
    </div>
  );
}
