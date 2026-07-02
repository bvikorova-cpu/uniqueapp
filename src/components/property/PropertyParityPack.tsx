import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Pencil, LineChart, Users, Handshake, Sofa, MapPin, TrendingUp, ScrollText } from "lucide-react";
import { motion } from "framer-motion";
import { usePropertyParity, PROPERTY_PARITY_COST, type PropertyParityAction } from "@/hooks/usePropertyParity";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TOOLS: { id: PropertyParityAction; label: string; icon: any; desc: string; color: string }[] = [
  { id: "listing-optimizer", label: "Listing Optimizer", icon: Pencil, desc: "SEO headline & hooks", color: "from-violet-500 to-purple-600" },
  { id: "pricing-strategy", label: "Pricing Strategy", icon: LineChart, desc: "Suggested price & range", color: "from-blue-500 to-cyan-500" },
  { id: "buyer-persona", label: "Buyer Persona", icon: Users, desc: "Target audience profile", color: "from-emerald-500 to-teal-500" },
  { id: "negotiation-coach", label: "Negotiation Coach", icon: Handshake, desc: "Scripts & walk-away price", color: "from-orange-500 to-red-500" },
  { id: "staging-brief", label: "Staging Brief", icon: Sofa, desc: "Room-by-room makeover", color: "from-rose-500 to-pink-500" },
  { id: "neighborhood-pitch", label: "Neighborhood Pitch", icon: MapPin, desc: "Lifestyle storytelling", color: "from-lime-500 to-emerald-500" },
  { id: "rental-yield", label: "Rental Yield", icon: TrendingUp, desc: "Investment analysis", color: "from-amber-500 to-yellow-500" },
  { id: "legal-checklist", label: "Legal Checklist", icon: ScrollText, desc: "Docs & transaction steps", color: "from-fuchsia-500 to-pink-500" },
];

export function PropertyParityPack() {
  const { run, isRunning, lastResult, lastAction } = usePropertyParity();
  const [tab, setTab] = useState<PropertyParityAction>("listing-optimizer");
  const [form, setForm] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const submit = (action: PropertyParityAction, payload: Record<string, unknown>) => run({ action, payload });
  const result = lastAction === tab && (lastResult as any)?.result;

  return (
    <>
      <FloatingHowItWorks title={"Property Parity Pack - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Parity Pack section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Parity Pack.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          <Sparkles className="h-5 w-5 text-primary" />
          Property Parity Pack
        </CardTitle>
        <CardDescription>8 advanced AI real-estate tools · {PROPERTY_PARITY_COST} credits per run</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => { setTab(v as PropertyParityAction); setForm({}); }}>
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-1 h-auto bg-background/50 p-1">
            {TOOLS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="flex-col gap-1 py-2 px-1 text-[10px] data-[state=active]:bg-primary/20">
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {TOOLS.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shrink-0`}>
                  <t.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black">{t.label}</h3>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              </div>

              {t.id === "listing-optimizer" && (
                <ToolForm onRun={() => submit(t.id, { type: form.type, city: form.city, size_m2: form.size, price_eur: form.price, features: form.features })}>
                  <Field label="Property type" value={form.type} onChange={(v) => set("type", v)} placeholder="2-bedroom apartment" />
                  <Field label="City / district" value={form.city} onChange={(v) => set("city", v)} placeholder="Berlin, Mitte" />
                  <Field label="Size (m²)" value={form.size} onChange={(v) => set("size", v)} placeholder="75" />
                  <Field label="Asking price (€)" value={form.price} onChange={(v) => set("price", v)} placeholder="220000" />
                  <Field label="Key features" value={form.features} onChange={(v) => set("features", v)} placeholder="balcony, parking, near park" multiline />
                </ToolForm>
              )}
              {t.id === "pricing-strategy" && (
                <ToolForm onRun={() => submit(t.id, { type: form.type, city: form.city, size_m2: form.size, condition: form.condition, comparables: form.comps })}>
                  <Field label="Property type" value={form.type} onChange={(v) => set("type", v)} placeholder="3-bed family house" />
                  <Field label="City / district" value={form.city} onChange={(v) => set("city", v)} placeholder="Košice" />
                  <Field label="Size (m²)" value={form.size} onChange={(v) => set("size", v)} placeholder="120" />
                  <Field label="Condition" value={form.condition} onChange={(v) => set("condition", v)} placeholder="newly renovated" />
                  <Field label="Comparable listings" value={form.comps} onChange={(v) => set("comps", v)} placeholder="similar units at 240-280k €" multiline />
                </ToolForm>
              )}
              {t.id === "buyer-persona" && (
                <ToolForm onRun={() => submit(t.id, { listing: form.listing, city: form.city, price_eur: form.price })}>
                  <Field label="Listing summary" value={form.listing} onChange={(v) => set("listing", v)} placeholder="loft, open plan, city center" multiline />
                  <Field label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="Berlin" />
                  <Field label="Price (€)" value={form.price} onChange={(v) => set("price", v)} placeholder="180000" />
                </ToolForm>
              )}
              {t.id === "negotiation-coach" && (
                <ToolForm onRun={() => submit(t.id, { asking_eur: form.ask, buyer_offer_eur: form.offer, market: form.market, urgency: form.urgency })}>
                  <Field label="Asking price (€)" value={form.ask} onChange={(v) => set("ask", v)} placeholder="250000" />
                  <Field label="Buyer's offer (€)" value={form.offer} onChange={(v) => set("offer", v)} placeholder="230000" />
                  <Field label="Market conditions" value={form.market} onChange={(v) => set("market", v)} placeholder="buyer's market, slow" />
                  <Field label="Your urgency" value={form.urgency} onChange={(v) => set("urgency", v)} placeholder="need to sell in 60 days" />
                </ToolForm>
              )}
              {t.id === "staging-brief" && (
                <ToolForm onRun={() => submit(t.id, { rooms: form.rooms, style_goal: form.style, budget_eur: form.budget })}>
                  <Field label="Rooms" value={form.rooms} onChange={(v) => set("rooms", v)} placeholder="living, kitchen, 2 bedrooms" />
                  <Field label="Style goal" value={form.style} onChange={(v) => set("style", v)} placeholder="warm Scandinavian" />
                  <Field label="Total budget (€)" value={form.budget} onChange={(v) => set("budget", v)} placeholder="1500" />
                </ToolForm>
              )}
              {t.id === "neighborhood-pitch" && (
                <ToolForm onRun={() => submit(t.id, { city: form.city, district: form.district, target_buyer: form.target })}>
                  <Field label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="Berlin" />
                  <Field label="District / area" value={form.district} onChange={(v) => set("district", v)} placeholder="Ružinov" />
                  <Field label="Target buyer" value={form.target} onChange={(v) => set("target", v)} placeholder="young family with 2 kids" />
                </ToolForm>
              )}
              {t.id === "rental-yield" && (
                <ToolForm onRun={() => submit(t.id, { purchase_eur: form.price, expected_rent_eur: form.rent, city: form.city, expenses_eur: form.exp })}>
                  <Field label="Purchase price (€)" value={form.price} onChange={(v) => set("price", v)} placeholder="200000" />
                  <Field label="Expected monthly rent (€)" value={form.rent} onChange={(v) => set("rent", v)} placeholder="850" />
                  <Field label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="Berlin" />
                  <Field label="Yearly expenses (€)" value={form.exp} onChange={(v) => set("exp", v)} placeholder="1200" />
                </ToolForm>
              )}
              {t.id === "legal-checklist" && (
                <ToolForm onRun={() => submit(t.id, { country: form.country, transaction: form.tx, property_type: form.type })}>
                  <Field label="Country" value={form.country} onChange={(v) => set("country", v)} placeholder="Germany" />
                  <Field label="Transaction" value={form.tx} onChange={(v) => set("tx", v)} placeholder="sale, purchase, rental lease" />
                  <Field label="Property type" value={form.type} onChange={(v) => set("type", v)} placeholder="apartment" />
                </ToolForm>
              )}

              {isRunning && lastAction === t.id && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Running AI…
                </div>
              )}

              {result && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-background/50 border-primary/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-black flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> Result
                        <Badge variant="outline" className="ml-auto text-[10px]">{PROPERTY_PARITY_COST} credits</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs whitespace-pre-wrap break-words font-mono text-foreground/90 max-h-96 overflow-auto">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
    </>
  );
}

function ToolForm({ children, onRun }: { children: React.ReactNode; onRun: () => void }) {
  return (
    <div className="space-y-3">
      {children}
      <Button onClick={onRun} className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold hover:opacity-90">
        <Sparkles className="h-4 w-4 mr-2" /> Run · {PROPERTY_PARITY_COST} credits
      </Button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type, multiline }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string; type?: string; multiline?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {multiline ? (
        <Textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className="bg-background/50 border-primary/20" />
      ) : (
        <Input type={type ?? "text"} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-background/50 border-primary/20" />
      )}
    </div>
  );
}
