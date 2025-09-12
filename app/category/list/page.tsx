import AppCategoryList from "@/components/category/AppCategoryList";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/lib/client/category-client";
import Link from "next/link";

export default async function CategotyListPage() {
  const categories = await getAllCategories();
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Link href="/category/create">
          <Button>Create category</Button>
        </Link>
      </div>
      <AppCategoryList categories={categories} />
    </div>
  );
}
