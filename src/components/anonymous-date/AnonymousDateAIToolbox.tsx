import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Sparkles, MessageSquareHeart, Brain, Wand2, Mic, MapPin, ScrollText, Loader2, Coins,
} from "lucide-react";
import { useAnonymousDateAI, AI_COSTS, type AIFeature } from "@/hooks/useAnonymousDateAI";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const FEATURES: Array<{
  id: AIFeature;
  title: string;
  desc: string;
  icon: any;
  gradient: string;
  fields: Array<{ key: string; label: string; placeholder: string; type?: "input" | "textarea" }>;
}> = [
  {
    id: "icebreakers",
    title: "AI Icebreaker Generator",
    desc: "3 personalised opening lines tailored to your match's interests",
    icon: Sparkles,
    gradient: "from-pink-500 to-rose-500",
    fields: [
      { key: "your_traits", label: "Your traits & interests", placeholder: "Adventurous, loves hiking, into sci-fi books..." },
      { key: "match_traits", label: "Their traits & interests", placeholder: "Creative, plays guitar, loves coffee..." },
    ],
  },
  {
    id: "compatibility",
    title: "AI Compatibility Score",
    desc: "Deep score with strengths, watch-outs and best topic to discuss",
    icon: Brain,
    gradient: "from-violet-500 to-primary",
    fields: [
      { key: "your_profile", label: "Your profile (interests, traits, looking for)", placeholder: "I'm playful, love travel, looking for deep connection...", type: "textarea" },
      { key: "their_profile", label: "Their profile", placeholder: "Calm, romantic, into art, looking for serious...", type: "textarea" },
    ],
  },
  {
    id: "reply_coach",
    title: "AI Reply Coach",
    desc: "3 reply options (flirty / playful / sincere) for their last message",
    icon: MessageSquareHeart,
    gradient: "from-fuchsia-500 to-pink-500",
    fields: [
      { key: "their_message", label: "Their last message", placeholder: "What did they just say?", type: "textarea" },
      { key: "your_vibe", label: "Your vibe (optional)", placeholder: "I want to keep it flirty..." },
    ],
  },
  {
    id: "personality_mirror",
    title: "AI Personality Mirror",
    desc: "Discover how you actually come across to your match",
    icon: Wand2,
    gradient: "from-amber-500 to-orange-500",
    fields: [
      { key: "your_messages", label: "Paste 3-5 of your recent messages", placeholder: "I usually write things like...", type: "textarea" },
      { key: "your_traits", label: "Your traits", placeholder: "Romantic, adventurous, witty..." },
    ],
  },
  {
    id: "voice_preview",
    title: "AI Voice Preview Script",
    desc: "Anonymous 2-3 sentence voice script to share before the reveal",
    icon: Mic,
    gradient: "from-cyan-500 to-blue-500",
    fields: [
      { key: "anonymous_name", label: "Your anonymous name", placeholder: "MysteryRose" },
      { key: "vibe", label: "Vibe", placeholder: "Mysterious, warm, slightly playful..." },
    ],
  },
  {
    id: "date_ideas",
    title: "AI Date Idea Generator",
    desc: "5 perfect first-date ideas based on shared interests",
    icon: MapPin,
    gradient: "from-emerald-500 to-teal-500",
    fields: [
      { key: "shared_interests", label: "Your shared interests", placeholder: "Coffee, books, indie music, hiking..." },
      { key: "city", label: "City (optional)", placeholder: "Berlin" },
    ],
  },
  {
    id: "love_letter",
    title: "AI Love Letter",
    desc: "Heartfelt anonymous letter to send at the end of the 7 days",
    icon: ScrollText,
    gradient: "from-rose-500 to-red-500",
    fields: [
      { key: "anonymous_name", label: "Your anonymous name", placeholder: "MysteryRose" },
      { key: "what_you_loved", label: "What you loved about them", placeholder: "Their humour, the way they describe sunsets...", type: "textarea" },
    ],
  },
];

function renderOutput(feature: AIFeature, output: any) {
  if (!output) return null;

  if (feature === "icebreakers") {
    const arr = Array.isArray(output) ? output : output.icebreakers || output.lines || [];
    return (
      <ul className="space-y-2">
      <FloatingHowItWorks
        title={"Anonymous Date A I Toolbox"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

        {arr.map((line: string, i: number) => (
          <li key={i} className="p-3 rounded-lg bg-muted/30 border border-border/40 text-sm">
            <span className="font-bold text-primary mr-2">#{i + 1}</span>{line}
          </li>
        ))}
      </ul>
    );
  }

  if (feature === "compatibility") {
    return (
      <div className="space-y-3">
        <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/15 to-pink-500/15 border border-primary/30">
          <div className="text-5xl font-black bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
            {output.score}%
          </div>
          <p className="text-sm font-semibold mt-1">{output.summary}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-emerald-400 mb-1">Strengths</p>
          <ul className="text-sm space-y-1">{output.strengths?.map((s: string, i: number) => <li key={i}>✓ {s}</li>)}</ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-amber-400 mb-1">Watch-outs</p>
          <ul className="text-sm space-y-1">{output.watch_outs?.map((s: string, i: number) => <li key={i}>! {s}</li>)}</ul>
        </div>
        {output.best_topic && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs font-bold uppercase text-primary mb-1">Best topic to discuss</p>
            <p className="text-sm">{output.best_topic}</p>
          </div>
        )}
      </div>
    );
  }

  if (feature === "reply_coach") {
    const arr = Array.isArray(output) ? output : output.replies || [];
    const toneColor: Record<string, string> = {
      flirty: "from-pink-500 to-rose-500",
      playful: "from-amber-500 to-orange-500",
      sincere: "from-emerald-500 to-teal-500",
    };
    return (
      <div className="space-y-2">
        {arr.map((r: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/40">
            <Badge className={`bg-gradient-to-r ${toneColor[r.tone] ?? "from-primary to-accent"} text-white text-[10px] mb-2`}>
              {r.tone}
            </Badge>
            <p className="text-sm">{r.text}</p>
          </div>
        ))}
      </div>
    );
  }

  if (feature === "date_ideas") {
    const arr = Array.isArray(output) ? output : output.ideas || [];
    return (
      <div className="space-y-2">
        {arr.map((d: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/40">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-sm">{d.title}</p>
              <Badge variant="outline" className="text-xs">{d.est_cost}</Badge>
            </div>
            <p className="text-xs text-primary">{d.vibe}</p>
            <p className="text-xs text-muted-foreground mt-1">{d.why_it_works}</p>
          </div>
        ))}
      </div>
    );
  }

  // text-based outputs
  const text = typeof output === "string" ? output : output.text ?? JSON.stringify(output, null, 2);
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border/40 whitespace-pre-wrap text-sm leading-relaxed italic">
      {text}
    </div>
  );
}

export const AnonymousDateAIToolbox = ({ credits }: { credits: number }) => {
  const [active, setActive] = useState<AIFeature | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const { run, loading, result, setResult } = useAnonymousDateAI();

  const activeFeature = FEATURES.find(f => f.id === active);

  const handleRun = async () => {
    if (!activeFeature) return;
    await run(activeFeature.id, formValues);
  };

  const closeDialog = () => {
    setActive(null);
    setFormValues({});
    setResult(null);
  };

  return (
    <>
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-primary/8 via-card/80 to-pink-500/8 backdrop-blur-xl border-primary/30 shadow-[0_0_40px_hsl(var(--primary)/0.15)]">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/30 to-pink-500/30">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black">AI Dating Toolbox</h3>
              <p className="text-xs text-muted-foreground">7 premium AI features powered by Lovable AI</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-primary to-pink-500 text-white">
            <Coins className="h-3 w-3 mr-1" /> {credits} credits
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActive(f.id)}
              className="text-left p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/50 hover:border-primary/50 transition-all group relative overflow-hidden"
            >
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${f.gradient} opacity-10 group-hover:opacity-25 transition-opacity blur-xl`} />
              <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${f.gradient} mb-2 shadow-lg`}>
                <f.icon className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-bold text-sm leading-tight mb-1">{f.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-snug mb-2">{f.desc}</p>
              <Badge variant="secondary" className="text-[10px]">
                <Coins className="h-2.5 w-2.5 mr-0.5" />
                {AI_COSTS[f.id]} credits
              </Badge>
            </motion.button>
          ))}
        </div>
      </Card>

      <Dialog open={!!active} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {activeFeature && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${activeFeature.gradient}`}>
                    <activeFeature.icon className="h-4 w-4 text-white" />
                  </div>
                  {activeFeature.title}
                </DialogTitle>
                <DialogDescription>{activeFeature.desc}</DialogDescription>
              </DialogHeader>

              {!result && (
                <div className="space-y-3 py-2">
                  {activeFeature.fields.map(field => (
                    <div key={field.key}>
                      <Label className="text-xs font-semibold">{field.label}</Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          value={formValues[field.key] ?? ""}
                          onChange={(e) => setFormValues(p => ({ ...p, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          rows={3}
                          className="mt-1 text-sm"
                        />
                      ) : (
                        <Input
                          value={formValues[field.key] ?? ""}
                          onChange={(e) => setFormValues(p => ({ ...p, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="mt-1 text-sm"
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={handleRun}
                    disabled={loading === activeFeature.id || credits < AI_COSTS[activeFeature.id]}
                    className="w-full bg-gradient-to-r from-primary to-pink-500 hover:opacity-90"
                  >
                    {loading === activeFeature.id ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
                    ) : credits < AI_COSTS[activeFeature.id] ? (
                      `Need ${AI_COSTS[activeFeature.id]} credits`
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> Generate ({AI_COSTS[activeFeature.id]} cr)</>
                    )}
                  </Button>
                </div>
              )}

              {result && result.feature === activeFeature.id && (
                <div className="space-y-3 py-2">
                  {renderOutput(result.feature, result.output)}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setResult(null)} className="flex-1">
                      Generate again
                    </Button>
                    <Button onClick={closeDialog} className="flex-1">Done</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
