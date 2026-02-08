"use client";

import RepoCard, { RepoCardData } from "@/components/search/repo-card";
import UserCard, { UserCardData } from "@/components/search/user-card";
import type { FavoriteItem } from "@/features/favorites/slice";
import { SEARCH_TYPES } from "@/lib/constants/search";
import type { SearchType } from "@/lib/search/types";
import Skeleton from "@mui/material/Skeleton";

type FavoritesListProps = {
  users?: Extract<FavoriteItem, { kind: "user" }>[];
  orgs?: Extract<FavoriteItem, { kind: "org" }>[];
  repos?: Extract<FavoriteItem, { kind: "repo" }>[];
  activeType?: SearchType | "all";
  isLoading?: boolean;
  selectionEnabled?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
};

export default function FavoritesList({
  users = [],
  orgs = [],
  repos = [],
  activeType = "all",
  isLoading = false,
  selectionEnabled = false,
  selectedIds = [],
  onToggleSelect,
}: FavoritesListProps) {
  const selectedSet = new Set(selectedIds);
  const toNumericId = (value: string) => {
    const parsed = Number(value.split(":")[1] ?? value);
    if (!Number.isNaN(parsed)) return parsed;
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) || 1;
  };

  if (isLoading) {
    const sections =
      activeType === "all"
        ? ["Users", "Organizations", "Repositories"]
        : [
            activeType === SEARCH_TYPES.USERS
              ? "Users"
              : activeType === SEARCH_TYPES.ORGANIZATIONS
                ? "Organizations"
                : "Repositories",
          ];
    return (
      <div className="space-y-8">
        {sections.map((title) => (
          <section key={title} className="space-y-3">
            <Skeleton variant="text" width={140} height={24} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={112} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (!users.length && !orgs.length && !repos.length) {
    return <p className="text-sm text-muted-foreground">No favorites yet.</p>;
  }

  return (
    <div className="space-y-8">
      {activeType === SEARCH_TYPES.USERS || activeType === "all" ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Users</h2>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No user favorites.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((item) => {
                const numericId = toNumericId(item.id);
                const user: UserCardData = {
                  id: numericId,
                  username: item.username,
                  avatar_url: item.avatarUrl,
                  html_url: item.htmlUrl,
                };

                const isSelected = selectedSet.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`relative ${
                      isSelected ? "rounded-xl ring-2 ring-destructive/60" : ""
                    }`}
                  >
                    <UserCard
                      user={user}
                      selectionControl={
                        selectionEnabled ? (
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-foreground"
                            checked={selectedSet.has(item.id)}
                            onChange={() => onToggleSelect?.(item.id)}
                            aria-label={`Select ${item.username}`}
                          />
                        ) : null
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {activeType === SEARCH_TYPES.ORGANIZATIONS || activeType === "all" ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Organizations</h2>
          {orgs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No organization favorites.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {orgs.map((item) => {
                const numericId = toNumericId(item.id);
                const user: UserCardData = {
                  id: numericId,
                  username: item.username,
                  avatar_url: item.avatarUrl,
                  html_url: item.htmlUrl,
                };

                const isSelected = selectedSet.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`relative ${
                      isSelected ? "rounded-xl ring-2 ring-destructive/60" : ""
                    }`}
                  >
                    <UserCard
                      user={user}
                      entityType="org"
                      selectionControl={
                        selectionEnabled ? (
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-foreground"
                            checked={selectedSet.has(item.id)}
                            onChange={() => onToggleSelect?.(item.id)}
                            aria-label={`Select ${item.username}`}
                          />
                        ) : null
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {activeType === SEARCH_TYPES.REPOSITORIES || activeType === "all" ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Repositories</h2>
          {repos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No repository favorites.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {repos.map((item) => {
                const numericId = toNumericId(item.id);
                const repo: RepoCardData = {
                  id: numericId,
                  full_name: item.fullName,
                  description: item.description,
                  html_url: item.htmlUrl,
                  stargazers_count: item.stars,
                };

                const isSelected = selectedSet.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={`relative ${
                      isSelected ? "rounded-xl ring-2 ring-destructive/60" : ""
                    }`}
                  >
                    <RepoCard
                      repo={repo}
                      selectionControl={
                        selectionEnabled ? (
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-foreground"
                            checked={selectedSet.has(item.id)}
                            onChange={() => onToggleSelect?.(item.id)}
                            aria-label={`Select ${item.fullName}`}
                          />
                        ) : null
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
