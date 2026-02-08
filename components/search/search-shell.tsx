"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AppHeader from "@/components/layout/app-header";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/use-toast";
import { TOAST_DESCRIPTIONS, TOAST_TITLES } from "@/lib/constants/messages";
import type { SearchType } from "@/lib/search/types";

type SearchShellProps = {
  initialQuery?: string;
  initialType?: SearchType;
  counts?: {
    users?: number;
    orgs?: number;
    repos?: number;
  };
};

export default function SearchShell({
  initialQuery = "",
  initialType = "users",
  counts,
  title = "Find GitHub users, organizations, and repositories fast",
  description = "Search users, organizations, and repositories from one simple query.",
  showSearch = true,
  showTabs = true,
  showHeader = true,
  tabs = ["users", "organizations", "repositories"],
  tabLabels,
  inputPlaceholder = "Search...",
  showSearchButton = true,
  showSearchIcon = true,
  liveSearch = false,
  tabMode = "link",
  onSearchSubmit,
  onQueryChange,
  onTabSelect,
  tabsRightSlot,
}: SearchShellProps & {
  title?: string;
  description?: string;
  showSearch?: boolean;
  showTabs?: boolean;
  showHeader?: boolean;
  tabs?: SearchType[];
  tabLabels?: Partial<Record<SearchType, string>>;
  inputPlaceholder?: string;
  showSearchButton?: boolean;
  showSearchIcon?: boolean;
  liveSearch?: boolean;
  tabMode?: "link" | "button";
  onSearchSubmit?: (query: string, type: SearchType) => void;
  onQueryChange?: (query: string) => void;
  onTabSelect?: (type: SearchType) => void;
  tabsRightSlot?: React.ReactNode;
}) {
  const { toast } = useToast();
  const [query, setQuery] = React.useState(initialQuery);
  const [type, setType] = React.useState<SearchType>(initialType);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const searchTimerRef = React.useRef<number | null>(null);

  const handleSubmit = React.useCallback(
    (
      event?: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>,
      force?: boolean,
    ) => {
      event?.preventDefault();
      if (!force && document.activeElement !== inputRef.current) {
        return;
      }
      const trimmed = query.trim();
      if (!trimmed) {
        toast({
          title: TOAST_TITLES.info,
          description: TOAST_DESCRIPTIONS.emptySearch,
        });
        return;
      }
      if (onSearchSubmit) {
        onSearchSubmit(trimmed, type);
        return;
      }
      startTransition(() => {
        const params = new URLSearchParams();
        params.set("type", type);
        params.set("q", trimmed);
        const next = params.toString();
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.delete("page");
        if (next === currentParams.toString()) return;
        router.push(`/?${next}`);
      });
    },
    [onSearchSubmit, query, router, searchParams, startTransition, toast, type],
  );

  React.useEffect(() => {
    setQuery(initialQuery);
    setType(initialType);
  }, [initialQuery, initialType]);

  React.useEffect(() => {
    if (!liveSearch) return;
    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = window.setTimeout(() => {
      const trimmed = query.trim();
      if (onSearchSubmit) {
        onSearchSubmit(trimmed, type);
        return;
      }
      startTransition(() => {
        const params = new URLSearchParams();
        params.set("type", type);
        if (trimmed) {
          params.set("q", trimmed);
        }
        const next = params.toString();
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.delete("page");
        if (next === currentParams.toString()) return;
        router.push(`/?${next}`);
      });
    }, 400);
    return () => {
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current);
      }
    };
  }, [liveSearch, onSearchSubmit, query, router, searchParams, startTransition, type]);

  return (
    <section className="w-full flex flex-col gap-5">
      {showHeader ? <AppHeader /> : null}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      </div>

      {showSearch ? (
        <Card className="w-full max-w-none">
          <CardContent className="pt-6">
            <form
              action="/"
              method="get"
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={handleSubmit}
            >
              <div className="relative flex-1">
                {showSearchIcon ? (
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
                ) : null}
                <Input
                  ref={inputRef}
                  name="q"
                  placeholder={inputPlaceholder}
                  type="search"
                  value={query}
                  onChange={(event) => {
                    const next = event.target.value;
                    setQuery(next);
                    onQueryChange?.(next);
                  }}
                  onFocus={(event) => {
                    const value = event.currentTarget.value;
                    event.currentTarget.setSelectionRange(value.length, value.length);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      if (!liveSearch) {
                        handleSubmit(event, true);
                      } else {
                        event.preventDefault();
                      }
                    }
                  }}
                  className={`${showSearchIcon ? "pl-10" : ""} pr-10`}
                />
                {query.trim().length > 0 ? (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                    aria-label="Clear search"
                    title="Clear"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                  >
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
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                ) : null}
              </div>
              <input type="hidden" name="type" value={type} />
              {showSearchButton ? (
                <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Searching...
                    </span>
                  ) : (
                    "Search"
                  )}
                </Button>
              ) : null}
            </form>
            {showTabs ? (
              <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {tabs.map((tab) => {
                    const base = query.trim()
                      ? `/?type=${tab}&q=${encodeURIComponent(query)}`
                      : `/?type=${tab}`;
                    const href = base;
                    const count =
                      tab === "users"
                        ? counts?.users
                        : tab === "organizations"
                          ? counts?.orgs
                          : counts?.repos;
                    const tabLabel =
                      tabLabels?.[tab] ??
                      (tab === "users"
                        ? "Users"
                        : tab === "organizations"
                          ? "Organizations"
                          : "Repositories");
                    const label =
                      count === undefined ? tabLabel : `${tabLabel} (${count.toLocaleString()})`;
                    const className = cn(
                      buttonVariants({
                        variant: type === tab ? "secondary" : "ghost",
                        size: "sm",
                      }),
                      "capitalize",
                    );

                    if (tabMode === "button") {
                      return (
                        <button
                          key={tab}
                          type="button"
                          className={className}
                          onClick={() => {
                            setType(tab);
                            onTabSelect?.(tab);
                          }}
                        >
                          {label}
                        </button>
                      );
                    }

                    return (
                      <a
                        key={tab}
                        href={href}
                        className={className}
                        onClick={() => {
                          setType(tab);
                          onTabSelect?.(tab);
                          inputRef.current?.blur();
                        }}
                      >
                        {label}
                      </a>
                    );
                  })}
                </div>
                {tabsRightSlot ? (
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {tabsRightSlot}
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
