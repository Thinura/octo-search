import { NextResponse } from "next/server";
import { fetchGitHub } from "@/lib/github/server";

const PER_PAGE_MAX = 100;

type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  pull_request?: unknown;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner")?.trim() ?? "";
  const repo = searchParams.get("repo")?.trim() ?? "";
  const query = searchParams.get("q")?.trim() ?? "";
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const perPageRaw = Number.parseInt(searchParams.get("per_page") ?? "12", 10) || 12;
  const perPage = Math.min(Math.max(perPageRaw, 1), PER_PAGE_MAX);

  if (!owner || !repo) {
    return NextResponse.json({ items: [], total_count: 0, page }, { status: 200 });
  }

  try {
    if (query) {
      const search = await fetchGitHub<{ items: GitHubIssue[]; total_count: number }>(
        "/search/issues",
        {
          params: {
            q: `${query} repo:${owner}/${repo} type:issue state:open`,
            per_page: String(perPage),
            page: String(page),
          },
          revalidate: 30,
        },
      );

      const items = search.items.map((issue) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        html_url: issue.html_url,
      }));

      return NextResponse.json({ items, total_count: search.total_count, page });
    }

    const issues = await fetchGitHub<GitHubIssue[]>(`/repos/${owner}/${repo}/issues`, {
      params: {
        state: "open",
        per_page: String(perPage),
        page: String(page),
      },
      revalidate: 30,
    });

    const items = issues
      .filter((issue) => !issue.pull_request)
      .map((issue) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        html_url: issue.html_url,
      }));

    return NextResponse.json({ items, page });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load issues.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
