// Persistent cache for generated escape-room scene images.
// Scene images are large base64 data URLs, so IndexedDB is used instead of
// localStorage (which would hit the ~5MB quota after two rooms).

const DB_NAME = "escape-room-scenes";
const STORE = "scenes";
const DB_VERSION = 1;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

// In-memory layer so repeated reads in one session are instant.
const memory = new Map<string, string>();

export function sceneKey(theme: string, room: { id?: number | string; name?: string; description?: string }, fallbackIdx: number) {
  const version = `${room?.name ?? ""}|${room?.description ?? ""}`.trim().toLowerCase().replace(/\s+/g, " ");
  return `escape-scene:${theme}:${room?.id ?? fallbackIdx}:${encodeURIComponent(version)}`;
}

export async function getCachedScene(key: string): Promise<string | null> {
  const hit = memory.get(key);
  if (hit) return hit;
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => {
        const row = req.result as { url: string; createdAt: number } | undefined;
        if (!row?.url) return resolve(null);
        if (Date.now() - (row.createdAt ?? 0) > MAX_AGE_MS) return resolve(null);
        memory.set(key, row.url);
        resolve(row.url);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function setCachedScene(key: string, url: string): Promise<void> {
  memory.set(key, url);
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ url, createdAt: Date.now() }, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

// Warms the browser image cache / decodes ahead of display.
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (!url) return resolve();
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}
