import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Settings {
  id: number;
  enabled: boolean;
  monthly_amount: number;
  timezone: string;
}

const TIMEZONES = [
  "Europe/Bratislava", "Europe/Prague", "Europe/Vienna", "Europe/Berlin",
  "Europe/London", "Europe/Paris", "Europe/Madrid", "UTC", "America/New_York",
];

export const FreeTierSettingsPanel = () => {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("free_tier_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (data) setS(data);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!s) return;
    setSaving(true);
    const { error } = await (supabase as any)
      .from("free_tier_settings")
      .update({
        enabled: s.enabled,
        monthly_amount: s.monthly_amount,
        timezone: s.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Free tier settings saved");
  };

  if (loading || !s) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-accent" />
          <CardTitle>Free Tier Credits</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-muted/30">
          <div>
            <p className="font-semibold">Enable free tier</p>
            <p className="text-xs text-muted-foreground">
              When off, new signups get no free credits and monthly top-ups stop.
            </p>
          </div>
          <Switch
            checked={s.enabled}
            onCheckedChange={(v) => setS({ ...s, enabled: v })}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monthly amount (credits)</Label>
            <Input
              id="amount"
              type="number"
              min={0}
              max={1000}
              value={s.monthly_amount}
              onChange={(e) =>
                setS({ ...s, monthly_amount: Math.max(0, parseInt(e.target.value) || 0) })
              }
            />
            <p className="text-[11px] text-muted-foreground">
              Granted on signup and once at the start of each calendar month.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tz">Reset timezone</Label>
            <select
              id="tz"
              value={s.timezone}
              onChange={(e) => setS({ ...s, timezone: e.target.value })}
              className="w-full h-10 px-3 rounded-md border bg-background"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Month boundary uses this timezone (avoids UTC edge cases).
            </p>
          </div>
        </div>

        <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Save settings
        </Button>
      </CardContent>
    </Card>
  );
};
