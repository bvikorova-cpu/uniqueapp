import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Props { onBack: () => void; }

export function ExpiryAlertView({ onBack }: Props) {
  const [coupons, setCoupons] = useState("");
  const [notifyDays, setNotifyDays] = useState("7");
  const [shoppingHabits, setShoppingHabits] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!coupons.trim()) { toast.error("Enter your coupon details"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); setLoading(false); return; }
      const { data, error } = await supabase.functions.invoke("coupon-ai", {
        body: { action: "expiry-alert", coupons, notifyDays, shoppingHabits },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success(`Alert analysis ready! (${data.credits_used} credits used)`);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Expiry Alert System</h2>
            <p className="text-muted-foreground text-sm">Smart expiry tracking & usage recommendations · 3 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-red-500 to-yellow-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />3 Credits
          </Badge>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-red-500/10">
          <CardHeader><CardTitle>Your Coupons</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-semibold mb-1.5 block">Coupon Details *</label>
              <Textarea placeholder="List your coupons with store names, values, and expiry dates. E.g.:&#10;Nike - €50 gift card - expires May 15&#10;Amazon - 20% off - expires April 30&#10;Starbucks - €25 voucher - no expiry" value={coupons} onChange={e => setCoupons(e.target.value)} rows={6} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Alert Window (days before expiry)</label>
              <Input type="number" placeholder="7" value={notifyDays} onChange={e => setNotifyDays(e.target.value)} /></div>
            <div><label className="text-sm font-semibold mb-1.5 block">Shopping Habits (optional)</label>
              <Textarea placeholder="What do you usually shop for? How often?" value={shoppingHabits} onChange={e => setShoppingHabits(e.target.value)} rows={2} /></div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Bell className="w-4 h-4 mr-2" />Analyze Expiry Risk (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className={result ? "border-red-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Expiry Alert Report" : "Results"}</CardTitle>
            {result && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}</Button>}
          </CardHeader>
          <CardContent>{result ? <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div> : <p className="text-muted-foreground text-sm text-center py-12">Enter your coupons to get expiry alerts and usage strategies</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
}
