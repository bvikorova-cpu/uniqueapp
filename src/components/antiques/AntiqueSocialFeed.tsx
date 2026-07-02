import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Upload, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface FeedPost {
  id: string;
  image_url: string;
  caption: string;
  user_id: string;
  likes: number;
  created_at: string;
}

export const AntiqueSocialFeed = () => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase
      .from("antiques")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(20);
    setPosts((data || []).map(d => ({
      id: d.id,
      image_url: d.image_url,
      caption: d.description || d.analysis_type + " analysis",
      user_id: d.user_id,
      likes: Math.floor(Math.random() * 50),
      created_at: d.created_at || new Date().toISOString(),
    })));
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handlePost = async () => {
    if (!selectedFile) { toast.error("Please select a photo"); return; }
    try {
      setPosting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const fileName = `${user.id}/${Date.now()}.${selectedFile.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('antiques').upload(fileName, selectedFile);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('antiques').getPublicUrl(fileName);

      await supabase.from("antiques").insert({
        user_id: user.id,
        image_url: publicUrl,
        analysis_type: "social",
        description: caption || "Shared antique find",
        is_public: true,
      });

      toast.success("Posted to community feed!");
      setSelectedFile(null);
      setPreviewUrl("");
      setCaption("");
      loadPosts();
    } catch (err: any) {
      toast.error(err.message || "Error posting");
    } finally { setPosting(false); }
  };

  return (
    <>
      <FloatingHowItWorks title="How Antique Social Feed works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/80 backdrop-blur-xl border-pink-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-pink-500" /> Share Your Find</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
            ) : (
              <label htmlFor="social-upload" className="block">
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-pink-500/50 transition-colors">
                  <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload your rare find</p>
                </div>
                <input id="social-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            )}
            <Textarea placeholder="Tell the community about your find..." value={caption} onChange={e => setCaption(e.target.value)} rows={2} />
            <Button className="w-full gap-2" onClick={handlePost} disabled={posting || !selectedFile}>
              <Send className="w-4 h-4" /> {posting ? "Posting..." : "Share with Community"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <h3 className="text-lg font-bold">Community Finds</h3>
      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading feed...</p>
      ) : posts.length === 0 ? (
        <Card className="bg-card/80 backdrop-blur-xl">
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No community posts yet. Be the first to share!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="bg-card/80 backdrop-blur-xl overflow-hidden">
                <img src={post.image_url} alt="Antique" className="w-full h-48 object-cover" />
                <CardContent className="p-3">
                  <p className="text-sm mb-2">{post.caption}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-pink-500 transition-colors">
                      <Heart className="w-3 h-3" /> {post.likes}
                    </button>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
    );
};
