"use client";

import * as React from "react";
import RepoCard, { RepoCardData } from "@/components/search/repo-card";
import UserCard, { UserCardData } from "@/components/search/user-card";
import Skeleton from "@mui/material/Skeleton";
import { SEARCH_TYPES } from "@/lib/constants/search";
import type { SearchType } from "@/lib/search/types";

type SearchResultsProps = {
  query: string;
  type: SearchType;
  perPage: number;
  totalCount: number;
  initialUsers: UserCardData[];
  initialRepos: RepoCardData[];
  initialPage?: number;
  onStateChange?: (state: { page: number; users: UserCardData[]; repos: RepoCardData[] }) => void;
};

type ApiResponse<T> = {
  items: T[];
  total_count: number;
  page: number;
  error?: string;
};

export default function SearchResults({
  query,
  type,
  perPage,
  totalCount,
  initialUsers,
  initialRepos,
  initialPage = 1,
  onStateChange,
}: SearchResultsProps) {
  const [page, setPage] = React.useState(initialPage);
  const [users, setUsers] = React.useState<UserCardData[]>(initialUsers);
  const [repos, setRepos] = React.useState<RepoCardData[]>(initialRepos);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  const totalPages = Math.min(Math.ceil(totalCount / perPage), 10);
  const hasMore = page < totalPages;

  const loadMore = React.useCallback(async () => {
    if (!query || isLoading || !hasMore || error) return;
    setIsLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&type=${type}&page=${nextPage}&per_page=${perPage}`,
      );
      const data = (await response.json()) as ApiResponse<UserCardData | RepoCardData>;

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Failed to load results.");
      }

      if (type === SEARCH_TYPES.REPOSITORIES) {
        setRepos((prev) => [...prev, ...(data.items as RepoCardData[])]);
      } else {
        setUsers((prev) => [...prev, ...(data.items as UserCardData[])]);
      }

      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results.");
    } finally {
      setIsLoading(false);
    }
  }, [query, type, page, perPage, isLoading, hasMore, error]);

  React.useEffect(() => {
    setPage(initialPage);
    setUsers(initialUsers);
    setRepos(initialRepos);
  }, [initialPage, initialRepos, initialUsers]);

  React.useEffect(() => {
    onStateChange?.({ page, users, repos });
  }, [onStateChange, page, repos, users]);

  React.useEffect(() => {
    if (!hasMore || isLoading || error) return;
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

  const title =
    type === SEARCH_TYPES.ORGANIZATIONS
      ? "Organizations"
      : type === SEARCH_TYPES.REPOSITORIES
        ? "Repositories"
        : "Users";

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          {error.toLowerCase().includes("rate limit") ? (
            <p className="mt-2 text-sm text-destructive/90">
              Add a GitHub token in <code>.env.local</code>:
              <br />
              <code>GITHUB_TOKEN=your_token_here</code>
            </p>
          ) : null}
        </div>
      ) : null}

      {type === SEARCH_TYPES.REPOSITORIES ? (
        repos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No repositories found.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {repos.map((repo) => (
              <RepoCard key={repo.full_name} repo={repo} />
            ))}
          </div>
        )
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {type === SEARCH_TYPES.ORGANIZATIONS ? "No organizations found." : "No users found."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {users.map((user) => (
            <UserCard
              key={user.username}
              user={user}
              entityType={type === SEARCH_TYPES.ORGANIZATIONS ? "org" : "user"}
            />
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={112} />
          ))}
        </div>
      ) : null}

      {hasMore && !isLoading ? (
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            type="button"
            className="rounded-md border px-3 py-1 text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load more"}
          </button>
          <span className="text-xs text-muted-foreground">Auto-loads as you scroll</span>
        </div>
      ) : null}

      <div ref={sentinelRef} />
    </section>
  );
}
