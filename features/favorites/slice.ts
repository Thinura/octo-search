import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FavoriteItem =
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

type FavoritesState = {
  items: FavoriteItem[];
};

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    setFavorites(state, action: PayloadAction<FavoriteItem[]>) {
      state.items = action.payload;
    },
    addFavorite(state, action: PayloadAction<FavoriteItem>) {
      const exists = state.items.some((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFavorite(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearFavorites(state) {
      state.items = [];
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions;

export default favoritesSlice.reducer;
