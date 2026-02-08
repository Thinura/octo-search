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

type UserPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  try {
    const { username } = await params;
    const raw = await fetchGitHub<Record<string, unknown>>(`/users/${username.toLowerCase()}`, {
      revalidate: 300,
    });
    const user = normalizeUser(raw);

    const title = user.name ? `${user.name} (@${user.username})` : `@${user.username}`;
    const description = user.bio ?? `GitHub profile for ${user.username}.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/users/${username}`,
      },
      openGraph: {
        title,
        description,
        type: "profile",
      },
    };
  } catch {
    return {
      title: "User not found",
      description: "This GitHub user could not be found.",
    };
  }
}

export default async function UserPage({ params }: UserPageProps) {
  let user: NormalizedUser;
  let initialRepos: RepoCardData[] = [];
  try {
    const { username } = await params;
    const raw = await fetchGitHub<Record<string, unknown>>(`/users/${username.toLowerCase()}`, {
      revalidate: 300,
    });
    user = normalizeUser(raw);
    const reposRaw = await fetchGitHub<Array<Record<string, unknown>>>(
      `/users/${username.toLowerCase()}/repos`,
      {
        params: { per_page: "12", page: "1", sort: "updated" },
        revalidate: 60,
      },
    );
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
        <img src={user.avatarUrl} alt={user.username} className="h-16 w-16 rounded-full" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{user.name ?? user.username}</h1>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              User
            </span>
            {user.siteAdmin ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                GitHub Staff
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Username: {user.username}</span>
            <CopyButton value={user.username} label="Copy username" />
          </div>
        </div>
        <FavoriteButton
          item={{
            kind: "user",
            id: `user:${user.id}`,
            username: user.username,
            avatarUrl: user.avatarUrl,
            htmlUrl: user.htmlUrl,
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {user.bio ? <p>{user.bio}</p> : null}
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Location:</span> {user.location ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Company:</span> {user.company ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Blog:</span>{" "}
              {user.blog ? (
                <a
                  className="text-primary hover:underline"
                  href={user.blog}
                  target="_blank"
                  rel="noreferrer"
                >
                  {user.blog}
                </a>
              ) : (
                "—"
              )}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {user.email ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Repos:</span> {user.publicRepos}
            </p>
            <p>
              <span className="text-muted-foreground">Gists:</span> {user.publicGists}
            </p>
            <p>
              <span className="text-muted-foreground">Followers:</span> {user.followers} ·{" "}
              <span className="text-muted-foreground">Following:</span> {user.following}
            </p>
            <p>
              <span className="text-muted-foreground">Hireable:</span>{" "}
              {user.hireable === null ? "—" : user.hireable ? "Yes" : "No"}
            </p>
            <p>
              <span className="text-muted-foreground">Created:</span> {formatDate(user.createdAt)}
            </p>
            <p>
              <span className="text-muted-foreground">Updated:</span> {formatDate(user.updatedAt)}
            </p>
          </div>
          {user.twitterUsername ? (
            <a
              className="text-sm text-primary hover:underline"
              href={`https://twitter.com/${user.twitterUsername}`}
              target="_blank"
              rel="noreferrer"
            >
              @{user.twitterUsername} on Twitter
            </a>
          ) : null}
          {user.email ? (
            <a className="text-sm text-primary hover:underline" href={`mailto:${user.email}`}>
              {user.email}
            </a>
          ) : null}
          {user.blog ? (
            <a
              className="text-sm text-primary hover:underline"
              href={user.blog}
              target="_blank"
              rel="noreferrer"
            >
              {user.blog}
            </a>
          ) : null}
        </CardContent>
      </Card>

      <ProfileRepos
        owner={user.username}
        kind="user"
        initialRepos={initialRepos}
        publicCount={user.publicRepos}
      />
    </DetailShell>
  );
}
