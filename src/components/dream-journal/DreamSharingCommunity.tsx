import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Users, ArrowLeft, Send, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface DreamSharingCommunityProps {
  onBack: () => void;
}

const DreamSharingCommunity = ({ onBack }: DreamSharingCommunityProps) => {
  const [loading, setLoading] = useState(false);
  const [dreams, setDreams] = useState<any[]>([]);
  const [loadingDreams, setLoadingDreams] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    loadSharedDreams();
  }, []);

  const loadSharedDreams = async () => {
    try {
      const query = supabase
        .from("dream_entries")
        .select("id, title, content, themes, emotions, dream_date, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      const { data, error } = await (query as any);
      if (error) throw error;
      setDreams(data || []);
    } catch (e: any) {
      // Table might not have is_public column yet, show empty
      setDreams([]);
    } finally {
      setLoadingDreams(false);
    }
  };

  const shareDream = async () => {
    if (!content.trim()) {
      toast.error("Please describe your dream");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("dream_entries").insert({
        title: title || "Shared Dream",
        content,
        dream_date: new Date().toISOString().split("T")[0],
        themes: tags.split(",").map(t => t.trim()).filter(Boolean),
        user_id: user.id,
      } as any);

      if (error) throw error;
      toast.success("Dream shared with the community!");
      setTitle("");
      setContent("");
      setTags("");
      loadSharedDreams();
    } catch (err: any) {
      toast.error(err.message || "Error sharing dream");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Dream Sharing Community'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Dream Sharing Community panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            Dream Sharing Community
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dream title..." />
          <Textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Share your dream with the community..." rows={4} />
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated): flying, water, chase..." />
          <Button onClick={shareDream} disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Share Dream
          </Button>
        </CardContent>
      </Card>

      <h3 className="text-lg font-bold">Community Dreams</h3>
      {loadingDreams ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>
      ) : dreams.length === 0 ? (
        <Card className="bg-card/80 backdrop-blur-xl">
          <CardContent className="p-8 text-center text-muted-foreground">
            No shared dreams yet. Be the first to share!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {dreams.map((dream, i) => (
            <motion.div key={dream.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card/80 backdrop-blur-xl border-border/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{dream.title}</h4>
                    <span className="text-xs text-muted-foreground">{new Date(dream.dream_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{dream.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {dream.themes?.slice(0, 4).map((t: string, j: number) => (
                      <Badge key={j} variant="secondary" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Heart className="h-3 w-3" /> Like
                    </button>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="h-3 w-3" /> Discuss
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
    </>
  );
};

export default DreamSharingCommunity;
