import { NextResponse } from "next/server";
import { fetchGitHub } from "@/lib/github/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") ?? "user";
  const name = searchParams.get("name") ?? "";
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const perPage = Math.min(Number.parseInt(searchParams.get("per_page") ?? "12", 10) || 12, 100);

  if (!name) {
    return NextResponse.json({ items: [], page }, { status: 200 });
  }

  try {
    const path = kind === "org" ? `/orgs/${name}/repos` : `/users/${name}/repos`;
    const data = await fetchGitHub<Array<Record<string, unknown>>>(path, {
      params: {
        per_page: String(perPage),
        page: String(page),
        sort: "updated",
      },
      revalidate: 60,
    });

    const items = data.map((repo) => ({
      id: Number(repo["id"] ?? 0),
      full_name: String(repo["full_name"] ?? ""),
      description: (repo["description"] as string | null) ?? null,
      html_url: String(repo["html_url"] ?? ""),
      stargazers_count: Number(repo["stargazers_count"] ?? 0),
      visibility: String(repo["visibility"] ?? "public"),
      language: (repo["language"] as string | null) ?? null,
    }));

    return NextResponse.json({ items, page });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load repositories.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
