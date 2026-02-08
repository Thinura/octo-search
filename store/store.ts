import { configureStore } from "@reduxjs/toolkit";
import { githubApi } from "@/features/github/api";
import favoritesReducer from "@/features/favorites/slice";

export const store = configureStore({
  reducer: {
    [githubApi.reducerPath]: githubApi.reducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(githubApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
