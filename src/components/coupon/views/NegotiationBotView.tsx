import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageSquare, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export function NegotiationBotView({ onBack }: Props) {
  const [couponTitle, setCouponTitle] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [role, setRole] = useState("buyer");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Negotiation Bot</h2>
            <p className="text-muted-foreground text-sm">Smart price negotiation strategies & scripts · 4 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-indigo-500/10">
          <CardHeader><CardTitle>Negotiation Setup</CardTitle></CardHeader>
          <CardContent className="space-y-4">
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
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Strategizing...</> : <><MessageSquare className="w-4 h-4 mr-2" />Get Strategy (4 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-indigo-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Negotiation Playbook" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>{result ? <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div> : <p className="text-muted-foreground text-sm text-center py-12">Set up your negotiation scenario to get AI strategies</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
}
