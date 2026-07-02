import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Heart, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  created_at: string;
  user_id: string;
}

const CATEGORIES = ["All", "CPR Save", "Car Accident", "Choking", "Allergic Reaction", "Workplace", "Outdoor", "Other"];

export const CommunityStories = ({ onBack }: Props) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Other");
  const [filterCat, setFilterCat] = useState("All");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadStories(); }, []);

  const loadStories = async () => {
    try {
      const { data } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("activity_type", "firstaid_story")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setStories(data.map(d => ({
          id: d.id,
          title: (d.metadata as any)?.title || "Untitled",
          content: (d.metadata as any)?.content || "",
          category: (d.metadata as any)?.category || "Other",
          likes: (d.metadata as any)?.likes || 0,
          created_at: d.created_at,
          user_id: d.user_id,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitStory = async () => {
    if (!title.trim() || !content.trim()) { toast({ title: "Missing Fields", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Please sign in", variant: "destructive" }); return; }

      await supabase.from("activity_feed").insert({
        user_id: user.id,
        activity_type: "firstaid_story",
        metadata: { title, content, category, likes: 0 },
      });

      toast({ title: "Story Shared!", description: "Thank you for sharing your experience." });
      setShowForm(false);
      setTitle("");
      setContent("");
      loadStories();
    } catch (e) {
      console.error(e);
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const likeStory = async (storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    try {
      await supabase.from("activity_feed").update({
        metadata: { title: story.title, content: story.content, category: story.category, likes: story.likes + 1 }
      }).eq("id", storyId);
      setStories(prev => prev.map(s => s.id === storyId ? { ...s, likes: s.likes + 1 } : s));
    } catch (e) { console.error(e); }
  };

  const filtered = filterCat === "All" ? stories : stories.filter(s => s.category === filterCat);

  return (
    <>
      <FloatingHowItWorks title={"Community Stories - How it works"} steps={[{ title: 'Open', desc: 'Access the Community Stories section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Community Stories.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Send className="mr-2 h-4 w-4" /> Share Your Story
        </Button>
      </div>

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Community Stories</h2>
        <p className="text-muted-foreground">Real-life first aid success stories from our community</p>
      </div>

      {showForm && (
        <Card className="border-rose-200">
          <CardHeader><CardTitle className="text-lg">Share Your First Aid Story</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Story title..." value={title} onChange={e => setTitle(e.target.value)} />
            <select className="w-full rounded-lg border border-input bg-background p-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea className="w-full min-h-[120px] rounded-lg border border-input bg-background p-3 text-sm" placeholder="Tell us what happened and how first aid helped..." value={content} onChange={e => setContent(e.target.value)} />
            <Button onClick={submitStory} disabled={submitting} className="w-full">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Submit Story
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <Badge key={c} variant={filterCat === c ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilterCat(c)}>{c}</Badge>
        ))}
      </div>

      {loading ? (
        <Card><CardContent className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No stories yet. Be the first to share!</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(story => (
            <Card key={story.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">{story.category}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(story.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{story.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3">{story.content}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => likeStory(story.id)}>
                    <Heart className="h-4 w-4 mr-1" /> {story.likes}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
