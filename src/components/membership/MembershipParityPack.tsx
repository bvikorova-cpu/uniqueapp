import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Crown, Calendar, Users, MessageCircle, Heart, Gift, Video, TrendingUp } from "lucide-react";
import { useMembershipParity, MembershipParityAction, MEMBERSHIP_PARITY_COST } from "@/hooks/useMembershipParity";

const TOOLS: { id: MembershipParityAction; label: string; icon: any; desc: string; fields: { key: string; label: string; type?: "text" | "textarea"; placeholder?: string }[] }[] = [
  { id: "tier-designer", label: "Tier Designer", icon: Crown, desc: "AI-built 3-tier membership ladder", fields: [
    { key: "niche", label: "Your niche", placeholder: "fitness coach, podcast, illustrator…" },
    { key: "audience_size", label: "Audience size", placeholder: "5k followers" },
    { key: "goal", label: "Goal", type: "textarea", placeholder: "Recurring revenue, deeper community…" },
  ]},
  { id: "post-planner", label: "Post Planner", icon: Calendar, desc: "Weekly exclusive content calendar", fields: [
    { key: "niche", label: "Niche" },
    { key: "tone", label: "Tone", placeholder: "playful, premium, raw" },
    { key: "formats", label: "Preferred formats", placeholder: "video, photo, voice, longform" },
  ]},
  { id: "fan-persona", label: "Fan Persona", icon: Users, desc: "Superfan vs casual fan insight", fields: [
    { key: "niche", label: "Niche" },
    { key: "current_subs", label: "Current subscribers", placeholder: "describe top fans" },
  ]},
  { id: "welcome-dm", label: "Welcome DM", icon: MessageCircle, desc: "Onboarding DM sequence", fields: [
    { key: "creator_name", label: "Creator name" },
    { key: "tier_name", label: "Tier name", placeholder: "Inner Circle" },
    { key: "key_perks", label: "Key perks", type: "textarea" },
  ]},
  { id: "retention-booster", label: "Retention Booster", icon: Heart, desc: "Save churning members", fields: [
    { key: "churn_pattern", label: "Churn pattern", type: "textarea", placeholder: "Most cancel after month 2…" },
    { key: "avg_price_eur", label: "Avg price (EUR)", placeholder: "9.99" },
  ]},
  { id: "perk-ideas", label: "Perk Ideas", icon: Gift, desc: "Fresh benefits worth paying for", fields: [
    { key: "niche", label: "Niche" },
    { key: "budget", label: "Budget per month", placeholder: "€0 / €50 / €200" },
  ]},
  { id: "livestream-brief", label: "Livestream Brief", icon: Video, desc: "Full session run-of-show", fields: [
    { key: "topic", label: "Topic" },
    { key: "duration_min", label: "Duration (min)", placeholder: "45" },
    { key: "audience", label: "Audience", placeholder: "paying members only" },
  ]},
  { id: "growth-funnel", label: "Growth Funnel", icon: TrendingUp, desc: "Free → paid acquisition plan", fields: [
    { key: "niche", label: "Niche" },
    { key: "current_channels", label: "Current channels", placeholder: "IG, TikTok, newsletter" },
    { key: "monthly_target_eur", label: "Monthly revenue target (EUR)", placeholder: "2000" },
  ]},
];

function ToolForm({ tool }: { tool: typeof TOOLS[number] }) {
  const { run, isLoading, data } = useMembershipParity();
  const [values, setValues] = useState<Record<string, string>>({});

  const submit = async () => {
    await run({ action: tool.id, payload: values });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {tool.fields.map(f => (
          <div key={f.key}>
            <label className="text-sm font-medium mb-1 block">{f.label}</label>
            {f.type === "textarea" ? (
              <Textarea value={values[f.key] || ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            ) : (
              <Input value={values[f.key] || ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            )}
          </div>
        ))}
      </div>
      <Button onClick={submit} disabled={isLoading} className="w-full gap-2">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <tool.icon className="h-4 w-4" />}
        Generate · {MEMBERSHIP_PARITY_COST} credits
      </Button>
      {data && (
        <Card className="p-4 bg-muted/30">
          <pre className="text-xs whitespace-pre-wrap break-words font-mono">{JSON.stringify(data, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}

export const MembershipParityPack = () => {
  return (
    <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Membership Parity Pack
          </h2>
          <p className="text-sm text-muted-foreground">8 AI tools to grow & retain your community · {MEMBERSHIP_PARITY_COST} credits each</p>
        </div>
        <Badge variant="outline" className="gap-1"><Crown className="h-3 w-3" /> Creator AI Suite</Badge>
      </div>
      <Tabs defaultValue={TOOLS[0].id}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 h-auto">
          {TOOLS.map(t => (
            <TabsTrigger key={t.id} value={t.id} className="flex-col h-auto py-2 gap-1">
              <t.icon className="h-4 w-4" />
              <span className="text-[10px]">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {TOOLS.map(t => (
          <TabsContent key={t.id} value={t.id} className="mt-4">
            <p className="text-sm text-muted-foreground mb-3">{t.desc}</p>
            <ToolForm tool={t} />
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};
