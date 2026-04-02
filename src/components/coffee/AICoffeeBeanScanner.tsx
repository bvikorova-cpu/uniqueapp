import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, ScanLine, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const AICoffeeBeanScanner = ({ onBack }: { onBack: () => void }) => {
  const [labelText, setLabelText] = useState("");
  const [roastLevel, setRoastLevel] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!labelText.trim()) { toast.error("Please enter the text from your coffee bag label"); return; }
    setLoading(true); setResult("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("ai-coffee-advisor", {
        body: { type: "bean_scan", labelText, roastLevel }
      });
      if (error) throw error;
      setResult(data?.result || "No analysis generated");
    } catch (e: any) {
      toast.error(e.message?.includes("credits") ? "Insufficient credits" : "Error scanning bean info");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-cyan-400" />
            AI Coffee Bean Scanner
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full ml-2">3 Credits</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">Type or paste the text from your coffee bag label for a deep AI analysis of origin, flavor profile, and brewing recommendations</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick tips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-xs text-cyan-300 font-semibold mb-1">💡 What to include from the label:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li>• Origin / Region (e.g. Ethiopia Yirgacheffe)</li>
              <li>• Roast level, altitude, process method</li>
              <li>• Any tasting notes mentioned</li>
              <li>• Brand name and blend name</li>
            </ul>
          </motion.div>

          <Select value={roastLevel} onValueChange={setRoastLevel}>
            <SelectTrigger><SelectValue placeholder="Roast level (if visible)" /></SelectTrigger>
            <SelectContent>
              {["Light Roast", "Medium-Light", "Medium Roast", "Medium-Dark", "Dark Roast", "Espresso Roast", "Unknown"].map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            value={labelText}
            onChange={e => setLabelText(e.target.value)}
            placeholder="Type or paste the text from your coffee bag label here... Include origin, roast, altitude, processing, tasting notes — everything you can see"
            rows={5}
          />

          <Button className="w-full bg-gradient-to-r from-cyan-600 to-teal-800" onClick={handleScan} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning...</> : <><ScanLine className="mr-2 h-4 w-4" />Analyze Bean Label</>}
          </Button>

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 whitespace-pre-wrap text-sm">
              {result}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
