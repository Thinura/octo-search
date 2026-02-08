import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type RepoCardData = {
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
};

export default function RepoCard({ repo }: { repo: RepoCardData }) {
  const [owner, name] = repo.full_name.split("/");

  return (
    <Card className="transition hover:border-foreground/20">
      <CardHeader>
        <CardTitle className="text-base">
          <Link href={`/repos/${owner}/${name}`} className="hover:underline">
            {repo.full_name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {repo.description ? (
          <p className="text-sm text-muted-foreground">{repo.description}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>★ {repo.stargazers_count}</span>
          <a href={repo.html_url} target="_blank" rel="noreferrer" className="hover:underline">
            View on GitHub
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
