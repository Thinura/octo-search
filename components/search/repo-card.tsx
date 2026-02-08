"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FavoriteButton from "@/components/favorites/favorite-button";
import TruncateTooltip from "@/components/ui/truncate-tooltip";

export type RepoCardData = {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language?: string | null;
  visibility?: string | null;
};

export default function RepoCard({
  repo,
  selectionControl,
}: {
  repo: RepoCardData;
  selectionControl?: React.ReactNode;
}) {
  const router = useRouter();
  const [owner, name] = repo.full_name.split("/");
  const repoHref = `/repositories/${owner}/${name}`;

  return (
    <Card
      className="relative transition hover:border-foreground/20 h-full min-h-[132px] flex flex-col cursor-pointer"
      role="link"
      aria-label={`View repository ${repo.full_name}`}
      tabIndex={0}
      onClick={(event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest("a,button,input,textarea,select")) {
          return;
        }
        router.push(repoHref);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(repoHref);
        }
      }}
    >
      <Link
        href={repoHref}
        aria-label={`View repository ${repo.full_name}`}
        className="absolute inset-0 rounded-xl z-0 no-underline pointer-events-none"
      />
      <CardHeader className="relative z-10 px-3 pb-1 pt-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {selectionControl ? (
              <div className="pointer-events-auto flex items-center self-start mt-0.5">
                {selectionControl}
              </div>
            ) : null}
            <TruncateTooltip title={repo.full_name}>
              <CardTitle className="text-base line-clamp-1 no-underline">
                {repo.full_name}
              </CardTitle>
            </TruncateTooltip>
          </div>
          {repo.visibility === "public" ? (
            <span className="rounded-full border border-input bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
              Public
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="relative z-10 flex flex-1 flex-col gap-2 px-3 pb-2 pt-0 pointer-events-none">
        <TruncateTooltip title={repo.description ?? "No description"}>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.2rem]">
            {repo.description ?? "No description"}
          </p>
        </TruncateTooltip>
        <div className="relative z-30 mt-auto flex items-center justify-between text-xs text-muted-foreground pt-0 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span>★ {repo.stargazers_count}</span>
            {repo.language ? (
              <span className="rounded-full border border-input bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                {repo.language}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <a
              className="text-muted-foreground hover:text-foreground"
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              aria-label="View on GitHub"
              title="View on GitHub"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5a12 12 0 00-3.79 23.4c.6.1.82-.26.82-.58v-2.17c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.85 2.82 1.32 3.5 1.01.1-.78.42-1.32.77-1.63-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.82 1.1.82 2.22v3.28c0 .32.22.69.83.57A12 12 0 0012 .5z" />
              </svg>
            </a>
            <div
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
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
        </div>
      </CardContent>
    </Card>
  );
}
