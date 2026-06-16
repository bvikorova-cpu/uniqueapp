import { useState } from "react";
import { Crown, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreatorTiers } from "@/hooks/useCreatorSubscriptions";
import { useToast } from "@/hooks/use-toast";

interface Props {
  creatorId?: string;
}

export function CreatorSubscriptionDialog({ creatorId }: Props) {
  const [open, setOpen] = useState(false);
  const { tiers, loading, createTier, toggleTier, subscribe } = useCreatorTiers(creatorId);
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", description: "", price: 4.99, benefits: "" });
  const [creating, setCreating] = useState(false);
  const isOwn = !creatorId;

  const onCreate = async () => {
    if (!form.name || form.price <= 0) {
      toast({ title: "Fill in the name and price", variant: "destructive" });
      return;
    }
    setCreating(true);
    const benefits = form.benefits.split("\n").map((s) => s.trim()).filter(Boolean);
    const err = await createTier({
      name: form.name,
      description: form.description,
      price: form.price,
      benefits,
    });
    setCreating(false);
    if (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } else {
      setForm({ name: "", description: "", price: 4.99, benefits: "" });
      toast({ title: "Tier created" });
    }
  };

  const onSubscribe = async (id: string) => {
    try {
      await subscribe(id);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Crown className="h-4 w-4" />
          {isOwn ? "My tiers" : "Subscription"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isOwn ? "Creator subscription tiers" : "Support the creator"}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {tiers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isOwn ? "No tiers yet — create your first one." : "Creator has no active tiers."}
              </p>
            )}
            {tiers.map((t) => (
              <div key={t.id} className="rounded-lg border border-border/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">€{Number(t.price).toFixed(2)}/mes</p>
                  </div>
                  {isOwn ? (
                    <Switch
                      checked={t.is_active}
                      onCheckedChange={(v) => toggleTier(t.id, v)}
                    />
                  ) : (
                    <Button size="sm" onClick={() => onSubscribe(t.id)}>
                      Subscribe
                    </Button>
                  )}
                </div>
                {t.description && <p className="text-sm">{t.description}</p>}
                {t.benefits && t.benefits.length > 0 && (
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    {t.benefits.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {isOwn && (
          <div className="space-y-2 border-t border-border/40 pt-3">
            <p className="text-sm font-semibold flex items-center gap-1">
              <Plus className="h-4 w-4" /> New tier
            </p>
            <Input
              placeholder="Name (e.g. Bronze, Silver)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Textarea
              placeholder="Popis"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Cena EUR / mesiac"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            />
            <Textarea
              placeholder="Benefity (jeden na riadok)"
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
              rows={3}
            />
            <Button onClick={onCreate} disabled={creating} className="w-full">
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create tier
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
