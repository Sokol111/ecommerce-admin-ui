import { ActionError } from '@/lib/types/action-result';
import React from 'react';

/**
 * Converts ActionError to a React element for use in toast descriptions.
 * Combines error detail and field-level validation errors into a structured display.
 */
export function actionErrorToDescription(error: ActionError): React.ReactNode {
  const hasDetail = !!error.detail;
  const hasFields = error.fields && Object.keys(error.fields).length > 0;

  // If no additional information, return simple message
  if (!hasDetail && !hasFields) {
    return 'Please check the form and try again';
  }

  // If only detail exists, return it as string
  if (hasDetail && !hasFields) {
    return error.detail;
  }

  // If only fields exist, format them
  if (!hasDetail && hasFields) {
    return (
      <div className="space-y-1">
        {Object.entries(error.fields!).map(([field, message]) => (
          <div key={field} className="text-sm">
            <span className="font-medium">{field}:</span> {message}
          </div>
        ))}
      </div>
    );
  }

  // Both detail and fields exist - combine them
  return (
    <div className="space-y-2">
      <div>{error.detail}</div>
      <div className="space-y-1 border-t border-border pt-2">
        {Object.entries(error.fields!).map(([field, message]) => (
          <div key={field} className="text-sm">
            <span className="font-medium">{field}:</span> {message}
          </div>
        ))}
      </div>
      {(error.code || error.status || error.traceId) && (
        <div className="text-xs text-muted-foreground border-t border-border pt-2 space-y-0.5">
          {error.code && <div>Code: {error.code}</div>}
          {error.status && <div>Status: {error.status}</div>}
          {error.traceId && <div>Trace ID: {error.traceId}</div>}
        </div>
      )}
    </div>
  );
}
