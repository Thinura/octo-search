import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils/cn";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16">
      <div className="flex items-center justify-between">
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

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Type a GitHub username or repository name.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input placeholder="Search GitHub..." type="text" />
          <Button>Search</Button>
        </CardContent>
      </Card>
    </main>
  );
}
