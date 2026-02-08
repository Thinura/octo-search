import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SearchPageClient from "@/components/search/search-page-client";
import { normalizeSearchType } from "@/lib/search/types";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Find GitHub users, organizations, and repositories",
  description: "Search GitHub users, organizations, and repositories in one place.",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const normalizedType = normalizeSearchType(resolvedParams?.type);
  if (!resolvedParams?.type || resolvedParams.type !== normalizedType) {
    const queryParam = resolvedParams?.q?.trim();
    const target = queryParam
      ? `/?type=${normalizedType}&q=${encodeURIComponent(queryParam)}`
      : `/?type=${normalizedType}`;
    redirect(target);
  }

  return (
    <SearchPageClient initialQuery={resolvedParams?.q?.trim() ?? ""} initialType={normalizedType} />
  );
}
