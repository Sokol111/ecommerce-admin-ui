'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DraftFormAdapter, useImageUpload } from '@/hooks/useImageUpload';
import { createProductAction, updateProductAction } from '@/lib/actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductResponse } from '@sokol111/ecommerce-product-service-api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

// Schema for create mode
const productSchema = z
  .object({
    id: z.string().uuid(),
    version: z.number().int().min(0, 'Version is required'),
    imageId: z.string().uuid().nullish(),
    name: z
      .string()
      .min(2, 'Product name must be at least 2 characters')
      .max(50, 'Product name must be at most 50 characters')
      .regex(/^[A-Za-z0-9 _-]+$/, 'Only letters, numbers, space, underscore and dash allowed')
      .transform((s) => s.trim()),
    price: z.coerce
      .number()
      .min(0, 'Price must be >= 0')
      .max(1_000_000, 'Price is too large')
      .refine((n) => /^\d+(\.\d{1,2})?$/.test(String(n)), 'Price must have up to 2 decimals'),
    quantity: z.coerce
      .number()
      .int('Quantity must be an integer')
      .min(0, 'Quantity must be >= 0')
      .max(1_000_000, 'Quantity is too large'),
    enabled: z.boolean(),
  })
  .refine((data) => !(data.enabled && !data.imageId), {
    message: 'Enabled products must have an image',
    path: ['imageId'],
  })
  .refine((data) => !(data.enabled && data.price <= 0), {
    message: 'Enabled products must have price greater than 0',
    path: ['price'],
  })
  .refine((data) => !(data.enabled && data.quantity <= 0), {
    message: 'Enabled products must have quantity greater than 0',
    path: ['quantity'],
  });

export type ProductFormData = z.infer<typeof productSchema>;

interface AppProductFormProps {
  product?: ProductResponse;
}

export default function AppProductEdit({ product }: AppProductFormProps) {
  const router = useRouter();
  const isEditMode = !!product;

  const [saving, setSaving] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: isEditMode
      ? {
          id: product.id,
          version: product.version,
          imageId: undefined, // Image updates can be added later
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          enabled: product.enabled,
        }
      : {
          id: uuidv4(),
          version: 0,
          imageId: undefined,
          name: '',
          price: 0,
          quantity: 0,
          enabled: false,
        },
  });

  // Create a narrowed subset of the form for image upload (only draftId & imageId needed)
  const imageUploadForm: DraftFormAdapter = {
    getValues: () => ({
      draftId: form.getValues().id,
      imageId: form.getValues().imageId ?? undefined,
    }),
    setValue: (name, value) => form.setValue(name, value),
  };
  const { previewUrl, error, imageUploading, handleFileChange } = useImageUpload(imageUploadForm);

  async function onSubmit(value: ProductFormData) {
    setSaving(true);
    try {
      // Normalize price to two decimals
      value.price = Number(value.price.toFixed(2));

      let result;
      if (isEditMode) {
        result = await updateProductAction({
          id: value.id,
          version: value.version,
          name: value.name,
          price: value.price,
          quantity: value.quantity,
          enabled: value.enabled,
          imageId: value.imageId ?? undefined,
        });
      } else {
        result = await createProductAction({
          id: value.id,
          name: value.name,
          price: value.price,
          quantity: value.quantity,
          enabled: value.enabled,
          imageId: value.imageId ?? undefined,
        });
      }

      if (!result.success) {
        const { error } = result;

        // Show field-level validation errors if present
        if (error.fields) {
          Object.entries(error.fields).forEach(([field, message]) => {
            if (
              field === 'id' ||
              field === 'version' ||
              field === 'imageId' ||
              field === 'name' ||
              field === 'price' ||
              field === 'quantity' ||
              field === 'enabled'
            ) {
              form.setError(field, { message });
            }
          });
        }

        toast.error(error.title, {
          description: error.detail || 'Please check the form and try again',
        });
        return;
      }

      toast.success(isEditMode ? 'Product updated successfully' : 'Product created successfully');
      router.push('/product/list');
    } catch {
      toast.error('Unexpected error', {
        description: `Something went wrong while ${isEditMode ? 'updating' : 'creating'} the product`,
      });
    } finally {
      setSaving(false);
    }
  }

  const isBusy = imageUploading || saving;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        aria-busy={isBusy ? 'true' : undefined}
      >
        <input type="hidden" {...form.register('id')} />
        <input type="hidden" {...form.register('version')} />
        <FormField
          control={form.control}
          name={'name'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product name</FormLabel>
              <FormControl>
                <Input type="text" disabled={isBusy} {...field} />
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
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min={0}
                  disabled={isBusy}
                  {...field}
                />
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
                <Input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min={0}
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'enabled'}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <Checkbox
                  id="enabled"
                  checked={field.value}
                  disabled={isBusy}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
              </FormControl>
              <FormLabel htmlFor="enabled">Enabled</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'imageId'}
          render={() => (
            <FormItem>
              <FormLabel htmlFor="image">Product image</FormLabel>
              <FormControl>
                <Input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={isBusy}
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </FormControl>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <FormMessage />
              {previewUrl && (
                <div className="mt-2">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={480}
                    height={360}
                    className="rounded border"
                  />
                </div>
              )}
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isBusy}>
          {saving ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
