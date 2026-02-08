"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { appClient, getApiErrorMessage } from "@/lib/api/client";
import { CACHE_TTL_MS } from "@/lib/constants/cache";
import { localizeRateLimitMessage } from "@/lib/utils/rate-limit";

type RepoIssue = {
  id: number;
  number: number;
  title: string;
  html_url: string;
};

export default function RepoIssues({
  issues,
  totalCount,
  owner,
  repo,
}: {
  issues: RepoIssue[];
  totalCount: number;
  owner: string;
  repo: string;
}) {
  const [query, setQuery] = React.useState("");
  const [draftQuery, setDraftQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [mode, setMode] = React.useState<"list" | "search">("list");
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(issues.length >= 12);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<RepoIssue[]>(issues);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const searchAbortRef = React.useRef<AbortController | null>(null);
  const cacheRef = React.useRef<{
    list: { items: RepoIssue[]; page: number; hasMore: boolean; updatedAt: number };
    search: Record<
      string,
      { items: RepoIssue[]; page: number; hasMore: boolean; updatedAt: number }
    >;
  }>({
    list: {
      items: issues,
      page: 1,
      hasMore: issues.length >= 12,
      updatedAt: Date.now(),
    },
    search: {},
  });

  const loadMore = React.useCallback(async () => {
    if (isLoading || !hasMore) return;
    const cache = cacheRef.current;
    const key = query.trim().toLowerCase();
    const activeCache = mode === "search" ? cache.search[key] : cache.list;
    if (activeCache && Date.now() - activeCache.updatedAt < CACHE_TTL_MS) {
      if (activeCache.page >= page + 1 && activeCache.items.length > items.length) {
        setItems(activeCache.items);
        setPage(activeCache.page);
        setHasMore(activeCache.hasMore);
        return;
      }
    }
    setIsLoading(true);
    setError(null);
    try {
      const nextPage = page + 1;
      const { data } = await appClient.get<{
        items?: RepoIssue[];
        total_count?: number;
        error?: string;
      }>("/api/repo-issues", {
        params: {
          owner,
          repo,
          page: nextPage,
          per_page: 12,
          q: mode === "search" ? query : undefined,
        },
      });
      if (data.error) {
        throw new Error(data.error ?? "Failed to load issues.");
      }
      const nextItems = data.items ?? [];
      setItems((prev) => {
        const merged = [...prev, ...nextItems];
        if (mode === "search") {
          cacheRef.current.search[key] = {
            items: merged,
            page: nextPage,
            hasMore: nextItems.length >= 12,
            updatedAt: Date.now(),
          };
        } else {
          cacheRef.current.list = {
            items: merged,
            page: nextPage,
            hasMore: nextItems.length >= 12,
            updatedAt: Date.now(),
          };
        }
        return merged;
      });
      setPage(nextPage);
      setHasMore(nextItems.length >= 12);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load issues."));
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, items.length, mode, owner, page, query, repo]);

  const runSearch = React.useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      setQuery(trimmed);
      if (!trimmed) {
        setMode("list");
        const listCache = cacheRef.current.list;
        if (Date.now() - listCache.updatedAt < CACHE_TTL_MS) {
          setItems(listCache.items);
          setPage(listCache.page);
          setHasMore(listCache.hasMore);
        } else {
          setItems(issues);
          setPage(1);
          setHasMore(issues.length >= 12);
          cacheRef.current.list = {
            items: issues,
            page: 1,
            hasMore: issues.length >= 12,
            updatedAt: Date.now(),
          };
        }
        return;
      }
      const cacheKey = trimmed.toLowerCase();
      const cached = cacheRef.current.search[cacheKey];
      if (cached && Date.now() - cached.updatedAt < CACHE_TTL_MS) {
        setMode("search");
        setItems(cached.items);
        setPage(cached.page);
        setHasMore(cached.hasMore);
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
          items?: RepoIssue[];
          total_count?: number;
          error?: string;
        }>("/api/repo-issues", {
          params: {
            owner,
            repo,
            q: trimmed,
            page: 1,
            per_page: 12,
          },
          signal: controller.signal,
        });
        if (data.error) {
          throw new Error(data.error ?? "Failed to search issues.");
        }
        const nextItems = data.items ?? [];
        setItems(nextItems);
        setPage(1);
        setHasMore(nextItems.length >= 12);
        cacheRef.current.search[cacheKey] = {
          items: nextItems,
          page: 1,
          hasMore: nextItems.length >= 12,
          updatedAt: Date.now(),
        };
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(getApiErrorMessage(err, "Failed to search issues."));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [issues, owner, repo],
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

  const filteredIssues = items;

  return (
    <section className="space-y-3">
      <div>
        <p className="text-sm font-medium">Open issues ({totalCount})</p>
        <p className="text-xs text-muted-foreground">Search open issues.</p>
      </div>
      <Card className="w-full max-w-none">
        <CardContent className="pt-4">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </span>
            <Input
              placeholder="Search issues..."
              type="search"
              value={draftQuery}
              className="pl-10"
              onChange={(event) => {
                const value = event.target.value;
                setDraftQuery(value);
                if (value.trim()) {
                  setMode("search");
                } else {
                  setQuery("");
                  runSearch("");
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {localizeRateLimitMessage(error)}
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {mode === "search" && query.trim() ? "No matching issues." : "No open issues found."}
        </p>
      ) : filteredIssues.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matching issues.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredIssues.map((issue) => (
            <Card key={issue.id} className="relative transition hover:border-foreground/20">
              <a
                href={issue.html_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`View issue #${issue.number}`}
                className="absolute inset-0 rounded-xl"
              />
              <CardContent className="relative z-10 space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Issue #{issue.number}</p>
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View issue #${issue.number} on GitHub`}
                    title="View on GitHub"
                    className="rounded p-1 text-muted-foreground transition hover:text-foreground"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 .5a12 12 0 00-3.79 23.4c.6.1.82-.26.82-.58v-2.17c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.85 2.82 1.32 3.5 1.01.1-.78.42-1.32.77-1.63-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.82 1.1.82 2.22v3.28c0 .32.22.69.83.57A12 12 0 0012 .5z" />
                    </svg>
                  </a>
                </div>
                <p className="text-sm font-medium leading-5">{issue.title}</p>
              </CardContent>
            </Card>
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
    </section>
  );
}
