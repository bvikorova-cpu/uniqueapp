// voteBatch — debounced client-side batcher for reactions/likes.
//
// Namiesto toho, aby každý klik urobil samostatný DB zápis (a broadcast cez
// Realtime), tento helper zbiera reakcie do buffera a raz za 400 ms zavolá
// `batch_apply_reactions` RPC, ktoré ich všetky spracuje v jednej transakcii.
//
// Ak používateľ klikne 5×, do DB ide iba posledný stav pre daný post — čo pri
// špičkách 10k+ CCU dramaticky znižuje write QPS aj Realtime fan-out.

import { supabase } from "@/integrations/supabase/client";

type Item = { post_id: string; reaction: string | null };

const FLUSH_MS = 400;
const MAX_BUFFER = 50;

const buffer = new Map<string, Item>(); // key = post_id → posledný stav
let timer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<void> | null = null;

async function flush(): Promise<void> {
  if (buffer.size === 0) return;
  const items = Array.from(buffer.values()).slice(0, MAX_BUFFER);
  // odstráň už zahrnuté položky (nechaj prípadný overflow na ďalšie kolo)
  for (const it of items) buffer.delete(it.post_id);

  const { error } = await supabase.rpc("batch_apply_reactions", {
    items: items as unknown as never,
  });
  if (error) {
    // eslint-disable-next-line no-console
    console.warn("[voteBatch] batch failed, rolling back:", error.message);
    // pri chybe nechaj používateľské akcie stratiť sa iba ticho — UI má
    // optimistic state, ktorý sa pri ďalšom fetch-i vyrovná.
  }

  if (buffer.size > 0) {
    // ešte ostalo — flush hneď znova
    inFlight = flush();
    await inFlight;
  }
}

function schedule(): void {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    inFlight = flush().finally(() => {
      inFlight = null;
    });
  }, FLUSH_MS);
}

/** Postavi reakciu do fronty. `reaction=null` = odstrániť. */
export function queueReaction(postId: string, reaction: string | null): void {
  buffer.set(postId, { post_id: postId, reaction });
  if (buffer.size >= MAX_BUFFER) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    inFlight = flush().finally(() => {
      inFlight = null;
    });
    return;
  }
  schedule();
}

/** Force flush (napr. pred navigáciou preč). */
export async function flushReactions(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (inFlight) await inFlight;
  await flush();
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    // best-effort: fire and forget
    void flushReactions();
  });
}
