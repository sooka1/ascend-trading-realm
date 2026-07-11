import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "hk:market:watchlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("hk:watchlist-change"));
  } catch {
    /* ignore quota */
  }
}

/** localStorage-backed watchlist of instrument symbols, synced across hook instances. */
export function useWatchlist() {
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    setList(read());
    const sync = () => setList(read());
    window.addEventListener("hk:watchlist-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hk:watchlist-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const has = useCallback((sym: string) => list.includes(sym), [list]);

  const toggle = useCallback((sym: string) => {
    const cur = read();
    const next = cur.includes(sym) ? cur.filter((s) => s !== sym) : [...cur, sym];
    write(next);
    setList(next);
  }, []);

  const remove = useCallback((sym: string) => {
    const next = read().filter((s) => s !== sym);
    write(next);
    setList(next);
  }, []);

  return { list, has, toggle, remove };
}