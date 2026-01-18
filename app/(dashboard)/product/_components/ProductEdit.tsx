'use client';

import {
  ComboboxField,
  ComboboxOption,
  ImageField,
  NumberField,
  SwitchField,
  TextField,
  TextareaField,
} from '@/components/form-fields';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { DraftFormAdapter, useImageUpload } from '@/hooks/useImageUpload';
import { problemToDescription } from '@/lib/utils/toast-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AttributeResponse,
  CategoryResponse,
  ProductAttributeInput,
  ProductResponse,
} from '@sokol111/ecommerce-catalog-service-api';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { ProductFormData, productSchema } from '../_schemas/product.schema';
import { createProductAction, updateProductAction } from '../actions';
import ProductAttributes from './ProductAttributes';

export type { ProductFormData } from '../_schemas/product.schema';

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
              optionSlugValue: attr.optionSlugValue,
              optionSlugValues: attr.optionSlugValues,
              numericValue: attr.numericValue,
              textValue: attr.textValue,
              booleanValue: attr.booleanValue,
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

  // Category options for combobox
  const categoryOptions: ComboboxOption[] = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: c.enabled ? c.name : `${c.name} (disabled)`,
        disabled: !c.enabled,
      })),
    [categories]
  );

  // Watch categoryId to get category attributes
  const watchedCategoryId = form.watch('categoryId');
  const selectedCategory = categories.find((c) => c.id === watchedCategoryId);
  const categoryAttributes = selectedCategory?.attributes ?? [];

  // Image upload hook
  const imageUploadForm: DraftFormAdapter = {
    getValues: () => ({
      ownerId: form.getValues().id,
      imageId: form.getValues().imageId ?? undefined,
    }),
    setValue: (name, value) => form.setValue(name, value),
  };
  const {
    previewUrl,
    error: imageError,
    imageUploading,
    handleFileChange,
  } = useImageUpload(imageUploadForm);

  const isBusy = imageUploading || saving;

  async function onSubmit(value: ProductFormData) {
    setSaving(true);
    try {
      value.price = Number(value.price.toFixed(2));

      const attributes: ProductAttributeInput[] | undefined =
        value.attributes && value.attributes.length > 0
          ? value.attributes
              .filter(
                (attr) =>
                  attr.optionSlugValue !== undefined ||
                  (attr.optionSlugValues && attr.optionSlugValues.length > 0) ||
                  attr.numericValue !== undefined ||
                  attr.textValue !== undefined ||
                  attr.booleanValue !== undefined
              )
              .map((attr) => ({
                attributeId: attr.attributeId,
                optionSlugValue: attr.optionSlugValue,
                optionSlugValues:
                  attr.optionSlugValues && attr.optionSlugValues.length > 0
                    ? attr.optionSlugValues
                    : undefined,
                numericValue: attr.numericValue,
                textValue: attr.textValue,
                booleanValue: attr.booleanValue,
              }))
          : undefined;

      const payload = {
        id: value.id,
        name: value.name,
        description: value.description,
        price: value.price,
        quantity: value.quantity,
        enabled: value.enabled,
        imageId: value.imageId ?? undefined,
        categoryId: value.categoryId ?? undefined,
        attributes,
      };

      const result = isEditMode
        ? await updateProductAction({ ...payload, version: value.version })
        : await createProductAction(payload);

      if (!result.success) {
        const { error } = result;
        if (error.fields) {
          Object.entries(error.fields).forEach(([field, message]) => {
            const validFields = [
              'id',
              'version',
              'imageId',
              'categoryId',
              'name',
              'description',
              'price',
              'quantity',
              'enabled',
            ] as const;
            if (validFields.includes(field as (typeof validFields)[number])) {
              form.setError(field as (typeof validFields)[number], { message });
            }
          });
        }
        toast.error(error.title, { description: problemToDescription(error) });
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
        aria-busy={isBusy || undefined}
      >
        <input type="hidden" {...form.register('id')} />
        <input type="hidden" {...form.register('version')} />

        <TextField control={form.control} name="name" label="Product name" disabled={isBusy} />
        <TextareaField
          control={form.control}
          name="description"
          label="Description"
          placeholder="Enter product description (optional)"
          maxLength={2000}
          disabled={isBusy}
        />
        <NumberField
          control={form.control}
          name="price"
          label="Product price"
          min={0}
          step={0.01}
          disabled={isBusy}
        />
        <NumberField
          control={form.control}
          name="quantity"
          label="Product quantity"
          min={0}
          step={1}
          disabled={isBusy}
        />
        <SwitchField control={form.control} name="enabled" label="Enabled" disabled={isBusy} />
        <ComboboxField
          control={form.control}
          name="categoryId"
          label="Category"
          options={categoryOptions}
          placeholder="Select category..."
          searchPlaceholder="Search category..."
          emptyMessage="No category found."
          disabled={isBusy}
        />
        <ImageField
          control={form.control}
          name="imageId"
          label="Product image"
          disabled={isBusy}
          previewUrl={previewUrl ?? undefined}
          error={imageError ?? undefined}
          originalImageId={product?.imageId}
          onFileChange={handleFileChange}
        />

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
