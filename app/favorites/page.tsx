import FavoritesPanel from "@/components/favorites/favorites-panel";

export default function FavoritesPage() {
  return (
    <main className="w-full flex flex-col gap-8 px-4 pt-3 pb-10 sm:px-8 sm:pt-4 sm:pb-16 lg:px-16 xl:px-12">
      <FavoritesPanel />
    </main>
  );
}
