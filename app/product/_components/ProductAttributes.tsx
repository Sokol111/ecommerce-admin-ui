'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AttributeResponse } from '@sokol111/ecommerce-attribute-service-api';
import { CategoryAttribute } from '@sokol111/ecommerce-category-service-api';
import { Control, useFieldArray, UseFormWatch } from 'react-hook-form';
import { ProductFormData } from '../_schemas/product.schema';
import { AttributeRow } from './AttributeRow';

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

  const getAttributeDef = (attributeId: string) =>
    availableAttributes.find((a) => a.id === attributeId);

  const getCategoryAttr = (attributeId: string) =>
    categoryAttributes.find((a) => a.attributeId === attributeId);

  const isRequired = (attributeId: string) => getCategoryAttr(attributeId)?.required ?? false;

  const syncWithCategory = () => {
    const currentAttrs = watchedAttributes ?? [];
    const currentAttrIds = new Set(currentAttrs.map((a) => a.attributeId));

    const keptAttrs = currentAttrs.filter((attr) =>
      categoryAttributes.some((ca) => ca.attributeId === attr.attributeId)
    );

    const newAttrs = categoryAttributes
      .filter((ca) => ca.enabled && !currentAttrIds.has(ca.attributeId))
      .map((ca) => ({
        attributeId: ca.attributeId,
        optionSlug: undefined,
        optionSlugs: undefined,
        numericValue: undefined,
        textValue: undefined,
        booleanValue: undefined,
      }));

    replace([...keptAttrs, ...newAttrs]);
  };

  const addAttribute = (attributeId: string) => {
    append({
      attributeId,
      optionSlug: undefined,
      optionSlugs: undefined,
      numericValue: undefined,
      textValue: undefined,
      booleanValue: undefined,
    });
  };

  const availableToAdd = (() => {
    const usedIds = new Set(watchedAttributes?.map((a) => a.attributeId) ?? []);
    return categoryAttributes
      .filter((ca) => ca.enabled && !usedIds.has(ca.attributeId))
      .map((ca) => getAttributeDef(ca.attributeId))
      .filter((a): a is AttributeResponse => !!a);
  })();

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
              if (!attributeDef) {
                return (
                  <div key={field.id} className="text-sm text-muted-foreground">
                    Unknown attribute: {field.attributeId}
                  </div>
                );
              }

              return (
                <AttributeRow
                  key={field.id}
                  control={control}
                  fieldName={`attributes.${index}`}
                  fieldId={field.attributeId}
                  attributeDef={attributeDef}
                  categoryAttr={getCategoryAttr(field.attributeId)}
                  required={isRequired(field.attributeId)}
                  disabled={disabled}
                  onRemove={() => remove(index)}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
