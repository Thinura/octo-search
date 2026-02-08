export const TOAST_TITLES = {
  error: "Error",
  info: "Info",
  success: "Success",
} as const;

export const TOAST_DESCRIPTIONS = {
  genericError: "Something went wrong",
  emptySearch: "Enter a search term to continue.",
  rateLimited: "Rate limit hit. Add a GitHub token or try again later.",
  unauthorized: "Unauthorized. Check your GitHub token permissions.",
  notFound: "Resource not found.",
  serverError: "Server error. Please try again shortly.",
  networkError: "Network error. Check your connection and try again.",
  timeout: "Request timed out. Please try again.",
  dnsError: "Network error. Unable to resolve server.",
} as const;

export const TOAST_DUPLICATE_WINDOW_MS = 2500;
