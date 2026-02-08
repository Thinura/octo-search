import { NextResponse } from "next/server";
import { fetchGitHub } from "@/lib/github/server";
import { normalizeSearchType } from "@/lib/search/types";
import { normalizeSearchUserItem } from "@/lib/github/normalize";

const PER_PAGE_MAX = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const type = normalizeSearchType(searchParams.get("type"));
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const perPageRaw = Number.parseInt(searchParams.get("per_page") ?? "12", 10) || 12;
  const perPage = Math.min(Math.max(perPageRaw, 1), PER_PAGE_MAX);

  if (!query) {
    return NextResponse.json({ items: [], total_count: 0, page }, { status: 200 });
  }

  try {
    if (type === "repositories") {
      const data = await fetchGitHub<{ items: unknown[]; total_count: number }>(
        "/search/repositories",
        {
          params: {
            q: query,
            per_page: String(perPage),
            page: String(page),
            sort: "stars",
          },
          revalidate: 30,
        },
      );

      return NextResponse.json({ ...data, page });
    }

    const usersQuery = type === "organizations" ? `${query} type:org` : query;
    const data = await fetchGitHub<{ items: Array<Record<string, unknown>>; total_count: number }>(
      "/search/users",
      {
        params: {
          q: usersQuery,
          per_page: String(perPage),
          page: String(page),
        },
        revalidate: 30,
      },
    );

    const items = data.items.map((item) => normalizeSearchUserItem(item));

    return NextResponse.json({ ...data, items, page });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load results.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
