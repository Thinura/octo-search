import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchGitHub } from "@/lib/github/server";

type UserPageProps = {
  params: { login: string };
};

type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
};

export default async function UserPage({ params }: UserPageProps) {
  const user = await fetchGitHub<GitHubUser>(`/users/${params.login}`);

  return (
    <main className="w-full max-w-none flex flex-col gap-6 px-4 py-10 sm:px-8 sm:py-16 lg:px-16 xl:px-12">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <img src={user.avatar_url} alt={user.login} className="h-16 w-16 rounded-full" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user.name ?? user.login}</h1>
          <a
            className="text-sm text-muted-foreground hover:underline"
            href={user.html_url}
            target="_blank"
            rel="noreferrer"
          >
            @{user.login}
          </a>
        </div>
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
              <span className="text-muted-foreground">Repos:</span> {user.public_repos}
            </p>
            <p>
              <span className="text-muted-foreground">Followers:</span> {user.followers} ·{" "}
              <span className="text-muted-foreground">Following:</span> {user.following}
            </p>
          </div>
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
    </main>
  );
}
