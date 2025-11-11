import { createTraceparent, parseTraceparent } from '@/lib/tracing';
import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

/**
 * Creates an Axios instance with OpenTelemetry tracing support
 *
 * Automatically adds W3C traceparent header to all outgoing requests
 * This ensures distributed tracing across microservices
 *
 * @param config - Optional Axios configuration
 * @returns Configured Axios instance with tracing interceptor
 */
export function createTracedHttpClient(config?: AxiosRequestConfig): AxiosInstance {
  const client = axios.create(config);

  // Request interceptor to add traceparent header
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Check if traceparent already exists (e.g., passed from client)
      const existingTraceparent = config.headers?.['traceparent'] as string | undefined;

      if (existingTraceparent) {
        // Validate and keep existing traceparent
        const parsed = parseTraceparent(existingTraceparent);
        if (parsed) {
          console.log('[Tracing] Using existing trace:', parsed.traceId);
          return config;
        }
      }

      // Generate new traceparent for this request
      const traceparent = createTraceparent();
      const parsed = parseTraceparent(traceparent);

      if (parsed) {
        console.log('[Tracing] Generated new trace:', parsed.traceId);
      }

      config.headers.set('traceparent', traceparent);

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to log trace information
  client.interceptors.response.use(
    (response) => {
      const traceparent = response.config.headers?.['traceparent'] as string | undefined;
      if (traceparent) {
        const parsed = parseTraceparent(traceparent);
        if (parsed) {
          console.log('[Tracing] Request completed:', {
            traceId: parsed.traceId,
            url: response.config.url,
            status: response.status,
          });
        }
      }
      return response;
    },
    (error) => {
      const traceparent = error.config?.headers?.['traceparent'] as string | undefined;
      if (traceparent) {
        const parsed = parseTraceparent(traceparent);
        if (parsed) {
          console.error('[Tracing] Request failed:', {
            traceId: parsed.traceId,
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
          });
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Extract trace ID from Axios request config
 * Useful for logging and correlation
 */
export function getTraceIdFromConfig(config: AxiosRequestConfig): string | null {
  const traceparent = config.headers?.['traceparent'] as string | undefined;
  if (!traceparent) {
    return null;
  }

  const parsed = parseTraceparent(traceparent);
  return parsed?.traceId || null;
}
