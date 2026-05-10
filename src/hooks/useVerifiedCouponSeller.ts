import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, boolean>();

export function useVerifiedCouponSeller(sellerId: string | null | undefined) {
  const [verified, setVerified] = useState<boolean>(sellerId ? cache.get(sellerId) ?? false : false);

  useEffect(() => {
    if (!sellerId) return;
    if (cache.has(sellerId)) { setVerified(cache.get(sellerId)!); return; }
    supabase.rpc("is_verified_coupon_seller" as any, { p_user_id: sellerId }).then(({ data }) => {
      const v = Boolean(data);
      cache.set(sellerId, v);
      setVerified(v);
    });
  }, [sellerId]);

  return verified;
}
