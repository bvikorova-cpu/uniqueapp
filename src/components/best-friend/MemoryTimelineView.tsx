import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Clock } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const MemoryTimelineView = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const [convs, memories, photos] = await Promise.all([
      supabase.from("best_friend_conversations").select("content,role,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("best_friend_memories").select("content,category,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("best_friend_photos").select("image_url,caption,ai_reaction,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);
    const merged = [
      ...(convs.data || []).map((c: any) => ({ kind: "msg", date: c.created_at, ...c })),
      ...(memories.data || []).map((m: any) => ({ kind: "memory", date: m.created_at, ...m })),
      ...(photos.data || []).map((p: any) => ({ kind: "photo", date: p.created_at, ...p })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 100);
    setItems(merged);
    setLoading(false);
  })(); }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin"/></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <FloatingHowItWorks
        title={"Memory Timeline View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-white"/>
        </div>
        <h2 className="text-3xl font-black">Our Timeline</h2>
        <p className="text-muted-foreground mt-2">Every shared moment</p>
      </div>

      <div className="border-l-2 border-purple-500/40 ml-4 space-y-4">
        {items.length === 0 && <p className="text-center text-muted-foreground p-8">No history yet.</p>}
        {items.map((it, i) => (
          <div key={i} className="relative pl-6">
            <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-purple-500 border-2 border-background"/>
            <Card><CardContent className="p-3">
              <div className="text-[10px] text-muted-foreground mb-1">{new Date(it.date).toLocaleString()}</div>
              {it.kind === "msg" && <><Badge variant="outline" className="mr-2">{it.role}</Badge><span className="text-sm">{it.content}</span></>}
              {it.kind === "memory" && <><Badge className="mr-2">memory · {it.category}</Badge><span className="text-sm">{it.content}</span></>}
              {it.kind === "photo" && (
                <div>
                  <Badge className="mb-2">photo</Badge>
                  <img src={it.image_url} alt="" className="rounded max-h-48"/>
                  {it.caption && <p className="text-sm mt-1 italic">"{it.caption}"</p>}
                  {it.ai_reaction && <p className="text-sm mt-1 text-muted-foreground">— {it.ai_reaction}</p>}
                </div>
              )}
            </CardContent></Card>
          </div>
        ))}
      </div>
    </div>
  );
};
