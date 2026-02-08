export const SEARCH_TYPES = ["users", "organizations", "repositories"] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

export function normalizeSearchType(value?: string | null): SearchType {
  if (!value) return "users";
  if (value === "orgs") return "organizations";
  if (value === "repos") return "repositories";
  if (SEARCH_TYPES.includes(value as SearchType)) {
    return value as SearchType;
  }
  return "users";
}
