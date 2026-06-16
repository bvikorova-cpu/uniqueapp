import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CreditCard, Globe, Bitcoin, Plus, Trash2, CheckCircle2, Star, Loader2,
} from "lucide-react";

type MethodType = "paypal" | "wise" | "crypto" | "stripe_connect";

interface PayoutMethod {
  id: string;
  method_type: MethodType;
  label: string | null;
  account_holder: string | null;
  account_details: Record<string, any>;
  currency: string;
  country: string | null;
  is_default: boolean;
  is_verified: boolean;
}

interface Props {
  onChange?: (hasMethod: boolean) => void;
}

const METHOD_META: Record<MethodType, { icon: any; label: string; desc: string; fields: { key: string; label: string; placeholder: string; type?: string }[]; color: string }> = {
  paypal: {
    icon: Globe, label: "PayPal",
    desc: "Worldwide — instant, ~2% fee",
    color: "from-sky-500 to-indigo-500",
    fields: [{ key: "email", label: "PayPal email", placeholder: "you@example.com", type: "email" }],
  },
  wise: {
    icon: Globe, label: "Wise (TransferWise)",
    desc: "80+ countries, low FX fees",
    color: "from-emerald-500 to-teal-500",
    fields: [
      { key: "email", label: "Wise email", placeholder: "you@example.com", type: "email" },
      { key: "wise_id", label: "Wise tag (optional)", placeholder: "@yourtag" },
    ],
  },
  crypto: {
    icon: Bitcoin, label: "Crypto wallet",
    desc: "USDT / USDC / BTC — global, instant",
    color: "from-amber-500 to-orange-500",
    fields: [
      { key: "network", label: "Network", placeholder: "TRC20 / ERC20 / BEP20 / Bitcoin" },
      { key: "wallet_address", label: "Wallet address", placeholder: "0x... or T..." },
      { key: "asset", label: "Asset", placeholder: "USDT" },
    ],
  },
  stripe_connect: {
    icon: CreditCard, label: "Stripe Connect",
    desc: "40+ countries — bank or card payouts",
    color: "from-violet-500 to-purple-500",
    fields: [{ key: "note", label: "Click 'Connect Stripe' below to onboard", placeholder: "" }],
  },
};

export const PayoutMethodsManager = ({ onChange }: Props) => {
  const { toast } = useToast();
  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<MethodType>("paypal");
  const [form, setForm] = useState<Record<string, string>>({});
  const [accountHolder, setAccountHolder] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("EUR");

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("payout_methods")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    const list = (data as any[]) || [];
    setMethods(list);
    onChange?.(list.length > 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const meta = METHOD_META[selectedType];
    const required = meta.fields.filter(f => !f.label.includes("optional") && f.key !== "note");
    const missing = required.find(f => !form[f.key]?.trim());
    if (missing && selectedType !== "stripe_connect") {
      toast({ title: "Missing field", description: `Please fill in ${missing.label}`, variant: "destructive" });
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("payout_methods").insert({
      user_id: user.id,
      method_type: selectedType,
      label: meta.label,
      account_holder: accountHolder || null,
      account_details: form,
      currency,
      country: country || null,
      is_default: methods.length === 0,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Payout method added", description: `${meta.label} is ready to receive payouts.` });
      setOpen(false);
      setForm({});
      setAccountHolder("");
      setCountry("");
      load();
    }
    setSaving(false);
  };

  const setDefault = async (id: string) => {
    await supabase.from("payout_methods").update({ is_default: true }).eq("id", id);
    toast({ title: "Default updated" });
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("payout_methods").delete().eq("id", id);
    toast({ title: "Method removed" });
    load();
  };

  const meta = METHOD_META[selectedType];
  const Icon = meta.icon;

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-black flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-500" /> Payout methods
          </h3>
          <p className="text-xs text-muted-foreground">Receive earnings worldwide — pick your preferred channel</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold gap-1">
              <Plus className="h-4 w-4" /> Add method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add a payout method</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider">Method</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(Object.keys(METHOD_META) as MethodType[]).map((t) => {
                    const m = METHOD_META[t];
                    const I = m.icon;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setSelectedType(t); setForm({}); }}
                        className={`p-3 rounded-lg border-2 text-left transition ${
                          selectedType === t
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-border hover:border-amber-500/40"
                        }`}
                      >
                        <div className={`inline-flex p-1.5 rounded bg-gradient-to-br ${m.color} mb-1.5`}>
                          <I className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="text-xs font-bold">{m.label}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{m.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="holder" className="text-xs">Account holder</Label>
                  <Input id="holder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <Label htmlFor="country" className="text-xs">Country</Label>
                  <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="SK / US / IN..." />
                </div>
              </div>

              <div>
                <Label className="text-xs">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["EUR","USD","GBP","CHF","CAD","AUD","JPY","INR","BRL","USDT"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-bold">{meta.label}</p>
                </div>
                <p className="text-xs text-muted-foreground">{meta.desc}</p>

                {selectedType === "stripe_connect" ? (
                  <Button
                    type="button"
                    onClick={async () => {
                      try {
                        const { supabase } = await import("@/integrations/supabase/client");
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session) { toast({ title: "Log in first", variant: "destructive" }); return; }
                        const { data, error } = await supabase.functions.invoke("stripe-connect-onboarding", { body: {} });
                        if (error) throw error;
                        if (data?.url) window.open(data.url, "_blank");
                        else toast({ title: "Onboarding started" });
                      } catch (e: any) {
                        toast({ title: "Error", description: e.message || "Stripe Connect failed", variant: "destructive" });
                      }
                    }}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold"
                  >
                    Connect Stripe account
                  </Button>
                ) : (
                  meta.fields.map((f) => (
                    <div key={f.key}>
                      <Label htmlFor={f.key} className="text-xs">{f.label}</Label>
                      <Input
                        id={f.key}
                        type={f.type || "text"}
                        value={form[f.key] || ""}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                      />
                    </div>
                  ))
                )}
              </div>

              {selectedType !== "stripe_connect" && (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save method"}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-amber-500" /></div>
      ) : methods.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-lg border-2 border-dashed border-amber-500/30 bg-amber-500/5">
          <Globe className="h-8 w-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm font-bold mb-1">No payout method yet</p>
          <p className="text-xs text-muted-foreground mb-3">
            Choose from PayPal, Wise, Crypto or Stripe Connect — all fully automated.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {methods.map((m) => {
              const mm = METHOD_META[m.method_type];
              const I = mm.icon;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/60 hover:border-amber-500/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${mm.color} shrink-0`}>
                      <I className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold truncate">{mm.label}</p>
                        {m.is_default && (
                          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 text-[10px]">
                            <Star className="h-2.5 w-2.5 mr-0.5" /> Default
                          </Badge>
                        )}
                        {m.is_verified && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {m.account_holder || "—"} · {m.currency}
                        {m.country ? ` · ${m.country}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!m.is_default && (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={() => setDefault(m.id)}>
                        Make default
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(m.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
};
