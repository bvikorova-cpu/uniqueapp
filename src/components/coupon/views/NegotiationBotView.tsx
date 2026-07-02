import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CouponToolLayout } from "../CouponToolLayout";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function NegotiationBotView({ onBack }: Props) {
  const [couponTitle, setCouponTitle] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [role, setRole] = useState("buyer");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!couponTitle.trim() || !askingPrice.trim()) { toast.error("Enter coupon and price details"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "negotiation-bot", couponTitle, askingPrice, targetPrice, role, context },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Negotiation strategy ready! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Negotiation Bot View - How it works"} steps={[{ title: 'Open', desc: 'Access the Negotiation Bot View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Negotiation Bot View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <CouponToolLayout onBack={onBack} title="AI Negotiation Bot" subtitle="Smart price negotiation strategies & ready-to-use scripts" credits={4} icon={MessageSquare} gradientFrom="#6366f1" gradientTo="#9333ea" borderColor="indigo" formTitle="Negotiation Setup" resultTitle="Negotiation Playbook" emptyText="Set up your negotiation scenario to get AI strategies" result={result} loading={loading}>
      <div><label className="text-sm font-semibold mb-1.5 block">Coupon / Deal Title *</label>
        <Input placeholder="e.g., Nike €100 Gift Card" value={couponTitle} onChange={e => setCouponTitle(e.target.value)} /></div>
      <div><label className="text-sm font-semibold mb-1.5 block">Your Role</label>
        <Select value={role} onValueChange={setRole}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="buyer">Buyer (want to pay less)</SelectItem><SelectItem value="seller">Seller (want to get more)</SelectItem>
        </SelectContent></Select></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-semibold mb-1.5 block">Asking Price (€) *</label>
          <Input type="number" placeholder="75" value={askingPrice} onChange={e => setAskingPrice(e.target.value)} /></div>
        <div><label className="text-sm font-semibold mb-1.5 block">Your Target (€)</label>
          <Input type="number" placeholder="60" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} /></div>
      </div>
      <div><label className="text-sm font-semibold mb-1.5 block">Context (optional)</label>
        <Textarea placeholder="Any additional context? E.g., 'Seller hasn't responded yet', 'Multiple similar listings available'" value={context} onChange={e => setContext(e.target.value)} rows={3} /></div>
      <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Strategizing...</> : <><MessageSquare className="w-4 h-4 mr-2" />Get Strategy (4 CR)</>}
      </Button>
    </CouponToolLayout>
    </>
  );
}
