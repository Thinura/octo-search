"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addFavorite, removeFavorite } from "@/features/favorites/slice";
import { selectIsFavorite } from "@/features/favorites/selectors";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type FavoriteButtonProps = {
  item:
    | {
        kind: "user";
        id: string;
        username: string;
        avatarUrl: string;
        htmlUrl: string;
      }
    | {
        kind: "org";
        id: string;
        username: string;
        avatarUrl: string;
        htmlUrl: string;
      }
    | {
        kind: "repo";
        id: string;
        fullName: string;
        description: string | null;
        htmlUrl: string;
        stars: number;
      };
};

export default function FavoriteButton({ item }: FavoriteButtonProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const actualIsFavorite = useAppSelector(selectIsFavorite(item.id));
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isFavorite = mounted ? actualIsFavorite : false;

  return (
    <Button
      type="button"
      variant="icon"
      size="icon"
      className="border-0 bg-transparent shadow-none hover:bg-accent/40"
      onClick={() => {
        const label =
          item.kind === "repo"
            ? item.fullName
            : item.kind === "org"
              ? `@${item.username} (organization)`
              : `@${item.username} (user)`;
        if (isFavorite) {
          dispatch(removeFavorite(item.id));
          toast({
            title: "Removed from favorites",
            description: label,
          });
        } else {
          dispatch(addFavorite(item));
          toast({
            title: "Added to favorites",
            description: label,
          });
        }
      }}
      aria-label={isFavorite ? "Unfavorite" : "Favorite"}
      title={isFavorite ? "Unfavorite" : "Favorite"}
      suppressHydrationWarning
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
      </svg>
    </Button>
  );
}
