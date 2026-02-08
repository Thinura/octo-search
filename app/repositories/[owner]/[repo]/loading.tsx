"use client";

import Skeleton from "@mui/material/Skeleton";

export default function RepositoryLoading() {
  return (
    <div className="w-full max-w-none flex flex-col gap-6 px-4 pt-3 pb-10 sm:px-8 sm:pt-4 sm:pb-16 lg:px-16 xl:px-12">
      <Skeleton variant="text" width="55%" height={32} />
      <Skeleton variant="text" width="70%" height={20} />
      <Skeleton variant="rounded" height={260} />
    </div>
  );
}
