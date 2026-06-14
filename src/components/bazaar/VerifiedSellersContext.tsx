import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type Status = "verified" | "pending" | "rejected";

interface Ctx {
  statuses: Map<string, Status>;
  ready: boolean;
}

const VerifiedSellersCtx = createContext<Ctx>({ statuses: new Map(), ready: false });

/**
 * Batched fetcher: pulls bazaar_seller_verifications for the given seller IDs in ONE query
 * and exposes a Map<sellerId, status>. Eliminates the per-card N+1 problem.
 */
export function VerifiedSellersProvider({ sellerIds, children }: { sellerIds: string[]; children: ReactNode }) {
  const [statuses, setStatuses] = useState<Map<string, Status>>(new Map());
  const [ready, setReady] = useState(false);

  // Stable key for the effect (sorted, deduped).
  const key = useMemo(() => Array.from(new Set(sellerIds)).sort().join(","), [sellerIds]);

  useEffect(() => {
    let cancelled = false;
    const ids = key ? key.split(",").filter(Boolean) : [];
    if (ids.length === 0) {
      setStatuses(new Map());
      setReady(true);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("bazaar_seller_verifications" as any)
        .select("user_id, status")
        .in("user_id", ids);
      if (cancelled) return;
      if (error) { setReady(true); return; }
      const m = new Map<string, Status>();
      for (const r of (data ?? []) as Array<{ user_id: string; status: Status }>) {
        m.set(r.user_id, r.status);
      }
      setStatuses(m);
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, [key]);

  return <VerifiedSellersCtx.Provider value={{ statuses, ready }}>{children}</VerifiedSellersCtx.Provider>;
}

export function useVerifiedSellerStatus(sellerId: string): Status | null {
  return useContext(VerifiedSellersCtx).statuses.get(sellerId) ?? null;
}
