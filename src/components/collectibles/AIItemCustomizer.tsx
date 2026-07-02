import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { useCollectibles } from "@/hooks/useCollectibles";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string; }

const styles = [
  { value: "cyberpunk", label: "Cyberpunk Neon" },
  { value: "vintage", label: "Vintage Sepia" },
  { value: "crystal", label: "Crystal Holographic" },
  { value: "dark-fantasy", label: "Dark Fantasy" },
  { value: "minimalist", label: "Minimalist Gold" },
  { value: "cosmic", label: "Cosmic Nebula" },
];

export default function AIItemCustomizer({ userId }: Props) {
  const [selectedItemId, setSelectedItemId] = useState("");
  const [style, setStyle] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { credits } = useAICredits();
  const { myCollectibles } = useCollectibles(userId);

  const handleCustomize = async () => {
    if (!selectedItemId || !style) return;
    if (!credits || credits.credits_remaining < 12) {
      toast.error("Insufficient credits. You need 12 credits.");
      return;
    }
    setLoading(true);
    try {
      const item = myCollectibles?.find((c: any) => c.id === selectedItemId);
      const { data, error } = await supabase.functions.invoke("collectible-ai", {
        body: { action: "customize", userId, itemId: selectedItemId, itemName: item?.collectible_type || "Collectible", style, customPrompt }
      });
      if (error) throw error;
      setResult(data);
      toast.success("Item customized successfully!");
    } catch (e: any) {
      toast.error(e.message || "Customization failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Item Customizer - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Item Customizer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Item Customizer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Wand2 className="h-8 w-8 text-fuchsia-400" />
          <div>
            <h2 className="text-2xl font-bold">AI Item Customizer</h2>
            <p className="text-sm text-muted-foreground">Transform your collectibles with AI-powered visual modifications — 12 credits</p>
          </div>
        </div>

        <div className="space-y-4">
          <Select value={selectedItemId} onValueChange={setSelectedItemId}>
            <SelectTrigger><SelectValue placeholder="Select an item to customize" /></SelectTrigger>
            <SelectContent>
              {myCollectibles?.map((item: any) => (
                <SelectItem key={item.id} value={item.id}>{item.collectible_type || "Collectible"} — {item.id.slice(0, 8)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger><SelectValue placeholder="Choose visual style" /></SelectTrigger>
            <SelectContent>
              {styles.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Optional: describe additional modifications (e.g., 'add glowing runes', 'make it icy')..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            rows={2}
          />

          <Button onClick={handleCustomize} disabled={loading || !selectedItemId || !style} className="w-full gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Customizing...</> : <><Sparkles className="h-4 w-4" /> Customize Item (12 Credits)</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Available: {credits?.credits_remaining || 0} credits</p>
        </div>
      </Card>

      {result && (
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold">Customization Result</h3>
          {result.newDescription && (
            <div>
              <span className="text-sm text-muted-foreground">Enhanced Description:</span>
              <p className="text-sm mt-1 whitespace-pre-wrap">{result.newDescription}</p>
            </div>
          )}
          {result.styleApplied && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Style Applied:</span>
              <Badge>{result.styleApplied}</Badge>
            </div>
          )}
          {result.rarityBoost && (
            <div className="bg-primary/10 rounded-lg p-3">
              <span className="text-sm font-semibold">✨ Rarity Boost:</span>
              <p className="text-sm mt-1">{result.rarityBoost}</p>
            </div>
          )}
          {result.visualEffects && (
            <div>
              <span className="text-sm text-muted-foreground">Visual Effects Added:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.visualEffects.map((effect: string, i: number) => (
                  <Badge key={i} variant="outline">{effect}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
    </>
  );
}
