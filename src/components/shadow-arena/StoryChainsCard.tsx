import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link2, Plus } from "lucide-react";
import { useStoryChains } from "@/hooks/useShadowArenaFeatures";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function StoryChainsCard() {
  const { chains, isLoading, createChain, addSegment } = useStoryChains();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [activeChain, setActiveChain] = useState<string | null>(null);
  const [segment, setSegment] = useState("");

  return (
    <><FloatingHowItWorks title="StoryChainsCard — How it works" steps={[{title:"Open this section",desc:"Access StoryChainsCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 bg-gradient-to-br from-[hsl(280,30%,8%)] to-[hsl(0,0%,4%)] border-red-900/30 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black text-red-100 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-purple-400" />
          Collaborative Story Chains
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(!showCreate)} className="border-red-900/30">
          <Plus className="w-4 h-4 mr-1" /> New Chain
        </Button>
      </div>

      {showCreate && (
        <div className="space-y-2 mb-4 p-3 rounded-lg bg-red-950/20 border border-red-900/30">
          <Input placeholder="Chain title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Theme (e.g. haunted asylum)" value={theme} onChange={(e) => setTheme(e.target.value)} />
          <Button
            disabled={!title || !theme || createChain.isPending}
            onClick={() => createChain.mutate({ title, theme }, { onSuccess: () => { setTitle(""); setTheme(""); setShowCreate(false); } })}
            className="w-full bg-red-700 hover:bg-red-600"
          >
            Start Chain
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-4">Loading chains...</p>
      ) : !chains?.length ? (
        <p className="text-sm text-muted-foreground text-center py-4">No chains yet. Start one!</p>
      ) : (
        <div className="space-y-2">
          {chains.slice(0, 5).map((c) => (
            <div key={c.id} className="p-3 rounded-lg bg-card/30 border border-red-900/20">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-red-100 text-sm">{c.title}</p>
                <span className="text-xs text-red-200/60">{c.current_segments}/{c.max_segments}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{c.theme}</p>
              {activeChain === c.id ? (
                <div className="space-y-2">
                  <Textarea value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Continue the story..." rows={3} />
                  <Button
                    size="sm"
                    disabled={!segment || addSegment.isPending}
                    onClick={() => addSegment.mutate(
                      { chainId: c.id, content: segment, order: c.current_segments + 1 },
                      { onSuccess: () => { setSegment(""); setActiveChain(null); } }
                    )}
                    className="w-full bg-purple-700 hover:bg-purple-600"
                  >
                    Submit Segment
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setActiveChain(c.id)} className="w-full text-xs">
                  Add Your Segment
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  </>
  );
}
