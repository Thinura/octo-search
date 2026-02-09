import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import FavoriteButton from "@/components/favorites/favorite-button";
import TruncateTooltip from "@/components/ui/truncate-tooltip";

export type UserCardData = {
  id: number;
  username: string;
  avatar_url: string;
  html_url: string;
};

export default function UserCard({
  user,
  entityType = "user",
  selectionControl,
}: {
  user: UserCardData;
  entityType?: "user" | "org";
  selectionControl?: React.ReactNode;
}) {
  const profileHref =
    entityType === "org" ? `/organizations/${user.username}` : `/users/${user.username}`;
  return (
    <Card className="relative transition hover:border-foreground/20 h-full min-h-[96px] flex flex-col">
      <Link
        href={profileHref}
        aria-label={`View ${entityType === "org" ? "organization" : "user"} ${user.username}`}
        className="absolute inset-0 rounded-xl z-10"
      />
      <CardContent className="relative z-20 flex h-full items-center justify-between gap-3 px-3 py-3 pointer-events-none">
        <div className="flex items-center gap-3 min-w-0">
          {selectionControl ? (
            <div className="pointer-events-auto flex items-center self-start mt-0.5">
              {selectionControl}
            </div>
          ) : null}
          <img
            src={user.avatar_url}
            alt={`${user.username} avatar`}
            className="h-16 w-16 rounded-full"
          />
          <TruncateTooltip title={user.username}>
            <span className="text-base font-semibold text-foreground line-clamp-1">
              {user.username}
            </span>
          </TruncateTooltip>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <a
            className="text-muted-foreground hover:text-foreground"
            href={user.html_url}
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
              kind: entityType,
              id: `${entityType}:${user.id}`,
              username: user.username,
              avatarUrl: user.avatar_url,
              htmlUrl: user.html_url,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
