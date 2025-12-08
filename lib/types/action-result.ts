import { Problem } from './problem';

/**
 * Success result with data
 */
export interface ActionSuccess<T = void> {
  success: true;
  data: T;
}

/**
 * Failure result with Problem error
 */
export interface ActionFailure {
  success: false;
  error: Problem;
}

/**
 * Combined result type for server actions
 */
export type ActionResult<T = void> = ActionSuccess<T> | ActionFailure;
