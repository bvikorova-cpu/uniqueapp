import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Share2, Globe, Clock, CheckCircle, Instagram, Youtube, Loader2, Send, Calendar, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CrossPlatformPublisherProps {
  onBack: () => void;
}

interface ScheduledPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledTime: string;
  status: "pending" | "published" | "failed";
}

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: "📸", color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  { id: "tiktok", label: "TikTok", icon: "🎵", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { id: "youtube", label: "YouTube", icon: "▶️", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  { id: "twitter", label: "X / Twitter", icon: "𝕏", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "facebook", label: "Facebook", icon: "📘", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  { id: "linkedin", label: "LinkedIn", icon: "💼", color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
];

const CrossPlatformPublisher = ({ onBack }: CrossPlatformPublisherProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [scheduleTime, setScheduleTime] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [autoAdapt, setAutoAdapt] = useState(true);

  const { data: scheduledPosts = [], isLoading } = useQuery({
    queryKey: ["scheduled-cross-posts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("user_id", user.id)
        .eq("activity_type", "cross_platform_post")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []).map((item: any) => ({
        id: item.id,
        content: item.metadata?.content || "",
        platforms: item.metadata?.platforms || [],
        scheduledTime: item.metadata?.scheduled_time || item.created_at,
        status: item.metadata?.status || "pending",
      })) as ScheduledPost[];
    },
  });

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const publishPost = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!content.trim()) throw new Error("Content is required");
      if (selectedPlatforms.size === 0) throw new Error("Select at least one platform");

      const platformsArray = Array.from(selectedPlatforms);

      const { error } = await supabase.from("activity_feed").insert({
        user_id: user.id,
        activity_type: "cross_platform_post",
        target_type: "multi_platform",
        metadata: {
          content,
          platforms: platformsArray,
          scheduled_time: scheduleTime || new Date().toISOString(),
          status: scheduleTime ? "pending" : "published",
          auto_adapt: autoAdapt,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-cross-posts"] });
      toast({
        title: scheduleTime ? "✅ Post Scheduled!" : "✅ Post Published!",
        description: `Content sent to ${selectedPlatforms.size} platform(s)`,
      });
      setContent("");
      setSelectedPlatforms(new Set());
      setScheduleTime("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getCharCount = () => {
    const limits: Record<string, number> = {
      twitter: 280, instagram: 2200, tiktok: 2200, youtube: 5000, facebook: 63206, linkedin: 3000,
    };
    const active = Array.from(selectedPlatforms);
    if (active.length === 0) return null;
    const minLimit = Math.min(...active.map(p => limits[p] || 5000));
    return { current: content.length, max: minLimit, platform: active.find(p => limits[p] === minLimit) };
  };

  const charInfo = getCharCount();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/30">
            <Share2 className="h-8 w-8 text-violet-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Cross-Platform Publisher</h2>
            <p className="text-muted-foreground">Publish to multiple social networks simultaneously</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Composer */}
          <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> Compose Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Platform Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Select Platforms</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PLATFORMS.map((platform) => (
                    <Button key={platform.id} variant={selectedPlatforms.has(platform.id) ? "default" : "outline"}
                      className="h-auto py-2 gap-2 justify-start"
                      onClick={() => togglePlatform(platform.id)}>
                      <span>{platform.icon}</span>
                      <span className="text-xs">{platform.label}</span>
                      {selectedPlatforms.has(platform.id) && <CheckCircle className="h-3 w-3 ml-auto" />}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium mb-2 block">Content</label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your post content here..." rows={5} />
                {charInfo && (
                  <p className={`text-xs mt-1 ${charInfo.current > charInfo.max ? "text-red-500" : "text-muted-foreground"}`}>
                    {charInfo.current}/{charInfo.max} characters ({charInfo.platform} limit)
                  </p>
                )}
              </div>

              {/* Auto-adapt */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Auto-adapt content</p>
                  <p className="text-xs text-muted-foreground">Automatically adjust format for each platform</p>
                </div>
                <Switch checked={autoAdapt} onCheckedChange={setAutoAdapt} />
              </div>

              {/* Schedule */}
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Schedule (optional)
                </label>
                <Input type="datetime-local" value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)} />
              </div>

              <Button onClick={() => publishPost.mutate()} disabled={publishPost.isPending} className="w-full gap-2">
                {publishPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> :
                  scheduleTime ? <Clock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {publishPost.isPending ? "Publishing..." :
                  scheduleTime ? "Schedule Post" : `Publish to ${selectedPlatforms.size} Platform(s)`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Queue Sidebar */}
        <Card className="backdrop-blur-xl bg-card/80 border-primary/10 h-fit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" /> Post Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No scheduled posts yet</p>
            ) : (
              scheduledPosts.slice(0, 8).map((post) => (
                <div key={post.id} className="p-3 rounded-lg border border-border/20 space-y-2">
                  <p className="text-xs line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {post.platforms.map((p: string) => (
                        <Badge key={p} variant="secondary" className="text-[9px] px-1">
                          {PLATFORMS.find(pl => pl.id === p)?.icon}
                        </Badge>
                      ))}
                    </div>
                    <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-[9px]">
                      {post.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrossPlatformPublisher;
