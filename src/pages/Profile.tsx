import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Briefcase, Video, Bookmark, Trophy, GraduationCap, Brain, Package, Sparkles, ArrowRightLeft, Users, UserPlus, UserCheck } from "lucide-react";
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

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  bio: string | null;
  location: string | null;
  birth_date: string | null;
  phone: string | null;
  website: string | null;
  interests: string[] | null;
  occupation: string | null;
  company: string | null;
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
    completedCoursesCount: 0
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
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

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

        setStats({
          postsCount: postsData?.length || 0,
          likesGiven: likesCount || 0,
          commentsGiven: commentsCount || 0,
          friendsCount: friendsData?.length || 0,
          submissionsCount: submissionsCount || 0,
          completedCoursesCount: completedCoursesCount || 0
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
      <div className="container mx-auto px-4 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/wall")}
          className="mb-6 glass-hover rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="glass-post-card p-8 mb-6">
          <div className="flex items-start gap-6 mb-6">
            <Avatar className="h-32 w-32 ring-4 ring-primary/10 ring-offset-4 ring-offset-background">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/20 to-accent/20 font-bold">
                {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold">
                    {profile.full_name || "No name"}
                  </h1>
                  {/* Verified Founder Badge - prominently displayed */}
                  <VerifiedFounderBadge 
                    userName={profile.full_name || ""} 
                    userEmail={profile.email || undefined}
                    userId={userId}
                    size="lg"
                  />
                </div>
                <div className="flex gap-2">
                  {currentUserId === userId ? (
                    <Button variant="outline" size="sm" onClick={() => navigate("/edit-profile")} className="glass-button rounded-xl">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      {friendshipStatus === 'none' && (
                        <Button variant="outline" size="sm" onClick={handleAddFriend}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </Button>
                      )}
                      {friendshipStatus === 'pending_sent' && (
                        <Button variant="outline" size="sm" disabled>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Request Sent
                        </Button>
                      )}
                      {friendshipStatus === 'pending_received' && (
                        <Button variant="outline" size="sm" onClick={handleAcceptFriend}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Accept Request
                        </Button>
                       )}
                       {friendshipStatus === 'accepted' && (
                         <Button variant="outline" size="sm" onClick={handleRemoveFriend}>
                           <Users className="h-4 w-4 mr-2" />
                           Friends
                         </Button>
                       )}
                       <FollowButton
                         userId={userId}
                         currentUserId={currentUserId || undefined}
                         variant="default"
                         size="sm"
                       />
                    </>
                  )}
                </div>
              </div>
              
              {profile.occupation && (
                <p className="text-lg text-muted-foreground mb-2 font-medium">
                  {profile.occupation}
                  {profile.company && ` @ ${profile.company}`}
                </p>
              )}

              {profile.bio && (
                <p className="text-muted-foreground mt-4 leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>

          <Separator className="my-6 opacity-50" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
            )}

            {profile.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {profile.website}
                </a>
              </div>
            )}

            {profile.birth_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(profile.birth_date).toLocaleDateString("sk-SK")}</span>
              </div>
            )}
          </div>

          {profile.interests && profile.interests.length > 0 && (
            <>
              <Separator className="my-6 opacity-30" />
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="glass-button rounded-full px-3 py-1 text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Daily XP Widget - only for own profile */}
        {currentUserId === userId && (
          <div className="mb-8">
            <DailyXPVideoReward userId={userId} />
          </div>
        )}

        {/* Activity Statistics */}
        <div className="glass-post-card p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Activity Statistics</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.postsCount}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div 
              className="text-center cursor-pointer hover:bg-accent rounded-lg p-2 transition-colors"
              onClick={() => {
                setFollowersModalTab("followers");
                setFollowersModalOpen(true);
              }}
            >
              <div className="text-3xl font-bold text-primary">{followCounts?.followers || 0}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div 
              className="text-center cursor-pointer hover:bg-accent rounded-lg p-2 transition-colors"
              onClick={() => {
                setFollowersModalTab("following");
                setFollowersModalOpen(true);
              }}
            >
              <div className="text-3xl font-bold text-primary">{followCounts?.following || 0}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.friendsCount}</div>
              <div className="text-sm text-muted-foreground">Friends</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.submissionsCount}</div>
              <div className="text-sm text-muted-foreground">Contests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.completedCoursesCount}</div>
              <div className="text-sm text-muted-foreground">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.likesGiven}</div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.commentsGiven}</div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </div>
          </div>
        </div>

        {/* Tabs Section - Central Hub */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 h-auto gap-1">
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
          </TabsList>
          
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
            <CourseHistory />
          </TabsContent>

          <TabsContent value="brain-duel" className="mt-4">
            <BrainDuelStats userId={userId!} />
          </TabsContent>

          <TabsContent value="friends" className="mt-4">
            {friends.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No friends yet
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend) => (
                  <Card 
                    key={friend.id} 
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => navigate(`/profile/${friend.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.avatar_url || undefined} />
                        <AvatarFallback>
                          {friend.full_name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{friend.full_name || "No name"}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
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
