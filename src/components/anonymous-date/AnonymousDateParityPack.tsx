import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Sparkles, Heart, ShieldAlert, Eye, MapPin, Anchor, Languages, HeartCrack, Wand2 } from "lucide-react";
import { useAnonymousDateParity, PARITY_COST, type ParityFeature } from "@/hooks/useAnonymousDateParity";

const TOOLS: { id: ParityFeature; label: string; icon: any; tagline: string }[] = [
  { id: "vibe_decoder",       label: "Vibe Decoder",       icon: Wand2,       tagline: "Decode the chat's overall energy" },
  { id: "chemistry_report",   label: "Chemistry Report",   icon: Heart,       tagline: "Four-axis chemistry score" },
  { id: "red_flag_scan",      label: "Red Flag Scan",      icon: ShieldAlert, tagline: "Detect manipulative patterns" },
  { id: "reveal_readiness",   label: "Reveal Readiness",   icon: Eye,         tagline: "Are you ready to reveal?" },
  { id: "first_meet_plan",    label: "First Meet Plan",    icon: MapPin,      tagline: "Plan the in-person meetup" },
  { id: "attachment_profile", label: "Attachment Profile", icon: Anchor,      tagline: "Your attachment style" },
  { id: "chat_translator",    label: "Chat Translator",    icon: Languages,   tagline: "Decode hidden meanings" },
  { id: "breakup_recovery",   label: "Breakup Recovery",   icon: HeartCrack,  tagline: "7-day recovery plan" },
];

export function AnonymousDateParityPack({ matchId }: { matchId?: string }) {
  const { run, loadingKey, results } = useAnonymousDateParity();
  const [active, setActive] = useState<ParityFeature>("vibe_decoder");
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setInputs((p) => ({ ...p, [k]: v }));

  const handle = async (id: ParityFeature) => {
    let payload: any = {};
    switch (id) {
      case "vibe_decoder":
      case "chemistry_report":
      case "red_flag_scan":
      case "reveal_readiness":
        payload = { chat_excerpt: inputs.chat ?? "" };
        break;
      case "first_meet_plan":
        payload = { city: inputs.city ?? "", interests: inputs.interests ?? "", budget: inputs.budget ?? "medium" };
        break;
      case "attachment_profile":
        payload = { self_report: inputs.self ?? "", chat_excerpt: inputs.chat ?? "" };
        break;
      case "chat_translator":
        payload = { message: inputs.message ?? "", context: inputs.context ?? "" };
        break;
      case "breakup_recovery":
        payload = { situation: inputs.situation ?? "", duration_days: Number(inputs.days ?? 7) };
        break;
    }
    await run(id, payload, matchId);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-5 sm:p-6 bg-card/60 backdrop-blur-sm border border-border/50">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Parity Pack · 8 New AI Tools
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Match competitor features — every tool costs {PARITY_COST} credits.</p>
          </div>
          <Badge variant="secondary" className="text-[10px]">{PARITY_COST} cr / action</Badge>
        </div>

        <Tabs value={active} onValueChange={(v) => setActive(v as ParityFeature)}>
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto gap-1 bg-muted/30 p-1">
            {TOOLS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="text-[11px] py-2 data-[state=active]:bg-primary/20">
                <t.icon className="h-3.5 w-3.5 mr-1" />
                <span className="truncate">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {TOOLS.map((t) => (
            <TabsContent key={t.id} value={t.id} className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">{t.tagline}</p>

              {(t.id === "vibe_decoder" || t.id === "chemistry_report" || t.id === "red_flag_scan" || t.id === "reveal_readiness") && (
                <Textarea
                  placeholder="Paste a few recent chat messages..."
                  value={inputs.chat ?? ""}
                  onChange={(e) => set("chat", e.target.value)}
                  className="min-h-24"
                />
              )}

              {t.id === "first_meet_plan" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input placeholder="City" value={inputs.city ?? ""} onChange={(e) => set("city", e.target.value)} />
                  <Input placeholder="Shared interests" value={inputs.interests ?? ""} onChange={(e) => set("interests", e.target.value)} />
                  <Input placeholder="Budget (low/medium/premium)" value={inputs.budget ?? ""} onChange={(e) => set("budget", e.target.value)} />
                </div>
              )}

              {t.id === "attachment_profile" && (
                <>
                  <Textarea placeholder="Briefly describe how you behave in relationships..." value={inputs.self ?? ""} onChange={(e) => set("self", e.target.value)} className="min-h-20" />
                  <Textarea placeholder="Optional: paste a chat excerpt" value={inputs.chat ?? ""} onChange={(e) => set("chat", e.target.value)} className="min-h-20" />
                </>
              )}

              {t.id === "chat_translator" && (
                <>
                  <Textarea placeholder="The message you want translated..." value={inputs.message ?? ""} onChange={(e) => set("message", e.target.value)} className="min-h-20" />
                  <Input placeholder="Optional context" value={inputs.context ?? ""} onChange={(e) => set("context", e.target.value)} />
                </>
              )}

              {t.id === "breakup_recovery" && (
                <>
                  <Textarea placeholder="What happened?" value={inputs.situation ?? ""} onChange={(e) => set("situation", e.target.value)} className="min-h-20" />
                  <Input type="number" placeholder="Days since" value={inputs.days ?? ""} onChange={(e) => set("days", e.target.value)} />
                </>
              )}

              <Button onClick={() => handle(t.id)} disabled={loadingKey === t.id} className="w-full gap-2">
                {loadingKey === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Run {t.label} ({PARITY_COST} cr)
              </Button>

              {results[t.id] && (
                <Card className="bg-muted/30 p-3">
                  <pre className="text-xs whitespace-pre-wrap break-words font-mono leading-relaxed">
                    {typeof results[t.id] === "string" ? results[t.id] : JSON.stringify(results[t.id], null, 2)}
                  </pre>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </motion.div>
  );
}
