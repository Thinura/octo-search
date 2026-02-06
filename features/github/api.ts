import { createApi } from "@reduxjs/toolkit/query/react";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";

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
};

const axiosBaseQuery =
  ({ baseUrl }: { baseUrl?: string } = {}): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    AxiosBaseQueryError
  > =>
  async ({ url, method = "GET", data, params, headers }) => {
    try {
      const result = await axios({
        url: `${baseUrl ?? ""}${url}`,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        },
      };
    }
  };

export const githubApi = createApi({
  reducerPath: "githubApi",
  baseQuery: axiosBaseQuery({ baseUrl: "https://api.github.com" }),
  endpoints: (builder) => ({
    searchUsers: builder.query<
      { items: Array<{ id: number; login: string; avatar_url: string }> },
      { q: string; page?: number; perPage?: number }
    >({
      query: ({ q, page = 1, perPage = 30 }) => ({
        url: "/search/users",
        params: { q, page, per_page: perPage },
      }),
    }),
  }),
});

export const { useSearchUsersQuery } = githubApi;
