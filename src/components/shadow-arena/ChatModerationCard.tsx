import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, X, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { shadowArenaCall } from "@/hooks/useShadowArenaRouter";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function ChatModerationCard() {
  const [words, setWords] = useState<{ id: string; word: string }[]>([]);
  const [mods, setMods] = useState<{ id: string; mod_user_id: string }[]>([]);
  const [w, setW] = useState("");
  const [m, setM] = useState("");

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [wr, mr] = await Promise.all([
      supabase.from("shadow_banned_words").select("id, word").eq("creator_id", user.id),
      supabase.from("shadow_stream_mods").select("id, mod_user_id").eq("creator_id", user.id),
    ]);
    setWords((wr.data as any[]) || []);
    setMods((mr.data as any[]) || []);
  };
  useEffect(() => { load(); }, []);

  const addWord = async () => {
    if (!w.trim()) return;
    try { await shadowArenaCall("banned_word_add", { word: w }); setW(""); await load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const removeWord = async (word: string) => {
    try { await shadowArenaCall("banned_word_remove", { word }); await load(); }
    catch (e: any) { toast.error(e.message); }
  };
  const addMod = async () => {
    if (!m.trim()) return;
    try { await shadowArenaCall("mod_add", { mod_user_id: m.trim() }); setM(""); await load(); toast.success("Mod added!"); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <><FloatingHowItWorks title="ChatModerationCard — How it works" steps={[{title:"Open this section",desc:"Access ChatModerationCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Card className="p-5 mb-6 border-purple-900/40">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-blue-400" />
        <h3 className="font-bold">Chat Moderation</h3>
      </div>

      <div className="mb-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Banned Words</div>
        <div className="flex gap-2 mb-2">
          <Input placeholder="Add word…" value={w} onChange={(e) => setW(e.target.value)} />
          <Button size="sm" onClick={addWord}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {words.map((x) => (
            <span key={x.id} className="text-xs px-2 py-1 rounded bg-red-900/40 border border-red-700/40 flex items-center gap-1">
              {x.word}
              <button onClick={() => removeWord(x.word)}><X className="h-3 w-3" /></button>
            </span>
          ))}
          {words.length === 0 && <span className="text-xs text-muted-foreground">No banned words.</span>}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Stream Mods</div>
        <div className="flex gap-2 mb-2">
          <Input placeholder="Mod user UUID…" value={m} onChange={(e) => setM(e.target.value)} />
          <Button size="sm" onClick={addMod}><UserPlus className="h-3 w-3 mr-1" />Add</Button>
        </div>
        <div className="space-y-1">
          {mods.map((x) => (
            <div key={x.id} className="text-xs font-mono px-2 py-1 rounded bg-black/30">{x.mod_user_id}</div>
          ))}
          {mods.length === 0 && <span className="text-xs text-muted-foreground">No mods yet.</span>}
        </div>
      </div>
    </Card>
  </>
  );
}
