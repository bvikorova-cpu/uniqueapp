import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, ArrowLeft, Play, Trophy, Loader2, ThumbsDown, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { TalentCommentsSheet } from "@/components/megatalent/TalentCommentsSheet";
import MegatalentTipJar from "@/components/megatalent/MegatalentTipJar";
import MegatalentDailyChallenge from "@/components/megatalent/MegatalentDailyChallenge";
import MegatalentBracket from "@/components/megatalent/MegatalentBracket";
import MegatalentVipBanner from "@/components/megatalent/MegatalentVipBanner";
import MegatalentWatchParty from "@/components/megatalent/MegatalentWatchParty";
import MegatalentAICoach from "@/components/megatalent/MegatalentAICoach";
import MegatalentLeaderboard from "@/components/megatalent/MegatalentLeaderboard";
import MegatalentAchievements from "@/components/megatalent/MegatalentAchievements";
import MegatalentRisingStars from "@/components/megatalent/MegatalentRisingStars";
import MegatalentTalentDuel from "@/components/megatalent/MegatalentTalentDuel";
import MegatalentSpotlight from "@/components/megatalent/MegatalentSpotlight";
import MegatalentVotingStreak from "@/components/megatalent/MegatalentVotingStreak";
import MegatalentSponsorShowcase from "@/components/megatalent/MegatalentSponsorShowcase";
import MegatalentCertificate from "@/components/megatalent/MegatalentCertificate";
import MegatalentHighlightReel from "@/components/megatalent/MegatalentHighlightReel";
import MegatalentDailyLoginBonus from "@/components/megatalent/MegatalentDailyLoginBonus";
import MegatalentFriendInvites from "@/components/megatalent/MegatalentFriendInvites";
import MegatalentVotingPowerBanner from "@/components/megatalent/MegatalentVotingPowerBanner";
import MegatalentBoostButton from "@/components/megatalent/MegatalentBoostButton";
import MegatalentMentorshipBooking from "@/components/megatalent/MegatalentMentorshipBooking";
import MegatalentTalentMarketplace from "@/components/megatalent/MegatalentTalentMarketplace";
import MegatalentBattleRoyale from "@/components/megatalent/MegatalentBattleRoyale";
import MegatalentStories from "@/components/megatalent/MegatalentStories";
import MegatalentPushOptIn from "@/components/megatalent/MegatalentPushOptIn";
import MegatalentTalentPortfolio from "@/components/megatalent/MegatalentTalentPortfolio";
import MegatalentTrophyCase from "@/components/megatalent/MegatalentTrophyCase";
import MegatalentLiveChat from "@/components/megatalent/MegatalentLiveChat";
import MegatalentDailyQuests from "@/components/megatalent/MegatalentDailyQuests";
import MegatalentPredictions from "@/components/megatalent/MegatalentPredictions";
import MegatalentFanClub from "@/components/megatalent/MegatalentFanClub";
import MegatalentSeasonPass from "@/components/megatalent/MegatalentSeasonPass";
import MegatalentEndorsements from "@/components/megatalent/MegatalentEndorsements";
import MegatalentComments from "@/components/megatalent/MegatalentComments";
import MegatalentClipOfDay from "@/components/megatalent/MegatalentClipOfDay";
import MegatalentTalentShop from "@/components/megatalent/MegatalentTalentShop";
import { ReferralProgram } from "@/components/megatalent/ReferralProgram";
import MegatalentJudgePanel from "@/components/megatalent/MegatalentJudgePanel";
import JudgeApplication from "@/components/megatalent/JudgeApplication";
import MegatalentRivalries from "@/components/megatalent/MegatalentRivalries";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";

const categoryConfig: Record<string, { title: string; icon: string; categories: string[] }> = {
  art: { title: "Art & Creativity", icon: "🎨", categories: ["drawing", "painting", "digital_art", "sculpture", "photography", "handmade", "makeup_art", "tattoo"] },
  music: { title: "Music", icon: "🎤", categories: ["singing", "instrument", "music_production", "beatbox", "rap"] },
  dance: { title: "Dance & Movement", icon: "💃", categories: ["dance", "breakdance", "gymnastics", "parkour"] },
  sports: { title: "Sports & Fitness", icon: "💪", categories: ["training", "yoga", "martial_arts", "extreme_sport", "sport_trick"] },
  entertainment: { title: "Entertainment", icon: "😂", categories: ["funny_video", "standup", "impressions", "magic", "pranks"] },
  education: { title: "Education", icon: "💡", categories: ["life_advice", "tutorial", "cooking", "diy", "science"] },
  photography: { title: "Photography", icon: "📸", categories: ["photography"] },
  cooking: { title: "Cooking & Baking", icon: "👨‍🍳", categories: ["cooking"] },
  digital_art: { title: "Digital Art", icon: "💻", categories: ["digital_art"] },
  makeup_art: { title: "Makeup Art", icon: "💄", categories: ["makeup_art"] },
};

const MegatalentCategory = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, 'like' | 'dislike'>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [expandedMedia, setExpandedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [commentsForId, setCommentsForId] = useState<string | null>(null);
  const [tipTarget, setTipTarget] = useState<{ id: string; name?: string } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [boostedIds, setBoostedIds] = useState<Set<string>>(new Set());

  const config = category ? categoryConfig[category] : null;

  useEffect(() => {
    if (!config) {
      navigate("/megatalent");
      return;
    }
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    fetchSubmissions();
    fetchUserVotes();
    fetchActiveBoosts();
    // Verify boost return
    const params = new URLSearchParams(window.location.search);
    if (params.get("boost") === "success" && params.get("session_id")) {
      supabase.functions
        .invoke("verify-megatalent-boost", { body: { session_id: params.get("session_id") } })
        .then(() => {
          toast({ title: "🚀 Boost active!", description: "Your submission is spotlighted for 24h." });
          fetchActiveBoosts();
          fetchSubmissions();
          window.history.replaceState({}, "", window.location.pathname);
        });
    }
  }, [category]);

  const fetchActiveBoosts = async () => {
    if (!config) return;
    const { data } = await supabase
      .from("megatalent_boosts")
      .select("submission_id")
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .in("category", config.categories as any);
    setBoostedIds(new Set((data ?? []).map((b: any) => b.submission_id)));
  };

  const fetchSubmissions = async () => {
    if (!config) return;
    try {
      setLoading(true);
      const { data: submissionsData, error } = await supabase
        .from('talent_submissions')
        .select('*')
        .in('category', config.categories as any)
        .eq('is_active', true)
        .order('votes_count', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (submissionsData && submissionsData.length > 0) {
        const userIds = [...new Set(submissionsData.map(s => s.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const submissionIds = submissionsData.map(s => s.id);
        const { data: commentsData } = await supabase
          .from('talent_comments')
          .select('submission_id')
          .in('submission_id', submissionIds);

        const counts: Record<string, number> = {};
        commentsData?.forEach(comment => {
          counts[comment.submission_id] = (counts[comment.submission_id] || 0) + 1;
        });
        setCommentCounts(counts);

        const enriched = submissionsData.map(submission => ({
          ...submission,
          profiles: profilesData?.find(p => p.id === submission.user_id)
        }));
        enriched.sort((a: any, b: any) => {
          const ab = boostedIds.has(a.id) ? 1 : 0;
          const bb = boostedIds.has(b.id) ? 1 : 0;
          if (ab !== bb) return bb - ab;
          return (b.votes_count || 0) - (a.votes_count || 0);
        });
        setSubmissions(enriched);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('talent_votes')
        .select('submission_id, vote_type')
        .eq('user_id', user.id);
      if (data) {
        const map: Record<string, 'like' | 'dislike'> = {};
        data.forEach((v: any) => { map[v.submission_id] = v.vote_type; });
        setUserVotes(map);
      }
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const applyDelta = (id: string, likeDelta: number, dislikeDelta: number) => {
    setSubmissions(prev => prev.map(s => s.id === id ? {
      ...s,
      votes_count: Math.max(0, (s.votes_count || 0) + likeDelta),
      dislikes_count: Math.max(0, (s.dislikes_count || 0) + dislikeDelta),
    } : s));
  };

  const handleVote = async (submissionId: string, voteType: 'like' | 'dislike') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Login required", description: "Please log in to vote", variant: "destructive" });
        return;
      }

      const current = userVotes[submissionId];

      if (current === voteType) {
        // toggle off
        const { error } = await supabase
          .from('talent_votes')
          .delete()
          .eq('submission_id', submissionId)
          .eq('user_id', user.id);
        if (error) throw error;
        setUserVotes(prev => { const c = { ...prev }; delete c[submissionId]; return c; });
        applyDelta(submissionId, voteType === 'like' ? -1 : 0, voteType === 'dislike' ? -1 : 0);
      } else if (current && current !== voteType) {
        // switch
        const { error } = await supabase
          .from('talent_votes')
          .update({ vote_type: voteType })
          .eq('submission_id', submissionId)
          .eq('user_id', user.id);
        if (error) throw error;
        setUserVotes(prev => ({ ...prev, [submissionId]: voteType }));
        if (voteType === 'like') applyDelta(submissionId, +1, -1);
        else applyDelta(submissionId, -1, +1);
      } else {
        // new vote
        const { error } = await supabase
          .from('talent_votes')
          .insert({ submission_id: submissionId, user_id: user.id, vote_type: voteType });
        if (error) throw error;
        setUserVotes(prev => ({ ...prev, [submissionId]: voteType }));
        applyDelta(submissionId, voteType === 'like' ? +1 : 0, voteType === 'dislike' ? +1 : 0);
      }
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({ title: "Error", description: error?.message || "Failed to vote", variant: "destructive" });
    }
  };

  if (!config) return null;

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={() => navigate("/megatalent")} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to MegaTalent
          </Button>
        </motion.div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-6 sm:p-8 mb-8"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          </div>

          <div className="relative z-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
              <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
                <Trophy className="h-3 w-3 mr-1" /> Category
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
            >
              {config.icon} {config.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg mb-4"
            >
              Discover amazing talents in {config.title.toLowerCase()}
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <Badge variant="secondary" className="text-lg px-6 py-2">
                {submissions.length} Submissions
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* VIP Viewer Pass */}
        <div className="mb-4">
          <MegatalentVipBanner />

          {/* Spotlight of the Week */}
          <div className="mt-6">
            <MegatalentSpotlight category={category} categories={config?.categories} />
          </div>
        </div>

        {/* Daily Challenge */}
        <div className="mb-6">
          <MegatalentDailyChallenge />
        </div>

        {/* Weekly Bracket */}
        {category && (
          <div className="mb-6">
            <MegatalentBracket category={category} />
          </div>
        )}

        {/* Live & Watch Party */}
        {category && (
          <div className="mb-6">
            <MegatalentWatchParty category={category} />
          </div>
        )}

        {/* AI Talent Coach */}
        {category && (
          <div className="mb-6">
            <MegatalentAICoach category={category} />
          </div>
        )}

        {/* Talent Leaderboard */}
        {category && (
          <div className="mb-6">
            <MegatalentLeaderboard category={category} categories={config?.categories} />
          </div>
        )}

        {/* Voting Power Banner */}
        <div className="mb-6">
          <MegatalentVotingPowerBanner />
        </div>

        {/* Achievements + Streaks + Login Bonus + Invites */}
        {currentUserId && (
          <div className="mb-6 space-y-6">
            <MegatalentDailyLoginBonus userId={currentUserId} />
            <MegatalentAchievements userId={currentUserId} />
            <MegatalentVotingStreak userId={currentUserId} />
            <MegatalentCertificate userId={currentUserId} category={category} />
            <MegatalentFriendInvites userId={currentUserId} />
          </div>
        )}

        {/* Highlight Reel */}
        <div className="mb-6">
          <MegatalentHighlightReel category={category} categories={config?.categories} />
        </div>

        {/* Rising Stars */}
        <div className="mb-6">
          <MegatalentRisingStars category={category} categories={config?.categories} />
        </div>

        {/* Talent Duel */}
        <div className="mb-6">
          <MegatalentTalentDuel category={category} categories={config?.categories} />
        </div>

        {/* Sponsor Showcase */}
        <div className="mb-6">
          <MegatalentSponsorShowcase category={category} />
        </div>

        {/* Push Opt-In */}
        <div className="mb-6">
          <MegatalentPushOptIn />
        </div>

        {/* Stories */}
        <div className="mb-6">
          <MegatalentStories />
        </div>

        {/* Battle Royale */}
        <div className="mb-6">
          <MegatalentBattleRoyale category={category} categories={config?.categories} />
        </div>

        {/* Mentorship */}
        <div className="mb-6">
          <MegatalentMentorshipBooking category={category} />
        </div>

        {/* Marketplace */}
        <div className="mb-6">
          <MegatalentTalentMarketplace category={category} />
        </div>

        {/* Featured Portfolios */}
        <div className="mb-6">
          <MegatalentTalentPortfolio category={category} categories={config?.categories} />
        </div>

        {/* Season Pass */}
        <div className="mb-6">
          <MegatalentSeasonPass userId={currentUserId} />
        </div>

        {/* Daily Quests */}
        <div className="mb-6">
          <MegatalentDailyQuests userId={currentUserId} />
        </div>

        {/* Predictions */}
        <div className="mb-6">
          <MegatalentPredictions category={category} userId={currentUserId} />
        </div>

        {/* Fan Clubs */}
        <div className="mb-6">
          <MegatalentFanClub userId={currentUserId} />
        </div>

        {/* Trophy Case */}
        {currentUserId && (
          <div className="mb-6">
            <MegatalentTrophyCase userId={currentUserId} />
          </div>
        )}

        {/* Live Chat */}
        <div className="mb-6">
          <MegatalentLiveChat category={category} userId={currentUserId} />
        </div>

        {/* Features #34-40 */}
        <div className="mb-6"><MegatalentClipOfDay category={category} /></div>
        <div className="mb-6"><MegatalentJudgePanel category={category} categories={config?.categories} userId={currentUserId} /></div>
        <div className="mb-6"><JudgeApplication userId={currentUserId} /></div>
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MegatalentEndorsements category={category} categories={config?.categories} userId={currentUserId} />
          <MegatalentComments category={category} categories={config?.categories} userId={currentUserId} />
        </div>
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MegatalentTalentShop userId={currentUserId} />
          <ReferralProgram />
        </div>
        <div className="mb-6"><MegatalentRivalries category={category} categories={config?.categories} /></div>


        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden backdrop-blur-xl bg-card/60 border-border/30 animate-pulse">
                <div className="aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-muted/60" />
                  <div className="h-3 w-full rounded bg-muted/40" />
                  <div className="h-3 w-2/3 rounded bg-muted/40" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-8 w-16 rounded bg-muted/40" />
                    <div className="h-8 w-16 rounded bg-muted/40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-2xl font-bold text-muted-foreground">No submissions yet</p>
            <p className="text-muted-foreground mt-2">Be the first to submit your talent!</p>
            <Button onClick={() => navigate("/megatalent")} className="mt-6 gap-2">
              Submit Your Talent
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission, i) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-border/30 hover:border-primary/20 hover:shadow-lg transition-all group">
                  <div 
                    className="relative aspect-video bg-muted cursor-pointer overflow-hidden"
                    onClick={() => setExpandedMedia({ url: submission.media_url, type: submission.media_type })}
                  >
                    {submission.media_type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video src={submission.media_url} className="w-full h-full object-cover" playsInline />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                          <Play className="w-16 h-16 text-white" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={submission.media_url}
                        alt={submission.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {submission.profiles?.avatar_url ? (
                        <img src={submission.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {submission.profiles?.full_name?.[0] || "U"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-sm line-clamp-1">{submission.title}</h3>
                          {boostedIds.has(submission.id) && (
                            <UiBadge className="bg-amber-500/20 text-amber-500 border-amber-500/40 text-[9px] gap-0.5 px-1.5">
                              <Rocket className="h-2.5 w-2.5" /> BOOSTED
                            </UiBadge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{submission.profiles?.full_name || 'Anonymous'}</p>
                      </div>
                    </div>

                    {submission.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{submission.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/20">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(submission.id, 'like')}
                          className={`gap-1.5 h-8 ${userVotes[submission.id] === 'like' ? "text-red-500" : ""}`}
                          aria-label="Like"
                          aria-pressed={userVotes[submission.id] === 'like'}
                        >
                          <Heart className={`w-4 h-4 ${userVotes[submission.id] === 'like' ? "fill-current" : ""}`} />
                          <span className="text-xs font-bold">{submission.votes_count || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(submission.id, 'dislike')}
                          className={`gap-1.5 h-8 ${userVotes[submission.id] === 'dislike' ? "text-blue-500" : ""}`}
                          aria-label="Dislike"
                          aria-pressed={userVotes[submission.id] === 'dislike'}
                        >
                          <ThumbsDown className={`w-4 h-4 ${userVotes[submission.id] === 'dislike' ? "fill-current" : ""}`} />
                          <span className="text-xs font-bold">{submission.dislikes_count || 0}</span>
                        </Button>
                      </div>

                      <div className="flex items-center gap-1">
                        {currentUserId === submission.user_id && !boostedIds.has(submission.id) && category && (
                          <MegatalentBoostButton submissionId={submission.id} category={category} />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 h-8 text-pink-500 hover:text-pink-600"
                          onClick={() => setTipTarget({ id: submission.user_id, name: submission.profiles?.full_name })}
                          aria-label="Send tip"
                        >
                          <Gift className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 h-8"
                          onClick={() => setCommentsForId(submission.id)}
                          aria-label="Open comments"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs">{commentCounts[submission.id] || 0}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!expandedMedia} onOpenChange={() => setExpandedMedia(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          {expandedMedia?.type === 'video' ? (
            <video src={expandedMedia.url} controls autoPlay className="w-full h-auto max-h-[80vh]" />
          ) : (
            <img src={expandedMedia?.url} alt="Expanded view" className="w-full h-auto max-h-[80vh] object-contain" />
          )}
        </DialogContent>
      </Dialog>

      <TalentCommentsSheet
        submissionId={commentsForId}
        open={!!commentsForId}
        onOpenChange={(o) => !o && setCommentsForId(null)}
        onCountChange={(id, count) => setCommentCounts((prev) => ({ ...prev, [id]: count }))}
      />

      <Dialog open={!!tipTarget} onOpenChange={(o) => !o && setTipTarget(null)}>
        <DialogContent className="max-w-md">
          {tipTarget && (
            <MegatalentTipJar
              creatorId={tipTarget.id}
              creatorName={tipTarget.name}
              categorySlug={category}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MegatalentCategory;
