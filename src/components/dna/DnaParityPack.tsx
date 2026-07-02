import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, Dna } from "lucide-react";
import { useDnaParity, DNA_PARITY_COST, type DnaParityAction } from "@/hooks/useDnaParity";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const TOOLS: { id: DnaParityAction; label: string; description: string; fields: { key: string; label: string; placeholder?: string; type?: "text" | "textarea" }[] }[] = [
  { id: "ancestral-storyteller", label: "Ancestral Storyteller", description: "Reconstruct a vivid story from your lineage.", fields: [
    { key: "haplogroup", label: "Haplogroup", placeholder: "R1b / H1a" },
    { key: "region", label: "Ancestral region", placeholder: "Carpathian basin" },
    { key: "era", label: "Era", placeholder: "1600s" },
  ]},
  { id: "heritage-map", label: "Heritage Map", description: "Migration routes for your DNA markers.", fields: [
    { key: "haplogroup", label: "Haplogroup", placeholder: "I2a" },
    { key: "known_origins", label: "Known origins", placeholder: "Slovakia, Hungary" },
  ]},
  { id: "genetic-compatibility", label: "Genetic Compatibility", description: "Compatibility analysis with a partner profile.", fields: [
    { key: "you_profile", label: "Your traits", type: "textarea", placeholder: "Brown eyes, endurance, lactose tolerant..." },
    { key: "partner_profile", label: "Partner traits", type: "textarea", placeholder: "Blue eyes, sprinter type..." },
  ]},
  { id: "offspring-predictor", label: "Offspring Predictor", description: "Likely traits and personality blend.", fields: [
    { key: "parent_a", label: "Parent A", type: "textarea", placeholder: "Traits, ethnicity, health background..." },
    { key: "parent_b", label: "Parent B", type: "textarea", placeholder: "Traits, ethnicity, health background..." },
  ]},
  { id: "health-blueprint", label: "Health Blueprint", description: "Lifestyle plan from your genetic profile.", fields: [
    { key: "genetic_summary", label: "Genetic summary", type: "textarea", placeholder: "APOE e3/e3, MTHFR C677T..." },
    { key: "goals", label: "Goals", placeholder: "Energy, longevity, focus" },
  ]},
  { id: "dna-art-prompt", label: "DNA Art Prompt", description: "Turn your DNA into an art prompt.", fields: [
    { key: "dominant_markers", label: "Dominant markers", placeholder: "Nordic + Mediterranean" },
    { key: "mood", label: "Mood", placeholder: "Ethereal, oceanic" },
  ]},
  { id: "ancestor-voice-script", label: "Ancestor Voice Script", description: "Monologue for voice synthesis.", fields: [
    { key: "ancestor", label: "Ancestor", placeholder: "Great-grandmother Anna, 1890s" },
    { key: "topic", label: "Topic", placeholder: "Leaving the village" },
  ]},
  { id: "family-tree-narrative", label: "Family Tree Narrative", description: "Biography for a family tree node.", fields: [
    { key: "person", label: "Person", placeholder: "Jozef Novak, 1922-1998" },
    { key: "known_facts", label: "Known facts", type: "textarea", placeholder: "Blacksmith, 4 children, WW2 survivor..." },
  ]},
];

export default function DnaParityPack() {
  const { run, isLoading, data } = useDnaParity();
  const [activeTool, setActiveTool] = useState<DnaParityAction>(TOOLS[0].id);
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});

  const update = (toolId: string, key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [toolId]: { ...(prev[toolId] ?? {}), [key]: value } }));
  };

  return (
    <>
      <FloatingHowItWorks
        title='Dna Parity Pack'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Dna Parity Pack panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <Card className="my-8 border-primary/30 bg-gradient-to-br from-card to-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dna className="h-5 w-5 text-primary" />
          DNA AI Parity Pack
        </CardTitle>
        <CardDescription>
          8 specialized AI tools · {DNA_PARITY_COST} credits per run · powered by OpenAI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTool} onValueChange={(v) => setActiveTool(v as DnaParityAction)}>
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
                Run · {DNA_PARITY_COST} credits
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
