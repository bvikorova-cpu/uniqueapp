import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Package, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const AISubscriptionBoxCurator = ({ onBack }: { onBack: () => void }) => {
  const [flavorProfile, setFlavorProfile] = useState("");
  const [budget, setBudget] = useState("");
  const [frequency, setFrequency] = useState("");
  const [preferences, setPreferences] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCurate = async () => {
    if (!flavorProfile || !budget) { toast.error("Please select your flavor profile and budget"); return; }
    setLoading(true); setResult("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "subscription_box", flavorProfile, budget, frequency, preferences }
      });
      if (error) throw error;
      setResult(data?.result || "No recommendations generated");
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits" : "Error generating box");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-pink-400" />
            AI Subscription Box Curator
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Get a personalized monthly coffee bean selection curated by AI based on your taste preferences</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={flavorProfile} onValueChange={setFlavorProfile}>
            <SelectTrigger><SelectValue placeholder="Your flavor preference" /></SelectTrigger>
            <SelectContent>
              {["Fruity & Bright", "Chocolatey & Nutty", "Caramel & Sweet", "Earthy & Spicy", "Floral & Delicate", "Bold & Smoky", "Balanced & Smooth"].map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger><SelectValue placeholder="Monthly budget" /></SelectTrigger>
            <SelectContent>
              {["€15-25/month", "€25-40/month", "€40-60/month", "€60+/month (Premium)"].map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger><SelectValue placeholder="Delivery frequency" /></SelectTrigger>
            <SelectContent>
              {["Weekly", "Bi-weekly", "Monthly", "Quarterly"].map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            value={preferences}
            onChange={e => setPreferences(e.target.value)}
            placeholder="Additional preferences... e.g. 'I love single-origin, no decaf, prefer African beans, whole bean only'"
            rows={3}
          />

          <Button className="w-full bg-gradient-to-r from-pink-600 to-rose-800" onClick={handleCurate} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Curating...</> : <><Gift className="mr-2 h-4 w-4" />Curate My Box</>}
          </Button>

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20 whitespace-pre-wrap text-sm">
              {result}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
