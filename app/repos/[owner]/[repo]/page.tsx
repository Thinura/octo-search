type RepoPageProps = {
  params: { owner: string; repo: string };
};

export default function RepoPage({ params }: RepoPageProps) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Repository</h1>
      <p className="mt-2 text-zinc-600">
        {params.owner}/{params.repo}
      </p>
    </main>
  );
}
