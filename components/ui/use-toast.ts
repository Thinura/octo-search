"use client";

import { useToastContext } from "@/components/ui/toast-provider";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export function useToast() {
  const { push, clear } = useToastContext();

  const toast = (options: ToastOptions) => push(options);

  return { toast, clear };
}
