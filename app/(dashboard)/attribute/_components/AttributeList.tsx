import { AppPagination } from '@/components/common/AppPagination';
import { DataTable } from '@/components/ui/data-table';
import { AttributeResponse } from '@sokol111/ecommerce-catalog-service-api';
import { attributeColumns } from './attribute-columns';

interface AttributeListProps {
  attributes: AttributeResponse[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export default function AttributeList({
  attributes,
  currentPage,
  pageSize,
  totalItems,
}: AttributeListProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div>
      <DataTable data={attributes} columns={attributeColumns} />
      {totalPages > 1 && (
        <div className="mt-4">
          <AppPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
