import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAttributeList } from '@/lib/client/attribute-client';
import {
  GetAttributeListOrder,
  GetAttributeListParams,
  GetAttributeListSort,
  GetAttributeListType,
} from '@sokol111/ecommerce-attribute-service-api';
import Link from 'next/link';
import AttributeList from '../_components/AttributeList';

type SearchParamsType = {
  [K in keyof GetAttributeListParams]?: string;
};

interface AttributeListPageProps {
  searchParams: Promise<SearchParamsType>;
}

export default async function AttributeListPage({ searchParams }: AttributeListPageProps) {
  const params = await searchParams;

  const page = params.page ? parseInt(params.page, 10) : undefined;
  const size = params.size ? parseInt(params.size, 10) : undefined;
  const sort = params.sort as GetAttributeListSort | undefined;
  const order = params.order as GetAttributeListOrder | undefined;
  const enabled = params.enabled === 'true' ? true : params.enabled === 'false' ? false : undefined;
  const type = params.type as GetAttributeListType | undefined;

  const attributeList = await getAttributeList({ page, size, sort, order, enabled, type });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Attributes</h1>
          <Badge variant="outline">{attributeList.total}</Badge>
        </div>
        <Link href="/attribute/create">
          <Button>Create Attribute</Button>
        </Link>
      </div>
      <AttributeList
        attributes={attributeList.items}
        currentPage={attributeList.page}
        pageSize={attributeList.size}
        totalItems={attributeList.total}
      />
    </div>
  );
}
