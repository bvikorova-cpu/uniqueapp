import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Crown, Gem, Star, Sparkles, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Tier {
  id: string;
  tier_name: string;
  min_amount: number;
  benefits: string[];
  perk_icon: string | null;
  sort_order: number;
}

const tierIcons: Record<string, any> = {
  bronze: Star,
  silver: Sparkles,
  gold: Gem,
  platinum: Crown,
};

export const SponsorTiers = ({ campaignId, isOwner }: { campaignId: string; isOwner: boolean }) => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ tier_name: "", min_amount: "", benefits: "", perk_icon: "gold" });

  const load = async () => {
    const { data } = await (supabase as any)
      .from("talent_sponsor_tiers")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("sort_order", { ascending: true })
      .order("min_amount", { ascending: true });
    setTiers((data as Tier[]) || []);
  };

  useEffect(() => {
    load();
  }, [campaignId]);

  const handleAdd = async () => {
    const amount = parseFloat(form.min_amount);
    if (!form.tier_name || isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid input", description: "Name and amount required", variant: "destructive" });
      return;
    }
    const benefits = form.benefits.split("\n").map(s => s.trim()).filter(Boolean);
    const { error } = await (supabase as any).from("talent_sponsor_tiers").insert({
      campaign_id: campaignId,
      tier_name: form.tier_name,
      min_amount: amount,
      benefits,
      perk_icon: form.perk_icon,
      sort_order: tiers.length,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setForm({ tier_name: "", min_amount: "", benefits: "", perk_icon: "gold" });
    setAdding(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("talent_sponsor_tiers").delete().eq("id", id);
    load();
  };

  if (tiers.length === 0 && !isOwner) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Sponsor Tiers & Benefits
        </CardTitle>
        <CardDescription>Choose how you want to support — every tier unlocks unique perks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tiers.map(tier => {
          const Icon = tierIcons[tier.perk_icon || "gold"] || Star;
          return (
            <div key={tier.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{tier.tier_name}</span>
                  <Badge variant="outline">from €{tier.min_amount.toFixed(0)}</Badge>
                </div>
                {isOwner && (
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(tier.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {tier.benefits.map((b, i) => (
                  <li key={i} className="flex gap-2"><span className="text-primary">✓</span>{b}</li>
                ))}
              </ul>
            </div>
          );
        })}

        {isOwner && (
          adding ? (
            <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
              <div>
                <Label>Tier name</Label>
                <Input value={form.tier_name} onChange={e => setForm({ ...form, tier_name: e.target.value })} placeholder="Gold Sponsor" />
              </div>
              <div>
                <Label>Min amount (€)</Label>
                <Input type="number" value={form.min_amount} onChange={e => setForm({ ...form, min_amount: e.target.value })} placeholder="50" />
              </div>
              <div>
                <Label>Benefits (one per line)</Label>
                <Textarea value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} rows={3} placeholder="Signed poster&#10;Backstage access" />
              </div>
              <div>
                <Label>Icon</Label>
                <select className="w-full border rounded px-3 py-2 bg-background" value={form.perk_icon} onChange={e => setForm({ ...form, perk_icon: e.target.value })}>
                  <option value="bronze">Bronze ⭐</option>
                  <option value="silver">Silver ✨</option>
                  <option value="gold">Gold 💎</option>
                  <option value="platinum">Platinum 👑</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} className="flex-1">Save tier</Button>
                <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setAdding(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add sponsor tier
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
};
