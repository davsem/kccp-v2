"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const COOKIE_NAME = "kccp-basket";
const MAX_AGE_SECONDS = 86400;

function getBasketCookie(): string[] {
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (!match) return [];
    return JSON.parse(decodeURIComponent(match.split("=")[1])) as string[];
  } catch {
    return [];
  }
}

const secure =
  typeof window !== "undefined" && window.location.protocol === "https:"
    ? "; Secure"
    : "";

function setBasketCookie(ids: string[]): void {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(ids))}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

function clearBasketCookie(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

interface BasketContextValue {
  selectedIds: Set<string>;
  count: number;
  add: (id: string) => void;
  remove: (id: string) => void;
  removeMultiple: (ids: string[]) => void;
  toggle: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

const BasketContext = createContext<BasketContextValue | null>(null);

export function BasketProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Hydrate from cookie on mount (SSR-safe: initial state is empty to avoid mismatch)
  useEffect(() => {
    const ids = getBasketCookie();
    if (ids.length > 0) setSelectedIds(new Set(ids));
  }, []);

  // Sync to cookie whenever selection changes (skip empty-set initial render is fine —
  // writing an empty cookie on mount is harmless)
  useEffect(() => {
    setBasketCookie([...selectedIds]);
  }, [selectedIds]);

  const add = useCallback((id: string) => {
    setSelectedIds((prev) => new Set(prev).add(id));
  }, []);

  const remove = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const removeMultiple = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    clearBasketCookie();
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const value = useMemo(
    () => ({ selectedIds, count: selectedIds.size, add, remove, removeMultiple, toggle, clear, isSelected }),
    [selectedIds, add, remove, removeMultiple, toggle, clear, isSelected]
  );

  return (
    <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
  );
}

export function useBasket(): BasketContextValue {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used within BasketProvider");
  return ctx;
}
