"use client";

import * as React from "react";
import RepoCard, { RepoCardData } from "@/components/search/repo-card";
import { Button } from "@/components/ui/button";
import SearchShell from "@/components/search/search-shell";
import Skeleton from "@mui/material/Skeleton";
import { CACHE_TTL_MS } from "@/lib/constants/cache";
import { SEARCH_TYPES } from "@/lib/constants/search";
import { appClient, getApiErrorMessage } from "@/lib/api/client";
import { localizeRateLimitMessage } from "@/lib/utils/rate-limit";

type ProfileReposProps = {
  owner: string;
  kind: "user" | "org";
  initialRepos: RepoCardData[];
  perPage?: number;
  publicCount?: number;
};

type ApiRepo = RepoCardData;

type CachedList = {
  items: ApiRepo[];
  page: number;
  hasMore: boolean;
  updatedAt: number;
};

export default function ProfileRepos({
  owner,
  kind,
  initialRepos,
  perPage = 12,
  publicCount = 0,
}: ProfileReposProps) {
  const [repos, setRepos] = React.useState<ApiRepo[]>(initialRepos);
  const [query, setQuery] = React.useState("");
  const [draftQuery, setDraftQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [mode, setMode] = React.useState<"list" | "search">("list");
  const [visibility, setVisibility] = React.useState<"public" | "private">("public");
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(initialRepos.length >= perPage);
  const [searchTotal, setSearchTotal] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const searchAbortRef = React.useRef<AbortController | null>(null);
  const cacheRef = React.useRef<{
    list: CachedList;
    search: Record<string, CachedList>;
  }>({
    list: {
      items: initialRepos,
      page: 1,
      hasMore: initialRepos.length >= perPage,
      updatedAt: Date.now(),
    },
    search: {},
  });

  const loadMore = React.useCallback(async () => {
    if (isLoading || !hasMore) return;
    const cache = cacheRef.current;
    const activeCache = mode === "search" ? cache.search[query.trim().toLowerCase()] : cache.list;
    if (activeCache && Date.now() - activeCache.updatedAt < CACHE_TTL_MS) {
      if (activeCache.page >= page + 1 && activeCache.items.length > repos.length) {
        setRepos(activeCache.items);
        setPage(activeCache.page);
        setHasMore(activeCache.hasMore);
        return;
      }
    }
    setIsLoading(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const params =
        mode === "search"
          ? {
              q: `${query} ${kind === "org" ? "org" : "user"}:${owner}`,
              type: SEARCH_TYPES.REPOSITORIES,
              page: nextPage,
              per_page: perPage,
            }
          : {
              kind,
              name: owner,
              page: nextPage,
              per_page: perPage,
            };
      const { data } = await appClient.get<{
        items?: ApiRepo[];
        total_count?: number;
        error?: string;
      }>(mode === "search" ? "/api/search" : "/api/profile-repos", { params });
      if (data.error) {
        throw new Error(data.error ?? "Failed to load repositories.");
      }
      const nextItems = data.items ?? [];
      setRepos((prev) => {
        const merged = [...prev, ...nextItems];
        if (mode === "search") {
          cacheRef.current.search[query.trim().toLowerCase()] = {
            items: merged,
            page: nextPage,
            hasMore: nextItems.length >= perPage,
            updatedAt: Date.now(),
          };
        } else {
          cacheRef.current.list = {
            items: merged,
            page: nextPage,
            hasMore: nextItems.length >= perPage,
            updatedAt: Date.now(),
          };
        }
        return merged;
      });
      setPage(nextPage);
      setHasMore(nextItems.length >= perPage);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load repositories."));
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, kind, mode, owner, page, perPage, query]);

  const runSearch = React.useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      setQuery(trimmed);
      if (!trimmed) {
        setMode("list");
        const listCache = cacheRef.current.list;
        if (Date.now() - listCache.updatedAt < CACHE_TTL_MS) {
          setRepos(listCache.items);
          setPage(listCache.page);
          setHasMore(listCache.hasMore);
        } else {
          setRepos(initialRepos);
          setPage(1);
          setHasMore(initialRepos.length >= perPage);
          cacheRef.current.list = {
            items: initialRepos,
            page: 1,
            hasMore: initialRepos.length >= perPage,
            updatedAt: Date.now(),
          };
        }
        setSearchTotal(null);
        return;
      }
      const cacheKey = trimmed.toLowerCase();
      const cached = cacheRef.current.search[cacheKey];
      if (cached && Date.now() - cached.updatedAt < CACHE_TTL_MS) {
        setMode("search");
        setRepos(cached.items);
        setPage(cached.page);
        setHasMore(cached.hasMore);
        setSearchTotal(cached.items.length);
        return;
      }
      searchAbortRef.current?.abort();
      const controller = new AbortController();
      searchAbortRef.current = controller;
      setIsLoading(true);
      setMode("search");
      setError(null);
      try {
        const { data } = await appClient.get<{
          items?: ApiRepo[];
          total_count?: number;
          error?: string;
        }>("/api/search", {
          params: {
            q: `${trimmed} ${kind === "org" ? "org" : "user"}:${owner}`,
            type: SEARCH_TYPES.REPOSITORIES,
            page: 1,
            per_page: perPage,
          },
          signal: controller.signal,
        });
        if (data.error) {
          throw new Error(data.error ?? "Failed to search repositories.");
        }
        const items = data.items ?? [];
        const fallbackMatches =
          items.length === 0
            ? cacheRef.current.list.items.filter((repo) => {
                const haystack = `${repo.full_name} ${repo.description ?? ""}`.toLowerCase();
                return haystack.includes(trimmed.toLowerCase());
              })
            : [];
        const finalItems = items.length > 0 ? items : fallbackMatches;
        setRepos(finalItems);
        setPage(1);
        setHasMore(finalItems.length >= perPage);
        setSearchTotal(items.length > 0 ? (data.total_count ?? items.length) : finalItems.length);
        cacheRef.current.search[cacheKey] = {
          items: finalItems,
          page: 1,
          hasMore: finalItems.length >= perPage,
          updatedAt: Date.now(),
        };
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(getApiErrorMessage(err, "Failed to search repositories."));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [initialRepos, kind, owner, perPage],
  );

  React.useEffect(() => {
    if (!draftQuery.trim()) return;
    const timer = window.setTimeout(() => {
      runSearch(draftQuery);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [draftQuery, runSearch]);

  React.useEffect(() => {
    if (!hasMore || isLoading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  // Search is handled by SearchShell liveSearch debounce.

  const isTyping = draftQuery.trim() !== "" && draftQuery.trim() !== query;
  const showSkeleton = isLoading || isTyping;
  const visibleRepos = React.useMemo(() => {
    const seen = new Set<string>();
    return repos.filter((repo, index) => {
      const key = `${repo.id}-${repo.full_name}-${index}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [repos]);

  return (
    <div className="space-y-3">
      <SearchShell
        title=""
        description=""
        showSearch
        showHeader={false}
        showTabs
        tabMode="button"
        inputPlaceholder="Search repositories..."
        showSearchButton={false}
        liveSearch={false}
        tabs={[SEARCH_TYPES.USERS, SEARCH_TYPES.REPOSITORIES]}
        tabLabels={{
          [SEARCH_TYPES.USERS]: "Public",
          [SEARCH_TYPES.REPOSITORIES]: "Private",
        }}
        counts={{
          users: mode === "search" && searchTotal !== null && !isTyping ? searchTotal : publicCount,
          orgs: 0,
          repos: 0,
        }}
        initialQuery={draftQuery}
        initialType={visibility === "public" ? SEARCH_TYPES.USERS : SEARCH_TYPES.REPOSITORIES}
        onQueryChange={(value) => {
          setDraftQuery(value);
          if (value.trim()) {
            setMode("search");
            setSearchTotal(null);
          } else {
            setQuery("");
            runSearch("");
          }
        }}
        onSearchSubmit={() => {}}
        onTabSelect={(tab) => {
          if (tab === SEARCH_TYPES.USERS) {
            setVisibility("public");
          }
          if (tab === SEARCH_TYPES.REPOSITORIES) {
            setVisibility("private");
          }
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {visibility === "private" ? "Private repositories" : "Public repositories"}
        </h2>
      </div>
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
      {visibility === "private" ? (
        <div className="rounded-lg border border-muted/60 bg-muted/10 p-4 text-sm text-muted-foreground">
          Private repositories require authorization.
        </div>
      ) : showSkeleton ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={112} />
          ))}
        </div>
      ) : visibleRepos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No public repositories found.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {visibleRepos.map((repo, index) => (
            <RepoCard key={`${repo.id}-${repo.full_name}-${index}`} repo={repo} />
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="flex flex-col items-center gap-2 pt-2">
          <Button type="button" variant="outline" onClick={loadMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load more"}
          </Button>
          <span className="text-xs text-muted-foreground">Auto-loads as you scroll</span>
        </div>
      ) : null}

      <div ref={sentinelRef} />
    </div>
  );
}
