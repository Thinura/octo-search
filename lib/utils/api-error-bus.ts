type ApiError = {
  message?: string;
  status?: number;
};

type Listener = (error: ApiError) => void;

const listeners = new Set<Listener>();

export const apiErrorBus = {
  emit(error: ApiError) {
    if (typeof window === "undefined") return;
    listeners.forEach((listener) => listener(error));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
