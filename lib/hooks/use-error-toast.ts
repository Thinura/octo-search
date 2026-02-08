"use client";

import * as React from "react";
import { useToast } from "@/components/ui/use-toast";
import { TOAST_DESCRIPTIONS, TOAST_TITLES } from "@/lib/constants/messages";

type ErrorLike = { status?: number; data?: unknown; message?: string } | Error | null | undefined;

export function useErrorToast(
  error: ErrorLike,
  fallback: string = TOAST_DESCRIPTIONS.genericError,
) {
  const { toast } = useToast();

  React.useEffect(() => {
    if (!error) return;

    let message = fallback;

    if (error instanceof Error) {
      message = error.message || fallback;
    } else if (typeof error === "object" && error && "data" in error) {
      const data = (error as { data?: unknown }).data;
      const apiMessage = (error as { message?: string }).message;
      if (apiMessage) message = apiMessage;
      else if (typeof data === "string") message = data;
    }

    toast({
      title: TOAST_TITLES.error,
      description: message,
      variant: "destructive",
    });
  }, [error, fallback, toast]);
}
