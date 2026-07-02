import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Film, Play } from "lucide-react";
import { useHorrorReels } from "@/hooks/useShadowArenaFeatures";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function HorrorReelsCard() {
  const { reels, generate } = useHorrorReels();
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");

  return (
    <><FloatingHowItWorks title="HorrorReelsCard — How it works" steps={[{title:"Open this section",desc:"Access HorrorReelsCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 bg-gradient-to-br from-[hsl(0,30%,8%)] to-[hsl(280,25%,7%)] border-red-900/30 mb-6">
      <h3 className="text-xl font-black text-red-100 flex items-center gap-2 mb-1">
        <Film className="w-5 h-5 text-red-400" />
        Horror Reels
      </h3>
      <p className="text-xs text-red-200/60 mb-4">AI-generated 30s horror video scripts. 15 credits per reel.</p>

      <div className="space-y-2 mb-4">
        <Input placeholder="Reel title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Describe the horror scene..." rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <Button
          disabled={!prompt || generate.isPending}
          onClick={() => generate.mutate({ prompt, title }, { onSuccess: () => { setPrompt(""); setTitle(""); } })}
          className="w-full bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-600 hover:to-pink-600"
        >
          {generate.isPending ? "Generating..." : "Generate Reel (15 cr)"}
        </Button>
      </div>

      {reels && reels.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {reels.slice(0, 4).map((r) => (
            <div key={r.id} className="aspect-[9/16] rounded-lg bg-black/60 border border-red-900/30 relative overflow-hidden flex items-center justify-center group">
              <Play className="w-8 h-8 text-red-400 opacity-60 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black to-transparent">
                <p className="text-[10px] font-bold text-red-100 truncate">{r.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  </>
  );
}
