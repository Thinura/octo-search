"use client";

import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { apiErrorBus } from "@/lib/utils/api-error-bus";
import {
  TOAST_DESCRIPTIONS,
  TOAST_DUPLICATE_WINDOW_MS,
  TOAST_TITLES,
} from "@/lib/constants/messages";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

type ToastContextValue = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const recentErrors = React.useRef(new Map<string, number>());

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clear = React.useCallback(() => {
    setToasts([]);
  }, []);

  const push = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      const duration = toast.duration ?? DEFAULT_DURATION;
      const nextToast: Toast = { id, ...toast, duration };

      setToasts((prev) => [nextToast, ...prev]);

      window.setTimeout(() => {
        remove(id);
      }, duration);
    },
    [remove],
  );

  React.useEffect(() => {
    return apiErrorBus.subscribe((error) => {
      const description =
        error.message ?? getDescriptionForStatus(error.status) ?? TOAST_DESCRIPTIONS.genericError;
      const key = `${error.status ?? "unknown"}:${description}`;
      const lastSeen = recentErrors.current.get(key);
      const now = Date.now();

      if (lastSeen && now - lastSeen < TOAST_DUPLICATE_WINDOW_MS) {
        return;
      }

      recentErrors.current.set(key, now);
      push({
        title: TOAST_TITLES.error,
        description,
        variant: "destructive",
      });
    });
  }, [push]);

  return (
    <ToastContext.Provider value={{ toasts, push, remove, clear }}>
      {children}
      <Toaster toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

function getDescriptionForStatus(status?: number) {
  switch (status) {
    case 401:
    case 403:
      return TOAST_DESCRIPTIONS.unauthorized;
    case 404:
      return TOAST_DESCRIPTIONS.notFound;
    case 429:
      return TOAST_DESCRIPTIONS.rateLimited;
    case 500:
    case 502:
    case 503:
    case 504:
      return TOAST_DESCRIPTIONS.serverError;
    default:
      return undefined;
  }
}

export function useToastContext() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
}
