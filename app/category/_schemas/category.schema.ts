import { z } from 'zod';

// Schema for category attribute
export const categoryAttributeSchema = z.object({
  attributeId: z.string().uuid('Please select an attribute'),
  role: z.enum(['variant', 'specification'], { message: 'Please select role' }),
  required: z.boolean(),
  sortOrder: z.number().int().min(0).max(10000),
  filterable: z.boolean(),
  searchable: z.boolean(),
  enabled: z.boolean(),
});

// Schema for category form
export const categorySchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().min(0, 'Version is required'),
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be at most 50 characters')
    .regex(/^[A-Za-z0-9 _-]+$/, 'Only letters, numbers, space, underscore and dash allowed')
    .transform((s) => s.trim()),
  enabled: z.boolean(),
  attributes: z.array(categoryAttributeSchema),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
export type CategoryAttributeFormData = z.infer<typeof categoryAttributeSchema>;
