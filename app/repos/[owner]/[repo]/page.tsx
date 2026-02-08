import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchGitHub } from "@/lib/github/server";

type RepoPageProps = {
  params: { owner: string; repo: string };
};

type GitHubRepo = {
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: { name: string } | null;
  homepage: string | null;
  topics?: string[];
};

export default async function RepoPage({ params }: RepoPageProps) {
  const repo = await fetchGitHub<GitHubRepo>(`/repos/${params.owner}/${params.repo}`);

  return (
    <main className="w-full max-w-none flex flex-col gap-6 px-4 py-10 sm:px-8 sm:py-16 lg:px-16 xl:px-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{repo.full_name}</h1>
        {repo.description ? (
          <p className="mt-2 text-sm text-muted-foreground">{repo.description}</p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repository Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Stars:</span> {repo.stargazers_count}
            </p>
            <p>
              <span className="text-muted-foreground">Forks:</span> {repo.forks_count}
            </p>
            <p>
              <span className="text-muted-foreground">Open issues:</span> {repo.open_issues_count}
            </p>
            <p>
              <span className="text-muted-foreground">Language:</span> {repo.language ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">License:</span> {repo.license?.name ?? "—"}
            </p>
          </div>

          {repo.topics?.length ? (
            <div className="flex flex-wrap gap-2">
              {repo.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                >
                  {topic}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-4">
            <a
              className="text-sm text-primary hover:underline"
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub
            </a>
            {repo.homepage ? (
              <a
                className="text-sm text-primary hover:underline"
                href={repo.homepage}
                target="_blank"
                rel="noreferrer"
              >
                Homepage
              </a>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
