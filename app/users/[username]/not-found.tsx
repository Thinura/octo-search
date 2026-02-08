"use client";

export default function UserNotFound() {
  return (
    <main className="w-full max-w-none flex flex-col gap-4 px-4 py-10 sm:px-8 sm:py-16 lg:px-16 xl:px-12">
      <h1 className="text-2xl font-semibold tracking-tight">User not found</h1>
      <p className="text-sm text-muted-foreground">We couldn&apos;t find that GitHub user.</p>
      <p className="text-sm text-muted-foreground">
        If you are seeing rate limit errors, add a GitHub token in <code>.env.local</code>:
        <br />
        <code>GITHUB_TOKEN=your_token_here</code>
      </p>
      <button
        type="button"
        className="text-left text-sm text-muted-foreground hover:underline"
        onClick={() => window.history.back()}
      >
        ← Back
      </button>
    </main>
  );
}
