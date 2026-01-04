import { z } from 'zod';

export const ATTRIBUTE_TYPES = [
  { value: 'single', label: 'Single (one choice)' },
  { value: 'multiple', label: 'Multiple (many choices)' },
  { value: 'range', label: 'Range (numeric)' },
  { value: 'boolean', label: 'Boolean (yes/no)' },
  { value: 'text', label: 'Text (free input)' },
] as const;

export const attributeOptionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  colorCode: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color code')
    .optional()
    .or(z.literal('')),
  sortOrder: z.number().int().min(0).max(10000).optional(),
  enabled: z.boolean(),
});

export const attributeSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().min(0),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .transform((s) => s.trim()),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  type: z.enum(['single', 'multiple', 'range', 'boolean', 'text']),
  unit: z.string().max(20, 'Unit must be at most 20 characters').optional(),
  enabled: z.boolean(),
  options: z.array(attributeOptionSchema).optional(),
});

export type AttributeFormData = z.infer<typeof attributeSchema>;
export type AttributeOptionFormData = z.infer<typeof attributeOptionSchema>;

// Helper to generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
