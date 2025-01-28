import AppCategoryList from "@/components/category/AppCategoryList";
import { getAllCategories } from "@/lib/client/category-client";

export default async function CategotyListPage() {
  const categories = await getAllCategories();
  return (
    <div>
      <AppCategoryList categories={categories} />
    </div>
  );
}
