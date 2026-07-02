import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Shuffle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { useCollectibles } from "@/hooks/useCollectibles";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string; }

export default function MysteryBoxSimulator({ userId }: Props) {
  const [selectedBoxId, setSelectedBoxId] = useState("");
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { credits } = useAICredits();
  const { mysteryBoxes } = useCollectibles(userId);

  const handleSimulate = async () => {
    if (!selectedBoxId) return;
    if (!credits || credits.credits_remaining < 3) {
      toast.error("Insufficient credits. You need 3 credits.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("collectible-ai", {
        body: { action: "box-simulate", boxId: selectedBoxId, userId }
      });
      if (error) throw error;
      setSimulations(data?.simulations || []);
    } catch (e: any) {
      toast.error(e.message || "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  const rarityColors: Record<string, string> = {
    Common: "bg-gray-500/20 text-gray-300",
    Uncommon: "bg-green-500/20 text-green-400",
    Rare: "bg-blue-500/20 text-blue-400",
    Epic: "bg-purple-500/20 text-purple-400",
    Legendary: "bg-amber-500/20 text-amber-400",
  };

  return (
    <>
      <FloatingHowItWorks title={"Mystery Box Simulator - How it works"} steps={[{ title: 'Open', desc: 'Access the Mystery Box Simulator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mystery Box Simulator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Shuffle className="h-8 w-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold">Mystery Box Simulator</h2>
            <p className="text-sm text-muted-foreground">Preview possible outcomes before spending credits — 3 credits per simulation</p>
          </div>
        </div>

        <div className="space-y-4">
          <Select value={selectedBoxId} onValueChange={setSelectedBoxId}>
            <SelectTrigger><SelectValue placeholder="Select a mystery box" /></SelectTrigger>
            <SelectContent>
              {mysteryBoxes?.map(box => (
                <SelectItem key={box.id} value={box.id}>{box.name} ({box.price} credits)</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSimulate} disabled={loading || !selectedBoxId} className="w-full gap-2">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Simulating...</> : <><Sparkles className="h-4 w-4" /> Simulate 5 Opens (3 Credits)</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground">Available: {credits?.credits_remaining || 0} credits</p>
        </div>
      </Card>

      {simulations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Simulation Results (5 Opens)</h3>
          <div className="space-y-3">
            {simulations.map((sim: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                  <div>
                    <p className="font-medium text-sm">{sim.itemName}</p>
                    <p className="text-xs text-muted-foreground">{sim.category}</p>
                  </div>
                </div>
                <Badge className={rarityColors[sim.rarity] || ""}>{sim.rarity}</Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            ⚠️ Simulated results — actual outcomes may vary
          </p>
        </Card>
      )}
    </div>
    </>
  );
}
