import axios, { AxiosError } from "axios";

export const appClient = axios.create({
  baseURL: "",
  headers: {
    Accept: "application/json",
  },
});

appClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers["X-Requested-With"] = "XMLHttpRequest";
  return config;
});

appClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError;
    const data = axiosError.response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object" && "error" in data) {
      const value = (data as { error?: unknown }).error;
      if (typeof value === "string" && value.trim()) return value;
    }
    if (axiosError.message) return axiosError.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
