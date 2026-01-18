'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AttributeResponse, CategoryAttribute } from '@sokol111/ecommerce-catalog-service-api';
import { Info, Trash2 } from 'lucide-react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { AttributeInput } from './AttributeInput';

interface AttributeRowProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  fieldName: Path<TFieldValues>;
  fieldId: string;
  attributeDef: AttributeResponse;
  categoryAttr?: CategoryAttribute;
  required: boolean;
  disabled?: boolean;
  onRemove: () => void;
}

export function AttributeRow<TFieldValues extends FieldValues = FieldValues>({
  control,
  fieldName,
  fieldId,
  attributeDef,
  categoryAttr,
  required,
  disabled,
  onRemove,
}: AttributeRowProps<TFieldValues>) {
  if (!attributeDef) {
    return (
      <div key={fieldId} className="text-sm text-muted-foreground">
        Unknown attribute: {fieldId}
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <FormLabel className="text-sm font-medium">
            {attributeDef.name}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <Badge variant="outline" className="text-xs">
            {attributeDef.type}
          </Badge>
          {categoryAttr?.role === 'variant' && (
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
              {categoryAttr && (
                <>
                  <p>
                    <strong>Role:</strong> {categoryAttr.role}
                  </p>
                  <p>
                    <strong>Required:</strong> {categoryAttr.required ? 'Yes' : 'No'}
                  </p>
                </>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
        <AttributeInput
          control={control}
          fieldName={fieldName}
          attributeDef={attributeDef}
          disabled={disabled}
        />
      </div>
      {!required && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
