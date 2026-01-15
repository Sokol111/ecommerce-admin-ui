import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getListCategories } from '@/lib/client/category-client';
import { GetListOrder, GetListParams, GetListSort } from '@sokol111/ecommerce-category-service-api';
import Link from 'next/link';
import CategoryList from '../_components/CategoryList';

type SearchParamsType = {
  [K in keyof GetListParams]?: string;
};

interface CategoryListPageProps {
  searchParams: Promise<SearchParamsType>;
}

export default async function CategoryListPage({ searchParams }: CategoryListPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : undefined;
  const size = params.size ? parseInt(params.size, 10) : undefined;
  const sort = params.sort as GetListSort | undefined;
  const order = params.order as GetListOrder | undefined;
  const enabled = params.enabled === 'true' ? true : params.enabled === 'false' ? false : undefined;

  const categoryList = await getListCategories({ page, size, sort, order, enabled });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Badge variant="outline">{categoryList.total}</Badge>
        </div>
        <Link href="/category/create">
          <Button>Create Category</Button>
        </Link>
      </div>
      <CategoryList
        categories={categoryList.items}
        currentPage={categoryList.page}
        pageSize={categoryList.size}
        totalItems={categoryList.total}
      />
    </div>
  );
}
