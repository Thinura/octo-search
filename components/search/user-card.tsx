import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type UserCardData = {
  login: string;
  avatar_url: string;
  html_url: string;
};

export default function UserCard({ user }: { user: UserCardData }) {
  return (
    <Card className="transition hover:border-foreground/20">
      <CardHeader>
        <CardTitle className="text-base">
          <Link href={`/users/${user.login}`} className="hover:underline">
            {user.login}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <img
          src={user.avatar_url}
          alt={`${user.login} avatar`}
          className="h-10 w-10 rounded-full"
        />
        <a
          className="text-sm text-muted-foreground hover:underline"
          href={user.html_url}
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub
        </a>
      </CardContent>
    </Card>
  );
}
