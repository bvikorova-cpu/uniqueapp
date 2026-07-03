import { lazy, Suspense, useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Briefcase, Brain, Package, Sparkles, Users, UserPlus, UserCheck, Gift } from "lucide-react";
// FreeTierBalanceWidget import removed — paid-only model
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFollowCounts } from "@/hooks/useFollow";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { XpBreakdown } from "@/components/profile/XpBreakdown";

const PostCard = lazy(() => import("@/components/feed/PostCard"));
const FreeTierHistory = lazy(() => import("@/components/credits/FreeTierHistory").then((m) => ({ default: m.FreeTierHistory })));
const StreakMultiplierCard = lazy(() => import("@/components/gamification/StreakMultiplierCard").then((m) => ({ default: m.StreakMultiplierCard })));
const VictoryCardGenerator = lazy(() => import("@/components/social/VictoryCardGenerator").then((m) => ({ default: m.VictoryCardGenerator })));
const ProfileMilestones = lazy(() => import("@/components/profile/ProfileMilestones").then((m) => ({ default: m.ProfileMilestones })));
const CreatorAnalyticsWidget = lazy(() => import("@/components/analytics/CreatorAnalyticsWidget"));
const InviteFriendPanel = lazy(() => import("@/components/referral/InviteFriendPanel").then((m) => ({ default: m.InviteFriendPanel })));
const BrainDuelStats = lazy(() => import("@/components/profile/BrainDuelStats").then((m) => ({ default: m.BrainDuelStats })));
const CourseHistory = lazy(() => import("@/components/profile/CourseHistory").then((m) => ({ default: m.CourseHistory })));
const UserContests = lazy(() => import("@/components/profile/UserContests").then((m) => ({ default: m.UserContests })));
const FollowersModal = lazy(() => import("@/components/profile/FollowersModal").then((m) => ({ default: m.FollowersModal })));
const DailyXPVideoReward = lazy(() => import("@/components/gamification/DailyXPVideoReward").then((m) => ({ default: m.DailyXPVideoReward })));
const MyBazaarListings = lazy(() => import("@/components/profile/MyBazaarListings").then((m) => ({ default: m.MyBazaarListings })));
const MySkillsHub = lazy(() => import("@/components/profile/MySkillsHub").then((m) => ({ default: m.MySkillsHub })));
const MyJobApplications = lazy(() => import("@/components/profile/MyJobApplications").then((m) => ({ default: m.MyJobApplications })));
const AchievementsWall = lazy(() => import("@/components/profile/AchievementsWall").then((m) => ({ default: m.AchievementsWall })));
const ActivityHeatmap = lazy(() => import("@/components/profile/ActivityHeatmap").then((m) => ({ default: m.ActivityHeatmap })));
const FounderStory = lazy(() => import("@/components/profile/FounderStory").then((m) => ({ default: m.FounderStory })));
const StoryHighlights = lazy(() => import("@/components/profile/StoryHighlights").then((m) => ({ default: m.StoryHighlights })));
const VoiceIntro = lazy(() => import("@/components/profile/VoiceIntro").then((m) => ({ default: m.VoiceIntro })));
const Avatar3D = lazy(() => import("@/components/profile/Avatar3D").then((m) => ({ default: m.Avatar3D })));
const PublicGoals = lazy(() => import("@/components/profile/PublicGoals").then((m) => ({ default: m.PublicGoals })));
const ProfileJsonLd = lazy(() => import("@/components/profile/ProfileJsonLd").then((m) => ({ default: m.ProfileJsonLd })));
const OpenToWorkBadge = lazy(() => import("@/components/profile/OpenToWork").then((m) => ({ default: m.OpenToWorkBadge })));
const ProfileMusicPlayer = lazy(() => import("@/components/profile/ProfileMusicPlayer").then((m) => ({ default: m.ProfileMusicPlayer })));
const MutualConnections = lazy(() => import("@/components/profile/MutualConnections").then((m) => ({ default: m.MutualConnections })));
const VCardDownloadButton = lazy(() => import("@/components/profile/VCardDownloadButton").then((m) => ({ default: m.VCardDownloadButton })));
const TipJar = lazy(() => import("@/components/profile/TipJar").then((m) => ({ default: m.TipJar })));
const TipHistory = lazy(() => import("@/components/profile/TipHistory").then((m) => ({ default: m.TipHistory })));
const ProfileQRCode = lazy(() => import("@/components/profile/ProfileQRCode").then((m) => ({ default: m.ProfileQRCode })));
const ThemePicker = lazy(() => import("@/components/profile/ThemePicker").then((m) => ({ default: m.ThemePicker })));
const Endorsements = lazy(() => import("@/components/profile/Endorsements").then((m) => ({ default: m.Endorsements })));
const ProfileViewsCounter = lazy(() => import("@/components/profile/ProfileViewsCounter").then((m) => ({ default: m.ProfileViewsCounter })));
const LifeEventsTimeline = lazy(() => import("@/components/profile/LifeEventsTimeline").then((m) => ({ default: m.LifeEventsTimeline })));
const FamilySection = lazy(() => import("@/components/profile/FamilySection").then((m) => ({ default: m.FamilySection })));

const PROFILE_POSTS_PAGE_SIZE = 10;
const LazyProfileSectionFallback = () => <div className="h-24 rounded-xl bg-muted/30 animate-pulse" />;

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email?: string | null;
  bio: string | null;
  location: string | null;
  birth_date?: string | null;
  phone?: string | null;
  website: string | null;
  interests: string[] | null;
  occupation: string | null;
  company: string | null;
  headline?: string | null;
  username?: string | null;
  social_links?: any;
  open_to_work?: boolean | null;
  open_to_work_details?: any;
  profile_music_url?: string | null;
  profile_music_title?: string | null;
  bio_translations?: any;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  reposts_count: number;
  media: Array<{
    id: string;
    file_url: string;
    file_type: string;
  }>;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>('none');
  const [friends, setFriends] = useState<Profile[]>([]);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<"followers" | "following">("followers");
  const { data: followCounts } = useFollowCounts(userId);
  const [defaultTab, setDefaultTab] = useState("posts");
  const [stats, setStats] = useState({
    postsCount: 0,
    likesGiven: 0,
    commentsGiven: 0,
    friendsCount: 0,
    submissionsCount: 0,
    completedCoursesCount: 0,
    xp: 0,
    level: 1,
  });

  useEffect(() => {
    if (authLoading) return;
    setCurrentUserId(user?.id || null);
  }, [authLoading, user?.id]);

  // Verify Stripe Checkout tip session on return
  useEffect(() => {
    const tipStatus = searchParams.get('tip');
    const sessionId = searchParams.get('session_id');
    if (tipStatus === 'cancel') {
      toast({ title: 'Tip cancelled', description: 'The payment was cancelled.' });
      searchParams.delete('tip');
      setSearchParams(searchParams, { replace: true });
      return;
    }
    if (tipStatus === 'success' && sessionId) {
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke('verify-profile-tip', {
            body: { sessionId },
          });
          if (error) throw error;
          if (data?.verified) {
            toast({
              title: '🎉 Tip sent successfully!',
              description: `Thanks for the support (€${((data.tip?.amount_cents ?? 0) / 100).toFixed(2)}).`,
            });
          } else {
            toast({ title: 'Tip is being processed', description: 'Please refresh in a moment.' });
          }
        } catch (e: any) {
          toast({ title: 'Verification failed', description: e.message, variant: 'destructive' });

        } finally {
          searchParams.delete('tip');
          searchParams.delete('session_id');
          setSearchParams(searchParams, { replace: true });
        }
      })();
    }
  }, [searchParams, setSearchParams, toast]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && currentUserId === userId) {
      setDefaultTab(tab);
    }
  }, [searchParams, currentUserId, userId]);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      if (!userId) return;

      try {
        // Fetch profile + posts first (critical path) in parallel and render ASAP.
        const [profileRes, postsRes] = await Promise.all([
          supabase
            .from("public_profiles")
            .select("id, full_name, avatar_url, bio, location, website, interests, occupation, company, headline, username, social_links, open_to_work, open_to_work_details, profile_music_url, profile_music_title")
            .eq("id", userId)
            .maybeSingle(),
          supabase
            .from("posts")
            .select(`*, media (*)`)
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(PROFILE_POSTS_PAGE_SIZE),
        ]);

        if (profileRes.error) throw profileRes.error;
        const profileData = profileRes.data;
        setProfile(profileData);

        const postsData = postsRes.data;
        const postsWithProfiles = (postsData || []).map((post) => ({
          ...post,
          profiles: {
            id: profileData?.id,
            full_name: profileData?.full_name,
            avatar_url: profileData?.avatar_url,
          },
        }));
        setPosts(postsWithProfiles);
        setLoading(false);

        // Fire-and-forget: all remaining queries in parallel (non-blocking).
        const friendsPromise = supabase
          .from("friendships")
          .select("user_id, friend_id")
          .eq("status", "accepted")
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

        const [
          likesRes,
          commentsRes,
          submissionsRes,
          coursesRes,
          pointsRes,
          friendsRes,
          postsCountRes,
        ] = await Promise.all([
          supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("post_comments").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("talent_submissions").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("completed_courses").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("user_points").select("total_points, level").eq("user_id", userId).maybeSingle(),
          friendsPromise,
          supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", userId),
        ]);

        const friendsData = friendsRes.data;
        setStats({
          postsCount: postsCountRes.count ?? postsData?.length ?? 0,
          likesGiven: likesRes.count || 0,
          commentsGiven: commentsRes.count || 0,
          friendsCount: friendsData?.length || 0,
          submissionsCount: submissionsRes.count || 0,
          completedCoursesCount: coursesRes.count || 0,
          xp: pointsRes.data?.total_points ?? 0,
          level: pointsRes.data?.level ?? 1,
        });

        if (friendsData && friendsData.length > 0) {
          const friendIds = friendsData.map((f) =>
            f.user_id === userId ? f.friend_id : f.user_id
          );
          const { data: friendProfiles } = await supabase
            .from("public_profiles")
            .select("*")
            .in("id", friendIds);
          setFriends(friendProfiles || []);
        }
      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [userId, toast]);

  // Fetch friendship status separately so profile render doesn't wait on session.
  useEffect(() => {
    if (!currentUserId || !userId || currentUserId === userId) return;
    (async () => {
      const { data: friendshipData } = await supabase
        .from("friendships")
        .select("*")
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUserId})`)
        .maybeSingle();

      if (friendshipData) {
        if (friendshipData.status === "accepted") setFriendshipStatus("accepted");
        else if (friendshipData.user_id === currentUserId) setFriendshipStatus("pending_sent");
        else setFriendshipStatus("pending_received");
      }
    })();
  }, [currentUserId, userId]);


  const handleAddFriend = async () => {
    if (!currentUserId || !userId) return;

    try {
      // Check if a friendship row already exists in either direction
      const { data: existing } = await supabase
        .from("friendships")
        .select("*")
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUserId})`)
        .limit(1);

      const row = existing?.[0];
      if (row) {
        if (row.status === "accepted") {
          setFriendshipStatus("accepted");
          toast({ title: "You are already friends" });
          return;
        }
        if (row.user_id === currentUserId) {
          setFriendshipStatus("pending_sent");
          toast({ title: "Friend request already sent" });
          return;
        }
        // pending request from the other user → accept it
        const { error: accErr } = await supabase
          .from("friendships")
          .update({ status: "accepted" })
          .eq("user_id", userId)
          .eq("friend_id", currentUserId);
        if (accErr) throw accErr;
        setFriendshipStatus("accepted");
        toast({ title: "Friend request accepted" });
        return;
      }

      const { error } = await supabase
        .from("friendships")
        .insert({
          user_id: currentUserId,
          friend_id: userId,
          status: "pending"
        });

      if (error) throw error;

      setFriendshipStatus('pending_sent');
      toast({
        title: "Friend request sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  const handleAcceptFriend = async () => {
    if (!currentUserId || !userId) return;

    try {
      const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("user_id", userId)
        .eq("friend_id", currentUserId);

      if (error) throw error;

      setFriendshipStatus('accepted');
      
      // Refresh friends list and stats
      const { data: friendsData } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .eq("status", "accepted")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

      if (friendsData && friendsData.length > 0) {
        const friendIds = friendsData.map(f => 
          f.user_id === userId ? f.friend_id : f.user_id
        );

        const { data: friendProfiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", friendIds);

        setFriends(friendProfiles || []);
      }

      setStats(prev => ({
        ...prev,
        friendsCount: friendsData?.length || 0
      }));

      toast({
        title: "Friend request accepted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async () => {
    if (!currentUserId || !userId) return;

    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUserId})`);

      if (error) throw error;

      setFriendshipStatus('none');
      setFriends([]);
      setStats(prev => ({
        ...prev,
        friendsCount: 0
      }));

      toast({
        title: "Friendship removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    if (!userId || !profile) return;
    
    const { data: postsData } = await supabase
      .from("posts")
      .select(`
        *,
        media (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const postsWithProfiles = (postsData || []).map(post => ({
      ...post,
      profiles: {
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      }
    }));
    
    setPosts(postsWithProfiles);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => navigate("/wall")}>
            Back to Wall
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/wall")}
          className="mb-4 glass-hover rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Cinematic Hero with video, portrait, live stats */}
        <ProfileHero
          profile={profile as any}
          userId={userId}
          currentUserId={currentUserId}
          isOwnProfile={currentUserId === userId}
          onEdit={() => navigate("/edit-profile")}
          stats={{
            posts: stats.postsCount,
            followers: followCounts?.followers || 0,
            following: followCounts?.following || 0,
            xp: stats.xp,
            level: stats.level,
          }}
          friendsAction={
            <>
              {friendshipStatus === 'none' && (
                <Button onClick={handleAddFriend} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/30">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
              )}
              {friendshipStatus === 'pending_sent' && (
                <Button disabled className="bg-gradient-to-r from-violet-600/60 to-purple-600/60 text-white border-0">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sent
                </Button>
              )}
              {friendshipStatus === 'pending_received' && (
                <Button onClick={handleAcceptFriend} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/30">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Accept Friend
                </Button>
              )}
              {friendshipStatus === 'accepted' && (
                <Button onClick={handleRemoveFriend} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/30">
                  <Users className="h-4 w-4 mr-2" />
                  Friends
                </Button>
              )}
              {currentUserId === userId && <ThemePicker userId={userId!} />}
              {currentUserId !== userId && profile.full_name && (
                <TipJar recipientId={userId!} recipientName={profile.full_name} currentUserId={currentUserId} />
              )}
            </>
          }
        />

        {/* XP breakdown — visible on every profile so the source of XP is clear */}
        <XpBreakdown
          xp={stats.xp}
          level={stats.level}
          posts={stats.postsCount}
          likes={stats.likesGiven}
          comments={stats.commentsGiven}
          friends={stats.friendsCount}
        />

        {/* Free Tier Credits — visible on own profile */}
        {userId && (
          <div className="mb-4 grid md:grid-cols-2 gap-4">
            <ProfileMilestones userId={userId} />
            {/* FreeTierBalanceWidget removed — paid-only model */}
            {currentUserId === userId && <StreakMultiplierCard />}
            {currentUserId === userId && <FreeTierHistory />}
            {currentUserId === userId && <VictoryCardGenerator username={profile?.username ?? null} avatarUrl={profile?.avatar_url ?? null} />}
            {currentUserId === userId && <CreatorAnalyticsWidget userId={userId} />}
          </div>
        )}

        {/* Secondary share actions — shown below hero on mobile for clarity */}
        {currentUserId !== userId && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <ProfileQRCode userId={userId!} userName={profile.full_name || "user"} />
            <VCardDownloadButton profile={profile} />
          </div>
        )}

        <ProfileJsonLd profile={profile} />

        <div className="flex items-center justify-center mb-3">
          <ProfileViewsCounter profileUserId={userId!} viewerId={currentUserId} />
        </div>

        {currentUserId && currentUserId !== userId && (
          <MutualConnections viewerId={currentUserId} profileUserId={userId!} />
        )}

        <Endorsements profileUserId={userId!} currentUserId={currentUserId} />

        {/* Tip history & totals — visible to everyone, sender names only to owner */}
        <div className="my-4">
          <TipHistory userId={userId!} isOwnProfile={currentUserId === userId} />
        </div>

        {profile.open_to_work && (
          <OpenToWorkBadge details={profile.open_to_work_details} />
        )}

        <ProfileMusicPlayer url={profile.profile_music_url} title={profile.profile_music_title} />

        {/* Voice intro */}
        <VoiceIntro userId={userId!} isOwnProfile={currentUserId === userId} />

        {/* Story Highlights */}
        <StoryHighlights userId={userId!} isOwnProfile={currentUserId === userId} />

        {/* 3D Avatar (if set) */}
        <Avatar3D userId={userId!} />

        {/* Founder Story / Bio */}
        <FounderStory profile={profile as any} />

        {/* Trophy Wall */}
        <AchievementsWall
          userId={userId!}
          stats={{
            posts: stats.postsCount,
            friends: stats.friendsCount,
            contests: stats.submissionsCount,
            courses: stats.completedCoursesCount,
            likes: stats.likesGiven,
            comments: stats.commentsGiven,
            followers: followCounts?.followers || 0,
          }}
        />

        {/* Activity Heatmap */}
        <ActivityHeatmap userId={userId!} />

        {/* Public Goals */}
        <PublicGoals userId={userId!} isOwnProfile={currentUserId === userId} />

        {/* Daily XP Widget - only for own profile */}
        {currentUserId === userId && (
          <div className="mb-6">
            <DailyXPVideoReward userId={userId} />
          </div>
        )}

        {/* Holographic history quick link - own profile only */}
        {currentUserId === userId && (
          <Link to="/holographic-history" className="block mb-6">
            <Card className="p-4 bg-gradient-to-r from-violet-500/10 to-pink-500/10 border-violet-500/30 hover:border-violet-400/60 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  <div>
                    <p className="font-bold text-sm">Holographic History</p>
                    <p className="text-[11px] text-muted-foreground">Battle & breeding archive</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-violet-500/40 text-violet-300 text-[10px]">View</Badge>
              </div>
            </Card>
          </Link>
        )}


        {/* Tabs Section - Central Hub */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="-mx-1 overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex w-max min-w-full gap-1 h-auto p-1">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="listings">
                <Package className="h-4 w-4 mr-1 hidden sm:inline" />
                Listings
              </TabsTrigger>
              <TabsTrigger value="skills">
                <Sparkles className="h-4 w-4 mr-1 hidden sm:inline" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="jobs">
                <Briefcase className="h-4 w-4 mr-1 hidden sm:inline" />
                Jobs
              </TabsTrigger>
              <TabsTrigger value="contests">Contests</TabsTrigger>
              <TabsTrigger value="education">Courses</TabsTrigger>
              <TabsTrigger value="brain-duel">
                <Brain className="h-4 w-4 mr-1 hidden sm:inline" />
                Duel
              </TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="life">
                <Sparkles className="h-4 w-4 mr-1 hidden sm:inline" />
                Life
              </TabsTrigger>
              {currentUserId === userId && (
                <TabsTrigger value="invite">
                  <Gift className="h-4 w-4 mr-1 hidden sm:inline" />
                  Invite
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="posts" className="space-y-4 mt-4">
            {posts.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                This user doesn't have any posts yet
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleRefresh}
                />
              ))
            )}
          </TabsContent>

          {/* My Listings (Bazaar) */}
          <TabsContent value="listings" className="mt-4">
            <MyBazaarListings userId={userId!} isOwnProfile={currentUserId === userId} />
          </TabsContent>

          {/* My Skills (Marketplace/Swap) */}
          <TabsContent value="skills" className="mt-4">
            <MySkillsHub userId={userId!} isOwnProfile={currentUserId === userId} />
          </TabsContent>

          {/* Job Applications */}
          <TabsContent value="jobs" className="mt-4">
            <MyJobApplications userId={userId!} isOwnProfile={currentUserId === userId} />
          </TabsContent>

          <TabsContent value="contests" className="mt-4">
            <UserContests userId={userId!} />
          </TabsContent>

          <TabsContent value="education" className="mt-4">
            <CourseHistory userId={userId} />
          </TabsContent>

          <TabsContent value="brain-duel" className="mt-4">
            <BrainDuelStats userId={userId!} />
          </TabsContent>

          <TabsContent value="friends" className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground flex-1 min-w-0">
                Friends are mutual connections (both accepted).
              </p>
              {currentUserId === userId && (
                <Button size="sm" variant="outline" onClick={() => navigate("/friends")}>
                  Manage all
                </Button>
              )}
            </div>
            {friends.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No friends yet
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {friends.map((friend) => (
                  <Card
                    key={friend.id}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => navigate(`/profile/${friend.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={friend.avatar_url || undefined} />
                        <AvatarFallback>
                          {friend.full_name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{friend.full_name || "No name"}</div>
                        {friend.username && (
                          <div className="text-xs text-muted-foreground truncate">@{friend.username}</div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="life" className="mt-4 space-y-4">
            <LifeEventsTimeline userId={userId!} isOwnProfile={currentUserId === userId} />
            <FamilySection userId={userId!} currentUserId={currentUserId} isOwnProfile={currentUserId === userId} />
          </TabsContent>

          {currentUserId === userId && (
            <TabsContent value="invite" className="mt-4">
              <InviteFriendPanel />
            </TabsContent>
          )}
        </Tabs>

        <FollowersModal
          userId={userId!}
          currentUserId={currentUserId || undefined}
          isOpen={followersModalOpen}
          onClose={() => setFollowersModalOpen(false)}
          defaultTab={followersModalTab}
        />
      </div>
    </div>
  );
};

export default Profile;
