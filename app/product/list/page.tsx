import AppProductList from '@/components/product/AppProductList';
import { Button } from '@/components/ui/button';
import { getListProducts } from '@/lib/client/product-client';
import {
  DefaultApiGetListRequest,
  GetListOrderEnum,
  GetListSortEnum,
} from '@sokol111/ecommerce-product-service-api';
import Link from 'next/link';

type SearchParamsType = {
  [K in keyof DefaultApiGetListRequest]?: string;
};

interface ProductListPageProps {
  searchParams: Promise<SearchParamsType>;
}

export default async function ProductListPage({ searchParams }: ProductListPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : undefined;
  const size = params.size ? parseInt(params.size, 10) : undefined;
  const sort = params.sort as GetListSortEnum | undefined;
  const order = params.order as GetListOrderEnum | undefined;
  const enabled = params.enabled === 'true' ? true : params.enabled === 'false' ? false : undefined;

  const productList = await getListProducts({ page, size, sort, order, enabled });

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Link href="/product/create">
          <Button>Create product</Button>
        </Link>
      </div>
      <AppProductList
        products={productList.items}
        currentPage={productList.page}
        pageSize={productList.size}
        totalItems={productList.total}
      />
    </div>
  );
}
