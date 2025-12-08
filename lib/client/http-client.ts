import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Creates an Axios instance for API calls
 */
export function createHttpClient(config?: AxiosRequestConfig): AxiosInstance {
  return axios.create(config);
}
