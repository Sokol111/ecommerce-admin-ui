'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DraftFormAdapter, useImageUpload } from '@/hooks/useImageUpload';
import { createProductAction, updateProductAction } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { problemToDescription } from '@/lib/utils/toast-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import { AttributeResponse } from '@sokol111/ecommerce-attribute-service-api';
import { CategoryResponse } from '@sokol111/ecommerce-category-service-api';
import { ProductAttributeInput, ProductResponse } from '@sokol111/ecommerce-product-service-api';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import ProductAttributes from './ProductAttributes';

// Schema for product attribute
const productAttributeSchema = z.object({
  attributeId: z.string().uuid(),
  value: z.string().optional(),
  values: z.array(z.string()).optional(),
  numericValue: z.number().optional(),
});

// Schema for create mode
const productSchema = z
  .object({
    id: z.uuid(),
    version: z.number().int().min(0, 'Version is required'),
    imageId: z.uuid().nullish(),
    categoryId: z.uuid().nullish(),
    name: z
      .string()
      .min(2, 'Product name must be at least 2 characters')
      .max(50, 'Product name must be at most 50 characters')
      .regex(/^[A-Za-z0-9 _-]+$/, 'Only letters, numbers, space, underscore and dash allowed')
      .transform((s) => s.trim()),
    description: z
      .string()
      .max(2000, 'Description must be at most 2000 characters')
      .transform((s) => s?.trim() || undefined)
      .optional(),
    price: z
      .number()
      .min(0, 'Price must be >= 0')
      .max(1_000_000, 'Price is too large')
      .refine((n) => /^\d+(\.\d{1,2})?$/.test(String(n)), 'Price must have up to 2 decimals'),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(0, 'Quantity must be >= 0')
      .max(1_000_000, 'Quantity is too large'),
    enabled: z.boolean(),
    attributes: z.array(productAttributeSchema).optional(),
  })
  .refine((data) => !(data.enabled && !data.imageId), {
    message: 'Enabled products must have an image',
    path: ['imageId'],
  })
  .refine((data) => !(data.enabled && !data.categoryId), {
    message: 'Enabled products must have a category',
    path: ['categoryId'],
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

interface ProductEditProps {
  product?: ProductResponse;
  categories: CategoryResponse[];
  availableAttributes: AttributeResponse[];
}

export default function ProductEdit({
  product,
  categories,
  availableAttributes,
}: ProductEditProps) {
  const router = useRouter();
  const isEditMode = !!product;

  const [saving, setSaving] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: isEditMode
      ? {
          id: product.id,
          version: product.version,
          imageId: product.imageId,
          categoryId: product.categoryId,
          name: product.name,
          description: product.description,
          price: product.price,
          quantity: product.quantity,
          enabled: product.enabled,
          attributes:
            product.attributes?.map((attr) => ({
              attributeId: attr.attributeId,
              value: attr.value,
              values: attr.values,
              numericValue: attr.numericValue,
            })) ?? [],
        }
      : {
          id: uuidv4(),
          version: 0,
          imageId: undefined,
          categoryId: undefined,
          name: '',
          description: undefined,
          price: 0,
          quantity: 0,
          enabled: false,
          attributes: [],
        },
  });

  // Watch categoryId to get category attributes
  const watchedCategoryId = form.watch('categoryId');
  const selectedCategory = categories.find((c) => c.id === watchedCategoryId);
  const categoryAttributes = selectedCategory?.attributes ?? [];

  // Create a narrowed subset of the form for image upload (only draftId & imageId needed)
  const imageUploadForm: DraftFormAdapter = {
    getValues: () => ({
      ownerId: form.getValues().id,
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

      // Prepare attributes for API - filter out empty values
      const attributes: ProductAttributeInput[] | undefined =
        value.attributes && value.attributes.length > 0
          ? value.attributes
              .filter(
                (attr) =>
                  attr.value !== undefined ||
                  (attr.values && attr.values.length > 0) ||
                  attr.numericValue !== undefined
              )
              .map((attr) => ({
                attributeId: attr.attributeId,
                value: attr.value,
                values: attr.values && attr.values.length > 0 ? attr.values : undefined,
                numericValue: attr.numericValue,
              }))
          : undefined;

      let result;
      if (isEditMode) {
        result = await updateProductAction({
          id: value.id,
          version: value.version,
          name: value.name,
          description: value.description,
          price: value.price,
          quantity: value.quantity,
          enabled: value.enabled,
          imageId: value.imageId ?? undefined,
          categoryId: value.categoryId ?? undefined,
          attributes,
        });
      } else {
        result = await createProductAction({
          id: value.id,
          name: value.name,
          description: value.description,
          price: value.price,
          quantity: value.quantity,
          enabled: value.enabled,
          imageId: value.imageId ?? undefined,
          categoryId: value.categoryId ?? undefined,
          attributes,
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
              field === 'categoryId' ||
              field === 'name' ||
              field === 'description' ||
              field === 'price' ||
              field === 'quantity' ||
              field === 'enabled'
            ) {
              form.setError(field, { message });
            }
          });
        }

        toast.error(error.title, {
          description: problemToDescription(error),
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
          name={'description'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description (optional)"
                  maxLength={2000}
                  disabled={isBusy}
                  className="resize-y min-h-[100px]"
                  {...field}
                  value={field.value ?? ''}
                />
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
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                <Switch
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
          name={'categoryId'}
          render={({ field }) => {
            const selectedCategory = categories.find((c) => c.id === field.value);
            return (
              <FormItem className="flex flex-col">
                <FormLabel>Category</FormLabel>
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={categoryOpen}
                        disabled={isBusy}
                        className={cn(
                          'w-[300px] justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {selectedCategory ? (
                          <span
                            className={!selectedCategory.enabled ? 'text-muted-foreground' : ''}
                          >
                            {selectedCategory.name}
                            {!selectedCategory.enabled && ' (disabled)'}
                          </span>
                        ) : (
                          'Select category...'
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search category..." />
                      <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category.id}
                              value={category.name}
                              onSelect={() => {
                                field.onChange(category.id === field.value ? null : category.id);
                                setCategoryOpen(false);
                              }}
                              className={!category.enabled ? 'text-muted-foreground' : ''}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === category.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {category.name}
                              {!category.enabled && ' (disabled)'}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name={'imageId'}
          render={({ field }) => {
            const hasImage = !!field.value;
            const isOriginalImage = field.value === product?.imageId;
            const fileName = !field.value
              ? 'No file chosen'
              : isOriginalImage
                ? `Current image: ${field.value}`
                : 'New image selected';

            return (
              <FormItem>
                <FormLabel htmlFor="image">Product image</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Button type="button" asChild>
                      <label htmlFor="image" className="cursor-pointer">
                        {hasImage ? 'Replace Image' : 'Choose File'}
                      </label>
                    </Button>
                    <span className="text-sm text-muted-foreground">{fileName}</span>
                    <Input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      disabled={isBusy}
                      onChange={(e) => handleFileChange(e.target.files)}
                      className="hidden"
                    />
                  </div>
                </FormControl>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <FormMessage />
                {previewUrl && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview"
                      width={480}
                      height={360}
                      className="rounded border"
                    />
                  </div>
                )}
              </FormItem>
            );
          }}
        />

        {/* Product Attributes */}
        <ProductAttributes
          control={form.control}
          watch={form.watch}
          categoryAttributes={categoryAttributes}
          availableAttributes={availableAttributes}
          disabled={isBusy}
        />

        <Button type="submit" disabled={isBusy}>
          {saving ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
