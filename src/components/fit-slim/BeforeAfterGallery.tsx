import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ImagePlus, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface Story {
  id: string;
  user_id: string;
  activity_type: string;
  metadata: any;
  created_at: string;
}

export default function BeforeAfterGallery({ onBack }: Props) {
  const [stories, setStories] = useState<Story[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weightBefore, setWeightBefore] = useState("");
  const [weightAfter, setWeightAfter] = useState("");
  const [duration, setDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadStories(); }, []);

  const loadStories = async () => {
    const { data } = await supabase.from("activity_feed").select("*").eq("activity_type", "transformation").order("created_at", { ascending: false }).limit(20);
    if (data) setStories(data as any[]);
  };

  const submitStory = async () => {
    if (!title.trim() || !description.trim()) { toast({ title: "Fill in title and description", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }
      await supabase.from("activity_feed").insert({
        user_id: user.id,
        activity_type: "transformation",
        metadata: { title, description, weight_before: weightBefore, weight_after: weightAfter, duration },
      });
      toast({ title: "Transformation shared! 🎉" });
      setTitle(""); setDescription(""); setWeightBefore(""); setWeightAfter(""); setDuration("");
      loadStories();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Before After Gallery - How it works"} steps={[{ title: 'Open', desc: 'Access the Before After Gallery section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Before After Gallery.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
          <ImagePlus className="h-5 w-5 text-amber-400" />
          <span className="font-bold text-amber-400">Before & After Gallery</span>
          <span className="text-xs bg-green-500/20 px-2 py-0.5 rounded-full text-green-300">Free</span>
        </div>
        <p className="text-muted-foreground text-sm">Share your fitness transformation and inspire others</p>
      </div>

      {/* Submit Form */}
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60">
        <h3 className="font-bold mb-4">Share Your Transformation</h3>
        <div className="space-y-3">
          <Input placeholder="Title (e.g. My 90-Day Journey)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Describe your transformation story, what you did, challenges, tips..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Weight before (kg)" value={weightBefore} onChange={(e) => setWeightBefore(e.target.value)} />
            <Input placeholder="Weight after (kg)" value={weightAfter} onChange={(e) => setWeightAfter(e.target.value)} />
            <Input placeholder="Duration (e.g. 3 months)" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <Button onClick={submitStory} disabled={submitting} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share Transformation"}
          </Button>
        </div>
      </Card>

      {/* Gallery */}
      <h3 className="text-xl font-bold">Community Transformations</h3>
      {stories.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 border-border/60">
          <p className="text-muted-foreground">No transformations shared yet. Be the first to inspire others!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map((s, i) => {
            const meta = s.metadata as any;
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/60 hover:border-amber-500/30 transition-colors">
                  <h4 className="font-bold">{meta?.title || "Transformation"}</h4>
                  <p className="text-sm text-muted-foreground mt-2">{meta?.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    {meta?.weight_before && <Badge variant="outline" className="bg-red-500/10 text-red-400">{meta.weight_before}kg → {meta.weight_after || "?"}kg</Badge>}
                    {meta?.duration && <Badge variant="outline" className="bg-blue-500/10 text-blue-400">{meta.duration}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{new Date(s.created_at).toLocaleDateString()}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
