import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Trash2, Plus, Coins, BookmarkPlus } from "lucide-react";
import { useCouponPriceAlerts } from "@/hooks/useCouponPriceAlerts";
import { useCouponSavedSearches } from "@/hooks/useCouponSavedSearches";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  userId: string | null;
  currentFilters: { searchTerm: string; category: string; minDiscount: string; maxPrice: string; sortBy: string };
  onApplySearch: (params: any) => void;
}

export function CouponEngagementPanel({ userId, currentFilters, onApplySearch }: Props) {
  const { alerts, create, remove, toggle } = useCouponPriceAlerts(userId);
  const { searches, save, remove: removeSearch } = useCouponSavedSearches(userId);
  const [store, setStore] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchName, setSearchName] = useState("");
  const [cashback, setCashback] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;
    supabase.from("coupon_cashback_ledger" as any).select("amount_eur").eq("user_id", userId)
      .then(({ data }) => {
        const total = ((data as any) || []).reduce((s: number, r: any) => s + Number(r.amount_eur || 0), 0);
        setCashback(total);
      });
  }, [userId]);

  return (
    <>
      <FloatingHowItWorks title={"Coupon Engagement Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Engagement Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Engagement Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid md:grid-cols-3 gap-4">
      {/* Cashback */}
      <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold">Cashback wallet</h3>
          </div>
          <p className="text-3xl font-black text-emerald-600">€{cashback.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">2% back on every completed coupon purchase. Auto-credited after the 7-day buyer guarantee.</p>
        </CardContent>
      </Card>

      {/* Price alerts */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Price drop alerts</h3>
          </div>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Store (e.g. Nike)" value={store} onChange={e => setStore(e.target.value)} className="h-8 text-xs" />
            <Input placeholder="Max €" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="h-8 text-xs w-20" />
            <Button size="sm" className="h-8" onClick={() => {
              const mp = parseFloat(maxPrice);
              if (!store.trim() || isNaN(mp) || mp <= 0) return;
              create({ store_name: store.trim(), max_price: mp });
              setStore(""); setMaxPrice("");
            }}><Plus className="w-3 h-3" /></Button>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-auto">
            {alerts.length === 0 && <p className="text-xs text-muted-foreground">No alerts yet. We notify you within 1h of matching listings.</p>}
            {alerts.map(a => (
              <div key={a.id} className="flex items-center gap-2 text-xs rounded-md border border-border/50 px-2 py-1.5">
                <span className="font-semibold flex-1 truncate">{a.store_name}</span>
                <Badge variant="outline" className="text-[10px]">≤€{a.max_price}</Badge>
                <Switch checked={a.is_active} onCheckedChange={(v) => toggle(a.id, v)} />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove(a.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Saved searches */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookmarkPlus className="w-5 h-5 text-primary" />
            <h3 className="font-bold">Saved searches</h3>
          </div>
          <div className="flex gap-2 mb-3">
            <Input placeholder="Name this search" value={searchName} onChange={e => setSearchName(e.target.value)} className="h-8 text-xs" />
            <Button size="sm" className="h-8" onClick={() => {
              if (!searchName.trim()) return;
              save(searchName.trim(), currentFilters);
              setSearchName("");
            }}><Plus className="w-3 h-3" /></Button>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-auto">
            {searches.length === 0 && <p className="text-xs text-muted-foreground">Save current filters to re-apply with one click.</p>}
            {searches.map(s => (
              <div key={s.id} className="flex items-center gap-2 text-xs rounded-md border border-border/50 px-2 py-1.5">
                <button className="flex-1 text-left truncate hover:text-primary" onClick={() => onApplySearch(s.params)}>{s.name}</button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeSearch(s.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
