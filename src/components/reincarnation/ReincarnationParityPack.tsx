import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, Infinity as InfinityIcon } from "lucide-react";
import { useReincarnationParity, REINCARNATION_PARITY_COST, type ReincarnationParityAction } from "@/hooks/useReincarnationParity";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const TOOLS: { id: ReincarnationParityAction; label: string; description: string; fields: { key: string; label: string; placeholder?: string; type?: "text" | "textarea" }[] }[] = [
  { id: "soul-origin", label: "Soul Origin", description: "Trace your soul's first spark and archetype.", fields: [
    { key: "birth_date", label: "Birth date", placeholder: "1990-05-12" },
    { key: "intuitions", label: "Intuitions / dreams", type: "textarea", placeholder: "Recurring dreams, déjà vu, fascinations..." },
  ]},
  { id: "karmic-thread", label: "Karmic Threads", description: "Map recurring karmic loops across lifetimes.", fields: [
    { key: "repeating_patterns", label: "Repeating patterns", type: "textarea", placeholder: "Same relationship dynamics, fears, blocks..." },
  ]},
  { id: "reincarnation-timeline", label: "Reincarnation Timeline", description: "Chronological past-life arc.", fields: [
    { key: "known_lives", label: "Known / suspected lives", type: "textarea", placeholder: "Egyptian priestess, Victorian scholar..." },
    { key: "anchor_eras", label: "Anchor eras", placeholder: "Ancient, Medieval, Modern" },
  ]},
  { id: "soul-contract", label: "Soul Contract", description: "Decode the agreements you incarnated with.", fields: [
    { key: "key_people", label: "Key people", type: "textarea", placeholder: "Mother, twin flame, mentor..." },
    { key: "life_purpose_clue", label: "Life purpose clue", placeholder: "Teaching, healing, building" },
  ]},
  { id: "past-life-letter", label: "Past Life Letter", description: "Receive a letter from a past-life self.", fields: [
    { key: "persona", label: "Past-life persona", placeholder: "16th-century Venetian weaver" },
    { key: "question", label: "Question to ask", type: "textarea", placeholder: "What lesson did I leave unfinished?" },
  ]},
  { id: "dharma-path", label: "Dharma Path", description: "Daily dharma alignment plan.", fields: [
    { key: "current_struggles", label: "Current struggles", type: "textarea", placeholder: "Burnout, identity, relationships..." },
    { key: "gifts", label: "Natural gifts", placeholder: "Empathy, voice, strategy" },
  ]},
  { id: "twin-flame-report", label: "Twin Flame Report", description: "Resonance and stage analysis.", fields: [
    { key: "you_profile", label: "Your profile", type: "textarea", placeholder: "Birth date, traits, story so far..." },
    { key: "counterpart_profile", label: "Counterpart profile", type: "textarea", placeholder: "Birth date, traits, story so far..." },
  ]},
  { id: "rebirth-blueprint", label: "Rebirth Blueprint", description: "Design the next incarnation blueprint.", fields: [
    { key: "lessons_learned", label: "Lessons learned this life", type: "textarea", placeholder: "Patience, boundaries, surrender..." },
    { key: "longings", label: "Soul longings", placeholder: "Ocean, art, family" },
  ]},
];

export default function ReincarnationParityPack() {
  const { run, isLoading, data } = useReincarnationParity();
  const [activeTool, setActiveTool] = useState<ReincarnationParityAction>(TOOLS[0].id);
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});

  const update = (toolId: string, key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [toolId]: { ...(prev[toolId] ?? {}), [key]: value } }));
  };

  return (
    <>
      <FloatingHowItWorks
        title='Reincarnation Parity Pack'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Reincarnation Parity Pack panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="my-8 border-primary/30 bg-gradient-to-br from-card to-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InfinityIcon className="h-5 w-5 text-primary" />
          Reincarnation AI Parity Pack
        </CardTitle>
        <CardDescription>
          8 specialized AI tools · {REINCARNATION_PARITY_COST} credits per run · powered by OpenAI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTool} onValueChange={(v) => setActiveTool(v as ReincarnationParityAction)}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto">
            {TOOLS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="text-xs whitespace-normal py-2">{t.label}</TabsTrigger>
            ))}
          </TabsList>

          {TOOLS.map((tool) => (
            <TabsContent key={tool.id} value={tool.id} className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">{tool.description}</p>
              <div className="space-y-3">
                {tool.fields.map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <Label htmlFor={`${tool.id}-${f.key}`}>{f.label}</Label>
                    {f.type === "textarea" ? (
                      <Textarea
                        id={`${tool.id}-${f.key}`}
                        placeholder={f.placeholder}
                        value={inputs[tool.id]?.[f.key] ?? ""}
                        onChange={(e) => update(tool.id, f.key, e.target.value)}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={`${tool.id}-${f.key}`}
                        placeholder={f.placeholder}
                        value={inputs[tool.id]?.[f.key] ?? ""}
                        onChange={(e) => update(tool.id, f.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button
                disabled={isLoading}
                onClick={() => run({ action: tool.id, payload: inputs[tool.id] ?? {} })}
                className="w-full sm:w-auto gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Run · {REINCARNATION_PARITY_COST} credits
              </Button>

              {data && (
                <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/60">
                  <h4 className="font-semibold mb-2 text-sm">Result</h4>
                  <pre className="text-xs whitespace-pre-wrap break-words overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
    </>
  );
}
