"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import ThemeProvider from "./theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Provider store={store}>
        <ToastProvider>{children}</ToastProvider>
      </Provider>
    </ThemeProvider>
  );
}
