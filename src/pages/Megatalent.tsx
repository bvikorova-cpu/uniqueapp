import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Upload, Video, Camera, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSpendCredits } from "@/hooks/useSpendCredits";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReferralProgram } from "@/components/megatalent/ReferralProgram";
import { MegaTalentGuide } from "@/components/megatalent/MegaTalentGuide";
import { SEO } from "@/components/SEO";
import { AnimatedVoteCounter } from "@/components/megatalent/AnimatedVoteCounter";
import { VoteBoostTooltip } from "@/components/megatalent/VoteBoostTooltip";

import MegaTalentHero from "@/components/megatalent/MegaTalentHero";
import MegatalentClipOfDay from "@/components/megatalent/MegatalentClipOfDay";
import MegatalentTalentShop from "@/components/megatalent/MegatalentTalentShop";
import MegatalentStories from "@/components/megatalent/MegatalentStories";
import MegatalentSponsorShowcase from "@/components/megatalent/MegatalentSponsorShowcase";
import MegatalentVotingStreak from "@/components/megatalent/MegatalentVotingStreak";
import MegatalentAchievements from "@/components/megatalent/MegatalentAchievements";

import BattleRoyalePayouts from "@/components/megatalent/BattleRoyalePayouts";
import MegatalentNotificationBell from "@/components/megatalent/MegatalentNotificationBell";
import { LiveSocialProof } from "@/components/social/LiveSocialProof";
import UnifiedXPLeaderboard from "@/components/shared/UnifiedXPLeaderboard";
import NextVotingCountdown from "@/components/megatalent/NextVotingCountdown";
import MegaTalentCategoryGrid from "@/components/megatalent/MegaTalentCategoryGrid";
import ContestStatsSidebar from "@/components/megatalent/ContestStatsSidebar";
import { LiveVoting } from "@/components/megatalent/LiveVoting";
import MegaTalentSubmissionCard from "@/components/megatalent/MegaTalentSubmissionCard";
import MegaTalentFeedFilters, { type FeedFilter } from "@/components/megatalent/MegaTalentFeedFilters";
import MegaTalentLatestFeed from "@/components/megatalent/MegaTalentLatestFeed";
import { MegaTalentOnboarding } from "@/components/megatalent/MegaTalentOnboarding";
import MegatalentLoadingSkeleton from "@/components/megatalent/MegatalentLoadingSkeleton";
import MegatalentEngagementRow from "@/components/megatalent/MegatalentEngagementRow";
import MegatalentAIToolsGrid from "@/components/megatalent/MegatalentAIToolsGrid";
import MegatalentToolView from "@/components/megatalent/MegatalentToolView";
import MegatalentCommentDialog from "@/components/megatalent/MegatalentCommentDialog";
import MegatalentShareSheet from "@/components/megatalent/MegatalentShareSheet";
import MegatalentExpandedMediaDialog from "@/components/megatalent/MegatalentExpandedMediaDialog";
import MegatalentCopyrightCard from "@/components/megatalent/MegatalentCopyrightCard";
import MegatalentSubscriptionManagement from "@/components/megatalent/MegatalentSubscriptionManagement";
import { categoryGroups } from "@/components/megatalent/megatalentConstants";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";

type ActiveView = string | null;

const Megatalent = () => {
  const navigate = useNavigate();
  const { spend } = useSpendCredits();

  const [activeView, setActiveView] = useState<ActiveView>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'premium' | 'top_premium' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("drawing");
  const [loading, setLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [likedSubmissions, setLikedSubmissions] = useState<Set<string>>(new Set());
  const [commentDialogOpen, setCommentDialogOpen] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deletingSubmission, setDeletingSubmission] = useState<string | null>(null);
  const [expandedMedia, setExpandedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("hot");
  const [shareSheetSubmission, setShareSheetSubmission] = useState<any>(null);

  useEffect(() => {
    checkSubscription();
    fetchUserVotes();
    getCurrentUser();
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [selectedCategory]);

  // loading clears in checkSubscription's finally block

  useEffect(() => {
    if (isSubscribed) { fetchTotalVotes(); }
  }, [isSubscribed, submissions]);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (roleData) {
        setIsSubscribed(true);
        setSubscriptionTier('top_premium');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from('megatalent_subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').maybeSingle();
      if (error) throw error;
      setIsSubscribed(!!data);
      setSubscriptionTier(data?.tier || null);
    } catch (error) { console.error('Error checking subscription:', error); } finally { setLoading(false); }
  };

  const fetchTotalVotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('talent_submissions').select('votes_count').eq('user_id', user.id).eq('is_active', true);
      if (error) throw error;
      const total = data?.reduce((sum, s) => sum + (s.votes_count || 0), 0) || 0;
      setTotalVotes(total);
    } catch (error) { console.error('Error fetching total votes:', error); }
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    } catch (error) { console.error('Error getting current user:', error); }
  };

  const fetchSubmissions = async () => {
    setFeedLoading(true);
    try {
      let submissionsData: any[] | null = null;
      let error: any = null;
      if (feedFilter === "hot") {
        const res = await (supabase as any).rpc("mt_feed_hot", { _category: selectedCategory, _limit: 10 });
        submissionsData = res.data; error = res.error;
      } else {
        const orderCol = feedFilter === "top" ? "votes_count" : "created_at";
        const res = await supabase.from('talent_submissions').select('*')
          .eq('category', selectedCategory as any).eq('is_active', true)
          .order(orderCol as any, { ascending: false }).limit(10);
        submissionsData = res.data as any; error = res.error;
      }
      if (error) throw error;
      if (submissionsData && submissionsData.length > 0) {
        const userIds = [...new Set(submissionsData.map(s => s.user_id))];
        const { data: profilesData } = await (supabase as any).from('profiles_public').select('id, full_name, avatar_url').in('id', userIds);
        const { data: subsData } = await supabase.from('megatalent_subscriptions').select('user_id, tier').in('user_id', userIds).eq('status', 'active');
        const userTiers: Record<string, string> = {};
        subsData?.forEach(sub => { userTiers[sub.user_id] = sub.tier; });
        const submissionIds = submissionsData.map(s => s.id);
        const { data: commentsData } = await supabase.from('talent_comments').select('submission_id').in('submission_id', submissionIds);
        const counts: Record<string, number> = {};
        commentsData?.forEach(c => { counts[c.submission_id] = (counts[c.submission_id] || 0) + 1; });
        setCommentCounts(counts);
        setSubmissions(submissionsData.map(s => ({ ...s, profiles: profilesData?.find(p => p.id === s.user_id), subscriptionTier: userTiers[s.user_id] || null })));
      } else { setSubmissions([]); }
    } catch (error) { console.error('Error fetching submissions:', error); } finally { setFeedLoading(false); }
  };

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('megatalent-customer-portal', {
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (error) {
      console.error('portal error', error);
      toast({ title: "Error", description: "Failed to open subscription portal", variant: "destructive" });
    }
  };

  const handleCancelSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCancelingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', { body: { subscriptionType: 'megatalent' } });
      if (error) throw error;
      toast({ title: "Subscription Cancelled", description: data.message || "Subscription will end at current period" });
      await checkSubscription();
    } catch (error) { console.error('Cancellation error:', error); toast({ title: "Error", description: "Failed to cancel subscription", variant: "destructive" }); } finally { setCancelingSubscription(false); }
  };

  const fetchUserVotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('talent_votes').select('submission_id').eq('user_id', user.id);
      if (data) setLikedSubmissions(new Set(data.map(v => v.submission_id)));
    } catch (error) { console.error('Error fetching user votes:', error); }
  };

  const handleVote = async (submissionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Login Required", description: "Please log in to vote", variant: "destructive" }); return; }
      if (!isSubscribed) {
        toast({ title: "Megatalent Premium required", description: "Activate Premium (10 €/month) to vote in the contest.", variant: "destructive" });
        return;
      }
      const isLiked = likedSubmissions.has(submissionId);
      if (isLiked) {
        await supabase.from('talent_votes').delete().eq('submission_id', submissionId).eq('user_id', user.id);
        setLikedSubmissions(prev => { const s = new Set(prev); s.delete(submissionId); return s; });
        setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, votes_count: (s.votes_count || 0) - 1 } : s));
      } else {
        await supabase.from('talent_votes').insert({ submission_id: submissionId, user_id: user.id });
        await (supabase as any).rpc('mt_bump_voting_streak', { _user_id: user.id });
        setLikedSubmissions(prev => new Set(prev).add(submissionId));
        setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, votes_count: (s.votes_count || 0) + 1 } : s));
      }
    } catch (error) { console.error('Error voting:', error); toast({ title: "Error", description: "Failed to vote", variant: "destructive" }); }
  };

  const fetchComments = async (submissionId: string) => {
    try {
      const { data: commentsData, error } = await supabase.from('talent_comments').select('*').eq('submission_id', submissionId).order('created_at', { ascending: false });
      if (error) throw error;
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: profilesData } = await (supabase as any).from('profiles_public').select('id, full_name, avatar_url').in('id', userIds);
        setComments(prev => ({ ...prev, [submissionId]: commentsData.map(c => ({ ...c, profiles: profilesData?.find(p => p.id === c.user_id) })) }));
      } else { setComments(prev => ({ ...prev, [submissionId]: [] })); }
    } catch (error) { console.error('Error fetching comments:', error); }
  };

  const handleComment = async (submissionId: string) => {
    if (!commentText.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
      if (!isSubscribed) {
        toast({ title: "Megatalent Premium required", description: "Activate Premium (10 €/month) to comment.", variant: "destructive" });
        return;
      }
      const { error } = await supabase.from('talent_comments').insert({ submission_id: submissionId, user_id: user.id, comment_text: commentText.trim() });
      if (error) throw error;
      setCommentText("");
      await fetchComments(submissionId);
      setCommentCounts(prev => ({ ...prev, [submissionId]: (prev[submissionId] || 0) + 1 }));
      toast({ title: "Comment added" });
    } catch (error) { console.error('Error adding comment:', error); toast({ title: "Error", description: "Failed to add comment", variant: "destructive" }); }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission || submission.user_id !== user.id) return;
      if (!window.confirm('Are you sure you want to delete this post?')) return;
      setDeletingSubmission(submissionId);
      const { error } = await supabase.from('talent_submissions').update({ is_active: false }).eq('id', submissionId).eq('user_id', user.id);
      if (error) throw error;
      toast({ title: "Post deleted" });
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
    } catch (error) { console.error('Error deleting submission:', error); toast({ title: "Error", variant: "destructive" }); } finally { setDeletingSubmission(null); }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (!isSubscribed) {
      toast({ title: "Megatalent Premium required", description: "Activate Premium (10 €/month) to upload to the contest.", variant: "destructive" });
      return;
    }
    const isImage = type === 'image';
    const validMime = isImage ? file.type.startsWith('image/') : file.type.startsWith('video/');
    if (!validMime) { toast({ title: "Invalid file", description: `Please select a ${isImage ? 'photo' : 'video'} file`, variant: "destructive" }); return; }
    const maxBytes = isImage ? 10 * 1024 * 1024 : 200 * 1024 * 1024;
    if (file.size > maxBytes) { toast({ title: "File too large", description: `Max ${isImage ? '10MB' : '200MB'}`, variant: "destructive" }); return; }
    setUploading(true);
    try {
      const fileExt = (file.name.split('.').pop() || (isImage ? 'jpg' : 'mp4')).toLowerCase();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const bucket = isImage ? 'media' : 'videos';
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      setUploadedFile({ url: publicUrl, type });
      toast({ title: "Uploaded!", description: `${isImage ? 'Photo' : 'Video'} uploaded successfully` });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", description: error?.message || "Please try again", variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast({ title: "Error", description: "Title is required", variant: "destructive" }); return; }
    if (!description.trim()) { toast({ title: "Error", description: "Description is required", variant: "destructive" }); return; }
    if (!uploadedFile) { toast({ title: "Error", description: "Please upload media first", variant: "destructive" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (!isSubscribed) {
      toast({ title: "Megatalent Premium required", description: "Activate Premium (10 €/month) to publish your submission.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const paid = await spend("megatalent_upload", { description: `upload:${selectedCategory}` });
      if (!paid) { setSubmitting(false); return; }
      const { error } = await supabase.from('talent_submissions').insert({ user_id: user.id, title: title.trim(), description: description.trim(), category: selectedCategory as any, media_url: uploadedFile.url, media_type: uploadedFile.type });
      if (error) throw error;
      toast({ title: "Published!", description: "Your submission is now live" });
      setTitle(""); setDescription(""); setUploadedFile(null);
      fetchSubmissions();
    } catch (error) { console.error('Submit error:', error); toast({ title: "Error", description: "Failed to publish", variant: "destructive" }); } finally { setSubmitting(false); }
  };

  if (loading) return <MegatalentLoadingSkeleton />;

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (feedFilter === "top") return (b.votes_count || 0) - (a.votes_count || 0);
    if (feedFilter === "new") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    // hot: Reddit-style score = (votes - dislikes) / (age_hours + 2)^1.5
    const hot = (s: any) => {
      const ageH = Math.max(0, (Date.now() - new Date(s.created_at).getTime()) / 3_600_000);
      const score = (s.votes_count || 0) - (s.dislikes_count || 0) * 0.5;
      return score / Math.pow(ageH + 2, 1.5);
    };
    return hot(b) - hot(a);
  });

  if (activeView) {
    return <MegatalentToolView activeView={activeView} onBack={() => setActiveView(null)} />;
  }

  return (
    <>
      <SEO
        title="Megatalent - Talent contest with real prizes"
        description="Show your talent, get votes and win cash prizes. Join Megatalent — Unique's global talent competition with weekly winners."
        canonical="/megatalent"
      />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <MegaTalentOnboarding />
        <div className="container mx-auto px-4 max-w-6xl">
          <NextVotingCountdown />

          <div className="flex justify-end mb-2">
            <MegatalentNotificationBell />
          </div>

          <MegaTalentHero totalVotes={totalVotes} isSubscribed={isSubscribed} subscriptionTier={subscriptionTier} />

          <div className="flex justify-center -mt-2">
            <LiveSocialProof
              channelKey="hub:megatalent"
              recentActions={[
                "Someone just voted ⭐",
                "New talent uploaded a clip 🎤",
                "A creator earned €5 in prizes 💰",
                "100+ votes cast in the last hour 🔥",
              ]}
            />
          </div>

          <HeroRewardedAd sectionKey="page_megatalent" />

          <MegatalentEngagementRow totalVotes={totalVotes} subscriptionTier={subscriptionTier} />

          <MegatalentAIToolsGrid onSelect={setActiveView} />

          <MegaTalentCategoryGrid />

          <section className="my-8 space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
                  Top features
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Earn XP, win recognition, and invite friends — all from one place.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/megatalent/${selectedCategory}`)} className="gap-1">
                See category <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MegatalentStories />
              <MegatalentSponsorShowcase category={selectedCategory} />
              <MegatalentClipOfDay category={selectedCategory} />
              <MegatalentTalentShop userId={currentUserId} />
              <MegatalentVotingStreak userId={currentUserId} />
              <MegatalentAchievements userId={currentUserId} />
            </div>

            <ReferralProgram />
            <BattleRoyalePayouts userId={currentUserId} />
            <UnifiedXPLeaderboard hub="megatalent" />
          </section>

          <MegaTalentGuide />

          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="feed">Contest Feed</TabsTrigger>
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="referral">Referral Program</TabsTrigger>
            </TabsList>

            <TabsContent value="latest" className="mt-0">
              <MegaTalentLatestFeed categoryGroups={categoryGroups} />
            </TabsContent>

            <TabsContent value="feed" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 order-2 lg:order-1">
                  <Card className="sticky top-24 backdrop-blur-xl bg-card/80 border-yellow-500/10">
                    <CardHeader>
                      {(subscriptionTier === 'premium' || subscriptionTier === 'top_premium') && (
                        <div className={`p-4 rounded-lg border ${subscriptionTier === 'top_premium' ? 'bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-yellow-500/10 border-yellow-500/30' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Your Votes</span>
                              <VoteBoostTooltip isTopPremium={subscriptionTier === 'top_premium'} />
                            </div>
                            <AnimatedVoteCounter targetValue={totalVotes} bonusVotes={0} isTopPremium={subscriptionTier === 'top_premium'} />
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Select Category</p>
                        <Badge variant="outline" className="text-sm border-yellow-500/20">
                          {categoryGroups.flatMap(g => g.categories).find(c => c.value === selectedCategory)?.label || "Select category"}
                        </Badge>
                      </div>
                      <ScrollArea className="h-[300px] rounded-md border border-border/20 p-3">
                        <Accordion type="single" collapsible className="w-full">
                          {categoryGroups.map((group, idx) => (
                            <AccordionItem key={idx} value={`group-${idx}`}>
                              <AccordionTrigger className="text-sm font-medium">{group.group}</AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-1">
                                  {group.categories.map(cat => (
                                    <Button key={cat.value} variant={selectedCategory === cat.value ? "default" : "ghost"} className="w-full justify-start text-sm" onClick={() => setSelectedCategory(cat.value)}>{cat.label}</Button>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </ScrollArea>
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'image')} />
                      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'video')} />
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold" onClick={() => photoInputRef.current?.click()} disabled={uploading}>
                        <Camera className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Photo"}
                      </Button>
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold" onClick={() => videoInputRef.current?.click()} disabled={uploading}>
                        <Video className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Video"}
                      </Button>
                      {uploadedFile && (
                        <div className="mt-4 rounded-lg overflow-hidden border border-yellow-500/20">
                          {uploadedFile.type === 'image' ? <img src={uploadedFile.url} alt="Uploaded" className="w-full rounded-lg" /> : <video src={uploadedFile.url} controls className="w-full rounded-lg" />}
                        </div>
                      )}
                      <Input placeholder="Title..." value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
                      <Textarea placeholder="Description..." className="min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
                      <Button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 text-white font-bold" onClick={handleSubmit} disabled={submitting || uploading}>
                        {submitting ? "Publishing..." : "Publish"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2 space-y-4 order-1 lg:order-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold">{categoryGroups.flatMap(g => g.categories).find(c => c.value === selectedCategory)?.label || "Posts"}</h2>
                  </div>
                  <MegaTalentFeedFilters active={feedFilter} onChange={setFeedFilter} />
                  {feedLoading ? (
                    <div className="space-y-4">
                      {[0, 1, 2].map((i) => (
                        <Card key={i} className="overflow-hidden backdrop-blur-xl bg-card/60 border-yellow-500/10 animate-pulse">
                          <div className="aspect-video bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-yellow-500/5" />
                          <CardContent className="p-4 space-y-3">
                            <div className="h-5 w-3/4 rounded bg-muted/60" />
                            <div className="h-3 w-full rounded bg-muted/40" />
                            <div className="h-3 w-2/3 rounded bg-muted/40" />
                            <div className="flex gap-3 pt-2">
                              <div className="h-8 w-16 rounded bg-muted/40" />
                              <div className="h-8 w-16 rounded bg-muted/40" />
                              <div className="h-8 w-16 rounded bg-muted/40" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : sortedSubmissions.length === 0 ? (
                    <Card className="p-8 text-center backdrop-blur-xl bg-card/80 border-yellow-500/10"><p className="text-muted-foreground">No posts in this category yet. Be the first!</p></Card>
                  ) : (
                    sortedSubmissions.map((submission, index) => (
                      <MegaTalentSubmissionCard key={submission.id} submission={submission} categoryLabel={categoryGroups.flatMap(g => g.categories).find(c => c.value === selectedCategory)?.label || ""} isLiked={likedSubmissions.has(submission.id)} commentCount={commentCounts[submission.id] || 0} isOwner={currentUserId === submission.user_id} isDeleting={deletingSubmission === submission.id} index={index} onVote={handleVote} onComment={(id) => { setCommentDialogOpen(id); fetchComments(id); }} onShare={(s) => setShareSheetSubmission(s)} onDelete={handleDeleteSubmission} onMediaClick={(url, type) => setExpandedMedia({ url, type })} />
                    ))
                  )}
                </div>

                <div className="lg:col-span-1 order-3">
                  <div className="sticky top-24 space-y-4">
                    <LiveVoting
                      contestants={sortedSubmissions.slice(0, 5).map(s => {
                        const total = sortedSubmissions.slice(0, 5).reduce((a, b) => a + (b.votes_count || 0), 0) || 1;
                        return {
                          id: s.id,
                          name: s.profiles?.full_name || s.title || "User",
                          votes: s.votes_count || 0,
                          percentage: Math.round(((s.votes_count || 0) / total) * 100),
                        };
                      })}
                      totalVotes={sortedSubmissions.reduce((a, b) => a + (b.votes_count || 0), 0)}
                      isVotingOpen={true}
                      onVote={handleVote}
                      userVotedFor={[...likedSubmissions][0] || null}
                    />
                    <ContestStatsSidebar subscriptionTier={subscriptionTier} totalVotes={totalVotes} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="referral" className="mt-0">
              <div className="max-w-4xl mx-auto space-y-6">
                <ReferralProgram />
                {isSubscribed && (
                  <MegatalentSubscriptionManagement
                    subscriptionTier={subscriptionTier}
                    canceling={cancelingSubscription}
                    onManage={handleManageSubscription}
                    onCancel={handleCancelSubscription}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>

          <MegatalentCommentDialog
            openId={commentDialogOpen}
            comments={comments}
            commentText={commentText}
            onCommentTextChange={setCommentText}
            onClose={() => setCommentDialogOpen(null)}
            onSubmit={handleComment}
          />

          <MegatalentShareSheet submission={shareSheetSubmission} onClose={() => setShareSheetSubmission(null)} />

          <MegatalentExpandedMediaDialog media={expandedMedia} onClose={() => setExpandedMedia(null)} />

          <MegatalentCopyrightCard />
        </div>
      </div>
    </>
  );
};

export default Megatalent;
