import { z } from 'zod';

// Schema for product attribute
export const productAttributeSchema = z.object({
  attributeId: z.string().uuid(),
  optionSlugValue: z.string().optional(),
  optionSlugValues: z.array(z.string()).optional(),
  numericValue: z.number().optional(),
  textValue: z.string().optional(),
  booleanValue: z.boolean().optional(),
});

// Schema for product form
export const productSchema = z
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
export type ProductAttributeFormData = z.infer<typeof productAttributeSchema>;
