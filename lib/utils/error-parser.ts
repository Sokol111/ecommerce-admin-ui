import { ActionError, ErrorCode, validationErrorsToFields } from '@/lib/types/action-result';
import { isProblem, Problem } from '@/lib/types/problem';
import { z } from 'zod';

/**
 * Map HTTP status codes to error codes
 */
function statusToErrorCode(status: number): ErrorCode {
  if (status >= 400 && status < 500) {
    switch (status) {
      case 400:
        return 'VALIDATION_ERROR';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
  if (status >= 500) {
    return 'SERVER_ERROR';
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Parse RFC 7807 Problem Details into ActionError
 */
export function parseProblem(problem: Problem): ActionError {
  const code = statusToErrorCode(problem.status);

  const fields = problem.errors ? validationErrorsToFields(problem.errors) : undefined;

  return {
    title: problem.title,
    detail: problem.detail,
    code,
    status: problem.status,
    fields,
    traceId: problem.traceId,
  };
}

/**
 * Parse Zod validation error into ActionError
 */
export function parseZodError(error: z.ZodError): ActionError {
  const fields: Record<string, string> = {};

  error.errors.forEach((err) => {
    const field = err.path.join('.');
    fields[field] = err.message;
  });

  return {
    title: 'Validation failed',
    detail: 'Please check the form fields and try again',
    code: 'VALIDATION_ERROR',
    status: 400,
    fields,
  };
}

/**
 * Parse any error into ActionError
 */
export function parseError(
  error: unknown,
  fallbackTitle: string = 'An error occurred'
): ActionError {
  // RFC 7807 Problem
  if (isProblem(error)) {
    return parseProblem(error);
  }

  // Zod validation error
  if (error instanceof z.ZodError) {
    return parseZodError(error);
  }

  // Network/fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      title: 'Network error',
      detail: 'Unable to connect to the server. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  }

  // Generic Error object
  if (error instanceof Error) {
    return {
      title: fallbackTitle,
      detail: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  // String error
  if (typeof error === 'string') {
    return {
      title: fallbackTitle,
      detail: error,
      code: 'UNKNOWN_ERROR',
    };
  }

  // Unknown error type
  return {
    title: fallbackTitle,
    detail: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Check if an error response body is a Problem
 */
export async function tryParseProblemFromResponse(response: Response): Promise<Problem | null> {
  const contentType = response.headers.get('content-type');

  if (
    !contentType?.includes('application/problem+json') &&
    !contentType?.includes('application/json')
  ) {
    return null;
  }

  try {
    const body = await response.json();
    if (isProblem(body)) {
      return body;
    }
  } catch {
    // Failed to parse JSON
  }

  return null;
}
