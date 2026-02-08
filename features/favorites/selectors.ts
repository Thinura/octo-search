import type { RootState } from "@/store/store";

export const selectFavorites = (state: RootState) => state.favorites.items;

export const selectIsFavorite = (id: string) => (state: RootState) =>
  state.favorites.items.some((item) => item.id === id);
