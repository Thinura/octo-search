import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FavoriteButton from "@/components/favorites/favorite-button";
import { fetchGitHub } from "@/lib/github/server";
import { normalizeUser, type NormalizedUser } from "@/lib/github/normalize";
import DetailShell from "@/components/layout/detail-shell";
import CopyButton from "@/components/ui/copy-button";
import ProfileRepos from "@/components/profile/profile-repos";
import type { RepoCardData } from "@/components/search/repo-card";

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

type OrganizationPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: OrganizationPageProps): Promise<Metadata> {
  try {
    const { username } = await params;
    const raw = await fetchGitHub<Record<string, unknown>>(`/orgs/${username}`, {
      revalidate: 300,
    });
    const org = normalizeUser(raw);

    const title = org.name ? `${org.name} (@${org.username})` : `@${org.username}`;
    const description = org.description ?? `GitHub organization ${org.username}.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/organizations/${username}`,
      },
      openGraph: {
        title,
        description,
        type: "profile",
      },
    };
  } catch {
    return {
      title: "Organization not found",
      description: "This GitHub organization could not be found.",
    };
  }
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  let org: NormalizedUser;
  let members: Array<{ login: string; avatar_url: string; html_url: string }> = [];
  let initialRepos: RepoCardData[] = [];
  try {
    const { username } = await params;
    const raw = await fetchGitHub<Record<string, unknown>>(`/orgs/${username}`, {
      revalidate: 300,
    });
    org = normalizeUser(raw);
    members = await fetchGitHub<Array<{ login: string; avatar_url: string; html_url: string }>>(
      `/orgs/${username}/members`,
      {
        params: { per_page: "6" },
        revalidate: 300,
      },
    );
    const reposRaw = await fetchGitHub<Array<Record<string, unknown>>>(`/orgs/${username}/repos`, {
      params: { per_page: "12", page: "1", sort: "updated" },
      revalidate: 60,
    });
    initialRepos = reposRaw.map((repo) => ({
      id: Number(repo["id"] ?? 0),
      full_name: String(repo["full_name"] ?? ""),
      description: (repo["description"] as string | null) ?? null,
      html_url: String(repo["html_url"] ?? ""),
      stargazers_count: Number(repo["stargazers_count"] ?? 0),
      language: (repo["language"] as string | null) ?? null,
      visibility: (repo["visibility"] as string | null) ?? null,
    }));
  } catch {
    notFound();
  }
  return (
    <DetailShell>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <img src={org.avatarUrl} alt={org.username} className="h-16 w-16 rounded-full" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{org.name ?? org.username}</h1>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              Organization
            </span>
            {org.siteAdmin ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                GitHub Staff
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Username: {org.username}</span>
            <CopyButton value={org.username} label="Copy username" />
          </div>
        </div>
        <FavoriteButton
          item={{
            kind: "org",
            id: `org:${org.id}`,
            username: org.username,
            avatarUrl: org.avatarUrl,
            htmlUrl: org.htmlUrl,
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {org.description ? <p>{org.description}</p> : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Location:</span> {org.location ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Public repos:</span> {org.publicRepos}
            </p>
            <p>
              <span className="text-muted-foreground">Gists:</span> {org.publicGists}
            </p>
            <p>
              <span className="text-muted-foreground">Followers:</span> {org.followers} ·{" "}
              <span className="text-muted-foreground">Following:</span> {org.following}
            </p>
            <p>
              <span className="text-muted-foreground">Hireable:</span>{" "}
              {org.hireable === null ? "—" : org.hireable ? "Yes" : "No"}
            </p>
            <p>
              <span className="text-muted-foreground">Blog:</span>{" "}
              {org.blog ? (
                <a
                  className="text-primary hover:underline"
                  href={org.blog}
                  target="_blank"
                  rel="noreferrer"
                >
                  {org.blog}
                </a>
              ) : (
                "—"
              )}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {org.email ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Created:</span> {formatDate(org.createdAt)}
            </p>
            <p>
              <span className="text-muted-foreground">Updated:</span> {formatDate(org.updatedAt)}
            </p>
          </div>
          {org.twitterUsername ? (
            <a
              className="text-sm text-primary hover:underline"
              href={`https://twitter.com/${org.twitterUsername}`}
              target="_blank"
              rel="noreferrer"
            >
              @{org.twitterUsername} on Twitter
            </a>
          ) : null}
          {org.email ? (
            <a className="text-sm text-primary hover:underline" href={`mailto:${org.email}`}>
              {org.email}
            </a>
          ) : null}
          {members.length ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Members</p>
              <div className="flex flex-wrap gap-3">
                {members.map((member) => (
                  <a
                    key={member.login}
                    href={member.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <img
                      src={member.avatar_url}
                      alt={member.login}
                      className="h-6 w-6 rounded-full"
                    />
                    {member.login}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
          {org.blog ? (
            <a
              className="text-sm text-primary hover:underline"
              href={org.blog}
              target="_blank"
              rel="noreferrer"
            >
              {org.blog}
            </a>
          ) : null}
        </CardContent>
      </Card>

      <ProfileRepos
        owner={org.username}
        kind="org"
        initialRepos={initialRepos}
        publicCount={org.publicRepos}
      />
    </DetailShell>
  );
}
