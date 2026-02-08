"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectFavorites } from "@/features/favorites/selectors";
import { removeFavorite, type FavoriteItem } from "@/features/favorites/slice";
import FavoritesList from "@/components/favorites/favorites-list";
import SearchShell from "@/components/search/search-shell";
import { Button } from "@/components/ui/button";
import { SEARCH_TYPES } from "@/lib/constants/search";
import { normalizeSearchType, type SearchType } from "@/lib/search/types";
import { useToast } from "@/components/ui/use-toast";
import { CACHE_TTL_MS } from "@/lib/constants/cache";

type TabType = SearchType;

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase());
}

const isUserFavorite = (item: FavoriteItem): item is Extract<FavoriteItem, { kind: "user" }> =>
  item.kind === "user";
const isOrgFavorite = (item: FavoriteItem): item is Extract<FavoriteItem, { kind: "org" }> =>
  item.kind === "org";
const isRepoFavorite = (item: FavoriteItem): item is Extract<FavoriteItem, { kind: "repo" }> =>
  item.kind === "repo";

export default function FavoritesPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const favorites = useAppSelector(selectFavorites);
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState<TabType>(
    normalizeSearchType(searchParams.get("type")) as TabType,
  );
  const [selectMode, setSelectMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<
    Extract<FavoriteItem, { kind: "user" }>[]
  >([]);
  const [filteredOrgs, setFilteredOrgs] = React.useState<Extract<FavoriteItem, { kind: "org" }>[]>(
    [],
  );
  const [filteredRepos, setFilteredRepos] = React.useState<
    Extract<FavoriteItem, { kind: "repo" }>[]
  >([]);
  const [isFiltering, setIsFiltering] = React.useState(false);
  const cacheRef = React.useRef<{
    key: string;
    updatedAt: number;
    users: Extract<FavoriteItem, { kind: "user" }>[];
    orgs: Extract<FavoriteItem, { kind: "org" }>[];
    repos: Extract<FavoriteItem, { kind: "repo" }>[];
  } | null>(null);
  const filterTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const nextType = normalizeSearchType(searchParams.get("type")) as TabType;
    setType(nextType);
  }, [searchParams]);

  const favoritesKey = React.useMemo(() => favorites.map((item) => item.id).join("|"), [favorites]);

  React.useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    const cacheKey = `${favoritesKey}:${trimmed}`;
    const now = Date.now();
    const cache = cacheRef.current;
    setIsFiltering(true);
    if (filterTimerRef.current) {
      window.clearTimeout(filterTimerRef.current);
    }

    filterTimerRef.current = window.setTimeout(() => {
      if (cache && cache.key === cacheKey && now - cache.updatedAt < CACHE_TTL_MS) {
        setFilteredUsers(cache.users);
        setFilteredOrgs(cache.orgs);
        setFilteredRepos(cache.repos);
        setIsFiltering(false);
        return;
      }

      const filtered = trimmed
        ? favorites.filter((item) => {
            if (item.kind === "repo") {
              const haystack = `${item.fullName} ${item.description ?? ""}`.trim().toLowerCase();
              return matchesQuery(haystack, trimmed);
            }
            return matchesQuery(item.username.toLowerCase(), trimmed);
          })
        : favorites;

      const users = filtered.filter(isUserFavorite);
      const orgs = filtered.filter(isOrgFavorite);
      const repos = filtered.filter(isRepoFavorite);

      cacheRef.current = {
        key: cacheKey,
        updatedAt: now,
        users,
        orgs,
        repos,
      };
      setFilteredUsers(users);
      setFilteredOrgs(orgs);
      setFilteredRepos(repos);
      setIsFiltering(false);
    }, 150);

    return () => {
      if (filterTimerRef.current) {
        window.clearTimeout(filterTimerRef.current);
      }
    };
  }, [favorites, favoritesKey, query]);

  const visibleItems =
    type === SEARCH_TYPES.USERS
      ? filteredUsers
      : type === SEARCH_TYPES.ORGANIZATIONS
        ? filteredOrgs
        : filteredRepos;
  const visibleIds = visibleItems.map((item) => item.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const updateUrl = React.useCallback(
    (nextType: TabType) => {
      const params = new URLSearchParams();
      if (nextType !== SEARCH_TYPES.USERS) {
        params.set("type", nextType);
      }
      const next = params.toString();
      const currentParams = new URLSearchParams(searchParams.toString());
      const current = currentParams.toString();
      if (next === current) return;
      router.replace(next ? `/favorites?${next}` : "/favorites");
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6">
      <SearchShell
        title="Favorites"
        description=""
        showSearch
        showTabs
        tabMode="button"
        showSearchButton={false}
        liveSearch
        tabsRightSlot={
          <div className="flex flex-wrap items-center gap-2">
            {!selectMode && visibleItems.length === 0 ? null : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectMode((prev) => !prev);
                  if (selectMode) {
                    setSelectedIds([]);
                  }
                }}
              >
                {selectMode ? "Cancel" : "Remove favorites"}
              </Button>
            )}
            {selectMode ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedIds(allVisibleSelected ? [] : visibleIds);
                  }}
                  disabled={visibleIds.length === 0}
                >
                  {allVisibleSelected ? "Clear selection" : "Select all"}
                </Button>
                <Button
                  type="button"
                  className="border border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    selectedIds.forEach((id) => dispatch(removeFavorite(id)));
                    setSelectedIds([]);
                    setSelectMode(false);
                    toast({
                      title: "Favorites updated",
                      description: "Selected items were removed.",
                    });
                  }}
                  disabled={selectedIds.length === 0}
                >
                  Remove selected {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
                </Button>
              </>
            ) : null}
          </div>
        }
        counts={{
          users: filteredUsers.length,
          orgs: filteredOrgs.length,
          repos: filteredRepos.length,
        }}
        initialQuery={query}
        initialType={type}
        onSearchSubmit={(nextQuery, nextType) => {
          setQuery(nextQuery);
          setType(nextType);
          updateUrl(nextType);
        }}
        onQueryChange={(nextQuery) => {
          setQuery(nextQuery);
        }}
        onTabSelect={(nextType) => {
          setType(nextType);
          setQuery("");
          setSelectedIds([]);
          setSelectMode(false);
          updateUrl(nextType);
        }}
      />

      <FavoritesList
        users={filteredUsers}
        orgs={filteredOrgs}
        repos={filteredRepos}
        activeType={type}
        isLoading={isFiltering}
        selectionEnabled={selectMode}
        selectedIds={selectedIds}
        onToggleSelect={(id) => {
          setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
          );
        }}
      />
    </div>
  );
}
