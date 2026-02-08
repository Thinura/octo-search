import SearchShell from "@/components/search/search-shell";
import RepoCard, { RepoCardData } from "@/components/search/repo-card";
import UserCard, { UserCardData } from "@/components/search/user-card";
import { fetchGitHub } from "@/lib/github/server";

type SearchPageProps = {
  searchParams: Promise<{ q?: string; type?: "all" | "users" | "repos" }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() ?? "";
  const type = resolvedParams.type ?? "all";

  let users: UserCardData[] = [];
  let repos: RepoCardData[] = [];
  let error: string | null = null;

  if (query) {
    try {
      if (type === "all" || type === "users") {
        const usersResult = await fetchGitHub<{ items: UserCardData[] }>("/search/users", {
          q: query,
          per_page: "12",
        });
        users = usersResult.items;
      }

      if (type === "all" || type === "repos") {
        const reposResult = await fetchGitHub<{ items: RepoCardData[] }>("/search/repositories", {
          q: query,
          per_page: "12",
          sort: "stars",
        });
        repos = reposResult.items;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load results.";
    }
  }

  return (
    <div className="w-full max-w-none flex flex-col gap-10 px-4 py-10 sm:px-8 sm:py-16 lg:px-16 xl:px-12">
      <SearchShell initialQuery={query} initialType={type} />

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {query ? (
        <div className="grid gap-8">
          {(type === "all" || type === "users") && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Users</h2>
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users found.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {users.map((user) => (
                    <UserCard key={user.login} user={user} />
                  ))}
                </div>
              )}
            </section>
          )}

          {(type === "all" || type === "repos") && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Repositories</h2>
              {repos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No repositories found.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {repos.map((repo) => (
                    <RepoCard key={repo.full_name} repo={repo} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
}
