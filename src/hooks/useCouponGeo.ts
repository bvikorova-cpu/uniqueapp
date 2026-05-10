import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCouponGeo() {
  const [loading, setLoading] = useState(false);
  const [deals, setDeals] = useState<any[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  const findNearby = useCallback(async (radius_km = 25) => {
    setLoading(true);
    try {
      const pos: GeolocationPosition = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      );
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      setCoords({ lat, lon });
      const { data } = await supabase.rpc("coupon_geo_nearby", { _lat: lat, _lon: lon, _radius_km: radius_km });
      setDeals(data ?? []);
    } catch (e) {
      console.error("geo error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, deals, coords, findNearby };
}
