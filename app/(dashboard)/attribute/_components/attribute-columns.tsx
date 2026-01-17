'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { problemToDescription } from '@/lib/utils/toast-helpers';
import { AttributeResponse } from '@sokol111/ecommerce-attribute-service-api';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteAttributeAction } from '../actions';

const typeLabels: Record<string, string> = {
  single: 'Single',
  multiple: 'Multiple',
  range: 'Range',
  boolean: 'Boolean',
  text: 'Text',
};

const typeVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  single: 'default',
  multiple: 'default',
  range: 'secondary',
  boolean: 'outline',
  text: 'outline',
};

function AttributeActions({ attribute }: { attribute: AttributeResponse }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteAttributeAction(attribute.id);
      if (!result.success) {
        toast.error(result.error.title, {
          description: problemToDescription(result.error),
        });
        return;
      }
      toast.success('Attribute deleted successfully');
      router.refresh();
    } catch (err) {
      toast.error('Failed to delete attribute', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setDeleting(false);
      setAlertOpen(false);
    }
  };

  return (
    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/attribute/edit/${attribute.id}`} className="flex items-center">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Attribute</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the attribute &quot;{attribute.name}&quot;? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const attributeColumns: ColumnDef<AttributeResponse>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-muted-foreground">{row.original.slug}</div>
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant={typeVariants[row.original.type] || 'secondary'}>
        {typeLabels[row.original.type] || row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: 'options',
    header: 'Options',
    cell: ({ row }) => {
      const count = row.original.options?.length || 0;
      if (row.original.type !== 'single' && row.original.type !== 'multiple') {
        return <span className="text-muted-foreground">—</span>;
      }
      return <Badge variant="outline">{count}</Badge>;
    },
  },
  {
    accessorKey: 'sortOrder',
    header: 'Sort Order',
  },
  {
    accessorKey: 'enabled',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.enabled ? 'default' : 'secondary'}>
        {row.original.enabled ? 'Enabled' : 'Disabled'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <AttributeActions attribute={row.original} />,
  },
];
