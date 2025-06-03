'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Button } from '../ui/button';
import { updateCategoryAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Category } from '@/lib/model/category-model';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2, {
    message: 'Category name must be at least 2 characters',
  }),
  version: z.coerce.number(),
  enabled: z.boolean(),
  createdAt: z.string(),
  modifiedAt: z.string(),
});

export default function AppCategoryEdit({ category }: { category: Category }) {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: category.id,
      name: category.name,
      version: category.version,
      enabled: category.enabled,
      createdAt: category.createdAt,
      modifiedAt: category.modifiedAt,
    },
  });

  async function onSubmit(value: z.infer<typeof formSchema>) {
    console.log('ZodCategoryEdit', value);
    await updateCategoryAction(value);
    router.push('/category/list');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name={'id'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category ID</FormLabel>
              <FormControl>
                <Input type="text" {...field} readOnly={true} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'name'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category name</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'enabled'}
          render={({ field }) => (
            <FormItem className="space-x-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Enabled</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'createdAt'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Created at</FormLabel>
              <FormControl>
                <Input type="text" {...field} readOnly={true} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'modifiedAt'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modified at</FormLabel>
              <FormControl>
                <Input type="text" {...field} readOnly={true} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
