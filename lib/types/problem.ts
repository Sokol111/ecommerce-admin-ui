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
 * Convert any error into a Problem object.
 */
export function toProblem(error: unknown, fallbackTitle: string = 'An error occurred'): Problem {
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

  // Zod validation error
  if (error instanceof z.ZodError) {
    const fields: Record<string, string> = {};
    error.errors.forEach((err) => {
      const field = err.path.join('.');
      fields[field] = err.message;
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
