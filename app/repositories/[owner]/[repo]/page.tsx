import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FavoriteButton from "@/components/favorites/favorite-button";
import { fetchGitHub } from "@/lib/github/server";
import DetailShell from "@/components/layout/detail-shell";
import RepoIssues from "@/components/repositories/repo-issues";

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

type RepoPageProps = {
  params: Promise<{ owner: string; repo: string }>;
};

type GitHubRepo = {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  subscribers_count: number;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: { name: string } | null;
  homepage: string | null;
  topics?: string[];
};

export async function generateMetadata({ params }: RepoPageProps): Promise<Metadata> {
  try {
    const { owner, repo } = await params;
    const repoData = await fetchGitHub<GitHubRepo>(`/repos/${owner}/${repo}`, {
      revalidate: 300,
    });

    const title = repoData.full_name;
    const description = repoData.description ?? `GitHub repository ${repoData.full_name}.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/repositories/${owner}/${repo}`,
      },
      openGraph: {
        title,
        description,
        type: "website",
      },
    };
  } catch {
    return {
      title: "Repository not found",
      description: "This GitHub repository could not be found.",
    };
  }
}

export default async function RepositoryPage({ params }: RepoPageProps) {
  let repo: GitHubRepo;
  let ownerValue = "";
  let repoValue = "";
  let issues: Array<{
    id: number;
    number: number;
    title: string;
    html_url: string;
    pull_request?: unknown;
  }> = [];
  let languages: Array<{ name: string; percentage: number }> = [];
  let latestRelease: { name: string | null; tag_name: string; html_url: string } | null = null;
  try {
    const { owner, repo: repoName } = await params;
    ownerValue = owner;
    repoValue = repoName;
    repo = await fetchGitHub<GitHubRepo>(`/repos/${owner}/${repoName}`, {
      revalidate: 300,
    });
    const [languagesRaw, releaseRaw] = await Promise.all([
      fetchGitHub<Record<string, number>>(`/repos/${owner}/${repoName}/languages`, {
        revalidate: 300,
      }),
      fetchGitHub<{ name: string | null; tag_name: string; html_url: string }>(
        `/repos/${owner}/${repoName}/releases/latest`,
        { revalidate: 300 },
      ).catch(() => null),
    ]);
    const issuesRaw = await fetchGitHub<
      Array<{
        id: number;
        number: number;
        title: string;
        html_url: string;
        pull_request?: unknown;
      }>
    >(`/repos/${owner}/${repoName}/issues`, {
      params: { state: "open", per_page: "12" },
      revalidate: 60,
    });
    issues = issuesRaw.filter((issue) => !issue.pull_request);
    const totalBytes = Object.values(languagesRaw).reduce((sum, value) => sum + value, 0);
    languages = Object.entries(languagesRaw)
      .map(([name, value]) => ({
        name,
        percentage: totalBytes ? Math.round((value / totalBytes) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);
    latestRelease = releaseRaw;
  } catch {
    notFound();
  }
  return (
    <DetailShell>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{repo.full_name}</h1>
          {repo.description ? (
            <p className="mt-2 text-sm text-muted-foreground">{repo.description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <a
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent/40 hover:text-foreground"
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            aria-label="View on GitHub"
            title="View on GitHub"
          >
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5a12 12 0 00-3.79 23.4c.6.1.82-.26.82-.58v-2.17c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.85 2.82 1.32 3.5 1.01.1-.78.42-1.32.77-1.63-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.82 1.1.82 2.22v3.28c0 .32.22.69.83.57A12 12 0 0012 .5z" />
            </svg>
          </a>
          <FavoriteButton
            item={{
              kind: "repo",
              id: `repo:${repo.id}`,
              fullName: repo.full_name,
              description: repo.description,
              htmlUrl: repo.html_url,
              stars: repo.stargazers_count,
            }}
          />
        </div>
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
              <span className="text-muted-foreground">Watchers:</span> {repo.subscribers_count}
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
            <p>
              <span className="text-muted-foreground">Default branch:</span> {repo.default_branch}
            </p>
            <p>
              <span className="text-muted-foreground">Created:</span> {formatDate(repo.created_at)}
            </p>
            <p>
              <span className="text-muted-foreground">Updated:</span> {formatDate(repo.updated_at)}
            </p>
            <p>
              <span className="text-muted-foreground">Last push:</span> {formatDate(repo.pushed_at)}
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

          {repo.homepage ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Website:</span>{" "}
              <a
                className="text-primary hover:underline"
                href={repo.homepage}
                target="_blank"
                rel="noreferrer"
              >
                {repo.homepage}
              </a>
            </div>
          ) : null}

          {latestRelease ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Latest release:</span>{" "}
              <a
                className="text-primary hover:underline"
                href={latestRelease.html_url}
                target="_blank"
                rel="noreferrer"
              >
                {latestRelease.name ?? latestRelease.tag_name}
              </a>
            </div>
          ) : null}

          {languages.length ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Languages</p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {languages.map((language) => (
                  <span
                    key={language.name}
                    className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground"
                  >
                    {language.name} {language.percentage}%
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <RepoIssues
        issues={issues}
        totalCount={repo.open_issues_count}
        owner={ownerValue}
        repo={repoValue}
      />
    </DetailShell>
  );
}
