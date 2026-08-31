/**
 * Registry of objects that live in Cloudflare R2.
 *
 * Every upload routed through the R2 interceptor (see
 * `src/integrations/supabase/client.ts`) records `bucket/path -> public URL`
 * here, persisted in localStorage. Display helpers use it so a stored
 * Supabase-style URL or raw path still resolves to the R2 public URL.
 *
 * This module must NOT import the supabase client (it is used from inside it).
 */

const STORE_KEY = "r2-object-map-v1";
const BASE_KEY = "r2-public-base-v1";
const MAX_ENTRIES = 4000;

type Store = Record<string, string>;

let mem: Store | null = null;

function load(): Store {
  if (mem) return mem;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    mem = raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    mem = {};
  }
  return mem!;
}

function persist(store: Store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* quota — keep in memory only */
  }
}

export function r2Key(bucket: string, path: string): string {
  return `${bucket}/${path.replace(/^\/+/, "")}`;
}

/** True when a URL points at Cloudflare R2. */
export function isR2Url(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.r2\.dev\//.test(url) || /r2\.cloudflarestorage\.com\//.test(url);
}

/** Remember that bucket/path is served from R2 at `url`. */
export function rememberR2Object(bucket: string, path: string, url: string) {
  const store = load();
  const keys = Object.keys(store);
  if (keys.length >= MAX_ENTRIES) {
    for (const k of keys.slice(0, Math.floor(MAX_ENTRIES / 4))) delete store[k];
  }
  store[r2Key(bucket, path)] = url;
  persist(store);
  try {
    const base = url.replace(/\/[^/]*$/, "");
    const origin = new URL(url).origin;
    if (origin) localStorage.setItem(BASE_KEY, origin);
    void base;
  } catch {
    /* ignore */
  }
}

/** Public R2 URL for bucket/path, or null when the object is not in R2. */
export function lookupR2Url(bucket: string, path: string): string | null {
  const clean = path.replace(/^\/+/, "").split("?")[0];
  const store = load();
  return store[r2Key(bucket, clean)] ?? null;
}

/** R2 public origin learned from previous uploads (if any). */
export function r2PublicOrigin(): string | null {
  try {
    return localStorage.getItem(BASE_KEY);
  } catch {
    return null;
  }
}
