export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Octo Search</h1>
      <p className="mt-3 text-lg text-zinc-600">
        Search GitHub users and repositories. Start by typing a username or repo name.
      </p>
      <div className="mt-8">
        <input
          className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-base outline-none focus:border-zinc-400"
          placeholder="Search GitHub..."
          type="text"
        />
      </div>
    </main>
  );
}
