import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getProductList } from '@/lib/client/catalog-client';
import {
  GetProductListOrder,
  GetProductListParams,
  GetProductListSort,
} from '@sokol111/ecommerce-catalog-service-api';
import Link from 'next/link';
import ProductList from '../_components/ProductList';

type SearchParamsType = {
  [K in keyof GetProductListParams]?: string;
};

interface ProductListPageProps {
  searchParams: Promise<SearchParamsType>;
}

export default async function ProductListPage({ searchParams }: ProductListPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : undefined;
  const size = params.size ? parseInt(params.size, 10) : undefined;
  const sort = params.sort as GetProductListSort | undefined;
  const order = params.order as GetProductListOrder | undefined;
  const enabled = params.enabled === 'true' ? true : params.enabled === 'false' ? false : undefined;

  const productList = await getProductList({ page, size, sort, order, enabled });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Products</h1>
          <Badge variant="outline">{productList.total}</Badge>
        </div>
        <Link href="/product/create">
          <Button>Create Product</Button>
        </Link>
      </div>
      <ProductList
        products={productList.items}
        currentPage={productList.page}
        pageSize={productList.size}
        totalItems={productList.total}
      />
    </div>
  );
}
