import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Swords, Trophy, ThumbsUp, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AgeBattleArena({ onBack }: Props) {
  const { toast } = useToast();
  const [battles, setBattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => { loadBattles(); }, []);

  const loadBattles = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("time_reversal_posts").select("*").order("likes_count", { ascending: false }).limit(10);
      setBattles(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmitEntry = async () => {
    if (!selectedFile) {
      toast({ title: "Select a photo", description: "Upload your reverse-aging transformation photo", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Login required", variant: "destructive" }); return; }

      const ext = selectedFile.name.split(".").pop();
      const path = `time-reversal/${session.user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("media").upload(path, selectedFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);

      await supabase.from("time_reversal_posts").insert({
        user_id: session.user.id,
        content: "Battle entry - My reverse aging transformation! 🔄",
        image_url: publicUrl,
        age_at_post: 30,
        post_type: "battle",
        likes_count: 0,
        comments_count: 0,
      } as any);

      toast({ title: "Entry Submitted!", description: "Your battle entry is now live. Good luck!" });
      setSelectedFile(null);
      loadBattles();
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to submit entry", variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleVote = async (postId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: post } = await supabase.from("time_reversal_posts").select("likes_count").eq("id", postId).single();
      if (post) {
        await supabase.from("time_reversal_posts").update({ likes_count: (post.likes_count || 0) + 1 }).eq("id", postId);
        toast({ title: "Vote Cast! ⚔️" });
        loadBattles();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Age Battle Arena'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Age Battle Arena panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Age Battle Arena</h2>
          <p className="text-sm text-muted-foreground">Compare reverse-aging transformations & vote for the best!</p>
        </div>
      </div>

      {/* Submit Entry */}
      <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-background">
        <CardHeader><CardTitle className="flex items-center gap-2"><Swords className="h-5 w-5 text-purple-400" /> Submit Your Entry</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center">
            <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="hidden" id="battle-upload" />
            <label htmlFor="battle-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-purple-400" />
              <p className="text-sm text-muted-foreground">{selectedFile ? selectedFile.name : "Upload your transformation photo"}</p>
            </label>
          </div>
          <Button onClick={handleSubmitEntry} disabled={uploading || !selectedFile} className="w-full bg-gradient-to-r from-purple-600 to-violet-600">
            {uploading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : "Enter Battle ⚔️"}
          </Button>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-400" /> Battle Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-400" /></div>
          ) : battles.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No battle entries yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {battles.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl bg-card/50 border border-border/40">
                  <div className={`text-2xl font-black ${i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                    #{i + 1}
                  </div>
                  {entry.image_url && <img src={entry.image_url} alt="Entry" className="w-16 h-16 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{entry.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{entry.likes_count || 0} votes</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleVote(entry.id)}>
                    <ThumbsUp className="h-4 w-4 mr-1" /> Vote
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
