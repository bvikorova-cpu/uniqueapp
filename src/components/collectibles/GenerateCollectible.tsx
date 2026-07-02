import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { useCollectibles } from "@/hooks/useCollectibles";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
    <>
      <FloatingHowItWorks title={"Generate Collectible - How it works"} steps={[{ title: 'Open', desc: 'Access the Generate Collectible section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Generate Collectible.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Generate Collectible</h2>
        <p className="text-muted-foreground mb-6">
          Use AI to create a unique item. Each generation costs 10 credits.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Item Description</label>
            <Input
              placeholder="E.g. 'Crystal sword with blue glow'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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
            <label className="text-sm font-medium mb-2 block">Desired Rarity (not guaranteed)</label>
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
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate (10 credits)
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Available credits: {credits?.credits_remaining || 0}
          </p>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-subtle">
        <h3 className="font-semibold mb-2">How it works?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• AI generates a completely unique image based on your description</li>
          <li>• Each item has a rarity level (Common to Legendary)</li>
          <li>• You can collect, trade or sell items</li>
          <li>• The more detailed the description, the better the result</li>
        </ul>
      </Card>
    </div>
    </>
  );
}