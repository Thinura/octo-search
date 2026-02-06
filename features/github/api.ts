import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/github/client";

export const githubApi = createApi({
  reducerPath: "githubApi",
  baseQuery: axiosBaseQuery(),
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
