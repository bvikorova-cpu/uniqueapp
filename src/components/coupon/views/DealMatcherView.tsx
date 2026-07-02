import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Target, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CouponToolLayout } from "../CouponToolLayout";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function DealMatcherView({ onBack }: Props) {
  const [favoriteStores, setFavoriteStores] = useState("");
  const [categories, setCategories] = useState("");
  const [budget, setBudget] = useState("");
  const [minDiscount, setMinDiscount] = useState("");
  const [frequency, setFrequency] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!favoriteStores.trim() && !categories.trim()) { toast.error("Enter stores or categories"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "deal-matcher", favoriteStores, categories, budget, minDiscount, frequency, lookingFor },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Deals found! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Deal Matcher View - How it works"} steps={[{ title: 'Open', desc: 'Access the Deal Matcher View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Deal Matcher View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <CouponToolLayout onBack={onBack} title="AI Deal Matcher" subtitle="Find best deals matching your shopping preferences & budget" credits={3} icon={Target} gradientFrom="#10b981" gradientTo="#14b8a6" borderColor="emerald" formTitle="Your Preferences" resultTitle="Your Deal Matches" emptyText="Enter your preferences to find personalized deals" result={result} loading={loading}>
      <div><label className="text-sm font-semibold mb-1.5 block">Favorite Stores *</label><Input placeholder="e.g., Nike, Amazon, Zara..." value={favoriteStores} onChange={e => setFavoriteStores(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Shopping Categories</label><Input placeholder="e.g., Fashion, Electronics, Food..." value={categories} onChange={e => setCategories(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-semibold mb-1.5 block">Budget (€)</label><Input type="number" placeholder="e.g., 100" value={budget} onChange={e => setBudget(e.target.value)} /></div>
        <div><label className="text-sm font-semibold mb-1.5 block">Min Discount (%)</label><Input type="number" placeholder="e.g., 20" value={minDiscount} onChange={e => setMinDiscount(e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-semibold mb-1.5 block">Shopping Frequency</label><Input placeholder="e.g., Weekly, Monthly..." value={frequency} onChange={e => setFrequency(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Looking For (specific)</label><Input placeholder="e.g., Running shoes, coffee, electronics..." value={lookingFor} onChange={e => setLookingFor(e.target.value)} /></div>
      <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Matching...</> : <><Target className="w-4 h-4 mr-2" />Find Deals (3 CR)</>}
      </Button>
    </CouponToolLayout>
    </>
  );
}
