"use client";

import * as React from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import ThemeProvider from "./theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { setFavorites } from "@/features/favorites/slice";

export default function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    let lastSerialized = "[]";
    try {
      const raw = window.localStorage.getItem("octo_favorites");
      if (raw) {
        const items = JSON.parse(raw) as Array<unknown>;
        store.dispatch(setFavorites(items as never[]));
        lastSerialized = raw;
      }
    } catch {
      // ignore storage read errors
    }

    const unsubscribe = store.subscribe(() => {
      try {
        const items = store.getState().favorites.items;
        const serialized = JSON.stringify(items);
        if (serialized === lastSerialized) return;
        lastSerialized = serialized;
        window.localStorage.setItem("octo_favorites", serialized);
      } catch {
        // ignore storage write errors
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Provider store={store}>
        <ToastProvider>{children}</ToastProvider>
      </Provider>
    </ThemeProvider>
  );
}
