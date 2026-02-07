"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

type ToasterProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "rounded-lg border bg-card p-4 text-card-foreground shadow-lg",
            toast.variant === "destructive" &&
              "border-destructive/40 bg-destructive/10 text-destructive",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {toast.title ? <p className="text-sm font-semibold">{toast.title}</p> : null}
              {toast.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
