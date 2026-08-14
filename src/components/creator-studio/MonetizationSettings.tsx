import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCreatorTiers } from "@/hooks/useCreatorSubscriptions";
import { Crown, MessageCircle, Loader2, Plus, Save, Trash2 } from "lucide-react";

export const MonetizationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { tiers, loading, createTier, toggleTier, refetch } = useCreatorTiers(user?.id);

  const [drafts, setDrafts] = useState<Record<string, { name: string; price: string; description: string }>>({});
  const [newTier, setNewTier] = useState({ name: "", price: "", description: "" });
  const [savingId, setSavingId] = useState<string | null>(null);

  // Paid DM settings
  const [msgLoading, setMsgLoading] = useState(true);
  const [msgSaving, setMsgSaving] = useState(false);
  const [pricePerMessage, setPricePerMessage] = useState("5");
  const [shoutoutPrice, setShoutoutPrice] = useState("20");
  const [msgEnabled, setMsgEnabled] = useState(true);
  const [shoutoutEnabled, setShoutoutEnabled] = useState(true);

  useEffect(() => {
    const next: Record<string, { name: string; price: string; description: string }> = {};
    tiers.forEach((t) => {
      next[t.id] = { name: t.name, price: String(t.price ?? ""), description: t.description ?? "" };
    });
    setDrafts(next);
  }, [tiers]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("creator_message_settings")
        .select("price_per_message, shoutout_price, is_enabled, shoutout_enabled")
        .eq("creator_id", user.id)
        .maybeSingle();
      if (data) {
        setPricePerMessage(String(data.price_per_message ?? 5));
        setShoutoutPrice(String(data.shoutout_price ?? 20));
        setMsgEnabled(data.is_enabled !== false);
        setShoutoutEnabled(data.shoutout_enabled !== false);
      }
      setMsgLoading(false);
    })();
  }, [user?.id]);

  const saveTier = async (id: string) => {
    const d = drafts[id];
    if (!d) return;
    const price = Number(d.price);
    if (!d.name.trim() || !Number.isFinite(price) || price < 1) {
      toast({ title: "Invalid tier", description: "Name is required and price must be at least €1.", variant: "destructive" });
      return;
    }
    setSavingId(id);
    const { error } = await (supabase as any)
      .from("creator_subscription_tiers")
      .update({ name: d.name.trim(), price, description: d.description.trim() || null })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tier updated", description: `${d.name} — €${price.toFixed(2)}/month` });
    refetch();
  };

  const removeTier = async (id: string) => {
    const { error } = await (supabase as any).from("creator_subscription_tiers").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not delete", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tier removed" });
    refetch();
  };

  const addTier = async () => {
    const price = Number(newTier.price);
    if (!newTier.name.trim() || !Number.isFinite(price) || price < 1) {
      toast({ title: "Invalid tier", description: "Enter a name and a price of at least €1.", variant: "destructive" });
      return;
    }
    const error = await createTier({
      name: newTier.name.trim(),
      price,
      description: newTier.description.trim() || undefined,
    });
    if (error) {
      toast({ title: "Could not create tier", description: (error as any).message, variant: "destructive" });
      return;
    }
    setNewTier({ name: "", price: "", description: "" });
    toast({ title: "Tier created", description: `€${price.toFixed(2)}/month` });
  };

  const saveMessageSettings = async () => {
    if (!user?.id) return;
    const dm = Number(pricePerMessage);
    const shout = Number(shoutoutPrice);
    if (!Number.isFinite(dm) || dm < 1 || !Number.isFinite(shout) || shout < 1) {
      toast({ title: "Invalid price", description: "Prices must be at least €1.", variant: "destructive" });
      return;
    }
    setMsgSaving(true);
    const { error } = await (supabase as any)
      .from("creator_message_settings")
      .upsert(
        {
          creator_id: user.id,
          price_per_message: dm,
          shoutout_price: shout,
          is_enabled: msgEnabled,
          shoutout_enabled: shoutoutEnabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "creator_id" }
      );
    setMsgSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Message pricing saved", description: `DM €${dm.toFixed(2)} · Shoutout €${shout.toFixed(2)}` });
  };

  return (
    <div className="space-y-6">
      <Card className="p-5 space-y-5">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-black">Fan club subscription prices</h3>
          <Badge variant="secondary" className="ml-auto">85/15 split</Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : tiers.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No tiers yet — create your first one below.</p>
        ) : (
          <div className="space-y-4">
            {tiers.map((t) => {
              const d = drafts[t.id] ?? { name: t.name, price: String(t.price), description: t.description ?? "" };
              return (
                <div key={t.id} className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
                    <div className="space-y-1.5">
                      <Label>Tier name</Label>
                      <Input
                        value={d.name}
                        onChange={(e) => setDrafts((p) => ({ ...p, [t.id]: { ...d, name: e.target.value } }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Price (€ / month)</Label>
                      <Input
                        type="number"
                        min={1}
                        step="0.5"
                        value={d.price}
                        onChange={(e) => setDrafts((p) => ({ ...p, [t.id]: { ...d, price: e.target.value } }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea
                      rows={2}
                      value={d.description}
                      onChange={(e) => setDrafts((p) => ({ ...p, [t.id]: { ...d, description: e.target.value } }))}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm" onClick={() => saveTier(t.id)} disabled={savingId === t.id}>
                      {savingId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span className="ml-1.5">Save price</span>
                    </Button>
                    <div className="flex items-center gap-2">
                      <Switch checked={t.is_active} onCheckedChange={(v) => toggleTier(t.id, v)} />
                      <span className="text-xs text-muted-foreground">{t.is_active ? "Active" : "Hidden"}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="ml-auto text-destructive" onClick={() => removeTier(t.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-xl border border-dashed border-primary/40 p-4 space-y-3">
          <p className="text-sm font-bold uppercase tracking-wider">Add a new tier</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
            <Input
              placeholder="e.g. VIP"
              value={newTier.name}
              onChange={(e) => setNewTier((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              type="number"
              min={1}
              step="0.5"
              placeholder="9.99"
              value={newTier.price}
              onChange={(e) => setNewTier((p) => ({ ...p, price: e.target.value }))}
            />
          </div>
          <Textarea
            rows={2}
            placeholder="What subscribers get"
            value={newTier.description}
            onChange={(e) => setNewTier((p) => ({ ...p, description: e.target.value }))}
          />
          <Button onClick={addTier}>
            <Plus className="h-4 w-4 mr-1.5" /> Create tier
          </Button>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-black">Paid DMs & shoutouts</h3>
        </div>
        {msgLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Price per DM (€)</Label>
                <Input type="number" min={1} step="0.5" value={pricePerMessage} onChange={(e) => setPricePerMessage(e.target.value)} />
                <div className="flex items-center gap-2 pt-1">
                  <Switch checked={msgEnabled} onCheckedChange={setMsgEnabled} />
                  <span className="text-xs text-muted-foreground">Accept paid DMs</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Shoutout price (€)</Label>
                <Input type="number" min={1} step="0.5" value={shoutoutPrice} onChange={(e) => setShoutoutPrice(e.target.value)} />
                <div className="flex items-center gap-2 pt-1">
                  <Switch checked={shoutoutEnabled} onCheckedChange={setShoutoutEnabled} />
                  <span className="text-xs text-muted-foreground">Accept shoutout requests</span>
                </div>
              </div>
            </div>
            <Button onClick={saveMessageSettings} disabled={msgSaving}>
              {msgSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span className="ml-1.5">Save message pricing</span>
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};
