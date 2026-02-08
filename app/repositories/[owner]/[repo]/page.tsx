import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FavoriteButton from "@/components/favorites/favorite-button";
import { fetchGitHub } from "@/lib/github/server";
import DetailShell from "@/components/layout/detail-shell";

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
  let issues: Array<{ id: number; title: string; html_url: string; pull_request?: unknown }> = [];
  let languages: Array<{ name: string; percentage: number }> = [];
  let latestRelease: { name: string | null; tag_name: string; html_url: string } | null = null;
  try {
    const { owner, repo: repoName } = await params;
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
      Array<{ id: number; title: string; html_url: string; pull_request?: unknown }>
    >(`/repos/${owner}/${repoName}/issues`, {
      params: { state: "open", per_page: "5" },
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

          {issues.length ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Open issues (latest)</p>
              <ul className="space-y-1 text-sm">
                {issues.map((issue) => (
                  <li key={issue.id}>
                    <a
                      className="text-primary hover:underline"
                      href={issue.html_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {issue.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </DetailShell>
  );
}
