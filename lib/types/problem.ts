/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
 *
 * This is the single error type used throughout the application.
 * Matches the backend API error response format.
 */

import axios from 'axios';
import { z } from 'zod';

export interface ValidationError {
  field?: string;
  message: string;
}

export interface Problem {
  /**
   * A URI reference that identifies the problem type.
   * Default: "about:blank"
   */
  type?: string;

  /**
   * A short, human-readable summary of the problem type.
   */
  title: string;

  /**
   * The HTTP status code.
   */
  status: number;

  /**
   * A human-readable explanation specific to this occurrence.
   */
  detail?: string;

  /**
   * A URI reference that identifies the specific occurrence.
   */
  instance?: string;

  /**
   * Trace ID for debugging and correlation.
   */
  traceId?: string;

  /**
   * Field-level validation errors (from API).
   */
  errors?: ValidationError[];

  /**
   * Field-level validation errors as a map (computed for form integration).
   */
  fields?: Record<string, string>;
}

/**
 * Type guard to check if an error is a Problem object
 */
function isProblem(error: unknown): error is Problem {
  if (typeof error !== 'object' || error === null) return false;
  const p = error as Problem;
  return typeof p.title === 'string' && typeof p.status === 'number';
}

/**
 * Convert validation errors array to fields map
 */
function errorsToFields(errors?: ValidationError[]): Record<string, string> | undefined {
  if (!errors || errors.length === 0) return undefined;

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

/**
 * Log error details in development mode (server-side only)
 */
function logErrorInDev(context: string, error: unknown, extra?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== 'development') return;

  console.error(`\n[toProblem] ${context}`);
  console.error('─'.repeat(50));

  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      console.error(`${key}:`, value);
    });
  }

  if (axios.isAxiosError(error)) {
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method?.toUpperCase());
    console.error('Request BaseURL:', error.config?.baseURL);
    console.error('Request Data:', error.config?.data);
    console.error('Response Status:', error.response?.status);
    console.error('Response Data:', error.response?.data);
    console.error('Error Code:', error.code);
  }

  console.error('Full Error:', error);
  console.error('─'.repeat(50) + '\n');
}

/**
 * Convert any error into a Problem object.
 */
export function toProblem(error: unknown, fallbackTitle: string = 'An error occurred'): Problem {
  // Log once at the start in development mode
  logErrorInDev(fallbackTitle, error);

  // Already a Problem
  if (isProblem(error)) {
    return {
      ...error,
      fields: error.fields ?? errorsToFields(error.errors),
    };
  }

  // Axios error with Problem in response
  if (axios.isAxiosError(error) && isProblem(error.response?.data)) {
    const data = error.response.data;
    return {
      ...data,
      fields: data.fields ?? errorsToFields(data.errors),
    };
  }

  // Axios error WITHOUT Problem in response (e.g., 500 from proxy, network issues)
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const method = error.config?.method?.toUpperCase() ?? 'UNKNOWN';
    const url = error.config?.baseURL
      ? `${error.config.baseURL}${error.config.url}`
      : (error.config?.url ?? 'unknown');

    // Network error (no response at all)
    if (!error.response) {
      return {
        title: 'Network error',
        status: 0,
        detail: `Unable to connect to the server (${method} ${url}). ${error.message}`,
      };
    }

    // Server returned non-Problem response
    const responseData = error.response.data;
    let detail = error.message;

    // Try to extract useful info from response
    if (typeof responseData === 'string' && responseData.length > 0 && responseData.length < 500) {
      detail = responseData;
    } else if (typeof responseData === 'object' && responseData !== null) {
      const msg =
        (responseData as Record<string, unknown>).message ??
        (responseData as Record<string, unknown>).error;
      if (typeof msg === 'string') {
        detail = msg;
      }
    }

    return {
      title: fallbackTitle,
      status,
      detail: `${detail} [${method} ${url}]`,
    };
  }

  // Zod validation error
  if (error instanceof z.ZodError) {
    const fields: Record<string, string> = {};
    error.issues.forEach((issue) => {
      const field = issue.path.join('.');
      fields[field] = issue.message;
    });

    return {
      title: 'Validation failed',
      status: 400,
      detail: 'Please check the form fields and try again',
      fields,
    };
  }

  // Network/fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      title: 'Network error',
      status: 0,
      detail: 'Unable to connect to the server. Please check your connection.',
    };
  }

  // Generic Error object
  if (error instanceof Error) {
    return {
      title: fallbackTitle,
      status: 500,
      detail: error.message,
    };
  }

  // String error
  if (typeof error === 'string') {
    return {
      title: fallbackTitle,
      status: 500,
      detail: error,
    };
  }

  // Unknown error type
  return {
    title: fallbackTitle,
    status: 500,
    detail: 'An unexpected error occurred',
  };
}
