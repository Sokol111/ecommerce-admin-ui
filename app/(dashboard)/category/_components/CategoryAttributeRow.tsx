'use client';

import { NumberField, SelectField, SwitchField } from '@/components/form-fields';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AttributeResponse } from '@sokol111/ecommerce-catalog-service-api';
import { Info, Trash2 } from 'lucide-react';
import { Control } from 'react-hook-form';
import { CategoryFormData } from '../_schemas/category.schema';

interface CategoryAttributeRowProps {
  control: Control<CategoryFormData>;
  index: number;
  fieldId: string;
  selectableAttributes: AttributeResponse[];
  currentAttributeId?: string;
  currentRole?: string;
  disabled?: boolean;
  onRemove: () => void;
  getAttributeType: (id: string) => string | undefined;
}

export function CategoryAttributeRow({
  control,
  index,
  fieldId,
  selectableAttributes,
  currentAttributeId,
  currentRole,
  disabled,
  onRemove,
  getAttributeType,
}: CategoryAttributeRowProps) {
  // Validate attribute type + role combination
  const getRoleWarning = (): string | null => {
    if (!currentAttributeId || currentRole !== 'variant') return null;
    const attrType = getAttributeType(currentAttributeId);
    if (!attrType) return null;

    if (attrType !== 'single') {
      return `"${attrType}" type is not compatible with "variant" role. Only "single" type can be used for variants (e.g., Color, Size).`;
    }
    return null;
  };

  const roleWarning = getRoleWarning();

  const attributeOptions = selectableAttributes.map((attr) => ({
    value: attr.id,
    label: `${attr.name} (${attr.type})`,
  }));

  const roleOptions = [
    { value: 'variant', label: 'Variant (buyer chooses)' },
    { value: 'specification', label: 'Specification (product info)' },
  ];

  return (
    <div key={fieldId} className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            control={control}
            name={`attributes.${index}.attributeId`}
            label="Attribute"
            options={attributeOptions}
            placeholder="Select an attribute"
            disabled={disabled}
          />

          <NumberField
            control={control}
            name={`attributes.${index}.sortOrder`}
            label={
              <span className="flex items-center gap-1">
                Sort Order
                <TooltipInfo>
                  Defines the display order of this attribute. Lower values appear first.
                </TooltipInfo>
              </span>
            }
            min={0}
            max={10000}
            disabled={disabled}
          />

          <div className="space-y-2">
            <SelectField
              control={control}
              name={`attributes.${index}.role`}
              label={
                <span className="flex items-center gap-1">
                  Role
                  <TooltipInfo>
                    <p>
                      <strong>Variant:</strong> Buyer can select (e.g., Color, Size). Creates
                      product variants.
                    </p>
                    <p className="mt-1">
                      <strong>Specification:</strong> Informational only (e.g., Processor, Weight).
                    </p>
                  </TooltipInfo>
                </span>
              }
              options={roleOptions}
              placeholder="Select role"
              disabled={disabled}
            />
            {roleWarning && (
              <p className="text-sm text-yellow-600 dark:text-yellow-500">⚠️ {roleWarning}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <SwitchFieldWithTooltip
            control={control}
            name={`attributes.${index}.required`}
            label="Required"
            tooltip="If enabled, this attribute must be filled when creating a product in this category."
            disabled={disabled}
          />

          <SwitchFieldWithTooltip
            control={control}
            name={`attributes.${index}.filterable`}
            label="Filterable"
            tooltip="If enabled, customers can filter products by this attribute on the category page sidebar."
            disabled={disabled}
          />

          <SwitchFieldWithTooltip
            control={control}
            name={`attributes.${index}.searchable`}
            label="Searchable"
            tooltip="If enabled, this attribute's values will be included in the search index for full-text product search."
            disabled={disabled}
          />
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mt-8 text-destructive hover:text-destructive"
        onClick={onRemove}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Helper component for tooltip info icon
function TooltipInfo({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger type="button">
        <Info className="h-3.5 w-3.5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{children}</TooltipContent>
    </Tooltip>
  );
}

// Switch field with inline tooltip
interface SwitchFieldWithTooltipProps {
  control: Control<CategoryFormData>;
  name:
    | `attributes.${number}.required`
    | `attributes.${number}.filterable`
    | `attributes.${number}.searchable`;
  label: string;
  tooltip: string;
  disabled?: boolean;
}

function SwitchFieldWithTooltip({
  control,
  name,
  label,
  tooltip,
  disabled,
}: SwitchFieldWithTooltipProps) {
  return (
    <SwitchField
      control={control}
      name={name}
      label={
        <span className="flex items-center gap-1">
          {label}
          <TooltipInfo>{tooltip}</TooltipInfo>
        </span>
      }
      disabled={disabled}
    />
  );
}
