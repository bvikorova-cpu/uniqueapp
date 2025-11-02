import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Atom, Heart, Eye, Trash2, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const QuantumFeed = () => {
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
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    } else {
      setPosts(data || []);
      // Fetch a random version for each post
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

    // Check if user already observed this post
    const { data: observation } = await supabase
      .from("quantum_observations")
      .select("version_id")
      .eq("post_id", postId)
      .eq("observer_id", user.id)
      .single();

    let versionId = observation?.version_id;

    if (!versionId) {
      // Get random version for this post
      const { data: versions } = await supabase
        .from("quantum_post_versions")
        .select("*")
        .eq("post_id", postId);

      if (versions && versions.length > 0) {
        const randomVersion = versions[Math.floor(Math.random() * versions.length)];
        versionId = randomVersion.id;

        // Record observation
        await supabase.from("quantum_observations").insert([
          {
            post_id: postId,
            observer_id: user.id,
            version_id: versionId,
          },
        ]);

        setPostVersions((prev) => ({
          ...prev,
          [postId]: randomVersion,
        }));
      }
    } else {
      // Fetch the observed version
      const { data: version } = await supabase
        .from("quantum_post_versions")
        .select("*")
        .eq("id", versionId)
        .single();

      if (version) {
        setPostVersions((prev) => ({
          ...prev,
          [postId]: version,
        }));
      }
    }
  };

  const createPost = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create posts",
        variant: "destructive",
      });
      return;
    }

    if (!newPost.content) {
      toast({
        title: "Missing Content",
        description: "Please enter post content",
        variant: "destructive",
      });
      return;
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from("quantum_posts")
      .insert([
        {
          user_id: user.id,
          base_content: newPost.content,
          versions_count: newPost.versionsCount,
        },
      ])
      .select()
      .single();

    if (postError || !post) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
      return;
    }

    // Create versions (in real app, AI would generate these)
    for (let i = 0; i < newPost.versionsCount; i++) {
      await supabase.from("quantum_post_versions").insert([
        {
          post_id: post.id,
          version_number: i + 1,
          content: `${newPost.content} [${newPost.tones[i % newPost.tones.length]} version]`,
          personality_tone: newPost.tones[i % newPost.tones.length],
        },
      ]);
    }

    toast({
      title: "Success",
      description: `Post created with ${newPost.versionsCount} quantum versions`,
    });

    setIsCreating(false);
    setNewPost({ content: "", versionsCount: 3, tones: ["professional", "casual", "humorous"] });
    fetchPosts();
  };

  const likePost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const version = postVersions[postId];
    if (!version) return;

    const { error } = await supabase.from("quantum_likes").insert([
      {
        post_id: postId,
        version_id: version.id,
        user_id: user.id,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    } else {
      // Update likes count
      const post = posts.find((p) => p.id === postId);
      if (post) {
        await supabase
          .from("quantum_posts")
          .update({ likes_count: post.likes_count + 1 })
          .eq("id", postId);
      }
      fetchPosts();
    }
  };

  const collapseReality = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const version = postVersions[postId];
    if (!version) return;

    const { error } = await supabase.from("quantum_collapses").insert([
      {
        post_id: postId,
        user_id: user.id,
        collapsed_version_id: version.id,
        price_paid: 2.99,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to collapse reality",
        variant: "destructive",
      });
    } else {
      await supabase
        .from("quantum_posts")
        .update({ is_collapsed: true })
        .eq("id", postId);

      toast({
        title: "Reality Collapsed",
        description: "Everyone now sees the same version (2.99€ charged)",
      });
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quantum Feed</h2>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Atom className="h-4 w-4 mr-2" />
          {isCreating ? "Cancel" : "Create Quantum Post"}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create Quantum Post</CardTitle>
            <CardDescription>AI will generate multiple versions for different viewers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Write your post content..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
            />
            <Select
              value={newPost.versionsCount.toString()}
              onValueChange={(value) => setNewPost({ ...newPost, versionsCount: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Version (Standard)</SelectItem>
                <SelectItem value="3">3 Versions (Quantum)</SelectItem>
                <SelectItem value="5">5 Versions (Premium)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createPost} className="w-full">
              <Atom className="h-4 w-4 mr-2" />
              Create Quantum Post
            </Button>
          </CardContent>
        </Card>
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
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {version ? version.content : post.base_content}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {version && (
                          <Badge variant="outline" className="capitalize">
                            {version.personality_tone}
                          </Badge>
                        )}
                        {post.is_collapsed ? (
                          <Badge variant="default">Reality Collapsed</Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Atom className="h-3 w-3 mr-1" />
                            {post.versions_count} Versions
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => likePost(post.id)}>
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes_count}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {!post.is_collapsed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => collapseReality(post.id)}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Collapse Reality (2.99€)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuantumFeed;
