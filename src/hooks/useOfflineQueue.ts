import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const DB_NAME = "lovable-offline-queue";
const STORE = "actions";
const VERSION = 1;

export interface QueuedAction {
  id?: number;
  type: string;
  payload: any;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbAdd(action: QueuedAction) {
  const db = await openDB();
  return new Promise<number>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const r = tx.objectStore(STORE).add(action);
    r.onsuccess = () => resolve(r.result as number);
    r.onerror = () => reject(r.error);
  });
}

async function dbGetAll(): Promise<QueuedAction[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const r = tx.objectStore(STORE).getAll();
    r.onsuccess = () => resolve((r.result as QueuedAction[]) ?? []);
    r.onerror = () => reject(r.error);
  });
}

async function dbDelete(id: number) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const r = tx.objectStore(STORE).delete(id);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}

type Replayer = (action: QueuedAction) => Promise<void>;

const replayers = new Map<string, Replayer>();

export function registerOfflineReplayer(type: string, replayer: Replayer) {
  replayers.set(type, replayer);
}

export function useOfflineQueue() {
  const { toast } = useToast();
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshCount = useCallback(async () => {
    try {
      const all = await dbGetAll();
      setPendingCount(all.length);
    } catch { /* noop */ }
  }, []);

  const replay = useCallback(async () => {
    const all = await dbGetAll();
    if (all.length === 0) return;
    let ok = 0;
    for (const a of all) {
      const r = replayers.get(a.type);
      if (!r) continue;
      try {
        await r(a);
        if (a.id != null) await dbDelete(a.id);
        ok++;
      } catch (e) {
        console.warn("offline replay failed", a.type, e);
      }
    }
    if (ok > 0) toast({ title: `Synced ${ok} pending action(s)` });
    await refreshCount();
  }, [toast, refreshCount]);

  useEffect(() => {
    refreshCount();
    const onOnline = () => { setOnline(true); replay(); };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [replay, refreshCount]);

  const enqueue = useCallback(async (type: string, payload: any) => {
    await dbAdd({ type, payload, createdAt: Date.now() });
    await refreshCount();
    toast({ title: "Saved offline", description: "Will sync when you reconnect." });
  }, [toast, refreshCount]);

  return { online, pendingCount, enqueue, replay };
}
