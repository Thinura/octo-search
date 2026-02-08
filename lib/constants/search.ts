export const SEARCH_TYPES = {
  USERS: "users",
  ORGANIZATIONS: "organizations",
  REPOSITORIES: "repositories",
} as const;

export const SEARCH_TYPE_VALUES = [
  SEARCH_TYPES.USERS,
  SEARCH_TYPES.ORGANIZATIONS,
  SEARCH_TYPES.REPOSITORIES,
] as const;
