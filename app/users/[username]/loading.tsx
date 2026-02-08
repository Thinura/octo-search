"use client";

import Skeleton from "@mui/material/Skeleton";

export default function UserLoading() {
  return (
    <div className="w-full max-w-none flex flex-col gap-6 px-4 pt-3 pb-10 sm:px-8 sm:pt-4 sm:pb-16 lg:px-16 xl:px-12">
      <Skeleton variant="text" width={160} height={28} />
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="40%" height={20} />
        </div>
        <Skeleton variant="rounded" width={36} height={36} />
      </div>
      <Skeleton variant="rounded" height={220} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={112} />
        ))}
      </div>
    </div>
  );
}
