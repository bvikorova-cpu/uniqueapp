import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Atom, Heart, Eye, ArrowLeft, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Post {
  id: string;
  user_id: string;
  base_content: string;
  is_collapsed: boolean;
  versions_count: number;
  likes_count: number;
  created_at: string;
}

interface PostVersion {
  id: string;
  content: string;
  personality_tone: string;
}

const QuantumFeed = ({ onBack }: { onBack: () => void }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postVersions, setPostVersions] = useState<{ [key: string]: PostVersion }>({});
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newPost, setNewPost] = useState({
    content: "",
    versionsCount: 3,
    tones: ["professional", "casual", "humorous"],
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quantum_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch posts", variant: "destructive" });
    } else {
      setPosts(data || []);
      if (data) {
        for (const post of data) {
          await fetchRandomVersion(post.id);
        }
      }
    }
    setLoading(false);
  };

  const fetchRandomVersion = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: observation } = await supabase
      .from("quantum_observations")
      .select("version_id")
      .eq("post_id", postId)
      .eq("observer_id", user.id)
      .single();

    let versionId = observation?.version_id;

    if (!versionId) {
      const { data: versions } = await supabase
        .from("quantum_post_versions")
        .select("*")
        .eq("post_id", postId);

      if (versions && versions.length > 0) {
        const randomVersion = versions[Math.floor(Math.random() * versions.length)];
        versionId = randomVersion.id;

        await supabase.from("quantum_observations").insert([{
          post_id: postId,
          observer_id: user.id,
          version_id: versionId,
        }]);

        setPostVersions((prev) => ({ ...prev, [postId]: randomVersion }));
      }
    } else {
      const { data: version } = await supabase
        .from("quantum_post_versions")
        .select("*")
        .eq("id", versionId)
        .single();

      if (version) {
        setPostVersions((prev) => ({ ...prev, [postId]: version }));
      }
    }
  };

  const createPost = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Authentication Required", description: "Please log in to create posts", variant: "destructive" }); return; }
    if (!newPost.content) { toast({ title: "Missing Content", description: "Please enter post content", variant: "destructive" }); return; }

    const { data: post, error: postError } = await supabase
      .from("quantum_posts")
      .insert([{ user_id: user.id, base_content: newPost.content, versions_count: newPost.versionsCount }])
      .select()
      .single();

    if (postError || !post) { toast({ title: "Error", description: "Failed to create post", variant: "destructive" }); return; }

    // Pick the tones we actually need (one per requested version) and call the AI gateway.
    const selectedTones = Array.from({ length: newPost.versionsCount }, (_, i) =>
      newPost.tones[i % newPost.tones.length]
    );

    let aiVersions: { tone: string; content: string }[] = [];
    try {
      const { data, error: aiErr } = await supabase.functions.invoke("quantum-generate-versions", {
        body: { baseContent: newPost.content, tones: selectedTones },
      });
      if (aiErr) throw aiErr;
      aiVersions = Array.isArray(data?.versions) ? data.versions : [];
    } catch (e) {
      // Graceful fallback: keep the post, but tag versions clearly so user knows AI was unavailable.
      aiVersions = selectedTones.map((tone) => ({ tone, content: `${newPost.content} (${tone})` }));
      toast({ title: "AI unavailable", description: "Versions saved without AI rewriting.", variant: "destructive" });
    }

    for (let i = 0; i < newPost.versionsCount; i++) {
      const v = aiVersions[i] ?? { tone: selectedTones[i], content: newPost.content };
      await supabase.from("quantum_post_versions").insert([{
        post_id: post.id,
        version_number: i + 1,
        content: v.content,
        personality_tone: v.tone,
      }]);
    }

    toast({ title: "Success", description: `Post created with ${newPost.versionsCount} quantum versions` });
    setIsCreating(false);
    setNewPost({ content: "", versionsCount: 3, tones: ["professional", "casual", "humorous"] });
    fetchPosts();
  };

  const likePost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const version = postVersions[postId];
    if (!version) return;

    const { error } = await supabase.from("quantum_likes").insert([{ post_id: postId, version_id: version.id, user_id: user.id }]);
    if (!error) {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        await supabase.from("quantum_posts").update({ likes_count: post.likes_count + 1 }).eq("id", postId);
      }
      fetchPosts();
    }
  };

  const collapseReality = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const version = postVersions[postId];
    if (!version) return;

    const { error } = await supabase.from("quantum_collapses").insert([{
      post_id: postId, user_id: user.id, collapsed_version_id: version.id, price_paid: 2.99,
    }]);

    if (!error) {
      await supabase.from("quantum_posts").update({ is_collapsed: true }).eq("id", postId);
      toast({ title: "Reality Collapsed", description: "Everyone now sees the same version (2.99€ charged)" });
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Atom className="h-5 w-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            Quantum Feed
          </h2>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-cyan-600 hover:bg-cyan-700">
          <Atom className="h-4 w-4 mr-2" />
          {isCreating ? "Cancel" : "Create Post"}
        </Button>
      </div>

      {isCreating && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-4">
          <h3 className="font-semibold">Create Quantum Post</h3>
          <p className="text-xs text-muted-foreground">AI will generate multiple versions for different viewers</p>
          <Textarea placeholder="Write your post content..." value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} rows={4} className="border-cyan-500/20" />
          <Select value={newPost.versionsCount.toString()} onValueChange={(value) => setNewPost({ ...newPost, versionsCount: parseInt(value) })}>
            <SelectTrigger className="border-cyan-500/20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Version (Standard)</SelectItem>
              <SelectItem value="3">3 Versions (Quantum)</SelectItem>
              <SelectItem value="5">5 Versions (Premium)</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={createPost} className="w-full bg-cyan-600 hover:bg-cyan-700">
            <Atom className="h-4 w-4 mr-2" />
            Create Quantum Post
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Loading quantum feed...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Create the first quantum post!</p>
        ) : (
          posts.map((post) => {
            const version = postVersions[post.id];
            return (
              <div key={post.id} className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 p-4">
                <div className="mb-3">
                  <p className="font-semibold text-sm">{version ? version.content : post.base_content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {version && <Badge variant="outline" className="capitalize text-[10px] border-cyan-500/30 text-cyan-400">{version.personality_tone}</Badge>}
                    {post.is_collapsed ? (
                      <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-[10px]">Reality Collapsed</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
                        <Atom className="h-2.5 w-2.5 mr-1" />{post.versions_count} Versions
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => likePost(post.id)} className="text-pink-400 hover:text-pink-300">
                    <Heart className="h-4 w-4 mr-1" />{post.likes_count}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-cyan-400" onClick={() => toast({ description: "View — coming soon" })}>
                    <Eye className="h-4 w-4 mr-1" />View
                  </Button>
                  {!post.is_collapsed && (
                    <Button variant="outline" size="sm" onClick={() => collapseReality(post.id)} className="border-violet-500/30 text-violet-400">
                      <Zap className="h-4 w-4 mr-1" />Collapse (€2.99)
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuantumFeed;
