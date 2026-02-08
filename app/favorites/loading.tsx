"use client";

import Skeleton from "@mui/material/Skeleton";

export default function FavoritesLoading() {
  return (
    <div className="w-full max-w-none flex flex-col gap-6 px-4 pt-3 pb-10 sm:px-8 sm:pt-4 sm:pb-16 lg:px-16 xl:px-12">
      <Skeleton variant="text" width={140} height={28} />
      <Skeleton variant="rounded" height={176} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={112} />
        ))}
      </div>
    </div>
  );
}
