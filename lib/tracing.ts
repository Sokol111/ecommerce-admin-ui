import { trace, TraceFlags } from '@opentelemetry/api';

/**
 * Generates a random trace ID (32 hex characters / 16 bytes)
 * Compatible with W3C Trace Context specification
 */
export function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a random span ID (16 hex characters / 8 bytes)
 * Compatible with W3C Trace Context specification
 */
export function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a W3C traceparent header value
 * Format: 00-{trace-id}-{span-id}-{trace-flags}
 *
 * @param traceId - Optional trace ID (generates new if not provided)
 * @param spanId - Optional span ID (generates new if not provided)
 * @param sampled - Whether the trace is sampled (default: true)
 * @returns W3C traceparent header value
 */
export function createTraceparent(
  traceId?: string,
  spanId?: string,
  sampled: boolean = true
): string {
  const tid = traceId || generateTraceId();
  const sid = spanId || generateSpanId();
  const flags = sampled ? '01' : '00';

  return `00-${tid}-${sid}-${flags}`;
}

/**
 * Parses a W3C traceparent header
 * Format: 00-{trace-id}-{span-id}-{trace-flags}
 *
 * @param traceparent - The traceparent header value
 * @returns Object with traceId, spanId, and sampled flag, or null if invalid
 */
export function parseTraceparent(traceparent: string): {
  traceId: string;
  spanId: string;
  sampled: boolean;
} | null {
  const parts = traceparent.split('-');
  if (parts.length !== 4 || parts[0] !== '00') {
    return null;
  }

  const [, traceId, spanId, flags] = parts;
  const sampled = parseInt(flags, 16) & TraceFlags.SAMPLED ? true : false;

  return { traceId, spanId, sampled };
}

/**
 * Gets the current trace ID from OpenTelemetry context
 * Returns empty string if no active span
 */
export function getCurrentTraceId(): string {
  const span = trace.getActiveSpan();
  if (!span) {
    return '';
  }

  const spanContext = span.spanContext();
  return spanContext.traceId;
}

/**
 * Gets the current span ID from OpenTelemetry context
 * Returns empty string if no active span
 */
export function getCurrentSpanId(): string {
  const span = trace.getActiveSpan();
  if (!span) {
    return '';
  }

  const spanContext = span.spanContext();
  return spanContext.spanId;
}

/**
 * Creates a traceparent header from current OpenTelemetry context
 * If no active span, generates a new trace
 */
export function getCurrentTraceparent(): string {
  const span = trace.getActiveSpan();
  if (!span) {
    return createTraceparent();
  }

  const spanContext = span.spanContext();
  const sampled = (spanContext.traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED;

  return createTraceparent(spanContext.traceId, spanContext.spanId, sampled);
}
