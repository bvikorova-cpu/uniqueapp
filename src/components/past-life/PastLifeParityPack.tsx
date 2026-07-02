import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe2, Scale, History, Users, BookOpen, PawPrint, Crown, Feather, Sparkles, Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { usePastLifeParity, PAST_LIFE_PARITY_COST, type PastLifeParityAction } from "@/hooks/usePastLifeParity";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ToolConfig {
  id: PastLifeParityAction;
  title: string;
  description: string;
  icon: typeof Globe2;
  fields: Array<{ name: string; label: string; type: "input" | "textarea" | "date"; placeholder?: string }>;
}

const TOOLS: ToolConfig[] = [
  {
    id: "soul-origin",
    title: "Soul Origin Map",
    description: "Trace where and when your soul first awakened.",
    icon: Globe2,
    fields: [
      { name: "birthDate", label: "Birth date", type: "date" },
      { name: "intuition", label: "Recurring intuition or feeling", type: "textarea", placeholder: "e.g. drawn to stars, oceans..." },
    ],
  },
  {
    id: "karmic-debt",
    title: "Karmic Debt Calculator",
    description: "Identify debts your soul carries and how to clear them.",
    icon: Scale,
    fields: [
      { name: "birthDate", label: "Birth date", type: "date" },
      { name: "recurringStruggles", label: "Recurring struggles", type: "textarea", placeholder: "patterns that keep returning" },
    ],
  },
  {
    id: "reincarnation-timeline",
    title: "Reincarnation Timeline",
    description: "Chronological journey across 5–7 past incarnations.",
    icon: History,
    fields: [
      { name: "birthDate", label: "Birth date", type: "date" },
      { name: "talents", label: "Talents or strong interests", type: "textarea" },
    ],
  },
  {
    id: "soul-tribe",
    title: "Soul Tribe Finder",
    description: "Discover members of your soul family across lifetimes.",
    icon: Users,
    fields: [
      { name: "birthDate", label: "Birth date", type: "date" },
      { name: "closeBonds", label: "Closest people in this life", type: "textarea" },
    ],
  },
  {
    id: "lesson-workbook",
    title: "7-Day Lesson Workbook",
    description: "Personalized soul-work plan for one week.",
    icon: BookOpen,
    fields: [
      { name: "focusArea", label: "Focus area", type: "input", placeholder: "trust, forgiveness, courage..." },
    ],
  },
  {
    id: "animal-elemental",
    title: "Animal / Elemental Life",
    description: "Explore lives lived as an animal or elemental being.",
    icon: PawPrint,
    fields: [
      { name: "birthDate", label: "Birth date", type: "date" },
      { name: "naturePull", label: "Element you feel pulled to", type: "input", placeholder: "fire, water, forest..." },
    ],
  },
  {
    id: "famous-match",
    title: "Famous Past Life Match",
    description: "Find the historical figure whose soul-signature resonates.",
    icon: Crown,
    fields: [
      { name: "birthDate", label: "Birth date", type: "date" },
      { name: "passions", label: "Passions / talents", type: "textarea" },
    ],
  },
  {
    id: "death-reflection",
    title: "Death Transition Reflection",
    description: "Heal imprints from how a past life ended.",
    icon: Feather,
    fields: [
      { name: "birthDate", label: "Birth date", type: "date" },
      { name: "phobias", label: "Phobias or strong aversions", type: "textarea" },
    ],
  },
];

export const PastLifeParityPack = () => {
  const [activeTab, setActiveTab] = useState<PastLifeParityAction>("soul-origin");
  const [formState, setFormState] = useState<Record<string, Record<string, string>>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const { run, isRunning } = usePastLifeParity();

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
      <FloatingHowItWorks
        title='Past Life Parity Pack'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life Parity Pack panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
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
                Past Life Expansion Pack
              </CardTitle>
              <CardDescription>
                8 advanced karmic and soul-forensic tools. Each costs {PAST_LIFE_PARITY_COST} credits.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              {PAST_LIFE_PARITY_COST} credits / tool
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PastLifeParityAction)}>
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
                    <span className="leading-tight">{t.title.split(" ")[0]}</span>
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
                            type={f.type === "date" ? "date" : "text"}
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
                        Channeling…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate ({PAST_LIFE_PARITY_COST} credits)
                      </>
                    )}
                  </Button>

                  {result && (
                    <Card className="bg-muted/30 border-primary/10">
                      <CardContent className="p-4 space-y-2">
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90 font-sans">
                          {JSON.stringify(stripMeta(result), null, 2)}
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

function stripMeta(row: any) {
  if (!row || typeof row !== "object") return row;
  const { id, user_id, created_at, credits_used, ...rest } = row;
  return rest;
}
