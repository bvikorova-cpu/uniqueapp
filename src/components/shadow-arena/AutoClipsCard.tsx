import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shadowArenaCall } from "@/hooks/useShadowArenaRouter";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface C { id: string; title: string; highlight_text: string; emoji: string; duration_seconds: number; views: number; shares: number; }

export function AutoClipsCard() {
  const [clips, setClips] = useState<C[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const load = async () => {
    const { data } = await supabase.from("shadow_auto_clips")
      .select("*").order("created_at", { ascending: false }).limit(6);
    setClips((data as C[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!title.trim() || !text.trim()) return;
    try {
      await shadowArenaCall("clip_create", { title, highlight_text: text });
      setTitle(""); setText(""); await load(); toast.success("Clip created!");
    } catch (e: any) { toast.error(e.message); }
  };

  const share = async (c: C) => {
    try {
      const url = `${location.origin}/shadow-arena/dashboard?clip=${c.id}`;
      await navigator.clipboard.writeText(url);
      await shadowArenaCall("clip_share", { clip_id: c.id });
      toast.success("Link copied!");
      await load();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <><FloatingHowItWorks title="AutoClipsCard — How it works" steps={[{title:"Open this section",desc:"Access AutoClipsCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 mb-6 border-purple-900/40">
      <div className="flex items-center gap-2 mb-3">
        <Film className="h-5 w-5 text-fuchsia-400" />
        <h3 className="font-bold">Highlight Clips</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <Input placeholder="Clip title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Highlight text (15-30s read)" value={text} onChange={(e) => setText(e.target.value)} className="sm:col-span-2" />
      </div>
      <Button onClick={create} className="w-full mb-3">Create Clip</Button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {clips.map((c) => (
          <div key={c.id} className="p-3 rounded border border-border/50 bg-black/30">
            <div className="flex justify-between items-start mb-1">
              <div className="font-semibold text-sm">{c.emoji} {c.title}</div>
              <Button size="sm" variant="ghost" onClick={() => share(c)}>
                <Share2 className="h-3 w-3 mr-1" />{c.shares}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{c.highlight_text}</p>
            <div className="text-[10px] text-muted-foreground mt-1">{c.duration_seconds}s · {c.views} views</div>
          </div>
        ))}
      </div>
    </Card>
  </>
  );
}
