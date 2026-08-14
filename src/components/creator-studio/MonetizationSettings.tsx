import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Crown, MessageCircle, Loader2, Plus, Save, Trash2 } from "lucide-react";

type Slot = "bronze" | "silver" | "gold";

interface ClubRow {
  id: string;
  name: string;
  description: string | null;
  tier: Slot;
  price_cents: number;
  is_active: boolean;
  member_count: number;
}

const SLOT_LABEL: Record<Slot, string> = {
  bronze: "Entry level (bronze)",
  silver: "Mid level (silver)",
  gold: "Top level (gold)",
};

export const MonetizationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, { name: string; price: string; description: string; tier: Slot }>>({});
  const [newTier, setNewTier] = useState<{ name: string; price: string; description: string; tier: Slot }>({
    name: "",
    price: "",
    description: "",
    tier: "bronze",
  });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Paid DM settings
  const [msgLoading, setMsgLoading] = useState(true);
  const [msgSaving, setMsgSaving] = useState(false);
  const [pricePerMessage, setPricePerMessage] = useState("5");
  const [shoutoutPrice, setShoutoutPrice] = useState("20");
  const [msgEnabled, setMsgEnabled] = useState(true);
  const [shoutoutEnabled, setShoutoutEnabled] = useState(true);

  const fetchClubs = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("influencer_fan_clubs")
      .select("id, name, description, tier, price_cents, is_active, member_count")
      .eq("creator_id", user.id)
      .order("price_cents", { ascending: true });
    const rows = (data as ClubRow[]) ?? [];
    setClubs(rows);
    const next: Record<string, { name: string; price: string; description: string; tier: Slot }> = {};
    rows.forEach((r) => {
      next[r.id] = {
        name: r.name,
        price: (r.price_cents / 100).toFixed(2),
        description: r.description ?? "",
        tier: r.tier,
      };
    });
    setDrafts(next);
    setLoading(false);
  };

  useEffect(() => {
    fetchClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
      .from("influencer_fan_clubs")
      .update({
        name: d.name.trim(),
        price_cents: Math.round(price * 100),
        description: d.description.trim() || "",
        tier: d.tier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tier updated", description: `${d.name} — €${price.toFixed(2)}/month` });
    fetchClubs();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await (supabase as any).from("influencer_fan_clubs").update({ is_active: active }).eq("id", id);
    fetchClubs();
  };

  const removeTier = async (id: string) => {
    const { error } = await (supabase as any).from("influencer_fan_clubs").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not delete", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tier removed" });
    fetchClubs();
  };

  const addTier = async () => {
    if (!user?.id || creating) return;
    const price = Number(newTier.price);
    if (!newTier.name.trim() || !Number.isFinite(price) || price < 1) {
      toast({ title: "Invalid tier", description: "Enter a name and a price of at least €1.", variant: "destructive" });
      return;
    }
    if (clubs.some((c) => c.tier === newTier.tier)) {
      toast({
        title: "Slot already used",
        description: `You already have a ${newTier.tier} tier — edit it or pick another level.`,
        variant: "destructive",
      });
      return;
    }
    setCreating(true);
    const { error } = await (supabase as any).from("influencer_fan_clubs").insert({
      creator_id: user.id,
      tier: newTier.tier,
      name: newTier.name.trim(),
      description: newTier.description.trim() || "",
      price_cents: Math.round(price * 100),
      perks: [],
      is_active: true,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Could not create tier", description: error.message, variant: "destructive" });
      return;
    }
    setNewTier({ name: "", price: "", description: "", tier: "bronze" });
    toast({ title: "Tier created", description: `€${price.toFixed(2)}/month — now visible on your profile.` });
    fetchClubs();
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
