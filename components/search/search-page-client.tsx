"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchShell from "@/components/search/search-shell";
import SearchResults from "@/components/search/search-results";
import Skeleton from "@mui/material/Skeleton";
import type { RepoCardData } from "@/components/search/repo-card";
import type { UserCardData } from "@/components/search/user-card";
import { CACHE_TTL_MS } from "@/lib/constants/cache";
import { SEARCH_TYPES } from "@/lib/constants/search";
import { normalizeSearchType, type SearchType } from "@/lib/search/types";
import { appClient, getApiErrorMessage } from "@/lib/api/client";
import { localizeRateLimitMessage } from "@/lib/utils/rate-limit";

type SearchPageClientProps = {
  initialQuery: string;
  initialType: SearchType;
};

type ApiResponse<T> = {
  items: T[];
  total_count: number;
  page: number;
  error?: string;
};

type CachedResult = {
  items: UserCardData[] | RepoCardData[];
  page: number;
};

export default function SearchPageClient({ initialQuery, initialType }: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(initialQuery);
  const [type, setType] = React.useState<SearchType>(initialType);
  const [usersTotal, setUsersTotal] = React.useState(0);
  const [organizationsTotal, setOrganizationsTotal] = React.useState(0);
  const [repositoriesTotal, setRepositoriesTotal] = React.useState(0);
  const [users, setUsers] = React.useState<UserCardData[]>([]);
  const [repos, setRepos] = React.useState<RepoCardData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const runIdRef = React.useRef(0);
  const lastParamsRef = React.useRef({ query: initialQuery, type: initialType });
  const cacheRef = React.useRef<{
    query: string;
    updatedAt: number;
    totals: { users: number; organizations: number; repositories: number };
    hasTotals: boolean;
    results: Partial<Record<SearchType, CachedResult>>;
  }>({
    query: "",
    updatedAt: 0,
    totals: { users: 0, organizations: 0, repositories: 0 },
    hasTotals: false,
    results: {},
  });
  const lastResultRef = React.useRef<
    Partial<
      Record<
        SearchType,
        {
          query: string;
          items: UserCardData[] | RepoCardData[];
        }
      >
    >
  >({});

  const updateUrl = React.useCallback(
    (nextQuery: string, nextType: SearchType) => {
      const params = new URLSearchParams();
      params.set("type", nextType);
      if (nextQuery.trim()) {
        params.set("q", nextQuery.trim());
      }
      const next = params.toString();
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.delete("page");
      const current = currentParams.toString();
      if (next === current) return;
      router.replace(`/?${next}`, { scroll: false });
    },
    [router, searchParams],
  );

  const runSearch = React.useCallback(
    async (nextQuery: string, nextType: SearchType, update = true) => {
      const trimmed = nextQuery.trim();
      setQuery(nextQuery);
      setType(nextType);
      if (update) {
        lastParamsRef.current = { query: trimmed, type: nextType };
        updateUrl(trimmed, nextType);
      }

      if (!trimmed) {
        setUsers([]);
        setRepos([]);
        setUsersTotal(0);
        setOrganizationsTotal(0);
        setRepositoriesTotal(0);
        setError(null);
        cacheRef.current = {
          query: "",
          updatedAt: 0,
          totals: { users: 0, organizations: 0, repositories: 0 },
          hasTotals: false,
          results: {},
        };
        return;
      }

      const now = Date.now();
      const cache = cacheRef.current;
      const cacheValid = cache.query === trimmed && now - cache.updatedAt < CACHE_TTL_MS;
      if (!cacheValid) {
        cacheRef.current = {
          query: trimmed,
          updatedAt: now,
          totals: { users: 0, organizations: 0, repositories: 0 },
          hasTotals: false,
          results: {},
        };
      }

      const activeCache = cacheRef.current;
      const cached = cacheValid ? activeCache.results[nextType] : undefined;
      if (cacheValid && cached) {
        const totalForType =
          nextType === SEARCH_TYPES.REPOSITORIES
            ? activeCache.totals.repositories
            : nextType === SEARCH_TYPES.ORGANIZATIONS
              ? activeCache.totals.organizations
              : activeCache.totals.users;
        const cacheHasMeaningfulData =
          cached.items.length > 0 || (activeCache.hasTotals && totalForType === 0);
        if (cacheHasMeaningfulData) {
          if (activeCache.hasTotals) {
            setUsersTotal(activeCache.totals.users);
            setOrganizationsTotal(activeCache.totals.organizations);
            setRepositoriesTotal(activeCache.totals.repositories);
          }
          if (nextType === SEARCH_TYPES.REPOSITORIES) {
            setRepos(cached.items as RepoCardData[]);
            setUsers([]);
          } else {
            setUsers(cached.items as UserCardData[]);
            setRepos([]);
          }
          setError(null);
          setIsLoading(false);
          return;
        }
      }

      const runId = ++runIdRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const perPage = 12;
        const activeRequest = appClient.get<ApiResponse<UserCardData | RepoCardData>>(
          "/api/search",
          {
            params: { q: trimmed, type: nextType, page: 1, per_page: perPage },
          },
        );

        const shouldFetchTotals = !(cacheValid && activeCache.hasTotals);
        const totalsRequests = shouldFetchTotals
          ? ([
              nextType === SEARCH_TYPES.USERS
                ? Promise.resolve(null)
                : appClient.get<ApiResponse<UserCardData>>("/api/search", {
                    params: { q: trimmed, type: SEARCH_TYPES.USERS, page: 1, per_page: 1 },
                  }),
              nextType === SEARCH_TYPES.ORGANIZATIONS
                ? Promise.resolve(null)
                : appClient.get<ApiResponse<UserCardData>>("/api/search", {
                    params: { q: trimmed, type: SEARCH_TYPES.ORGANIZATIONS, page: 1, per_page: 1 },
                  }),
              nextType === SEARCH_TYPES.REPOSITORIES
                ? Promise.resolve(null)
                : appClient.get<ApiResponse<RepoCardData>>("/api/search", {
                    params: { q: trimmed, type: SEARCH_TYPES.REPOSITORIES, page: 1, per_page: 1 },
                  }),
            ] as const)
          : null;

        const [activeResponse, totalsSettled] = await Promise.all([
          activeRequest,
          shouldFetchTotals && totalsRequests
            ? Promise.allSettled(totalsRequests)
            : Promise.resolve([null, null, null]),
        ]);
        const [usersTotalResult, orgsTotalResult, reposTotalResult] = totalsSettled;
        const results = activeResponse.data;

        if (results.error) {
          throw new Error(results.error ?? "Failed to load results.");
        }

        const nextTotal = results.total_count ?? 0;
        const safeTotal = <T,>(
          result: PromiseSettledResult<Awaited<
            ReturnType<typeof appClient.get<ApiResponse<T>>>
          > | null> | null,
        ) => {
          if (!result || result.status !== "fulfilled") return 0;
          if (result.value === null) return 0;
          const data = result.value.data;
          if (data.error) return 0;
          return data.total_count ?? 0;
        };
        const totals = shouldFetchTotals
          ? {
              users:
                nextType === SEARCH_TYPES.USERS
                  ? nextTotal
                  : safeTotal<UserCardData>(usersTotalResult),
              organizations:
                nextType === SEARCH_TYPES.ORGANIZATIONS
                  ? nextTotal
                  : safeTotal<UserCardData>(orgsTotalResult),
              repositories:
                nextType === SEARCH_TYPES.REPOSITORIES
                  ? nextTotal
                  : safeTotal<RepoCardData>(reposTotalResult),
            }
          : {
              users: activeCache.totals.users,
              organizations: activeCache.totals.organizations,
              repositories: activeCache.totals.repositories,
            };

        setUsersTotal(totals.users);
        setOrganizationsTotal(totals.organizations);
        setRepositoriesTotal(totals.repositories);

        if (nextType === SEARCH_TYPES.REPOSITORIES) {
          const repoItems = results.items as RepoCardData[];
          const fallback =
            repoItems.length === 0
              ? (() => {
                  const last = lastResultRef.current.repositories;
                  if (last && trimmed.startsWith(last.query)) {
                    return last.items.filter((repo) =>
                      (repo as RepoCardData).full_name
                        .toLowerCase()
                        .includes(trimmed.toLowerCase()),
                    ) as RepoCardData[];
                  }
                  return [];
                })()
              : [];
          const finalItems = repoItems.length > 0 ? repoItems : fallback;
          setRepos(finalItems);
          setUsers([]);
          if (finalItems.length > 0) {
            lastResultRef.current.repositories = { query: trimmed, items: finalItems };
          }
          cacheRef.current = {
            query: trimmed,
            updatedAt: now,
            totals: {
              users: totals.users,
              organizations: totals.organizations,
              repositories:
                repoItems.length > 0
                  ? totals.repositories
                  : Math.min(finalItems.length, totals.repositories),
            },
            hasTotals: true,
            results: {
              ...(cacheValid ? activeCache.results : {}),
              repositories: { items: finalItems, page: 1 },
            },
          };
        } else {
          const userItems = results.items as UserCardData[];
          const fallback =
            userItems.length === 0
              ? (() => {
                  const last = lastResultRef.current[nextType];
                  if (last && trimmed.startsWith(last.query)) {
                    return last.items.filter((user) =>
                      (user as UserCardData).username.toLowerCase().includes(trimmed.toLowerCase()),
                    ) as UserCardData[];
                  }
                  return [];
                })()
              : [];
          const finalItems = userItems.length > 0 ? userItems : fallback;
          setUsers(finalItems);
          setRepos([]);
          if (finalItems.length > 0) {
            lastResultRef.current[nextType] = { query: trimmed, items: finalItems };
          }
          cacheRef.current = {
            query: trimmed,
            updatedAt: now,
            totals: {
              users:
                nextType === SEARCH_TYPES.USERS
                  ? userItems.length === 0
                    ? Math.min(finalItems.length, totals.users)
                    : totals.users
                  : totals.users,
              organizations:
                nextType === SEARCH_TYPES.ORGANIZATIONS
                  ? userItems.length === 0
                    ? Math.min(finalItems.length, totals.organizations)
                    : totals.organizations
                  : totals.organizations,
              repositories: totals.repositories,
            },
            hasTotals: true,
            results: {
              ...(cacheValid ? activeCache.results : {}),
              [nextType]: { items: finalItems, page: 1 },
            },
          };
        }
      } catch (err) {
        if (runId === runIdRef.current) {
          setError(getApiErrorMessage(err, "Failed to load results."));
        }
      } finally {
        if (runId === runIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [updateUrl],
  );

  React.useEffect(() => {
    const nextQuery = searchParams.get("q")?.trim() ?? "";
    const nextType = normalizeSearchType(searchParams.get("type"));
    const last = lastParamsRef.current;
    if (nextQuery === last.query && nextType === last.type) return;
    lastParamsRef.current = { query: nextQuery, type: nextType };
    runSearch(nextQuery, nextType, false);
  }, [runSearch, searchParams]);

  React.useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery, initialType, false);
    }
    lastParamsRef.current = { query: initialQuery, type: initialType };
  }, [initialQuery, initialType, runSearch]);

  const handleStateChange = React.useCallback(
    (state: { page: number; users: UserCardData[]; repos: RepoCardData[] }) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      const cache = cacheRef.current;
      if (cache.query !== trimmed) return;
      cache.results[type] = {
        items: type === SEARCH_TYPES.REPOSITORIES ? state.repos : state.users,
        page: state.page,
      };
      cache.updatedAt = Date.now();
    },
    [query, type],
  );

  const totalCount =
    type === SEARCH_TYPES.REPOSITORIES
      ? repositoriesTotal
      : type === SEARCH_TYPES.ORGANIZATIONS
        ? organizationsTotal
        : usersTotal;

  const cacheSnapshot = cacheRef.current;
  const cacheValid =
    cacheSnapshot.query === query.trim() && Date.now() - cacheSnapshot.updatedAt < CACHE_TTL_MS;
  const cachedResult = cacheValid ? cacheSnapshot.results[type] : undefined;
  const initialPage = cachedResult?.page ?? 1;

  return (
    <div className="w-full max-w-none flex flex-col gap-8 px-4 pt-3 pb-10 sm:px-8 sm:pt-4 sm:pb-16 lg:px-16 xl:px-12">
      <SearchShell
        initialQuery={query}
        initialType={type}
        showSearchButton={false}
        liveSearch
        tabMode="button"
        counts={{
          users: usersTotal,
          orgs: organizationsTotal,
          repos: repositoriesTotal,
        }}
        onSearchSubmit={(nextQuery, nextType) => {
          runSearch(nextQuery, nextType);
        }}
        onQueryChange={(nextQuery) => {
          setQuery(nextQuery);
        }}
        onTabSelect={(nextType) => {
          runSearch(query, nextType);
        }}
      />

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {localizeRateLimitMessage(error)}
          {error.toLowerCase().includes("rate limit") ? (
            <p className="mt-2 text-sm text-destructive/90">
              Add a GitHub token in <code>.env.local</code>:
              <br />
              <code>GITHUB_TOKEN=your_token_here</code>
            </p>
          ) : null}
        </div>
      ) : null}

      {query.trim() ? (
        isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={112} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            <SearchResults
              key={`${query}-${type}`}
              query={query}
              type={type}
              perPage={12}
              totalCount={totalCount}
              initialUsers={users}
              initialRepos={repos}
              initialPage={initialPage}
              onStateChange={handleStateChange}
            />
          </div>
        )
      ) : null}
    </div>
  );
}
