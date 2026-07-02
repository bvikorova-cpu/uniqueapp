import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Repeat, Save } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/** User-controlled rule: auto-withdraw funds when balance hits a threshold. */
export function AutoWithdrawSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState(100);
  const [minBalance, setMinBalance] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from("auto_withdraw_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setEnabled(!!data.enabled);
        setThreshold(Number(data.threshold_eur));
        setMinBalance(Number(data.min_balance_eur));
      }
    })();
  }, [user?.id]);

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    const { error } = await supabase.from("auto_withdraw_settings").upsert(
      {
        user_id: user.id,
        enabled,
        threshold_eur: threshold,
        min_balance_eur: minBalance,
        preferred_method: "stripe_connect",
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Auto-withdraw saved", description: enabled ? `Triggers at €${threshold}` : "Disabled" });
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Auto Withdraw Settings - How it works"} steps={[{ title: 'Open', desc: 'Access the Auto Withdraw Settings section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Auto Withdraw Settings.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Repeat className="h-4 w-4 text-primary" /> Auto-withdraw
        </CardTitle>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Trigger at balance (€)</Label>
          <Input
            type="number"
            min={25}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            disabled={!enabled}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Keep minimum reserve (€)</Label>
          <Input
            type="number"
            min={0}
            value={minBalance}
            onChange={(e) => setMinBalance(Number(e.target.value))}
            disabled={!enabled}
          />
        </div>
        <Button onClick={save} disabled={saving} size="sm" className="w-full gap-2">
          <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save rule"}
        </Button>
        <p className="text-[11px] text-muted-foreground">
          Sweep runs daily and pays via Stripe Connect when balance ≥ trigger.
        </p>
      </CardContent>
    </Card>
    </>
  );
}
