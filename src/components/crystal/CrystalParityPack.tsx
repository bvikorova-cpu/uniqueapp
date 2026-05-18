import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2 } from "lucide-react";
import { useCrystalParity, CRYSTAL_PARITY_COST, type CrystalParityAction } from "@/hooks/useCrystalParity";

const TOOLS: { id: CrystalParityAction; label: string; description: string; fields: { key: string; label: string; placeholder?: string; type?: "text" | "textarea" }[] }[] = [
  { id: "birth-chart-crystals", label: "Birth Chart Crystals", description: "Crystals aligned with your astrological chart.", fields: [
    { key: "birth_date", label: "Birth date", placeholder: "1990-05-12" },
    { key: "birth_time", label: "Birth time", placeholder: "07:30" },
    { key: "birth_place", label: "Birth place", placeholder: "Bratislava, SK" },
  ]},
  { id: "ritual-designer", label: "Ritual Designer", description: "Custom crystal ritual for your intention.", fields: [
    { key: "intention", label: "Intention", placeholder: "Release self-doubt" },
    { key: "available_crystals", label: "Crystals you have", placeholder: "Amethyst, Rose Quartz, Citrine" },
  ]},
  { id: "grid-layout", label: "Grid Layout", description: "Sacred-geometry crystal grid plan.", fields: [
    { key: "goal", label: "Goal", placeholder: "Abundance" },
    { key: "available_crystals", label: "Crystals available", placeholder: "Citrine, Clear Quartz, Pyrite" },
  ]},
  { id: "dream-decoder", label: "Dream Decoder", description: "Decode dreams via crystal symbolism.", fields: [
    { key: "dream", label: "Describe your dream", type: "textarea", placeholder: "I was walking through a cave..." },
  ]},
  { id: "affirmation-pack", label: "Affirmation Pack", description: "7-day affirmation pack tied to a crystal.", fields: [
    { key: "crystal", label: "Crystal", placeholder: "Rose Quartz" },
    { key: "theme", label: "Theme", placeholder: "Self-love" },
  ]},
  { id: "intention-setter", label: "Intention Setter", description: "Structured manifestation plan.", fields: [
    { key: "desire", label: "What do you want to manifest?", type: "textarea", placeholder: "A new creative career..." },
  ]},
  { id: "aura-color-coach", label: "Aura Color Coach", description: "Coaching for your dominant aura color.", fields: [
    { key: "aura_color", label: "Aura color", placeholder: "Indigo" },
    { key: "current_state", label: "Current state", placeholder: "Feeling foggy and overstimulated" },
  ]},
  { id: "space-clearing", label: "Space Clearing", description: "Crystal plan to cleanse your home/office.", fields: [
    { key: "space_type", label: "Space type", placeholder: "1-bedroom apartment" },
    { key: "issues", label: "Energetic issues", type: "textarea", placeholder: "Heavy energy in bedroom, arguments in kitchen" },
  ]},
];

export default function CrystalParityPack() {
  const { run, isLoading, data } = useCrystalParity();
  const [activeTool, setActiveTool] = useState<CrystalParityAction>(TOOLS[0].id);
  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>({});

  const update = (toolId: string, key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [toolId]: { ...(prev[toolId] ?? {}), [key]: value } }));
  };

  return (
    <Card className="my-8 border-primary/30 bg-gradient-to-br from-card to-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Crystal & Energy AI Parity Pack
        </CardTitle>
        <CardDescription>
          8 specialized AI tools · {CRYSTAL_PARITY_COST} credits per run · powered by OpenAI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTool} onValueChange={(v) => setActiveTool(v as CrystalParityAction)}>
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
                Run · {CRYSTAL_PARITY_COST} credits
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
  );
}
