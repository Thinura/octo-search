import axios, { AxiosError, AxiosRequestConfig } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { apiErrorBus } from "@/lib/utils/api-error-bus";
import { TOAST_DESCRIPTIONS } from "@/lib/constants/messages";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
};

type AxiosBaseQueryError = {
  status?: number;
  data?: unknown;
  message?: string;
};

export const githubClient = axios.create({
  baseURL: "/api/github",
});

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
  async ({ url, method = "GET", data, params, headers }) => {
    try {
      const result = await githubClient({
        url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      const message =
        extractErrorMessage(axiosError) ??
        getFallbackForStatus(axiosError.response?.status, axiosError);
      apiErrorBus.emit({
        status: axiosError.response?.status,
        message,
      });
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message,
        },
      };
    }
  };

function extractErrorMessage(error: AxiosError): string | undefined {
  const data = error.response?.data;

  if (!data) return error.message;
  if (typeof data === "string") return data;
  if (typeof data === "object" && "message" in data) {
    const value = (data as { message?: unknown }).message;
    if (typeof value === "string") return value;
  }

  return error.message;
}

function getFallbackForStatus(status?: number, error?: AxiosError): string | undefined {
  if (!status) {
    if (error?.code === "ECONNABORTED") {
      return TOAST_DESCRIPTIONS.timeout;
    }
    if (error?.code === "ENOTFOUND") {
      return TOAST_DESCRIPTIONS.dnsError;
    }
    if (error?.code || error?.message) {
      return TOAST_DESCRIPTIONS.networkError;
    }
  }
  if (status === 429) {
    return TOAST_DESCRIPTIONS.rateLimited;
  }
  if (status === 401 || status === 403) {
    return TOAST_DESCRIPTIONS.unauthorized;
  }
  return undefined;
}
