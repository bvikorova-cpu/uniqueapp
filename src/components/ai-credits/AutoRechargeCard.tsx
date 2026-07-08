import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, CreditCard, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Settings {
  enabled: boolean;
  threshold: number;
  package_credits: number;
  package_price_eur: number;
  stripe_payment_method_id?: string | null;
  last_recharge_at?: string | null;
  last_recharge_status?: string | null;
  last_error?: string | null;
}

const PACKAGES = [
  { credits: 10, price: 5, label: "Starter · 10 credits · €5" },
  { credits: 25, price: 10, label: "Basic · 25 credits · €10" },
  { credits: 60, price: 20, label: "Pro · 60 credits · €20" },
  { credits: 150, price: 40, label: "Ultimate · 150 credits · €40" },
];

// Auto-recharge backend (`ai-auto-recharge` edge function) is not deployed yet.
// Hide the card entirely until the backend ships to avoid CORS / 404 errors.
const AUTO_RECHARGE_ENABLED = false;

const AutoRechargeCardImpl = ({ currentBalance }: { currentBalance: number }) => {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    enabled: false, threshold: 10, package_credits: 25, package_price_eur: 10,
  });
  const [pm, setPm] = useState<{ brand?: string; last4?: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-auto-recharge", {
        body: { action: "get_settings" },
      });
      if (error) throw error;
      if (data?.settings) setSettings({
        enabled: data.settings.enabled,
        threshold: data.settings.threshold,
        package_credits: data.settings.package_credits,
        package_price_eur: Number(data.settings.package_price_eur),
        stripe_payment_method_id: data.settings.stripe_payment_method_id,
        last_recharge_at: data.settings.last_recharge_at,
        last_recharge_status: data.settings.last_recharge_status,
        last_error: data.settings.last_error,
      });
      setPm(data?.paymentMethod ?? null);
    } catch (e: any) {
      console.warn("auto-recharge load", e);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    // Handle redirect from Stripe setup checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get("autorecharge") === "setup_success") {
      const sid = params.get("session_id");
      if (sid) {
        (async () => {
          await supabase.functions.invoke("ai-auto-recharge", {
            body: { action: "confirm_setup", session_id: sid },
          });
          toast.success("Card saved. Auto-recharge is active.");
          window.history.replaceState({}, "", "/ai-credits-store");
          load();
        })();
      }
    } else if (params.get("autorecharge") === "setup_canceled") {
      toast.info("Setup canceled");
      window.history.replaceState({}, "", "/ai-credits-store");
    }
  }, []);

  const setupCard = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-auto-recharge", {
        body: { action: "save_setup_link" },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e?.message || "Failed to start setup");
    } finally { setBusy(false); }
  };

  const save = async (next: Partial<Settings>) => {
    const merged = { ...settings, ...next };
    setSettings(merged);
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("ai-auto-recharge", {
        body: {
          action: "save_settings",
          enabled: merged.enabled,
          threshold: merged.threshold,
          package_credits: merged.package_credits,
          package_price_eur: merged.package_price_eur,
        },
      });
      if (error) throw error;
      toast.success("Saved");
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally { setBusy(false); }
  };

  // Auto-trigger charge when balance dips below threshold
  useEffect(() => {
    if (!settings.enabled || !pm) return;
    if (currentBalance > settings.threshold) return;
    const key = `ai_auto_recharge_last_${new Date().toISOString().slice(0,10)}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("ai-auto-recharge", {
          body: { action: "charge" },
        });
        if (error) throw error;
        if (data?.skipped) return;
        if (data?.ok) {
          toast.success(`Auto-recharged: +${data.credits_added} credits`);
          load();
        }
      } catch (e: any) {
        toast.error(`Auto-recharge failed: ${e.message || "unknown"}`);
      }
    })();
  }, [currentBalance, settings.enabled, settings.threshold, pm]);

  const hasCard = !!pm?.last4;

  return (
    <>
      <FloatingHowItWorks title={"Auto Recharge Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Auto Recharge Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Auto Recharge Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="max-w-3xl mx-auto mb-8 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/5">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Auto-recharge
              {settings.enabled && hasCard && <Badge className="bg-emerald-500 text-white">Active</Badge>}
            </CardTitle>
            <CardDescription>Never run out — top up automatically when your balance gets low.</CardDescription>
          </div>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {!hasCard ? (
          <div className="rounded-lg border border-dashed p-4 flex items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-semibold">Save a payment method</p>
              <p className="text-muted-foreground text-xs">Stored securely by Stripe. Used only when balance drops below your threshold.</p>
            </div>
            <Button onClick={setupCard} disabled={busy} className="shrink-0">
              <CreditCard className="w-4 h-4 mr-2" /> Add card
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border p-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="font-medium capitalize">{pm?.brand}</span>
              <span className="text-muted-foreground">•••• {pm?.last4}</span>
            </div>
            <Button size="sm" variant="ghost" onClick={setupCard} disabled={busy}>Replace</Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="ar-enabled" className="font-semibold">Enabled</Label>
            <p className="text-xs text-muted-foreground">Charge automatically when balance is low</p>
          </div>
          <Switch
            id="ar-enabled"
            checked={settings.enabled}
            disabled={!hasCard || busy}
            onCheckedChange={(v) => save({ enabled: v })}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Recharge when balance ≤</Label>
            <Input
              type="number" min={1} max={500}
              value={settings.threshold}
              onChange={(e) => setSettings(s => ({ ...s, threshold: Number(e.target.value) }))}
              onBlur={() => save({ threshold: settings.threshold })}
              disabled={busy}
            />
            <p className="text-[11px] text-muted-foreground mt-1">credits</p>
          </div>
          <div>
            <Label className="text-xs">Recharge package</Label>
            <Select
              value={String(settings.package_credits)}
              onValueChange={(v) => {
                const pkg = PACKAGES.find(p => p.credits === Number(v))!;
                save({ package_credits: pkg.credits, package_price_eur: pkg.price });
              }}
              disabled={busy}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PACKAGES.map(p => (
                  <SelectItem key={p.credits} value={String(p.credits)}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {settings.last_recharge_at && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            Last attempt: {new Date(settings.last_recharge_at).toLocaleString()} —{" "}
            <span className={settings.last_recharge_status === "succeeded" ? "text-emerald-500" : "text-destructive"}>
              {settings.last_recharge_status}
            </span>
            {settings.last_error && (
              <div className="mt-1 flex items-start gap-1 text-destructive">
                <AlertTriangle className="w-3 h-3 mt-0.5" /> {settings.last_error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};

export const AutoRechargeCard = (props: { currentBalance: number }) => {
  if (!AUTO_RECHARGE_ENABLED) return null;
  return <AutoRechargeCardImpl {...props} />;
};

export default AutoRechargeCard;
