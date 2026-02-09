const baseUrl = process.env.GITHUB_API_BASE ?? "https://api.github.com";
const token = process.env.GH_API_TOKEN ?? process.env.GITHUB_TOKEN;

type FetchGitHubOptions = {
  params?: Record<string, string>;
  revalidate?: number;
};

export async function fetchGitHub<T>(path: string, options: FetchGitHubOptions = {}) {
  const url = new URL(baseUrl.replace(/\/$/, "") + path);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: options.revalidate ? { revalidate: options.revalidate } : undefined,
  });

  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");
    let message = `GitHub API error: ${response.status}`;

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (data?.message) {
        message = data.message;
      }
    }

    if (response.status === 401) {
      message = "GitHub API unauthorized. Check your GH_API_TOKEN.";
    }

    if (response.status === 403 && remaining === "0") {
      const resetTime = reset ? new Date(Number(reset) * 1000).toUTCString() : null;
      message = resetTime
        ? `GitHub rate limit exceeded. Try again after ${resetTime} or add a GH_API_TOKEN.`
        : "GitHub rate limit exceeded. Add a GH_API_TOKEN or try again later.";
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}
