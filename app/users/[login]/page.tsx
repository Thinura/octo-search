type UserPageProps = {
  params: { login: string };
};

export default function UserPage({ params }: UserPageProps) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">User</h1>
      <p className="mt-2 text-zinc-600">Login: {params.login}</p>
    </main>
  );
}
