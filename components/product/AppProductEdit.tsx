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
import { Product } from '@/lib/model/product-model';
import { updateProductAction } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters',
  }),
  price: z.coerce.number(),
  quantity: z.coerce.number(),
  version: z.coerce.number(),
  enabled: z.boolean(),
  createdAt: z.string(),
  modifiedAt: z.string(),
});

export default function AppProductEdit({ product }: { product: Product }) {
  const router = useRouter();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      version: product.version,
      enabled: product.enabled,
      createdAt: product.createdAt,
      modifiedAt: product.modifiedAt,
    },
  });

  async function onSubmit(value: z.infer<typeof productSchema>) {
    console.log('ZodProductEdit', value);
    await updateProductAction(value);
    router.push('/product/list');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name={'id'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product ID</FormLabel>
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
              <FormLabel>Product name</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'price'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product price</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'quantity'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product quantity</FormLabel>
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
