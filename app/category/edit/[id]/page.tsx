import AppCategoryEdit from "@/components/category/AppCategoryEdit";
import { getCategoryById } from "@/lib/client/category-client";

export default async function CategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params

  const category = await getCategoryById(id);

  return (
    <div>
      <AppCategoryEdit category={category} />
    </div>
  );
}
