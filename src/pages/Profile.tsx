import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Briefcase, Video, Bookmark, Trophy, GraduationCap, Brain, Package, Sparkles, ArrowRightLeft, Users, UserPlus, UserCheck, Gift } from "lucide-react";
// FreeTierBalanceWidget import removed — paid-only model
import { FreeTierHistory } from "@/components/credits/FreeTierHistory";
import { StreakMultiplierCard } from "@/components/gamification/StreakMultiplierCard";
import { VictoryCardGenerator } from "@/components/social/VictoryCardGenerator";
import { ProfileMilestones } from "@/components/profile/ProfileMilestones";
import CreatorAnalyticsWidget from "@/components/analytics/CreatorAnalyticsWidget";
import { InviteFriendPanel } from "@/components/referral/InviteFriendPanel";
import { BrainDuelStats } from "@/components/profile/BrainDuelStats";
import { useToast } from "@/hooks/use-toast";
import PostCard from "@/components/feed/PostCard";
import { CourseHistory } from "@/components/profile/CourseHistory";
import { UserContests } from "@/components/profile/UserContests";
import { FollowersModal } from "@/components/profile/FollowersModal";
import { useFollowCounts } from "@/hooks/useFollow";
import { DailyXPVideoReward } from "@/components/gamification/DailyXPVideoReward";
import { MyBazaarListings } from "@/components/profile/MyBazaarListings";
import { MySkillsHub } from "@/components/profile/MySkillsHub";
import { MyJobApplications } from "@/components/profile/MyJobApplications";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { AchievementsWall } from "@/components/profile/AchievementsWall";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { FounderStory } from "@/components/profile/FounderStory";
import { StoryHighlights } from "@/components/profile/StoryHighlights";
import { VoiceIntro } from "@/components/profile/VoiceIntro";
import { Avatar3D } from "@/components/profile/Avatar3D";
import { PublicGoals } from "@/components/profile/PublicGoals";
import { ProfileJsonLd } from "@/components/profile/ProfileJsonLd";
import { OpenToWorkBadge } from "@/components/profile/OpenToWork";
import { ProfileMusicPlayer } from "@/components/profile/ProfileMusicPlayer";
import { MutualConnections } from "@/components/profile/MutualConnections";
import { VCardDownloadButton } from "@/components/profile/VCardDownloadButton";
import { TipJar } from "@/components/profile/TipJar";
import { ProfileQRCode } from "@/components/profile/ProfileQRCode";
import { ThemePicker } from "@/components/profile/ThemePicker";
import { Endorsements } from "@/components/profile/Endorsements";
import { ProfileViewsCounter } from "@/components/profile/ProfileViewsCounter";
import { LifeEventsTimeline } from "@/components/profile/LifeEventsTimeline";
import { FamilySection } from "@/components/profile/FamilySection";
import { XpBreakdown } from "@/components/profile/XpBreakdown";

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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });
  }, []);

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
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("public_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(`
            *,
            media (*)
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;
        
        // Add profiles data to posts
        const postsWithProfiles = (postsData || []).map(post => ({
          ...post,
          profiles: {
            id: profileData.id,
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url
          }
        }));
        
        setPosts(postsWithProfiles);

        // Fetch friendship status if viewing someone else's profile
        if (currentUserId && currentUserId !== userId) {
          const { data: friendshipData } = await supabase
            .from("friendships")
            .select("*")
            .or(`and(user_id.eq.${currentUserId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUserId})`)
            .maybeSingle();

          if (friendshipData) {
            if (friendshipData.status === 'accepted') {
              setFriendshipStatus('accepted');
            } else if (friendshipData.user_id === currentUserId) {
              setFriendshipStatus('pending_sent');
            } else {
              setFriendshipStatus('pending_received');
            }
          }
        }

        // Fetch friends list
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

        // Fetch activity statistics
        const { count: likesCount } = await supabase
          .from("post_likes")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId);

        const { count: commentsCount } = await supabase
          .from("post_comments")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId);

        const { count: submissionsCount } = await supabase
          .from("talent_submissions")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId);

        const { count: completedCoursesCount } = await supabase
          .from("completed_courses")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId);

        // Real XP & level from user_points (publicly readable)
        const { data: pointsData } = await supabase
          .from("user_points")
          .select("total_points, level")
          .eq("user_id", userId)
          .maybeSingle();

        setStats({
          postsCount: postsData?.length || 0,
          likesGiven: likesCount || 0,
          commentsGiven: commentsCount || 0,
          friendsCount: friendsData?.length || 0,
          submissionsCount: submissionsCount || 0,
          completedCoursesCount: completedCoursesCount || 0,
          xp: pointsData?.total_points ?? 0,
          level: pointsData?.level ?? 1,
        });

      } catch (error: any) {
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPosts();
  }, [userId, currentUserId, toast]);

  const handleAddFriend = async () => {
    if (!currentUserId || !userId) return;

    try {
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
          profile={profile}
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
                <Button onClick={handleAddFriend} className="bg-gradient-to-r from-amber-500 to-pink-500 text-white border-0 shadow-lg w-full sm:w-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
              )}
              {friendshipStatus === 'pending_sent' && (
                <Button variant="outline" size="sm" disabled className="bg-card/80 backdrop-blur-md">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sent
                </Button>
              )}
              {friendshipStatus === 'pending_received' && (
                <Button onClick={handleAcceptFriend} className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white border-0 shadow-lg w-full sm:w-auto">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Accept Friend
                </Button>
              )}
              {friendshipStatus === 'accepted' && (
                <Button variant="outline" size="sm" onClick={handleRemoveFriend} className="bg-card/80 backdrop-blur-md border-emerald-400/40">
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
        <FounderStory profile={profile} />

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
