type GitHubUserRaw = { [key: string]: unknown };

export type NormalizedUser = {
  id: number;
  username: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  email: string | null;
  twitterUsername: string | null;
  hireable: boolean | null;
  siteAdmin: boolean | null;
  publicGists: number;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string | null;
  updatedAt: string | null;
  description?: string | null;
};

export function normalizeUser(raw: GitHubUserRaw): NormalizedUser {
  return {
    id: Number(raw["id"] ?? 0),
    username: String(raw["login"] ?? ""),
    name: (raw["name"] as string | null) ?? null,
    avatarUrl: String(raw["avatar_url"] ?? ""),
    htmlUrl: String(raw["html_url"] ?? ""),
    bio: (raw["bio"] as string | null) ?? null,
    location: (raw["location"] as string | null) ?? null,
    company: (raw["company"] as string | null) ?? null,
    blog: (raw["blog"] as string | null) ?? null,
    email: (raw["email"] as string | null) ?? null,
    twitterUsername: (raw["twitter_username"] as string | null) ?? null,
    hireable: (raw["hireable"] as boolean | null) ?? null,
    siteAdmin: (raw["site_admin"] as boolean | null) ?? null,
    publicGists: Number(raw["public_gists"] ?? 0),
    publicRepos: Number(raw["public_repos"] ?? 0),
    followers: Number(raw["followers"] ?? 0),
    following: Number(raw["following"] ?? 0),
    createdAt: (raw["created_at"] as string | null) ?? null,
    updatedAt: (raw["updated_at"] as string | null) ?? null,
    description: (raw["description"] as string | null) ?? null,
  };
}

export function normalizeSearchUserItem(raw: GitHubUserRaw) {
  return {
    id: Number(raw["id"] ?? 0),
    username: String(raw["login"] ?? ""),
    avatar_url: String(raw["avatar_url"] ?? ""),
    html_url: String(raw["html_url"] ?? ""),
  };
}
