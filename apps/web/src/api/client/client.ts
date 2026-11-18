import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
} from "axios";
import { ApiError, getErrorMessage } from "./utils/api-client.utils";
import { getAccessToken } from "../../modules/auth/services/authStorage";

const DEFAULT_API_URL = "http://localhost:8080";
const DEFAULT_TIMEOUT_MS = 15_000;

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_URL;

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: apiBaseUrl,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout: DEFAULT_TIMEOUT_MS,
  });

  client.interceptors.request.use((config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && getAccessToken()) {
        window.dispatchEvent(new Event("socialops:unauthorized"));
      }

      return Promise.reject(
        new ApiError(getErrorMessage(error), {
          status: error.response?.status,
          details: error.response?.data,
          cause: error,
        })
      );
    }
  );

  return client;
}

export const apiClient = createApiClient();

export async function request<TResponse>(config: AxiosRequestConfig): Promise<TResponse> {
  const response = await apiClient.request<TResponse>(config);

  return response.data;
}
