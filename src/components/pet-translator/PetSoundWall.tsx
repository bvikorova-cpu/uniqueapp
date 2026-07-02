import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, Volume2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Post { id: string; pet_name: string; species: string; audio_url: string; caption: string; emotion: string | null; votes: number; created_at: string; user_id: string; }

export default function PetSoundWall({ onBack }: { onBack: () => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const load = async () => {
    const { data } = await supabase.from("pet_sound_wall").select("*").order("votes", { ascending: false }).limit(50);
    setPosts((data as Post[]) || []);
  };
  useEffect(() => { load(); }, []);

  const vote = async (p: Post) => {
    await supabase.from("pet_sound_wall").update({ votes: (p.votes || 0) + 1 }).eq("id", p.id);
    toast.success("👍"); load();
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Sound Wall works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <Card className="p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-1"><Users className="w-5 h-5 text-primary" /> Community Sound Wall</h2>
        <p className="text-sm text-muted-foreground mb-4">Top pet sounds shared by other owners. Vote your favorites.</p>
        {posts.length === 0
          ? <p className="text-sm text-muted-foreground text-center py-6">No posts yet — be the first to share from the audio recorder!</p>
          : <div className="space-y-3">
              {posts.map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-semibold"><Volume2 className="w-4 h-4" />{p.pet_name} <Badge variant="outline">{p.species}</Badge>{p.emotion && <Badge>{p.emotion}</Badge>}</div>
                    <Button size="sm" variant="outline" onClick={() => vote(p)}><ThumbsUp className="w-4 h-4 mr-1" />{p.votes}</Button>
                  </div>
                  {p.audio_url && <audio src={p.audio_url} controls className="w-full h-8 mb-2" />}
                  {p.caption && <p className="text-sm">{p.caption}</p>}
                </div>
              ))}
            </div>}
      </Card>
    </div>
    </>
    );
}
