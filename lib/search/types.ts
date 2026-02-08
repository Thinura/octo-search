import { SEARCH_TYPES, SEARCH_TYPE_VALUES } from "@/lib/constants/search";

export type SearchType = (typeof SEARCH_TYPE_VALUES)[number];

export function normalizeSearchType(value?: string | null): SearchType {
  if (!value) return SEARCH_TYPES.USERS;
  if (value === "orgs") return SEARCH_TYPES.ORGANIZATIONS;
  if (value === "repos") return SEARCH_TYPES.REPOSITORIES;
  if (SEARCH_TYPE_VALUES.includes(value as SearchType)) {
    return value as SearchType;
  }
  return SEARCH_TYPES.USERS;
}
