import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CouponToolLayout } from "../CouponToolLayout";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function WishlistAlertsView({ onBack }: Props) {
  const [wishlistStores, setWishlistStores] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [minDiscount, setMinDiscount] = useState("20");
  const [preferences, setPreferences] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!wishlistStores.trim()) { toast.error("Enter your wishlist stores"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "wishlist-alerts", wishlistStores, maxBudget, minDiscount, preferences },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Wishlist strategy ready! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Wishlist Alerts View - How it works"} steps={[{ title: 'Open', desc: 'Access the Wishlist Alerts View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Wishlist Alerts View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <CouponToolLayout onBack={onBack} title="Wishlist & Price Drops" subtitle="Smart tracking & deal alert strategies for your favorite stores" credits={3} icon={Heart} gradientFrom="#ec4899" gradientTo="#e11d48" borderColor="pink" formTitle="Wishlist Setup" resultTitle="Wishlist Intelligence" emptyText="Enter your wishlist to get personalized deal alert strategy" result={result} loading={loading}>
      <div><label className="text-sm font-semibold mb-1.5 block">Stores to Watch *</label>
        <Textarea placeholder="List stores you want to track. E.g.:&#10;Nike&#10;Amazon&#10;Sephora&#10;Apple" value={wishlistStores} onChange={e => setWishlistStores(e.target.value)} rows={4} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-semibold mb-1.5 block">Max Budget (€)</label>
          <Input type="number" placeholder="e.g., 50" value={maxBudget} onChange={e => setMaxBudget(e.target.value)} /></div>
        <div><label className="text-sm font-semibold mb-1.5 block">Min Discount (%)</label>
          <Input type="number" placeholder="20" value={minDiscount} onChange={e => setMinDiscount(e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-semibold mb-1.5 block">Shopping Preferences</label>
        <Textarea placeholder="What are you looking to buy? Any specific products or categories?" value={preferences} onChange={e => setPreferences(e.target.value)} rows={2} /></div>
      <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Heart className="w-4 h-4 mr-2" />Get Alert Strategy (3 CR)</>}
      </Button>
    </CouponToolLayout>
    </>
  );
}
