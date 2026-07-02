import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import { useCouponGeo } from "@/hooks/useCouponGeo";
import { Link } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CouponGeoDeals() {
  const { loading, deals, coords, findNearby } = useCouponGeo();

  return (
    <>
      <FloatingHowItWorks title={"Coupon Geo Deals - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Geo Deals section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Geo Deals.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 space-y-3 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold">Nearby Deals</h3>
        {coords && <span className="text-xs text-muted-foreground ml-auto">
          {coords.lat.toFixed(2)}, {coords.lon.toFixed(2)}
        </span>}
      </div>
      {!coords ? (
        <Button size="sm" onClick={() => findNearby(25)} className="w-full gap-1.5">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
          Find deals near me
        </Button>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {deals.length === 0 && <p className="text-xs text-muted-foreground">No deals within 25 km.</p>}
          {deals.map((d: any) => (
            <Link key={d.id} to={`/coupons`} className="block p-2 rounded-lg border bg-background/60 hover:bg-background">
              <div className="text-sm font-bold">{d.title}</div>
              <div className="text-xs text-muted-foreground">{d.store_name} · {d.geo_city ?? "—"} · €{d.selling_price}</div>
            </Link>
          ))}
        </div>
      )}
    </Card>
    </>
  );
}
