import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Map, BookOpen, Target, Handshake, Megaphone, Globe2, Award, Sparkles, Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSkillSwapParity, SKILL_SWAP_PARITY_COST, type SkillSwapParityAction } from "@/hooks/useSkillSwapParity";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ToolConfig {
  id: SkillSwapParityAction;
  title: string;
  short: string;
  description: string;
  icon: typeof Users;
  fields: Array<{ name: string; label: string; type: "input" | "textarea"; placeholder?: string }>;
}

const TOOLS: ToolConfig[] = [
  {
    id: "swap-matcher",
    title: "Swap Matcher",
    short: "Matcher",
    description: "AI-curated swap partners by fit, timezone and chemistry.",
    icon: Users,
    fields: [
      { name: "offering", label: "Skill you offer", type: "input", placeholder: "e.g. Figma UI design" },
      { name: "wanting", label: "Skill you want", type: "input", placeholder: "e.g. conversational Spanish" },
      { name: "timezone", label: "Your timezone", type: "input", placeholder: "CET / UTC+1" },
    ],
  },
  {
    id: "learning-roadmap",
    title: "Learning Roadmap",
    short: "Roadmap",
    description: "Personalized 4-week roadmap with daily practice.",
    icon: Map,
    fields: [
      { name: "skill", label: "Skill to learn", type: "input" },
      { name: "hoursPerWeek", label: "Hours per week", type: "input", placeholder: "5" },
      { name: "currentLevel", label: "Current level", type: "input", placeholder: "absolute beginner" },
    ],
  },
  {
    id: "teaching-script",
    title: "Teaching Script",
    short: "Lesson",
    description: "Full lesson outline for a skill you want to teach.",
    icon: BookOpen,
    fields: [
      { name: "topic", label: "Topic to teach", type: "input" },
      { name: "durationMinutes", label: "Duration (minutes)", type: "input", placeholder: "60" },
      { name: "audience", label: "Audience", type: "textarea", placeholder: "absolute beginners, age 20-35..." },
    ],
  },
  {
    id: "gap-analysis",
    title: "Skill Gap Analysis",
    short: "Gaps",
    description: "Honest audit of where you are vs. where you want to be.",
    icon: Target,
    fields: [
      { name: "skill", label: "Skill", type: "input" },
      { name: "currentAbilities", label: "What you can do now", type: "textarea" },
      { name: "targetOutcome", label: "Target outcome", type: "textarea" },
    ],
  },
  {
    id: "negotiation-helper",
    title: "Negotiation Helper",
    short: "Negotiate",
    description: "Fair exchange proposal with counter-offers.",
    icon: Handshake,
    fields: [
      { name: "yourOffer", label: "What you give", type: "input" },
      { name: "theirOffer", label: "What they give", type: "input" },
      { name: "constraints", label: "Constraints", type: "textarea", placeholder: "only weekends, max 3h/week..." },
    ],
  },
  {
    id: "portfolio-pitch",
    title: "Portfolio Pitch",
    short: "Pitch",
    description: "Headline + elevator pitch + hashtags for your offering.",
    icon: Megaphone,
    fields: [
      { name: "skill", label: "Skill to pitch", type: "input" },
      { name: "highlights", label: "Highlights / proof", type: "textarea", placeholder: "5 years exp, published in..." },
    ],
  },
  {
    id: "cultural-tips",
    title: "Cross-Cultural Tips",
    short: "Culture",
    description: "Etiquette and communication tips for global partners.",
    icon: Globe2,
    fields: [
      { name: "country", label: "Partner's country", type: "input", placeholder: "Japan" },
      { name: "context", label: "Context", type: "textarea", placeholder: "first call, formal exchange..." },
    ],
  },
  {
    id: "certification-path",
    title: "Certification Path",
    short: "Badges",
    description: "Sequenced credentials worth earning for the skill.",
    icon: Award,
    fields: [
      { name: "skill", label: "Skill / career", type: "input" },
      { name: "budgetEur", label: "Budget (€)", type: "input", placeholder: "0-500" },
    ],
  },
];

export const SkillSwapParityPack = () => {
  const [activeTab, setActiveTab] = useState<SkillSwapParityAction>("swap-matcher");
  const [formState, setFormState] = useState<Record<string, Record<string, string>>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const { run, isRunning } = useSkillSwapParity();

  const updateField = (toolId: string, field: string, value: string) => {
    setFormState((s) => ({ ...s, [toolId]: { ...(s[toolId] ?? {}), [field]: value } }));
  };

  const submit = async (tool: ToolConfig) => {
    try {
      const payload = formState[tool.id] ?? {};
      const data = await run({ action: tool.id, payload });
      setResults((r) => ({ ...r, [tool.id]: data?.result }));
    } catch {
      /* toast handled in hook */
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Skill Swap Parity Pack - How it works"} steps={[{ title: 'Open', desc: 'Access the Skill Swap Parity Pack section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Skill Swap Parity Pack.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-primary/20 bg-card/60 backdrop-blur-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                Skill Swap Expansion Pack
              </CardTitle>
              <CardDescription>
                8 advanced AI tools for matching, learning and global negotiation. Each costs {SKILL_SWAP_PARITY_COST} credits.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {SKILL_SWAP_PARITY_COST} credits / tool
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SkillSwapParityAction)}>
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1 h-auto bg-muted/40 p-1">
              {TOOLS.map((t) => {
                const Icon = t.icon;
                return (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    className="flex flex-col gap-1 py-2 px-1 text-[10px] data-[state=active]:bg-primary/15"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="leading-tight">{t.short}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const result = results[tool.id];
              return (
                <TabsContent key={tool.id} value={tool.id} className="mt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-bold">{tool.title}</h3>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {tool.fields.map((f) => (
                      <div key={f.name} className="space-y-1.5">
                        <Label htmlFor={`${tool.id}-${f.name}`} className="text-xs">
                          {f.label}
                        </Label>
                        {f.type === "textarea" ? (
                          <Textarea
                            id={`${tool.id}-${f.name}`}
                            placeholder={f.placeholder}
                            value={formState[tool.id]?.[f.name] ?? ""}
                            onChange={(e) => updateField(tool.id, f.name, e.target.value)}
                            rows={3}
                          />
                        ) : (
                          <Input
                            id={`${tool.id}-${f.name}`}
                            placeholder={f.placeholder}
                            value={formState[tool.id]?.[f.name] ?? ""}
                            onChange={(e) => updateField(tool.id, f.name, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => submit(tool)}
                    disabled={isRunning}
                    className="w-full bg-gradient-to-r from-primary to-accent"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate ({SKILL_SWAP_PARITY_COST} credits)
                      </>
                    )}
                  </Button>

                  {result && (
                    <Card className="bg-muted/30 border-primary/10">
                      <CardContent className="p-4">
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90 font-sans">
                          {JSON.stringify(result.result ?? result, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
