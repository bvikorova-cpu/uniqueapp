import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { useCollectibles } from "@/hooks/useCollectibles";
import { useAICredits } from "@/hooks/useAICredits";

interface GenerateCollectibleProps {
  userId: string;
}

export default function GenerateCollectible({ userId }: GenerateCollectibleProps) {
  const [prompt, setPrompt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [rarityLevel, setRarityLevel] = useState("1");
  
  const { categories, generateCollectible } = useCollectibles(userId);
  const { credits } = useAICredits();

  const handleGenerate = async () => {
    if (!prompt || !categoryId) {
      return;
    }

    generateCollectible.mutate({
      prompt,
      categoryId,
      rarityLevel: parseInt(rarityLevel)
    });
  };

  const isLoading = generateCollectible.isPending;
  const canGenerate = prompt && categoryId && credits && credits.credits_remaining >= 10;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Vygeneruj Collectible</h2>
        <p className="text-muted-foreground mb-6">
          Použi AI na vytvorenie unikátneho predmetu. Každá generácia stojí 10 kreditov.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Popis predmetu</label>
            <Input
              placeholder="Napr. 'Kryštálový meč s modrým leskom'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Kategória</label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Vyber kategóriu" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Požadovaná rarita (negarantovaná)</label>
            <Select value={rarityLevel} onValueChange={setRarityLevel} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Common</SelectItem>
                <SelectItem value="2">Uncommon</SelectItem>
                <SelectItem value="3">Rare</SelectItem>
                <SelectItem value="4">Epic</SelectItem>
                <SelectItem value="5">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generujem...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generovať (10 kreditov)
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Dostupné kredity: {credits?.credits_remaining || 0}
          </p>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-subtle">
        <h3 className="font-semibold mb-2">Ako to funguje?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• AI vygeneruje úplne unikátny obrázok na základe tvojho popisu</li>
          <li>• Každý predmet má rarita level (Common až Legendary)</li>
          <li>• Predmety môžeš zbierať, obchodovať alebo predávať</li>
          <li>• Čím detailnejší popis, tým lepší výsledok</li>
        </ul>
      </Card>
    </div>
  );
}