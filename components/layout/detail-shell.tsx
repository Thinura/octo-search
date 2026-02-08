import AppHeader from "@/components/layout/app-header";

type DetailShellProps = {
  children: React.ReactNode;
};

export default function DetailShell({ children }: DetailShellProps) {
  return (
    <main className="w-full max-w-none flex flex-col gap-6 px-4 pt-3 pb-10 sm:px-8 sm:pt-4 sm:pb-16 lg:px-16 xl:px-12">
      <AppHeader />
      {children}
    </main>
  );
}
