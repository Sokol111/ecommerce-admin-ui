'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AttributeResponse } from '@sokol111/ecommerce-attribute-service-api';
import { CategoryAttribute } from '@sokol111/ecommerce-category-service-api';
import { Info, Trash2 } from 'lucide-react';
import { Control, useFieldArray, UseFormWatch } from 'react-hook-form';
import { ProductFormData } from './ProductEdit';

interface ProductAttributesProps {
  control: Control<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  categoryAttributes: CategoryAttribute[];
  availableAttributes: AttributeResponse[];
  disabled?: boolean;
}

export default function ProductAttributes({
  control,
  watch,
  categoryAttributes,
  availableAttributes,
  disabled = false,
}: ProductAttributesProps) {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'attributes',
  });

  const watchedAttributes = watch('attributes');

  // Get attribute definition by ID
  const getAttributeDef = (attributeId: string): AttributeResponse | undefined => {
    return availableAttributes.find((a) => a.id === attributeId);
  };

  // Get category attribute config by ID
  const getCategoryAttr = (attributeId: string): CategoryAttribute | undefined => {
    return categoryAttributes.find((a) => a.attributeId === attributeId);
  };

  // Check if attribute is required for the category
  const isRequired = (attributeId: string): boolean => {
    const catAttr = getCategoryAttr(attributeId);
    return catAttr?.required ?? false;
  };

  // Sync product attributes with category attributes when category changes
  const syncWithCategory = () => {
    const currentAttrs = watchedAttributes ?? [];
    const currentAttrIds = new Set(currentAttrs.map((a) => a.attributeId));

    // Keep existing values for attributes that are still in category
    const keptAttrs = currentAttrs.filter((attr) =>
      categoryAttributes.some((ca) => ca.attributeId === attr.attributeId)
    );

    // Add new attributes from category that don't exist yet
    const newAttrs = categoryAttributes
      .filter((ca) => ca.enabled && !currentAttrIds.has(ca.attributeId))
      .map((ca) => ({
        attributeId: ca.attributeId,
        value: undefined,
        values: undefined,
        numericValue: undefined,
      }));

    replace([...keptAttrs, ...newAttrs]);
  };

  // Add an attribute manually
  const addAttribute = (attributeId: string) => {
    append({
      attributeId,
      value: undefined,
      values: undefined,
      numericValue: undefined,
    });
  };

  // Get available attributes that aren't already added
  const getAvailableToAdd = () => {
    const usedIds = new Set(watchedAttributes?.map((a) => a.attributeId) ?? []);
    return categoryAttributes
      .filter((ca) => ca.enabled && !usedIds.has(ca.attributeId))
      .map((ca) => getAttributeDef(ca.attributeId))
      .filter((a): a is AttributeResponse => !!a);
  };

  // Render input based on attribute type
  const renderAttributeInput = (index: number, attributeDef: AttributeResponse) => {
    const fieldName = `attributes.${index}` as const;

    switch (attributeDef.type) {
      case 'single':
        return (
          <FormField
            control={control}
            name={`${fieldName}.value`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select value..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {attributeDef.options
                      ?.filter((opt) => opt.enabled)
                      .map((opt) => (
                        <SelectItem key={opt.slug} value={opt.value}>
                          {opt.colorCode && (
                            <span
                              className="inline-block w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: opt.colorCode }}
                            />
                          )}
                          {opt.value}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'multiple':
        return (
          <FormField
            control={control}
            name={`${fieldName}.values`}
            render={({ field }) => {
              const selectedValues = field.value ?? [];
              return (
                <FormItem className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {attributeDef.options
                      ?.filter((opt) => opt.enabled)
                      .map((opt) => {
                        const isChecked = selectedValues.includes(opt.value);
                        return (
                          <label
                            key={opt.slug}
                            className="flex items-center gap-1.5 cursor-pointer"
                          >
                            <Checkbox
                              checked={isChecked}
                              disabled={disabled}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...selectedValues, opt.value]);
                                } else {
                                  field.onChange(selectedValues.filter((v) => v !== opt.value));
                                }
                              }}
                            />
                            {opt.colorCode && (
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: opt.colorCode }}
                              />
                            )}
                            <span className="text-sm">{opt.value}</span>
                          </label>
                        );
                      })}
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        );

      case 'range':
        return (
          <FormField
            control={control}
            name={`${fieldName}.numericValue`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      disabled={disabled}
                      placeholder="Enter value..."
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === '' ? undefined : parseFloat(val));
                      }}
                    />
                  </FormControl>
                  {attributeDef.unit && (
                    <span className="text-sm text-muted-foreground">{attributeDef.unit}</span>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'boolean':
        return (
          <FormField
            control={control}
            name={`${fieldName}.value`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'text':
        return (
          <FormField
            control={control}
            name={`${fieldName}.value`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="text"
                    disabled={disabled}
                    placeholder="Enter text..."
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  const availableToAdd = getAvailableToAdd();

  if (categoryAttributes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            Attributes
            <Badge variant="secondary" className="ml-2">
              0
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            Select a category to see available attributes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Attributes
          <Badge variant="secondary" className="ml-2">
            {fields.length}
          </Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={syncWithCategory}
            disabled={disabled}
          >
            Sync with Category
          </Button>
          {availableToAdd.length > 0 && (
            <Select onValueChange={addAttribute} disabled={disabled}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Add attribute..." />
              </SelectTrigger>
              <SelectContent>
                {availableToAdd.map((attr) => (
                  <SelectItem key={attr.id} value={attr.id}>
                    {attr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No attributes set. Click &quot;Sync with Category&quot; to add category attributes.
          </p>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => {
              const attributeDef = getAttributeDef(field.attributeId);
              const catAttr = getCategoryAttr(field.attributeId);

              if (!attributeDef) {
                return (
                  <div key={field.id} className="text-sm text-muted-foreground">
                    Unknown attribute: {field.attributeId}
                  </div>
                );
              }

              const required = isRequired(field.attributeId);

              return (
                <div
                  key={field.id}
                  className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-sm font-medium">
                        {attributeDef.name}
                        {required && <span className="text-destructive ml-1">*</span>}
                      </FormLabel>
                      <Badge variant="outline" className="text-xs">
                        {attributeDef.type}
                      </Badge>
                      {catAttr?.role === 'variant' && (
                        <Badge variant="secondary" className="text-xs">
                          variant
                        </Badge>
                      )}
                      <Tooltip>
                        <TooltipTrigger type="button">
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            <strong>Type:</strong> {attributeDef.type}
                          </p>
                          {catAttr && (
                            <>
                              <p>
                                <strong>Role:</strong> {catAttr.role}
                              </p>
                              <p>
                                <strong>Required:</strong> {catAttr.required ? 'Yes' : 'No'}
                              </p>
                            </>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {renderAttributeInput(index, attributeDef)}
                  </div>
                  {!required && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={disabled}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
