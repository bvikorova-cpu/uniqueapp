import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, MessageCircle, Share2, Upload, Video, Camera, TrendingUp, Send, Copy, Facebook, Trash2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReferralProgram } from "@/components/megatalent/ReferralProgram";
import { MegaTalentGuide } from "@/components/megatalent/MegaTalentGuide";
import { TopPremiumBadge } from "@/components/megatalent/TopPremiumBadge";
import { AnimatedVoteCounter } from "@/components/megatalent/AnimatedVoteCounter";
import { VoteBoostTooltip } from "@/components/megatalent/VoteBoostTooltip";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { triggerTopPremiumConfetti } from "@/utils/confetti";
import MegaTalentHero from "@/components/megatalent/MegaTalentHero";
import MegaTalentCategoryGrid from "@/components/megatalent/MegaTalentCategoryGrid";
import ContestStatsSidebar from "@/components/megatalent/ContestStatsSidebar";
import MegaTalentSubmissionCard from "@/components/megatalent/MegaTalentSubmissionCard";
import MegaTalentFeedFilters, { type FeedFilter } from "@/components/megatalent/MegaTalentFeedFilters";

const categoryGroups = [
  {
    group: "🎨 Art & Creativity",
    categories: [
      { value: "drawing", label: "🎨 Drawing" },
      { value: "painting", label: "🖌️ Painting" },
      { value: "digital_art", label: "💻 Digital Art" },
      { value: "sculpture", label: "🗿 Sculpture / Modeling" },
      { value: "photography", label: "📸 Photography" },
      { value: "handmade", label: "✂️ Handmade Crafts" },
      { value: "makeup_art", label: "💄 Makeup Art" },
      { value: "tattoo", label: "⚡ Best Tattoo" },
    ]
  },
  {
    group: "🎤 Music",
    categories: [
      { value: "singing", label: "🎤 Singing" },
      { value: "instrument", label: "🎸 Musical Instrument" },
      { value: "music_production", label: "🎧 Music Production / DJ" },
      { value: "beatbox", label: "🎵 Beatbox" },
      { value: "rap", label: "🎙️ Rap / Freestyle" },
    ]
  },
  {
    group: "💃 Dance & Movement",
    categories: [
      { value: "dance", label: "💃 Dance" },
      { value: "breakdance", label: "🕺 Breakdance" },
      { value: "gymnastics", label: "🤸 Gymnastics / Acrobatics" },
      { value: "parkour", label: "🏃 Parkour / Freerunning" },
    ]
  },
  {
    group: "💪 Sports & Fitness",
    categories: [
      { value: "training", label: "💪 Best Training" },
      { value: "yoga", label: "🧘 Yoga / Pilates" },
      { value: "martial_arts", label: "🥋 Martial Arts" },
      { value: "extreme_sport", label: "🛹 Extreme Sports" },
      { value: "sport_trick", label: "⚽ Sport Tricks" },
    ]
  },
  {
    group: "😂 Entertainment",
    categories: [
      { value: "funny_video", label: "😂 Funniest Video" },
      { value: "standup", label: "🎭 Stand-up / Comedy" },
      { value: "impressions", label: "🎪 Impressions / Parodies" },
      { value: "magic", label: "🎩 Magic / Illusions" },
      { value: "pranks", label: "😜 Pranks / Hidden Camera" },
    ]
  },
  {
    group: "💡 Education",
    categories: [
      { value: "life_advice", label: "💡 Best Life Advice" },
      { value: "tutorial", label: "📚 Tutorial / How-to" },
      { value: "cooking", label: "👨‍🍳 Cooking / Baking" },
      { value: "diy", label: "🔧 DIY Projects" },
      { value: "science", label: "🔬 Science / Experiments" },
    ]
  },
  {
    group: "🌟 Other",
    categories: [
      { value: "best_selfie", label: "🤳 Best Selfie" },
      { value: "transformation", label: "✨ Transformation (Before/After)" },
      { value: "pet_talent", label: "🐾 Pet Talent" },
      { value: "other", label: "🌟 Other Talents" },
    ]
  },
];

const Megatalent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (isSubscribed) {
      fetchTotalVotes();
    }
  }, [isSubscribed, submissions]);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('megatalent_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setIsSubscribed(!!data);
      setSubscriptionTier(data?.tier || null);
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalVotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('talent_submissions')
        .select('votes_count')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const total = data?.reduce((sum, submission) => sum + (submission.votes_count || 0), 0) || 0;
      
      // Add bonus 100,000 votes for TOP Premium users
      const bonusVotes = subscriptionTier === 'top_premium' ? 100000 : 0;
      setTotalVotes(total + bonusVotes);
    } catch (error) {
      console.error('Error fetching total votes:', error);
    }
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('talent_submissions')
        .select('*')
        .eq('category', selectedCategory as any)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (submissionsError) throw submissionsError;

      // Fetch profiles separately
      if (submissionsData && submissionsData.length > 0) {
        const userIds = [...new Set(submissionsData.map(s => s.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        // Fetch subscription tiers for all users to show TOP Premium badge
        const { data: subscriptionsData } = await supabase
          .from('megatalent_subscriptions')
          .select('user_id, tier')
          .in('user_id', userIds)
          .eq('status', 'active');

        // Create a map of user_id to tier
        const userTiers: Record<string, string> = {};
        subscriptionsData?.forEach(sub => {
          userTiers[sub.user_id] = sub.tier;
        });

        // Fetch comment counts for all submissions
        const submissionIds = submissionsData.map(s => s.id);
        const { data: commentsData } = await supabase
          .from('talent_comments')
          .select('submission_id')
          .in('submission_id', submissionIds);

        // Count comments per submission
        const counts: Record<string, number> = {};
        commentsData?.forEach(comment => {
          counts[comment.submission_id] = (counts[comment.submission_id] || 0) + 1;
        });
        setCommentCounts(counts);

        // Merge profiles and subscription tier with submissions
        const enrichedSubmissions = submissionsData.map(submission => ({
          ...submission,
          profiles: profilesData?.find(p => p.id === submission.user_id),
          subscriptionTier: userTiers[submission.user_id] || null
        }));

        setSubmissions(enrichedSubmissions);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubscribe = async (tier: 'premium' | 'top_premium') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('megatalent.login_required'),
          description: t('megatalent.login_required_desc'),
          variant: "destructive",
        });
        return;
      }

      // Check if user already has or had any subscription (active, expired, or cancelled)
      const { data: existingSub } = await supabase
        .from("megatalent_subscriptions")
        .select("id, status")
        .eq("user_id", user.id)
        .maybeSingle();

      // Validate and get referrer if referral code is provided
      let referrerId = null;
      if (referralCode.trim()) {
        // Only new users can use referral codes
        if (existingSub) {
          toast({
            title: t('megatalent.code_invalid'),
            description: t('megatalent.code_invalid_desc'),
            variant: "destructive",
          });
          return;
        }

        const { data: referralData } = await supabase
          .from("megatalent_referral_codes")
          .select("user_id")
          .eq("code", referralCode.trim().toUpperCase())
          .maybeSingle();

        if (!referralData) {
          toast({
            title: t('megatalent.invalid_code'),
            description: t('megatalent.invalid_code_desc'),
            variant: "destructive",
          });
          return;
        }

        if (referralData.user_id === user.id) {
          toast({
            title: t('megatalent.error'),
            description: t('megatalent.own_code_error'),
            variant: "destructive",
          });
          return;
        }

        referrerId = referralData.user_id;
      } else if (existingSub && existingSub.status === 'active') {
        // User already has active subscription, just inform them
        toast({
          title: t('megatalent.already_subscribed'),
          description: t('megatalent.already_subscribed_desc'),
          variant: "destructive",
        });
        return;
      }

      const price = tier === 'premium' ? 10 : 15;
      const bonusVotes = tier === 'top_premium' ? 100000 : 0;
      const winChanceBoost = tier === 'top_premium' ? 50 : 0;

      const { error } = await supabase
        .from('megatalent_subscriptions')
        .insert({
          user_id: user.id,
          tier,
          price,
          bonus_votes: bonusVotes,
          win_chance_boost: winChanceBoost,
          status: 'active',
          referred_by: referrerId,
        });

      if (error) throw error;

      toast({
        title: t('megatalent.successfully_activated'),
        description: tier === 'premium' ? t('megatalent.premium_activated') : t('megatalent.top_premium_activated'),
      });

      // Trigger gold confetti for TOP Premium purchase
      if (tier === 'top_premium') {
        triggerTopPremiumConfetti();
      }

      setIsSubscribed(true);
      setSubscriptionTier(tier);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.activation_error'),
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCancelingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionType: 'megatalent' }
      });

      if (error) throw error;

      toast({
        title: t('megatalent.subscription_cancelled'),
        description: data.message || t('megatalent.subscription_cancelled_desc'),
      });

      await checkSubscription();
    } catch (error) {
      console.error('Cancellation error:', error);
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.cancel_error'),
        variant: "destructive",
      });
    } finally {
      setCancelingSubscription(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('talent_votes')
        .select('submission_id')
        .eq('user_id', user.id);

      if (data) {
        setLikedSubmissions(new Set(data.map(v => v.submission_id)));
      }
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVote = async (submissionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('megatalent.login_required'),
          description: t('megatalent.login_required_desc'),
          variant: "destructive",
        });
        return;
      }

      const isLiked = likedSubmissions.has(submissionId);

      if (isLiked) {
        // Remove vote
        const { error } = await supabase
          .from('talent_votes')
          .delete()
          .eq('submission_id', submissionId)
          .eq('user_id', user.id);

        if (error) throw error;

        setLikedSubmissions(prev => {
          const newSet = new Set(prev);
          newSet.delete(submissionId);
          return newSet;
        });

        // Update local submission votes count
        setSubmissions(prev => prev.map(s => 
          s.id === submissionId 
            ? { ...s, votes_count: (s.votes_count || 0) - 1 }
            : s
        ));
      } else {
        // Add vote
        const { error } = await supabase
          .from('talent_votes')
          .insert({
            submission_id: submissionId,
            user_id: user.id,
          });

        if (error) throw error;

        setLikedSubmissions(prev => new Set(prev).add(submissionId));

        // Update local submission votes count
        setSubmissions(prev => prev.map(s => 
          s.id === submissionId 
            ? { ...s, votes_count: (s.votes_count || 0) + 1 }
            : s
        ));
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: t('megatalent.error'),
        description: 'Failed to vote',
        variant: "destructive",
      });
    }
  };

  const fetchComments = async (submissionId: string) => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('talent_comments')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Fetch profiles separately
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        // Merge profiles with comments
        const enrichedComments = commentsData.map(comment => ({
          ...comment,
          profiles: profilesData?.find(p => p.id === comment.user_id)
        }));

        setComments(prev => ({ ...prev, [submissionId]: enrichedComments }));
      } else {
        setComments(prev => ({ ...prev, [submissionId]: [] }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleComment = async (submissionId: string) => {
    if (!commentText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('megatalent.login_required'),
          description: t('megatalent.login_required_desc'),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('talent_comments')
        .insert({
          submission_id: submissionId,
          user_id: user.id,
          comment_text: commentText.trim(),
        });

      if (error) throw error;

      setCommentText("");
      await fetchComments(submissionId);
      
      // Update comment count
      setCommentCounts(prev => ({
        ...prev,
        [submissionId]: (prev[submissionId] || 0) + 1
      }));
      
      toast({
        title: 'Comment added',
        description: 'Your comment was successfully added',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: t('megatalent.error'),
        description: 'Failed to add comment',
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('megatalent.login_required'),
          description: t('megatalent.login_required_desc'),
          variant: "destructive",
        });
        return;
      }

      // Get submission to check ownership
      const submission = submissions.find(s => s.id === submissionId);
      if (!submission || submission.user_id !== user.id) {
        toast({
          title: 'Error',
          description: 'You cannot delete this post',
          variant: "destructive",
        });
        return;
      }

      // Confirm deletion
      if (!window.confirm('Are you sure you want to delete this post?')) {
        return;
      }

      setDeletingSubmission(submissionId);

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('talent_submissions')
        .update({ is_active: false })
        .eq('id', submissionId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Post deleted',
        description: 'Your post was successfully deleted',
      });

      // Remove from local state
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: t('megatalent.error'),
        description: 'Failed to delete post',
        variant: "destructive",
      });
    } finally {
      setDeletingSubmission(null);
    }
  };

  const copyMediaLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied',
        description: 'Media link was copied to clipboard',
      });
    } catch (error) {
      toast({
        title: t('megatalent.error'),
        description: 'Nepodarilo sa skopírovať link',
        variant: "destructive",
      });
    }
  };

  const shareToFacebook = (submission: any) => {
    const url = encodeURIComponent(submission.media_url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareToTwitter = (submission: any) => {
    const text = encodeURIComponent(submission.title);
    const url = encodeURIComponent(submission.media_url);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareToWhatsApp = (submission: any) => {
    const text = encodeURIComponent(`${submission.title} - ${submission.media_url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: t('megatalent.login_required'),
        description: t('megatalent.upload_required_login'),
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const bucket = type === 'image' ? 'media' : 'videos';

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setUploadedFile({ url: publicUrl, type });
      
      toast({
        title: t('megatalent.successfully_uploaded'),
        description: type === 'image' ? t('megatalent.photo_uploaded') : t('megatalent.video_uploaded'),
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.upload_error'),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.title_required'),
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.description_required'),
        variant: "destructive",
      });
      return;
    }

    if (!uploadedFile) {
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.media_required'),
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: t('megatalent.login_required'),
        description: t('megatalent.publish_required_login'),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('talent_submissions')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category: selectedCategory as any,
          media_url: uploadedFile.url,
          media_type: uploadedFile.type,
        });

      if (error) throw error;

      toast({
        title: t('megatalent.successfully_published'),
        description: t('megatalent.submission_added'),
      });

      // Reset form
      setTitle("");
      setDescription("");
      setUploadedFile(null);
      
      // Refresh submissions
      fetchSubmissions();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: t('megatalent.error'),
        description: t('megatalent.publish_error'),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 flex items-center justify-center">
        <p className="text-lg">{t('megatalent.loading')}</p>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gold text-gold-foreground animate-glow">
                {t('megatalent.monthly_prize')}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                {t('megatalent.enter_megatalent')}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('megatalent.subtitle')}
              </p>
            </div>

            <div className="mb-8 max-w-2xl mx-auto">
              <div className="p-4 bg-muted rounded-lg">
                <label className="text-sm font-medium mb-2 block">
                  {t('megatalent.referral_title')}
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('megatalent.referral_description')}
                </p>
                <Input
                  type="text"
                  placeholder={t('megatalent.referral_placeholder')}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="text-center tracking-wider font-mono text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Premium Tier */}
              <Card className="bg-gradient-secondary border-border/50">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{t('megatalent.premium_title')}</CardTitle>
                  <div className="text-4xl font-bold text-gold">10 €<span className="text-lg">{t('megatalent.price_month')}</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.access_contest')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.chance_win')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.upload_media')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.voting_comments')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.referral_5')}</span>
                    </div>
                  </div>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    onClick={() => handleSubscribe('premium')}
                  >
                    {t('megatalent.activate_premium')}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {t('megatalent.monthly_renews')}
                  </p>
                </CardContent>
              </Card>

              {/* TOP Premium Tier */}
              <Card className="bg-gradient-primary border-gold/50 relative overflow-hidden">
                <Badge className="absolute top-4 right-4 bg-gold text-gold-foreground">
                  {t('megatalent.recommended')}
                </Badge>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{t('megatalent.top_premium_title')}</CardTitle>
                  <div className="text-4xl font-bold text-gold">15 €<span className="text-lg">{t('megatalent.price_month')}</span></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gold">{t('megatalent.all_from_premium')}</p>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.boost_win')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.auto_votes')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.priority_display')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{t('megatalent.exclusive_badge_item')}</span>
                    </div>
                  </div>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full bg-gold hover:bg-gold/90"
                    onClick={() => handleSubscribe('top_premium')}
                  >
                    {t('megatalent.activate_top_premium')}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {t('megatalent.monthly_renews')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <MegaTalentGuide />
        
        {/* Featured Categories Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-black mb-4">Explore by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate('/megatalent/art')}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🎨</div>
                <h3 className="font-semibold mb-1">Art</h3>
                <p className="text-xs text-muted-foreground">Drawing, Painting & More</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate('/megatalent/music')}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🎤</div>
                <h3 className="font-semibold mb-1">Music</h3>
                <p className="text-xs text-muted-foreground">Singing & Instruments</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate('/megatalent/dance')}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">💃</div>
                <h3 className="font-semibold mb-1">Dance</h3>
                <p className="text-xs text-muted-foreground">All Dance Styles</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate('/megatalent/photography')}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">📸</div>
                <h3 className="font-semibold mb-1">Photography</h3>
                <p className="text-xs text-muted-foreground">Best Photos</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate('/megatalent/cooking')}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">👨‍🍳</div>
                <h3 className="font-semibold mb-1">Cooking</h3>
                <p className="text-xs text-muted-foreground">Culinary Creations</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate('/megatalent/digital_art')}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">💻</div>
                <h3 className="font-semibold mb-1">Digital Art</h3>
                <p className="text-xs text-muted-foreground">Digital Creations</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate('/megatalent/makeup_art')}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">💄</div>
                <h3 className="font-semibold mb-1">Makeup Art</h3>
                <p className="text-xs text-muted-foreground">Beauty Artistry</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate('/megatalent/sports')}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">💪</div>
                <h3 className="font-semibold mb-1">Sports</h3>
                <p className="text-xs text-muted-foreground">Fitness & Training</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate('/megatalent/entertainment')}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">😂</div>
                <h3 className="font-semibold mb-1">Entertainment</h3>
                <p className="text-xs text-muted-foreground">Comedy & Fun</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all group"
              onClick={() => navigate('/megatalent/education')}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">💡</div>
                <h3 className="font-semibold mb-1">Education</h3>
                <p className="text-xs text-muted-foreground">Tutorials & Tips</p>
                <ArrowRight className="w-4 h-4 mx-auto mt-2 group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="feed">{t('megatalent.contest')}</TabsTrigger>
            <TabsTrigger value="referral">{t('megatalent.referral_program')}</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Upload Section */}
              <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                {(subscriptionTier === 'premium' || subscriptionTier === 'top_premium') && (
                  <div className={`p-4 rounded-lg border ${subscriptionTier === 'top_premium' ? 'bg-gradient-to-r from-gold/20 via-yellow-400/10 to-gold/20 border-gold/50 shadow-[0_0_15px_rgba(255,215,0,0.2)]' : 'bg-gradient-primary border-gold/30'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t('megatalent.your_votes')}</span>
                        <VoteBoostTooltip isTopPremium={subscriptionTier === 'top_premium'} />
                      </div>
                      <AnimatedVoteCounter 
                        targetValue={totalVotes}
                        bonusVotes={subscriptionTier === 'top_premium' ? 100000 : 0}
                        isTopPremium={subscriptionTier === 'top_premium'}
                      />
                    </div>
                    {subscriptionTier === 'top_premium' && (
                      <p className="text-xs text-gold mt-2 flex items-center gap-1">
                        🏆 {t('megatalent.bonus_votes')}
                      </p>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('megatalent.select_category')}</p>
                  <Badge variant="outline" className="text-sm">
                    {categoryGroups.flatMap(g => g.categories).find(c => c.value === selectedCategory)?.label || t('megatalent.select_category')}
                  </Badge>
                </div>
                
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {categoryGroups.map((group, idx) => (
                      <AccordionItem key={idx} value={`group-${idx}`}>
                        <AccordionTrigger className="text-sm font-medium">
                          {group.group}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1">
                            {group.categories.map((cat) => (
                              <Button
                                key={cat.value}
                                variant={selectedCategory === cat.value ? "default" : "ghost"}
                                className="w-full justify-start text-sm"
                                onClick={() => setSelectedCategory(cat.value)}
                              >
                                {cat.label}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
                
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'image')}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'video')}
                />
                
                <Button 
                  variant="premium" 
                  className="w-full"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4" />
                  {uploading ? t('megatalent.uploading') : t('megatalent.upload_photo')}
                </Button>
                <Button 
                  variant="premium" 
                  className="w-full"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Video className="h-4 w-4" />
                  {uploading ? t('megatalent.uploading') : t('megatalent.upload_video')}
                </Button>
                
                {uploadedFile && (
                  <div className="mt-4">
                    {uploadedFile.type === 'image' ? (
                      <img src={uploadedFile.url} alt="Uploaded" className="w-full rounded-lg" />
                    ) : (
                      <video src={uploadedFile.url} controls className="w-full rounded-lg" />
                    )}
                  </div>
                )}
                
                <Input 
                  placeholder={t('megatalent.submit_title_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <Textarea 
                  placeholder={t('megatalent.submit_description_placeholder')}
                  className="min-h-20"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting || uploading}
                >
                  {submitting ? t('megatalent.publishing') : t('megatalent.publish')}
                </Button>
              </CardContent>
              </Card>
              </div>

              {/* Feed */}
              <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {categoryGroups.flatMap(g => g.categories).find(c => c.value === selectedCategory)?.label || "Posts"}
              </h2>
              <Badge className="bg-gold text-gold-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                Trending
              </Badge>
            </div>

            {/* Real Posts from Database */}
            {submissions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No posts in this category yet. Be the first!
                </p>
              </Card>
            ) : (
              submissions.map((submission) => (
                <Card key={submission.id} className={`overflow-hidden ${submission.subscriptionTier === 'top_premium' ? 'ring-2 ring-gold/50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                            {submission.profiles?.full_name?.[0] || 'U'}
                          </div>
                          {submission.subscriptionTier === 'top_premium' && (
                            <TopPremiumBadge variant="small" className="absolute -bottom-1 -right-1" showIcon={false} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {submission.profiles?.full_name || 'User'}
                            </p>
                            {submission.subscriptionTier === 'top_premium' && (
                              <TopPremiumBadge variant="inline" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(submission.created_at).toLocaleDateString('en-US')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {categoryGroups.flatMap(g => g.categories).find(c => c.value === selectedCategory)?.label}
                        </Badge>
                        {currentUserId === submission.user_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSubmission(submission.id)}
                            disabled={deletingSubmission === submission.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <h3 className="font-semibold text-lg">{submission.title}</h3>
                    {submission.media_type === 'image' ? (
                      <img 
                        src={submission.media_url} 
                        alt={submission.title}
                        className="w-full aspect-video object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setExpandedMedia({ url: submission.media_url, type: 'image' })}
                      />
                    ) : (
                      <video 
                        src={submission.media_url} 
                        controls
                        className="w-full aspect-video rounded-lg cursor-pointer"
                        onClick={(e) => {
                          // Only open modal if clicking on video (not controls)
                          if (e.target === e.currentTarget) {
                            setExpandedMedia({ url: submission.media_url, type: 'video' });
                          }
                        }}
                      />
                    )}
                    <p className="text-sm">
                      {submission.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(submission.id)}
                          className={likedSubmissions.has(submission.id) ? "text-red-500" : ""}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${likedSubmissions.has(submission.id) ? 'fill-current' : ''}`} />
                          {submission.subscriptionTier === 'top_premium' 
                            ? ((submission.votes_count || 0) + 100000).toLocaleString()
                            : (submission.votes_count || 0)
                          }
                        </Button>
                        {submission.subscriptionTier === 'top_premium' && (
                          <VoteBoostTooltip isTopPremium={true} />
                        )}
                        
                        <Dialog open={commentDialogOpen === submission.id} onOpenChange={(open) => {
                          setCommentDialogOpen(open ? submission.id : null);
                          if (open) fetchComments(submission.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {commentCounts[submission.id] || 0}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Comments</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[400px] pr-4">
                              {comments[submission.id]?.length > 0 ? (
                                <div className="space-y-4">
                                  {comments[submission.id].map((comment: any) => (
                                    <div key={comment.id} className="flex gap-3">
                                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                        {comment.profiles?.full_name?.[0] || 'U'}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-semibold text-sm">{comment.profiles?.full_name || 'User'}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{comment.comment_text}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {new Date(comment.created_at).toLocaleDateString('en-US')}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-center text-muted-foreground py-8">No comments yet</p>
                              )}
                            </ScrollArea>
                            <div className="flex gap-2 mt-4">
                              <Input
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleComment(submission.id);
                                  }
                                }}
                              />
                              <Button size="sm" onClick={() => handleComment(submission.id)}>
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Share</SheetTitle>
                          </SheetHeader>
                          <div className="space-y-4 mt-6">
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => copyMediaLink(submission.media_url)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy media link
                            </Button>
                            
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => shareToFacebook(submission)}
                            >
                              <Facebook className="h-4 w-4 mr-2" />
                              Share on Facebook
                            </Button>
                            
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => shareToTwitter(submission)}
                            >
                              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                              Share on X (Twitter)
                            </Button>
                            
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => shareToWhatsApp(submission)}
                            >
                              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                              Share via WhatsApp
                            </Button>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </CardContent>
                </Card>
              ))
              )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Contest</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold">€10,000</div>
                  <p className="text-sm text-muted-foreground">Grand Prize</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Month:</span>
                    <span className="font-semibold">
                      {(() => {
                        const now = new Date();
                        const startDate = new Date('2026-01-01');
                        
                        if (now < startDate) {
                          return 'Starts 01.01.2026';
                        }
                        
                        const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        return currentMonth;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining:</span>
                    <span className="font-semibold">
                      {(() => {
                        const now = new Date();
                        const startDate = new Date('2026-01-01');
                        
                        if (now < startDate) {
                          const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                          return `Starts in ${daysUntilStart} days`;
                        }
                        
                        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        const daysLeft = Math.ceil((lastDayOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-gold h-2 rounded-full transition-all" 
                      style={{
                        width: `${(() => {
                          const now = new Date();
                          const startDate = new Date('2026-01-01');
                          
                          if (now < startDate) return '0%';
                          
                          const currentDay = now.getDate();
                          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                          return `${(currentDay / daysInMonth) * 100}%`;
                        })()}`
                      }}
                    ></div>
                  </div>
                </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </TabsContent>


          <TabsContent value="referral" className="mt-0">
            <div className="max-w-4xl mx-auto space-y-6">
              <ReferralProgram />
              
              {/* Subscription Management */}
              {isSubscribed && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Subscription Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Current Subscription</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {subscriptionTier === 'top_premium' ? 'Top Premium' : 'Premium'}
                        </p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        If you cancel your subscription, it will remain active until the end of the paid period. 
                        The paid amount is non-refundable.
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={handleCancelSubscription}
                      disabled={cancelingSubscription}
                    >
                      {cancelingSubscription ? 'Canceling...' : 'Cancel Subscription'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Expanded Media Dialog */}
        <Dialog open={!!expandedMedia} onOpenChange={() => setExpandedMedia(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0">
            <div className="relative flex items-center justify-center bg-black/95">
              {expandedMedia?.type === 'image' ? (
                <img 
                  src={expandedMedia.url} 
                  alt="Zväčšený obrázok"
                  className="max-w-full max-h-[95vh] object-contain"
                />
              ) : expandedMedia?.type === 'video' ? (
                <video 
                  src={expandedMedia.url} 
                  controls
                  autoPlay
                  className="max-w-full max-h-[95vh]"
                />
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        {/* Copyright Protection Section */}
        <Card className="mt-12 border-muted">
          <CardHeader>
            <CardTitle className="text-xl">⚖️ Copyright Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="space-y-3">
              <p className="font-semibold text-foreground">
                Important information for all Megatalent contest participants:
              </p>
              
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
                  <li>The Megatalent platform serves only as a space for publishing content</li>
                  <li>The platform operator is not responsible for content uploaded by users</li>
                  <li>In case of copyright infringement, the content will be immediately removed</li>
                  <li>We reserve the right to block users who violate the rules</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-foreground">⚠️ Warning:</h3>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Copyright infringement can have serious legal consequences</li>
                  <li>By uploading content, you agree to these terms</li>
                  <li>In case of doubts about the authenticity of content, we may request verification of authorship</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-700 dark:text-amber-400 font-medium">
                  🚨 Upload only your own original content. Copyright infringement may disqualify you from the contest and expose you to legal consequences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Megatalent;