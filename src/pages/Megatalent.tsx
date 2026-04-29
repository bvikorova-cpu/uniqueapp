import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, MessageCircle, Share2, Upload, Video, Camera, TrendingUp, Send, Copy, Facebook, Trash2, ArrowRight, ArrowLeft, GraduationCap, ImagePlus, Award, Flame, Trophy, Star, Users, Zap, PenTool, Music, Handshake, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReferralProgram } from "@/components/megatalent/ReferralProgram";
import { MegaTalentGuide } from "@/components/megatalent/MegaTalentGuide";
import { SEO } from "@/components/SEO";
import { TopPremiumBadge } from "@/components/megatalent/TopPremiumBadge";
import { AnimatedVoteCounter } from "@/components/megatalent/AnimatedVoteCounter";
import { VoteBoostTooltip } from "@/components/megatalent/VoteBoostTooltip";
import { TalentCoachView } from "@/components/megatalent/TalentCoachView";
import { ThumbnailGeneratorView } from "@/components/megatalent/ThumbnailGeneratorView";
import { TrendAnalyzerView } from "@/components/megatalent/TrendAnalyzerView";
import { PerformanceScoreView } from "@/components/megatalent/PerformanceScoreView";
import { ViralPredictorView } from "@/components/megatalent/ViralPredictorView";
import { MusicAdvisorView } from "@/components/megatalent/MusicAdvisorView";
import { CaptionWriterView } from "@/components/megatalent/CaptionWriterView";
import { LiveLeaderboardView } from "@/components/megatalent/LiveLeaderboardView";
import { CollaborationMatcherView } from "@/components/megatalent/CollaborationMatcherView";
import { AchievementSystemView } from "@/components/megatalent/AchievementSystemView";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import MegaTalentHero from "@/components/megatalent/MegaTalentHero";
import MegaTalentCategoryGrid from "@/components/megatalent/MegaTalentCategoryGrid";
import ContestStatsSidebar from "@/components/megatalent/ContestStatsSidebar";
import MegaTalentSubmissionCard from "@/components/megatalent/MegaTalentSubmissionCard";
import MegaTalentFeedFilters, { type FeedFilter } from "@/components/megatalent/MegaTalentFeedFilters";
import { MegaTalentOnboarding } from "@/components/megatalent/MegaTalentOnboarding";
import { motion } from "framer-motion";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const categoryGroups = [
  { group: "🎨 Art & Creativity", categories: [
    { value: "drawing", label: "🎨 Drawing" }, { value: "painting", label: "🖌️ Painting" },
    { value: "digital_art", label: "💻 Digital Art" }, { value: "sculpture", label: "🗿 Sculpture / Modeling" },
    { value: "photography", label: "📸 Photography" }, { value: "handmade", label: "✂️ Handmade Crafts" },
    { value: "makeup_art", label: "💄 Makeup Art" }, { value: "tattoo", label: "⚡ Best Tattoo" },
  ]},
  { group: "🎤 Music", categories: [
    { value: "singing", label: "🎤 Singing" }, { value: "instrument", label: "🎸 Musical Instrument" },
    { value: "music_production", label: "🎧 Music Production / DJ" }, { value: "beatbox", label: "🎵 Beatbox" },
    { value: "rap", label: "🎙️ Rap / Freestyle" },
  ]},
  { group: "💃 Dance & Movement", categories: [
    { value: "dance", label: "💃 Dance" }, { value: "breakdance", label: "🕺 Breakdance" },
    { value: "gymnastics", label: "🤸 Gymnastics / Acrobatics" }, { value: "parkour", label: "🏃 Parkour / Freerunning" },
  ]},
  { group: "💪 Sports & Fitness", categories: [
    { value: "training", label: "💪 Best Training" }, { value: "yoga", label: "🧘 Yoga / Pilates" },
    { value: "martial_arts", label: "🥋 Martial Arts" }, { value: "extreme_sport", label: "🛹 Extreme Sports" },
    { value: "sport_trick", label: "⚽ Sport Tricks" },
  ]},
  { group: "😂 Entertainment", categories: [
    { value: "funny_video", label: "😂 Funniest Video" }, { value: "standup", label: "🎭 Stand-up / Comedy" },
    { value: "impressions", label: "🎪 Impressions / Parodies" }, { value: "magic", label: "🎩 Magic / Illusions" },
    { value: "pranks", label: "😜 Pranks / Hidden Camera" },
  ]},
  { group: "💡 Education", categories: [
    { value: "life_advice", label: "💡 Best Life Advice" }, { value: "tutorial", label: "📚 Tutorial / How-to" },
    { value: "cooking", label: "👨‍🍳 Cooking / Baking" }, { value: "diy", label: "🔧 DIY Projects" },
    { value: "science", label: "🔬 Science / Experiments" },
  ]},
  { group: "🌟 Other", categories: [
    { value: "best_selfie", label: "🤳 Best Selfie" }, { value: "transformation", label: "✨ Transformation (Before/After)" },
    { value: "pet_talent", label: "🐾 Pet Talent" }, { value: "other", label: "🌟 Other Talents" },
  ]},
];

// AI Tools definition
const aiTools = [
  { id: "talent_coach", name: "AI Talent Coach", icon: GraduationCap, credits: 4, description: "Personalized coaching to improve your talent", gradient: "from-yellow-500 to-amber-600" },
  { id: "thumbnail_generator", name: "AI Thumbnail Creator", icon: ImagePlus, credits: 3, description: "Eye-catching thumbnail concepts", gradient: "from-amber-500 to-orange-600" },
  { id: "trend_analyzer", name: "AI Trend Analyzer", icon: TrendingUp, credits: 3, description: "Discover trending categories & strategies", gradient: "from-yellow-600 to-yellow-800" },
  { id: "performance_score", name: "AI Performance Score", icon: Award, credits: 4, description: "Professional talent evaluation", gradient: "from-yellow-400 to-yellow-700" },
  { id: "viral_predictor", name: "AI Viral Predictor", icon: Flame, credits: 4, description: "Predict viral potential of your submission", gradient: "from-red-500 to-orange-600" },
  { id: "music_advisor", name: "AI Music Advisor", icon: Music, credits: 3, description: "Perfect music & sound for your videos", gradient: "from-violet-500 to-purple-600" },
  { id: "caption_writer", name: "AI Caption Writer", icon: PenTool, credits: 3, description: "Engaging captions & hashtags", gradient: "from-emerald-500 to-teal-600" },
  { id: "collaboration_matcher", name: "AI Collab Matcher", icon: Handshake, credits: 4, description: "Find perfect collaboration partners", gradient: "from-blue-500 to-indigo-600" },
  { id: "leaderboard", name: "Live Leaderboard", icon: BarChart3, credits: 0, description: "Real-time rankings & animations", gradient: "from-yellow-500 to-amber-500" },
  { id: "achievements", name: "Achievements", icon: Trophy, credits: 0, description: "Track milestones & unlock badges", gradient: "from-amber-500 to-yellow-600" },
];

type ActiveView = string | null;

const Megatalent = () => {
  const navigate = useNavigate();
  
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
  const [totalVotes, setTotalVotes] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
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
    fetchSubmissions();
    fetchUserVotes();
    getCurrentUser();
  }, [selectedCategory]);

  // NOTE: Stripe checkout return is handled by MegatalentGuard (parent route guard).
  // Do not duplicate the success/canceled handling here — it would race with the guard
  // and cause double activation toasts and URL param conflicts.


  useEffect(() => {
    if (isSubscribed) { fetchTotalVotes(); }
  }, [isSubscribed, submissions]);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Admins always have full access (matches MegatalentGuard behavior)
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
      setTotalVotes(total + (subscriptionTier === 'top_premium' ? 100000 : 0));
    } catch (error) { console.error('Error fetching total votes:', error); }
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    } catch (error) { console.error('Error getting current user:', error); }
  };

  const fetchSubmissions = async () => {
    try {
      const { data: submissionsData, error } = await supabase.from('talent_submissions').select('*').eq('category', selectedCategory as any).eq('is_active', true).order('created_at', { ascending: false }).limit(10);
      if (error) throw error;
      if (submissionsData && submissionsData.length > 0) {
        const userIds = [...new Set(submissionsData.map(s => s.user_id))];
        const { data: profilesData } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds);
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
    } catch (error) { console.error('Error fetching submissions:', error); }
  };

  const handleSubscribe = async (tier: 'premium' | 'top_premium') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: "Login Required", description: "Please log in first", variant: "destructive" }); return; }

      // Validate referral code locally before going to Stripe
      if (referralCode.trim()) {
        const { data: referralData } = await supabase
          .from("megatalent_referral_codes")
          .select("user_id")
          .eq("code", referralCode.trim().toUpperCase())
          .maybeSingle();
        if (!referralData) { toast({ title: "Invalid Code", description: "This referral code doesn't exist", variant: "destructive" }); return; }
        if (referralData.user_id === user.id) { toast({ title: "Error", description: "You can't use your own code", variant: "destructive" }); return; }
      }

      const { data: existingSub } = await supabase
        .from("megatalent_subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (existingSub) {
        toast({ title: "Already Subscribed", description: "Use Manage Subscription to change your plan." });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('create-megatalent-checkout', {
        body: { tier, referralCode: referralCode.trim().toUpperCase() || undefined },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      if (error) throw error;
      if (data?.url) {
        // Redirect in same tab so Stripe returns the user to /megatalent?success=true
        // and MegatalentGuard can resume the activation flow.
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to start checkout", variant: "destructive" });
    }
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
        toast({
          title: "Megatalent Premium required",
          description: "Activate Premium (10 €/month) to vote in the contest.",
          variant: "destructive",
        });
        return;
      }
      const isLiked = likedSubmissions.has(submissionId);
      if (isLiked) {
        await supabase.from('talent_votes').delete().eq('submission_id', submissionId).eq('user_id', user.id);
        setLikedSubmissions(prev => { const s = new Set(prev); s.delete(submissionId); return s; });
        setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, votes_count: (s.votes_count || 0) - 1 } : s));
      } else {
        await supabase.from('talent_votes').insert({ submission_id: submissionId, user_id: user.id });
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
        const { data: profilesData } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds);
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
        toast({
          title: "Megatalent Premium required",
          description: "Activate Premium (10 €/month) to comment.",
          variant: "destructive",
        });
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

  const copyMediaLink = async (url: string) => {
    try { await navigator.clipboard.writeText(url); toast({ title: "Link copied" }); } catch { toast({ title: "Error", variant: "destructive" }); }
  };
  const shareToFacebook = (s: any) => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(s.media_url)}`, '_blank'); };
  const shareToTwitter = (s: any) => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(s.title)}&url=${encodeURIComponent(s.media_url)}`, '_blank'); };
  const shareToWhatsApp = (s: any) => { window.open(`https://wa.me/?text=${encodeURIComponent(`${s.title} - ${s.media_url}`)}`, '_blank'); };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (!isSubscribed) {
      toast({
        title: "Megatalent Premium required",
        description: "Activate Premium (10 €/month) to upload to the contest.",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const bucket = type === 'image' ? 'media' : 'videos';
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      setUploadedFile({ url: publicUrl, type });
      toast({ title: "Uploaded!", description: `${type === 'image' ? 'Photo' : 'Video'} uploaded successfully` });
    } catch (error) { console.error('Upload error:', error); toast({ title: "Error", description: "Upload failed", variant: "destructive" }); } finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { toast({ title: "Error", description: "Title is required", variant: "destructive" }); return; }
    if (!description.trim()) { toast({ title: "Error", description: "Description is required", variant: "destructive" }); return; }
    if (!uploadedFile) { toast({ title: "Error", description: "Please upload media first", variant: "destructive" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Login Required", variant: "destructive" }); return; }
    if (!isSubscribed) {
      toast({
        title: "Megatalent Premium required",
        description: "Activate Premium (10 €/month) to publish your submission.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('talent_submissions').insert({ user_id: user.id, title: title.trim(), description: description.trim(), category: selectedCategory as any, media_url: uploadedFile.url, media_type: uploadedFile.type });
      if (error) throw error;
      toast({ title: "Published!", description: "Your submission is now live" });
      setTitle(""); setDescription(""); setUploadedFile(null);
      fetchSubmissions();
    } catch (error) { console.error('Submit error:', error); toast({ title: "Error", description: "Failed to publish", variant: "destructive" }); } finally { setSubmitting(false); }
  };

  // Render active AI tool view
  const renderToolView = () => {
    switch (activeView) {
      case "talent_coach": return <TalentCoachView />;
      case "thumbnail_generator": return <ThumbnailGeneratorView />;
      case "trend_analyzer": return <TrendAnalyzerView />;
      case "performance_score": return <PerformanceScoreView />;
      case "viral_predictor": return <ViralPredictorView />;
      case "music_advisor": return <MusicAdvisorView />;
      case "caption_writer": return <CaptionWriterView />;
      case "leaderboard": return <LiveLeaderboardView />;
      case "collaboration_matcher": return <CollaborationMatcherView />;
      case "achievements": return <AchievementSystemView />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background pt-20 pb-12 flex items-center justify-center"><p className="text-lg">Loading...</p></div>;
  }

  // Paywall screen for non-subscribers
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
          <Badge className="bg-yellow-500 text-black font-bold">🏆 Monthly Prize: €10,000</Badge>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
            Enter MegaTalent
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Showcase your talent across 30+ categories and compete for €10,000 every month!
          </p>

          <div className="p-4 bg-muted rounded-lg max-w-md mx-auto">
            <label className="text-sm font-medium mb-2 block">Referral Code (optional)</label>
            <Input type="text" placeholder="Enter referral code..." value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} maxLength={8} className="text-center tracking-wider font-mono text-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card className="bg-card border-yellow-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Premium</CardTitle>
                <div className="text-4xl font-bold text-yellow-500">10 €<span className="text-lg">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {["Access to all categories", "Chance to win €10,000", "Upload photos & videos", "Voting & commenting", "Referral program (€5/friend)"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 text-yellow-500" />{f}</div>
                ))}
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold" size="lg" onClick={() => handleSubscribe('premium')}>Activate Premium</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-yellow-500/50 relative overflow-hidden">
              <Badge className="absolute top-4 right-4 bg-yellow-500 text-black">Recommended</Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">TOP Premium</CardTitle>
                <div className="text-4xl font-bold text-yellow-400">15 €<span className="text-lg">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-semibold text-yellow-500">All Premium features +</p>
                {["50% Win chance boost", "+100,000 Automatic bonus votes", "Priority display in categories", "Exclusive TOP Premium badge"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm"><Zap className="h-4 w-4 text-yellow-400" />{f}</div>
                ))}
                <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-700 text-black font-bold" size="lg" onClick={() => handleSubscribe('top_premium')}>Activate TOP Premium</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (feedFilter === "top") return (b.votes_count || 0) - (a.votes_count || 0);
    if (feedFilter === "new") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    const scoreA = (a.votes_count || 0) + (new Date(a.created_at).getTime() / 1e10);
    const scoreB = (b.votes_count || 0) + (new Date(b.created_at).getTime() / 1e10);
    return scoreB - scoreA;
  });

  // If an AI tool is active, show it
  if (activeView) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" onClick={() => setActiveView(null)} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to MegaTalent
          </Button>
          {renderToolView()}
        </div>
      </div>
    );
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
        {/* Cinematic Video Hero */}
        <MegaTalentHero totalVotes={totalVotes} isSubscribed={isSubscribed} subscriptionTier={subscriptionTier} />


        <HeroRewardedAd sectionKey="page_megatalent" />

        {/* 3-Column Engagement Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Flame, label: "Contest Streak", value: "Active", sub: "Monthly competition running", color: "text-orange-500" },
            { icon: Trophy, label: "Your Rank", value: `${totalVotes.toLocaleString()} votes`, sub: `${subscriptionTier === 'top_premium' ? 'TOP Premium' : 'Premium'} tier`, color: "text-yellow-500" },
            { icon: Star, label: "Categories", value: "30+", sub: "Talent categories available", color: "text-amber-500" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/10 hover:border-yellow-500/30 transition-all">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-bold text-sm">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* AI Tools Grid */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black mb-4 bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">AI Power Tools</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {aiTools.map((tool, i) => (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="cursor-pointer group hover:shadow-lg hover:shadow-yellow-500/10 hover:border-yellow-500/30 transition-all active:scale-[0.97] bg-card/80 backdrop-blur-xl border-border/30" onClick={() => setActiveView(tool.id)}>
                  <CardContent className="p-3 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-bold text-xs mb-1">{tool.name}</h3>
                    <p className="text-[9px] text-muted-foreground mb-1.5 line-clamp-2">{tool.description}</p>
                    <Badge variant="outline" className="text-[9px] border-yellow-500/30 text-yellow-500">{tool.credits > 0 ? `${tool.credits} CR` : "Free"}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Category Grid */}
        <MegaTalentCategoryGrid />

        <MegaTalentGuide />

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="feed">Contest Feed</TabsTrigger>
            <TabsTrigger value="referral">Referral Program</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Upload Section */}
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
                          <AnimatedVoteCounter targetValue={totalVotes} bonusVotes={subscriptionTier === 'top_premium' ? 100000 : 0} isTopPremium={subscriptionTier === 'top_premium'} />
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

              {/* Feed */}
              <div className="lg:col-span-2 space-y-4 order-1 lg:order-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold">{categoryGroups.flatMap(g => g.categories).find(c => c.value === selectedCategory)?.label || "Posts"}</h2>
                </div>
                <MegaTalentFeedFilters active={feedFilter} onChange={setFeedFilter} />
                {sortedSubmissions.length === 0 ? (
                  <Card className="p-8 text-center backdrop-blur-xl bg-card/80 border-yellow-500/10"><p className="text-muted-foreground">No posts in this category yet. Be the first!</p></Card>
                ) : (
                  sortedSubmissions.map((submission, index) => (
                    <MegaTalentSubmissionCard key={submission.id} submission={submission} categoryLabel={categoryGroups.flatMap(g => g.categories).find(c => c.value === selectedCategory)?.label || ""} isLiked={likedSubmissions.has(submission.id)} commentCount={commentCounts[submission.id] || 0} isOwner={currentUserId === submission.user_id} isDeleting={deletingSubmission === submission.id} index={index} onVote={handleVote} onComment={(id) => { setCommentDialogOpen(id); fetchComments(id); }} onShare={(s) => setShareSheetSubmission(s)} onDelete={handleDeleteSubmission} onMediaClick={(url, type) => setExpandedMedia({ url, type })} />
                  ))
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 order-3">
                <div className="sticky top-24"><ContestStatsSidebar subscriptionTier={subscriptionTier} totalVotes={totalVotes} /></div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="referral" className="mt-0">
            <div className="max-w-4xl mx-auto space-y-6">
              <ReferralProgram />
              {isSubscribed && (
                <Card className="border-yellow-500/10">
                  <CardHeader><CardTitle className="text-xl">Subscription Management</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/10">
                      <div><p className="font-medium">Current Subscription</p><p className="text-sm text-muted-foreground capitalize">{subscriptionTier === 'top_premium' ? 'Top Premium' : 'Premium'}</p></div>
                      <Badge className="bg-yellow-500 text-black">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50">If you cancel your subscription, it will remain active until the end of the paid period. The paid amount is non-refundable.</p>
                    <Button variant="default" className="w-full" onClick={handleManageSubscription}>
                      Manage Subscription (Stripe Portal)
                    </Button>
                    <Button variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive/10" onClick={handleCancelSubscription} disabled={cancelingSubscription}>
                      {cancelingSubscription ? 'Canceling...' : 'Cancel Subscription'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Comment Dialog */}
        <Dialog open={!!commentDialogOpen} onOpenChange={(open) => { if (!open) setCommentDialogOpen(null); }}>
          <DialogContent className="max-w-lg max-h-[80vh]">
            <DialogHeader><DialogTitle>Comments</DialogTitle></DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              {commentDialogOpen && comments[commentDialogOpen]?.length > 0 ? (
                <div className="space-y-4">
                  {comments[commentDialogOpen].map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-black text-sm font-semibold shrink-0">{comment.profiles?.full_name?.[0] || 'U'}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{comment.profiles?.full_name || 'User'}</p>
                        <p className="text-sm text-muted-foreground mt-1">{comment.comment_text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(comment.created_at).toLocaleDateString('en-US')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No comments yet</p>
              )}
            </ScrollArea>
            <div className="flex gap-2 mt-4">
              <Input placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey && commentDialogOpen) { e.preventDefault(); handleComment(commentDialogOpen); } }} />
              <Button size="sm" className="bg-yellow-500 text-black" onClick={() => commentDialogOpen && handleComment(commentDialogOpen)}><Send className="h-4 w-4" /></Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Sheet */}
        <Sheet open={!!shareSheetSubmission} onOpenChange={(open) => { if (!open) setShareSheetSubmission(null); }}>
          <SheetContent>
            <SheetHeader><SheetTitle>Share</SheetTitle></SheetHeader>
            {shareSheetSubmission && (
              <div className="space-y-4 mt-6">
                <Button variant="outline" className="w-full justify-start" onClick={() => copyMediaLink(shareSheetSubmission.media_url)}><Copy className="h-4 w-4 mr-2" /> Copy media link</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => shareToFacebook(shareSheetSubmission)}><Facebook className="h-4 w-4 mr-2" /> Share on Facebook</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => shareToTwitter(shareSheetSubmission)}>Share on X (Twitter)</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => shareToWhatsApp(shareSheetSubmission)}>Share via WhatsApp</Button>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Expanded Media */}
        <Dialog open={!!expandedMedia} onOpenChange={() => setExpandedMedia(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0">
            <div className="relative flex items-center justify-center bg-black/95">
              {expandedMedia?.type === 'image' ? <img src={expandedMedia.url} alt="Expanded" className="max-w-full max-h-[95vh] object-contain" /> : expandedMedia?.type === 'video' ? <video src={expandedMedia.url} controls autoPlay className="max-w-full max-h-[95vh]" /> : null}
            </div>
          </DialogContent>
        </Dialog>

        {/* Copyright */}
        <Card className="mt-12 border-yellow-500/10 backdrop-blur-xl bg-card/80">
          <CardHeader><CardTitle className="text-xl">⚖️ Copyright Protection</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Important information for all MegaTalent contest participants:</p>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">📸 Rights to Uploaded Content:</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>By uploading a post, you confirm that you are the author or have the right to publish the content</li>
                <li>You must not upload others' photos, videos, or other protected content without permission</li>
                <li>The author of the post bears full responsibility for uploading others' content</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">🛡️ Our Responsibilities:</h3>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>The MegaTalent platform serves only as a space for publishing content</li>
                <li>The platform operator is not responsible for content uploaded by users</li>
                <li>In case of copyright infringement, the content will be immediately removed</li>
                <li>We reserve the right to block users who violate the rules</li>
              </ul>
            </div>
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive font-medium">🚨 Upload only your own original content. Copyright infringement may disqualify you from the contest and expose you to legal consequences.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default Megatalent;
