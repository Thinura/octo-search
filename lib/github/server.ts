const baseUrl = process.env.GITHUB_API_BASE ?? "https://api.github.com";
const token = process.env.GITHUB_TOKEN;

export async function fetchGitHub<T>(path: string, params?: Record<string, string>) {
  const url = new URL(baseUrl.replace(/\/$/, "") + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return (await response.json()) as T;
}
