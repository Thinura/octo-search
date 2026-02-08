"use client";

import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/use-toast";
import { TOAST_DESCRIPTIONS, TOAST_TITLES } from "@/lib/constants/messages";

type SearchShellProps = {
  initialQuery?: string;
  initialType?: "all" | "users" | "repos";
};

export default function SearchShell({ initialQuery = "", initialType = "all" }: SearchShellProps) {
  const { toast } = useToast();
  const [query, setQuery] = React.useState(initialQuery);
  const [type, setType] = React.useState<"all" | "users" | "repos">(initialType);

  React.useEffect(() => {
    setQuery(initialQuery);
    setType(initialType);
  }, [initialQuery, initialType]);

  return (
    <main className="w-full max-w-none min-h-screen flex flex-col px-4 py-10 sm:px-8 sm:py-16 lg:px-16 xl:px-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Octo Search</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Find GitHub users and repositories
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            className={cn(buttonVariants({ variant: "secondary" }))}
            href="https://docs.github.com/en/rest"
            target="_blank"
            rel="noreferrer"
          >
            Docs
          </a>
        </div>
      </div>

      <Card className="mt-10 w-full max-w-none">
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Type a GitHub username or repository name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="/search"
            method="get"
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              if (!query.trim()) {
                event.preventDefault();
                toast({
                  title: TOAST_TITLES.info,
                  description: TOAST_DESCRIPTIONS.emptySearch,
                });
              }
            }}
          >
            <Input
              name="q"
              placeholder="Search GitHub..."
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <input type="hidden" name="type" value={type} />
            <Button type="submit" className="w-full sm:w-auto">
              Search
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {(["all", "users", "repos"] as const).map((tab) => {
              const href = query.trim()
                ? `/search?q=${encodeURIComponent(query)}&type=${tab}`
                : `/search?type=${tab}`;

              return (
                <a
                  key={tab}
                  href={href}
                  className={cn(
                    buttonVariants({ variant: type === tab ? "secondary" : "ghost", size: "sm" }),
                    "capitalize",
                  )}
                  onClick={() => setType(tab)}
                >
                  {tab}
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
