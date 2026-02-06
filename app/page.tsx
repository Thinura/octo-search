import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
        <Button variant="secondary">Docs</Button>
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
