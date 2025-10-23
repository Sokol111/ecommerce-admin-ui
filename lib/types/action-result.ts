import { ValidationError } from './problem';

/**
 * Error codes for categorizing different types of failures
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'UNKNOWN_ERROR';

/**
 * Structured error information with RFC 7807 compatibility
 */
export interface ActionError {
  /**
   * Human-readable error title
   */
  title: string;

  /**
   * Detailed error description (optional)
   */
  detail?: string;

  /**
   * Error category code
   */
  code: ErrorCode;

  /**
   * HTTP status code (if from API)
   */
  status?: number;

  /**
   * Field-level validation errors
   */
  fields?: Record<string, string>;

  /**
   * Trace ID for debugging
   */
  traceId?: string;
}

/**
 * Success result with data
 */
export interface ActionSuccess<T = void> {
  success: true;
  data: T;
}

/**
 * Failure result with structured error
 */
export interface ActionFailure {
  success: false;
  error: ActionError;
}

/**
 * Combined result type for server actions
 */
export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure;

/**
 * Helper to create a success result
 */
export function successResult<T>(data: T): ActionSuccess<T> {
  return { success: true, data };
}

/**
 * Helper to create a failure result
 */
export function failureResult(error: ActionError): ActionFailure {
  return { success: false, error };
}

/**
 * Helper to create a simple error result
 */
export function simpleError(title: string, code: ErrorCode = 'UNKNOWN_ERROR'): ActionFailure {
  return failureResult({ title, code });
}

/**
 * Convert validation errors array to fields object
 */
export function validationErrorsToFields(errors: ValidationError[]): Record<string, string> {
  return errors.reduce(
    (acc, err) => {
      if (err.field) {
        acc[err.field] = err.message;
      }
      return acc;
    },
    {} as Record<string, string>
  );
}
