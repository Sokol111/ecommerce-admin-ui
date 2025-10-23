/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
 *
 * This matches the backend API error response format.
 */

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
   * Field-level validation errors.
   */
  errors?: ValidationError[];
}

/**
 * Type guard to check if an error is a Problem object
 */
export function isProblem(error: unknown): error is Problem {
  return (
    typeof error === 'object' &&
    error !== null &&
    'title' in error &&
    'status' in error &&
    typeof (error as Problem).title === 'string' &&
    typeof (error as Problem).status === 'number'
  );
}
