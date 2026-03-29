import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, Users, Heart, Eye, TrendingUp, Camera, Plus, CheckCircle, Star, Upload, ExternalLink, Gift, Brain, Handshake, Briefcase } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { GoLiveButton } from "@/components/influencer/GoLiveButton";
import { SendInfluencerGiftDialog } from "@/components/influencer/SendInfluencerGiftDialog";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import InfluKingHero from "@/components/influking/InfluKingHero";
import AIContentPlanner from "@/components/influking/AIContentPlanner";
import CollabMatchmaker from "@/components/influking/CollabMatchmaker";
import FanClubManager from "@/components/influking/FanClubManager";
import BrandDealFinder from "@/components/influking/BrandDealFinder";
import EngagementAnalytics from "@/components/influking/EngagementAnalytics";
import HashtagGenerator from "@/components/influking/HashtagGenerator";
import WeeklyChallenges from "@/components/influking/WeeklyChallenges";
import AIThumbnailCreator from "@/components/influking/AIThumbnailCreator";
import CrossPlatformPublisher from "@/components/influking/CrossPlatformPublisher";
import AudienceInsights from "@/components/influking/AudienceInsights";
import { BarChart3, Hash, Trophy, Image, Share2, PieChart } from "lucide-react";

type InfluKingView = "hub" | "content-planner" | "collab" | "fan-club" | "brand-deals" | "analytics" | "hashtags" | "challenges" | "thumbnails" | "publisher" | "audience";

interface InfluencerProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  profile_photo_url: string | null;
  cover_photo_url: string | null;
  category: string;
  social_links: any;
  followers_count: number;
  total_likes: number;
  total_views: number;
  is_verified: boolean;
  created_at: string;
}

interface InfluencerPost {
  id: string;
  influencer_id: string;
  title: string | null;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  likes_count: number;
  views_count: number;
  created_at: string;
}

const CATEGORIES = [
  "Fashion & Beauty", "Gaming", "Fitness & Health", "Travel",
  "Food & Cooking", "Technology", "Music", "Comedy", "Education",
  "Lifestyle", "Business", "Art & Design",
];

const TOOLS = [
  { id: "content-planner" as const, icon: Brain, label: "AI Content Planner", description: "Smart AI-powered content calendar", color: "text-primary", bg: "bg-primary/10", paid: true },
  { id: "collab" as const, icon: Handshake, label: "Collab Matchmaker", description: "Find collaboration partners", color: "text-pink-500", bg: "bg-pink-500/10", paid: false },
  { id: "fan-club" as const, icon: Crown, label: "Fan Club Manager", description: "Create exclusive paid fan clubs", color: "text-amber-500", bg: "bg-amber-500/10", paid: false },
  { id: "brand-deals" as const, icon: Briefcase, label: "Brand Deal Finder", description: "Browse sponsorship opportunities", color: "text-emerald-500", bg: "bg-emerald-500/10", paid: false },
  { id: "analytics" as const, icon: BarChart3, label: "Engagement Analytics", description: "Track growth, likes & views over time", color: "text-cyan-500", bg: "bg-cyan-500/10", paid: false },
  { id: "hashtags" as const, icon: Hash, label: "AI Hashtag Generator", description: "Generate viral hashtags for reach", color: "text-indigo-500", bg: "bg-indigo-500/10", paid: true },
  { id: "challenges" as const, icon: Trophy, label: "Weekly Challenges", description: "Compete and win credits & badges", color: "text-orange-500", bg: "bg-orange-500/10", paid: false },
  { id: "thumbnails" as const, icon: Image, label: "AI Thumbnail Creator", description: "Generate eye-catching thumbnails", color: "text-rose-500", bg: "bg-rose-500/10", paid: true },
  { id: "publisher" as const, icon: Share2, label: "Cross-Platform Publisher", description: "Publish to multiple networks at once", color: "text-violet-500", bg: "bg-violet-500/10", paid: false },
  { id: "audience" as const, icon: PieChart, label: "Audience Insights", description: "Demographics, behavior & interests", color: "text-teal-500", bg: "bg-teal-500/10", paid: false },
];

const InfluKing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [activeView, setActiveView] = useState<InfluKingView>("hub");
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerProfile | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [followStatusMap, setFollowStatusMap] = useState<Record<string, boolean>>({});
  const [showGiftDialog, setShowGiftDialog] = useState(false);

  const [newProfile, setNewProfile] = useState({
    display_name: "", bio: "", category: CATEGORIES[0],
    profile_photo_url: "", cover_photo_url: "",
    instagram: "", tiktok: "", youtube: "", twitter: "",
  });

  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);

  const [newPost, setNewPost] = useState({
    title: "", content: "", media_url: "", media_type: "image",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { setUser(session?.user ?? null); }
    );
    return () => subscription.unsubscribe();
  }, []);

  const { data: myProfile } = useQuery({
    queryKey: ["myInfluencerProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("influencer_profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data as InfluencerProfile | null;
    },
    enabled: !!user,
  });

  const { data: topInfluencers = [], isLoading } = useQuery({
    queryKey: ["topInfluencers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("influencer_profiles").select("*")
        .eq("is_active", true).order("followers_count", { ascending: false }).limit(50);
      if (error) throw error;
      return data as InfluencerProfile[];
    },
  });

  useEffect(() => {
    if (!user || topInfluencers.length === 0) return;
    const fetchFollowStatus = async () => {
      const { data } = await supabase.from("influencer_followers").select("influencer_id")
        .eq("follower_id", user.id).in("influencer_id", topInfluencers.map(i => i.id));
      const statusMap: Record<string, boolean> = {};
      data?.forEach(item => { statusMap[item.influencer_id] = true; });
      setFollowStatusMap(statusMap);
    };
    fetchFollowStatus();
  }, [user, topInfluencers]);

  const { data: influencerPosts = [] } = useQuery({
    queryKey: ["influencerPosts", selectedInfluencer?.id],
    queryFn: async () => {
      if (!selectedInfluencer) return [];
      const { data, error } = await supabase.from("influencer_posts").select("*")
        .eq("influencer_id", selectedInfluencer.id).eq("is_active", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data as InfluencerPost[];
    },
    enabled: !!selectedInfluencer,
  });

  const { data: isFollowing } = useQuery({
    queryKey: ["isFollowing", selectedInfluencer?.id, user?.id],
    queryFn: async () => {
      if (!user || !selectedInfluencer) return false;
      const { data } = await supabase.from("influencer_followers").select("id")
        .eq("influencer_id", selectedInfluencer.id).eq("follower_id", user.id).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!selectedInfluencer,
  });

  const totalFollowers = topInfluencers.reduce((sum, i) => sum + (i.followers_count || 0), 0);
  const totalLikes = topInfluencers.reduce((sum, i) => sum + (i.total_likes || 0), 0);
  const totalViews = topInfluencers.reduce((sum, i) => sum + (i.total_views || 0), 0);

  // Mutations
  const createProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("influencer_profiles").insert([{
        user_id: user.id, display_name: newProfile.display_name, bio: newProfile.bio,
        category: newProfile.category, profile_photo_url: newProfile.profile_photo_url || null,
        cover_photo_url: newProfile.cover_photo_url || null,
        social_links: { instagram: newProfile.instagram || null, tiktok: newProfile.tiktok || null, youtube: newProfile.youtube || null, twitter: newProfile.twitter || null },
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInfluencerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["topInfluencers"] });
      setShowCreateDialog(false);
      toast({ title: "✅ Profile Created", description: "Your influencer profile is live!" });
    },
    onError: (error: any) => { toast({ title: "Error", description: error.message, variant: "destructive" }); },
  });

  const uploadMediaToStorage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    setUploadingMedia(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('media').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      return publicUrl;
    } catch (error: any) {
      toast({ title: "Upload Error", description: error.message, variant: "destructive" });
      return null;
    } finally { setUploadingMedia(false); }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingProfilePhoto(true);
    try {
      const fileName = `${user!.id}/profile-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('media').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      setNewProfile({ ...newProfile, profile_photo_url: publicUrl });
    } catch (error: any) { toast({ title: "Upload Error", description: error.message, variant: "destructive" }); }
    finally { setUploadingProfilePhoto(false); }
  };

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingCoverPhoto(true);
    try {
      const fileName = `${user!.id}/cover-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('media').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      setNewProfile({ ...newProfile, cover_photo_url: publicUrl });
    } catch (error: any) { toast({ title: "Upload Error", description: error.message, variant: "destructive" }); }
    finally { setUploadingCoverPhoto(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    const url = await uploadMediaToStorage(file);
    if (url) { setNewPost({ ...newPost, media_url: url, media_type: mediaType }); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
        const url = await uploadMediaToStorage(file);
        if (url) { setNewPost({ ...newPost, media_url: url, media_type: 'video' }); }
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error: any) { toast({ title: "Camera Error", description: error.message, variant: "destructive" }); }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) { mediaRecorder.stop(); setIsRecording(false); setMediaRecorder(null); }
  };

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!myProfile) throw new Error("Need influencer profile");
      const { error } = await supabase.from("influencer_posts").insert([{
        influencer_id: myProfile.id, title: newPost.title || null, content: newPost.content || null,
        media_url: newPost.media_url || null, media_type: newPost.media_type,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencerPosts"] });
      setShowPostDialog(false);
      setNewPost({ title: "", content: "", media_url: "", media_type: "image" });
      toast({ title: "✅ Post Published", description: "Your content is now live!" });
    },
    onError: (error: any) => { toast({ title: "Error", description: error.message, variant: "destructive" }); },
  });

  const followMutation = useMutation({
    mutationFn: async ({ influencerId, follow }: { influencerId: string; follow: boolean }) => {
      if (!user) throw new Error("Must be logged in");
      if (follow) {
        const { error } = await supabase.from("influencer_followers").insert([{ influencer_id: influencerId, follower_id: user.id }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("influencer_followers").delete().eq("influencer_id", influencerId).eq("follower_id", user.id);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      setFollowStatusMap(prev => ({ ...prev, [variables.influencerId]: variables.follow }));
      queryClient.invalidateQueries({ queryKey: ["isFollowing"] });
      queryClient.invalidateQueries({ queryKey: ["topInfluencers"] });
      toast({ title: variables.follow ? "✅ Following" : "Unfollowed" });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { data: existing } = await supabase.from("influencer_post_likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
      if (existing) {
        await supabase.from("influencer_post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      } else {
        await supabase.from("influencer_post_likes").insert([{ post_id: postId, user_id: user.id }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencerPosts"] });
      queryClient.invalidateQueries({ queryKey: ["topInfluencers"] });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>You need to log in to access Influ-King</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/auth"}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // View router
  if (activeView === "content-planner") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4">
      <AIContentPlanner onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "collab") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4">
      <CollabMatchmaker onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "fan-club") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4">
      <FanClubManager onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "brand-deals") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4">
      <BrandDealFinder onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "analytics") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4">
      <EngagementAnalytics onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "hashtags") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4">
      <HashtagGenerator onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "challenges") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4">
      <WeeklyChallenges onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "thumbnails") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4">
      <AIThumbnailCreator onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "publisher") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4">
      <CrossPlatformPublisher onBack={() => setActiveView("hub")} />
    </div></div>
  );
  if (activeView === "audience") return (
    <div className="min-h-screen bg-background pt-20 pb-12"><div className="container mx-auto px-4">
      <AudienceInsights onBack={() => setActiveView("hub")} />
    </div></div>
  );

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Cinematic Hero */}
        <InfluKingHero
          totalInfluencers={topInfluencers.length}
          totalFollowers={totalFollowers}
          totalLikes={totalLikes}
          totalViews={totalViews}
        />

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {myProfile ? (
            <>
              <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2"><Plus className="h-5 w-5" /> Add Post</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>New Post</DialogTitle>
                    <DialogDescription>Publish content for your followers</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Title</Label><Input value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} placeholder="Enter title..." /></div>
                    <div><Label>Content</Label><Textarea value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} placeholder="Write something..." rows={4} /></div>
                    <div className="space-y-3">
                      <Label>Photo/Video</Label>
                      <div className="flex gap-2">
                        <Input type="file" accept="image/*,video/*" onChange={handleFileUpload} disabled={uploadingMedia || isRecording} className="flex-1" />
                        {!isRecording ? (
                          <Button type="button" variant="outline" onClick={startRecording} disabled={uploadingMedia}>
                            <Camera className="h-4 w-4 mr-2" /> Record
                          </Button>
                        ) : (
                          <Button type="button" variant="destructive" onClick={stopRecording}>Stop</Button>
                        )}
                      </div>
                      {newPost.media_url && (
                        <div className="mt-3">
                          {newPost.media_type === 'video' ? (
                            <video src={newPost.media_url} controls className="w-full rounded-lg max-h-64" />
                          ) : (
                            <img src={newPost.media_url} alt="Preview" className="w-full rounded-lg max-h-64 object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                    <Button className="w-full" onClick={() => createPostMutation.mutate()} disabled={createPostMutation.isPending || uploadingMedia}>
                      {uploadingMedia ? "Uploading..." : createPostMutation.isPending ? "Publishing..." : "Publish"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <GoLiveButton influencerId={myProfile.id} />
              <Button variant="outline" onClick={() => navigate("/influencer/earnings")}>My Earnings</Button>
              <Button variant="outline" onClick={() => setSelectedInfluencer(myProfile)}>My Profile</Button>
              <Button variant="destructive" size="sm" onClick={async () => {
                if (!confirm('Delete your influencer profile? This is irreversible.')) return;
                const { error } = await supabase.from('influencer_profiles').delete().eq('id', myProfile.id).eq('user_id', user.id);
                if (!error) {
                  queryClient.invalidateQueries({ queryKey: ["myInfluencerProfile"] });
                  queryClient.invalidateQueries({ queryKey: ["topInfluencers"] });
                  toast({ title: "Profile Deleted" });
                }
              }}>Delete Profile</Button>
            </>
          ) : (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2"><Star className="h-5 w-5" /> Become an Influencer</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Your Influencer Profile</DialogTitle>
                  <DialogDescription>Start your path to fame!</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div><Label>Name / Nickname *</Label><Input value={newProfile.display_name} onChange={(e) => setNewProfile({ ...newProfile, display_name: e.target.value })} placeholder="@influencer_king" /></div>
                  <div><Label>About Me</Label><Textarea value={newProfile.bio} onChange={(e) => setNewProfile({ ...newProfile, bio: e.target.value })} placeholder="Write about yourself..." rows={3} /></div>
                  <div>
                    <Label>Category *</Label>
                    <select value={newProfile.category} onChange={(e) => setNewProfile({ ...newProfile, category: e.target.value })} className="w-full p-2 border rounded-md bg-background">
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <div className="flex gap-2">
                      <Input type="file" accept="image/*" onChange={handleProfilePhotoUpload} disabled={uploadingProfilePhoto} className="flex-1" />
                      {uploadingProfilePhoto && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />}
                    </div>
                    {newProfile.profile_photo_url && <img src={newProfile.profile_photo_url} alt="" className="w-20 h-20 object-cover rounded-full border-2 border-border" />}
                    <Input value={newProfile.profile_photo_url} onChange={(e) => setNewProfile({ ...newProfile, profile_photo_url: e.target.value })} placeholder="Or enter URL..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Cover Photo</Label>
                    <div className="flex gap-2">
                      <Input type="file" accept="image/*" onChange={handleCoverPhotoUpload} disabled={uploadingCoverPhoto} className="flex-1" />
                      {uploadingCoverPhoto && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />}
                    </div>
                    {newProfile.cover_photo_url && <img src={newProfile.cover_photo_url} alt="" className="w-full h-32 object-cover rounded-lg border-2 border-border" />}
                    <Input value={newProfile.cover_photo_url} onChange={(e) => setNewProfile({ ...newProfile, cover_photo_url: e.target.value })} placeholder="Or enter URL..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Instagram</Label><Input value={newProfile.instagram} onChange={(e) => setNewProfile({ ...newProfile, instagram: e.target.value })} placeholder="@username" /></div>
                    <div><Label>TikTok</Label><Input value={newProfile.tiktok} onChange={(e) => setNewProfile({ ...newProfile, tiktok: e.target.value })} placeholder="@username" /></div>
                    <div><Label>YouTube</Label><Input value={newProfile.youtube} onChange={(e) => setNewProfile({ ...newProfile, youtube: e.target.value })} placeholder="@channel" /></div>
                    <div><Label>Twitter/X</Label><Input value={newProfile.twitter} onChange={(e) => setNewProfile({ ...newProfile, twitter: e.target.value })} placeholder="@username" /></div>
                  </div>
                  <Button className="w-full" onClick={() => createProfileMutation.mutate()} disabled={createProfileMutation.isPending}>
                    {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* Tools Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" /> Influencer Tools
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TOOLS.map((tool, i) => (
              <motion.div key={tool.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Card className="backdrop-blur-xl bg-card/80 border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => setActiveView(tool.id)}>
                  <CardContent className="p-4 text-center">
                    <div className={`${tool.bg} rounded-xl p-3 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      <tool.icon className={`h-6 w-6 ${tool.color}`} />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{tool.label}</h3>
                    <p className="text-[10px] text-muted-foreground">{tool.description}</p>
                    {tool.paid && <Badge className="mt-2 text-[9px] bg-primary/20 text-primary border-primary/30">AI Powered</Badge>}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Description Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="max-w-4xl mx-auto mb-8 backdrop-blur-xl bg-card/80 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" /> What is Influ-King?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong className="text-foreground">Influ-King</strong> is your ultimate platform to build and grow your influencer career.
                Create your professional profile, share engaging content, attract followers, and climb the leaderboard
                to become a TOP influencer recognized worldwide.
              </p>
              <div className="space-y-3">
                <h4 className="font-semibold">How to Get Started:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                  <li><strong className="text-foreground">Create Your Profile</strong> – Set up your professional influencer profile with bio, photos, and social media links.</li>
                  <li><strong className="text-foreground">Share Content</strong> – Post photos and videos to engage your audience.</li>
                  <li><strong className="text-foreground">Go Live</strong> – Start live streams to interact with fans in real-time.</li>
                  <li><strong className="text-foreground">Receive Gifts & Tips</strong> – Followers can send virtual gifts as appreciation.</li>
                  <li><strong className="text-foreground">Track & Withdraw Earnings</strong> – Monitor earnings and request withdrawals (min €50).</li>
                  <li><strong className="text-foreground">Use AI Tools</strong> – Leverage the AI Content Planner, find brand deals, and manage fan clubs.</li>
                </ul>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                {[
                  { icon: Crown, text: "Leaderboard ranking", color: "text-amber-500" },
                  { icon: Users, text: "Follower management", color: "text-primary" },
                  { icon: Gift, text: "Gift monetization", color: "text-pink-500" },
                  { icon: Camera, text: "Live streaming", color: "text-blue-500" },
                  { icon: TrendingUp, text: "Earnings tracking", color: "text-green-500" },
                  { icon: Brain, text: "AI-powered tools", color: "text-purple-500" },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} /><span>{text}</span></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Influencer Detail Dialog */}
        <Dialog open={!!selectedInfluencer} onOpenChange={() => setSelectedInfluencer(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedInfluencer && (
              <>
                {selectedInfluencer.cover_photo_url && (
                  <div className="h-48 -mt-6 -mx-6 mb-4 rounded-t-lg overflow-hidden">
                    <img src={selectedInfluencer.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={selectedInfluencer.profile_photo_url || undefined} />
                    <AvatarFallback>{selectedInfluencer.display_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">{selectedInfluencer.display_name}</h2>
                      {selectedInfluencer.is_verified && <CheckCircle className="h-6 w-6 text-blue-500 fill-blue-500" />}
                    </div>
                    <Badge className="mb-3">{selectedInfluencer.category}</Badge>
                    <p className="text-muted-foreground mb-4">{selectedInfluencer.bio}</p>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground" /><span className="font-bold">{selectedInfluencer.followers_count.toLocaleString()}</span><span className="text-sm text-muted-foreground">followers</span></div>
                      <div className="flex items-center gap-2"><Heart className="h-5 w-5 text-muted-foreground" /><span className="font-bold">{selectedInfluencer.total_likes.toLocaleString()}</span><span className="text-sm text-muted-foreground">likes</span></div>
                      <div className="flex items-center gap-2"><Eye className="h-5 w-5 text-muted-foreground" /><span className="font-bold">{selectedInfluencer.total_views.toLocaleString()}</span><span className="text-sm text-muted-foreground">views</span></div>
                    </div>
                    {selectedInfluencer.user_id !== user?.id && (
                      <div className="flex gap-2">
                        <Button onClick={() => followMutation.mutate({ influencerId: selectedInfluencer.id, follow: !isFollowing })}
                          disabled={followMutation.isPending} variant={isFollowing ? "outline" : "default"}>
                          {isFollowing ? "Following" : "Follow"}
                        </Button>
                        <Button onClick={() => setShowGiftDialog(true)} variant="outline" className="gap-2">
                          <Gift className="h-4 w-4" /> Send Gift
                        </Button>
                      </div>
                    )}
                    {selectedInfluencer.social_links?.instagram && (
                      <div className="mt-4">
                        <a href={`https://instagram.com/${selectedInfluencer.social_links.instagram}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Posts</h3>
                  {influencerPosts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No posts yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {influencerPosts.map((post) => (
                        <Card key={post.id}>
                          {post.media_url && (
                            <div className="aspect-video overflow-hidden rounded-t-lg">
                              {post.media_type === "video" ? (
                                <video src={post.media_url} controls className="w-full h-full object-cover" />
                              ) : (
                                <img src={post.media_url} alt={post.title || ""} className="w-full h-full object-cover" />
                              )}
                            </div>
                          )}
                          <CardContent className="pt-4">
                            {post.title && <h4 className="font-bold mb-2">{post.title}</h4>}
                            {post.content && <p className="text-sm text-muted-foreground mb-3">{post.content}</p>}
                            <div className="flex items-center justify-between">
                              <Button variant="ghost" size="sm" onClick={() => likePostMutation.mutate(post.id)} disabled={likePostMutation.isPending}>
                                <Heart className="h-4 w-4 mr-1" /> {post.likes_count}
                              </Button>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground"><Eye className="h-4 w-4" /> {post.views_count}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Gift Dialog */}
        {selectedInfluencer && (
          <SendInfluencerGiftDialog open={showGiftDialog} onOpenChange={setShowGiftDialog}
            influencerId={selectedInfluencer.id} influencerName={selectedInfluencer.display_name} />
        )}

        {/* TOP Influencers Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="max-w-6xl mx-auto backdrop-blur-xl bg-card/80 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-amber-500" /> TOP Influencers
              </CardTitle>
              <CardDescription>Leaderboard ranked by follower count</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12"><p className="text-muted-foreground">Loading...</p></div>
              ) : topInfluencers.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No influencers yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topInfluencers.map((influencer, index) => (
                    <motion.div key={influencer.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.03 }}
                      onClick={() => setSelectedInfluencer(influencer)}
                      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all hover:bg-accent/50 ${
                        index < 3 ? "bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/10" : ""
                      }`}>
                      <div className="flex items-center justify-center w-10 h-10 shrink-0">
                        {index === 0 && <Crown className="h-8 w-8 text-amber-500" />}
                        {index === 1 && <Crown className="h-7 w-7 text-gray-400" />}
                        {index === 2 && <Crown className="h-6 w-6 text-orange-600" />}
                        {index > 2 && <span className="text-xl font-bold text-muted-foreground">#{index + 1}</span>}
                      </div>
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={influencer.profile_photo_url || undefined} />
                        <AvatarFallback>{influencer.display_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold truncate">{influencer.display_name}</h3>
                          {influencer.is_verified && <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-500 shrink-0" />}
                        </div>
                        <Badge variant="outline" className="text-xs">{influencer.category}</Badge>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 text-sm shrink-0">
                        <div className="flex items-center gap-1"><Users className="h-4 w-4 text-muted-foreground" /><span className="font-bold">{influencer.followers_count.toLocaleString()}</span></div>
                        <div className="flex items-center gap-1"><Heart className="h-4 w-4 text-muted-foreground" /><span className="font-bold">{influencer.total_likes.toLocaleString()}</span></div>
                        <div className="flex items-center gap-1"><Eye className="h-4 w-4 text-muted-foreground" /><span className="font-bold">{influencer.total_views.toLocaleString()}</span></div>
                      </div>
                      {user && influencer.user_id !== user.id && (
                        <Button variant="outline" size="sm" className="shrink-0" onClick={(e) => {
                          e.stopPropagation();
                          followMutation.mutate({ influencerId: influencer.id, follow: !followStatusMap[influencer.id] });
                        }} disabled={followMutation.isPending}>
                          {followStatusMap[influencer.id] ? "Following" : "Follow"}
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InfluKing;
