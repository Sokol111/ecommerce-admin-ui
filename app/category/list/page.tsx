import AppCategoryList from '@/components/category/AppCategoryList';
import { Button } from '@/components/ui/button';
import { getListCategories } from '@/lib/client/category-client';
import {
  DefaultApiGetListRequest,
  GetListOrderEnum,
  GetListSortEnum,
} from '@sokol111/ecommerce-category-service-api';
import Link from 'next/link';

type SearchParamsType = {
  [K in keyof DefaultApiGetListRequest]?: string;
};

interface CategoryListPageProps {
  searchParams: Promise<SearchParamsType>;
}

export default async function CategoryListPage({ searchParams }: CategoryListPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : undefined;
  const size = params.size ? parseInt(params.size, 10) : undefined;
  const sort = params.sort as GetListSortEnum | undefined;
  const order = params.order as GetListOrderEnum | undefined;
  const enabled = params.enabled === 'true' ? true : params.enabled === 'false' ? false : undefined;

  const categoryList = await getListCategories({ page, size, sort, order, enabled });

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Link href="/category/create">
          <Button>Create category</Button>
        </Link>
      </div>
      <AppCategoryList
        categories={categoryList.items}
        currentPage={categoryList.page}
        pageSize={categoryList.size}
        totalItems={categoryList.total}
      />
    </div>
  );
}
