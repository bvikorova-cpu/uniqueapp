import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Package, Loader2, Sparkles, Plus, Trash2, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface InventoryItem {
  name: string;
  quantity: string;
  expiry?: string;
}

interface Props { onBack: () => void; }

export default function AIKitchenInventory({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems(prev => [...prev, { name: newItem.trim(), quantity: newQty.trim() || '1' }]);
    setNewItem(""); setNewQty("");
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const generateList = async () => {
    if (items.length === 0) { toast({ title: "Add items first", variant: "destructive" }); return; }
    if (credits.credits_remaining < 3) { toast({ title: "Not enough credits", description: "You need 3 credits.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Kitchen Inventory");
      if (!ok) throw new Error("Failed to use credit");
      const itemList = items.map(i => `${i.name} (${i.quantity})`).join(', ');
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { prompt: `You are a professional kitchen manager and meal prep expert. Based on the user's current kitchen inventory, provide:

1) INVENTORY ASSESSMENT: What's well-stocked, what's running low, what's missing for a balanced kitchen
2) EXPIRY PRIORITY: Which items should be used first (estimate typical shelf life)
3) RECIPE SUGGESTIONS: 5 recipes that can be made with these ingredients (prioritize using perishables)
4) SMART SHOPPING LIST: What to buy to complement the current inventory (organized by store aisle)
5) MEAL PREP PLAN: A 3-day meal plan using the available ingredients
6) STORAGE TIPS: How to extend the shelf life of each item
7) COST ESTIMATE: Approximate weekly grocery budget optimization

Current inventory: ${itemList}` },
      });
      if (error) throw error;
      setResult(data?.message || data?.text || "No result");
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How AIKitchen Inventory works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
          <Package className="h-5 w-5 text-cyan-400" />
          <span className="font-bold text-cyan-400">AI Kitchen Inventory</span>
          <span className="text-xs bg-cyan-500/20 px-2 py-0.5 rounded-full text-cyan-300">3 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">Track your ingredients & get AI-powered shopping lists</p>
      </div>

      {/* Add Items */}
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60">
        <h3 className="font-bold text-sm mb-3">Add Ingredients to Your Inventory</h3>
        <div className="flex gap-2 mb-4">
          <Input placeholder="Ingredient name..." value={newItem} onChange={e => setNewItem(e.target.value)} className="flex-1" onKeyDown={e => e.key === 'Enter' && addItem()} />
          <Input placeholder="Qty" value={newQty} onChange={e => setNewQty(e.target.value)} className="w-20" onKeyDown={e => e.key === 'Enter' && addItem()} />
          <Button onClick={addItem} size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
        </div>

        {items.length > 0 && (
          <div className="space-y-2 mb-4">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{item.quantity}</Badge>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeItem(i)} className="h-7 w-7">
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={generateList} disabled={loading || items.length === 0} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing Inventory...</> : <><ShoppingCart className="h-4 w-4 mr-2" /> Generate Smart Shopping List & Meal Plan</>}
        </Button>
      </Card>

      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-cyan-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Package className="h-5 w-5 text-cyan-400" /> Kitchen Analysis & Shopping List</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
    </>
    );
}
