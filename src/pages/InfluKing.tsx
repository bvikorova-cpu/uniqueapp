import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, Users, Heart, Eye, TrendingUp, Camera, Plus, CheckCircle, Star, Upload, ExternalLink, Gift } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { GoLiveButton } from "@/components/influencer/GoLiveButton";
import { SendInfluencerGiftDialog } from "@/components/influencer/SendInfluencerGiftDialog";
import { useNavigate } from "react-router-dom";

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
  "Fashion & Beauty",
  "Gaming",
  "Fitness & Health",
  "Travel",
  "Food & Cooking",
  "Technology",
  "Music",
  "Comedy",
  "Education",
  "Lifestyle",
  "Business",
  "Art & Design",
];

const InfluKing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
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
    display_name: "",
    bio: "",
    category: CATEGORIES[0],
    profile_photo_url: "",
    cover_photo_url: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    twitter: "",
  });

  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    media_url: "",
    media_type: "image",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user's influencer profile
  const { data: myProfile } = useQuery({
    queryKey: ["myInfluencerProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      return data as InfluencerProfile | null;
    },
    enabled: !!user,
  });

  // Fetch top influencers
  const { data: topInfluencers = [], isLoading } = useQuery({
    queryKey: ["topInfluencers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("is_active", true)
        .order("followers_count", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as InfluencerProfile[];
    },
  });

  // Fetch follow status for all influencers
  useEffect(() => {
    if (!user || topInfluencers.length === 0) return;

    const fetchFollowStatus = async () => {
      const { data } = await supabase
        .from("influencer_followers")
        .select("influencer_id")
        .eq("follower_id", user.id)
        .in("influencer_id", topInfluencers.map(i => i.id));

      const statusMap: Record<string, boolean> = {};
      data?.forEach(item => {
        statusMap[item.influencer_id] = true;
      });
      setFollowStatusMap(statusMap);
    };

    fetchFollowStatus();
  }, [user, topInfluencers]);

  // Fetch influencer posts
  const { data: influencerPosts = [] } = useQuery({
    queryKey: ["influencerPosts", selectedInfluencer?.id],
    queryFn: async () => {
      if (!selectedInfluencer) return [];
      const { data, error } = await supabase
        .from("influencer_posts")
        .select("*")
        .eq("influencer_id", selectedInfluencer.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InfluencerPost[];
    },
    enabled: !!selectedInfluencer,
  });

  // Check if following
  const { data: isFollowing } = useQuery({
    queryKey: ["isFollowing", selectedInfluencer?.id, user?.id],
    queryFn: async () => {
      if (!user || !selectedInfluencer) return false;
      const { data } = await supabase
        .from("influencer_followers")
        .select("id")
        .eq("influencer_id", selectedInfluencer.id)
        .eq("follower_id", user.id)
        .maybeSingle();
      
      return !!data;
    },
    enabled: !!user && !!selectedInfluencer,
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase.from("influencer_profiles").insert([{
        user_id: user.id,
        display_name: newProfile.display_name,
        bio: newProfile.bio,
        category: newProfile.category,
        profile_photo_url: newProfile.profile_photo_url || null,
        cover_photo_url: newProfile.cover_photo_url || null,
        social_links: {
          instagram: newProfile.instagram || null,
          tiktok: newProfile.tiktok || null,
          youtube: newProfile.youtube || null,
          twitter: newProfile.twitter || null,
        },
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInfluencerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["topInfluencers"] });
      setShowCreateDialog(false);
      toast({
        title: "✅ Profile Created",
        description: "Your influencer profile has been successfully created!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  // Upload media to storage
  const uploadMediaToStorage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    setUploadingMedia(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingMedia(false);
    }
  };

  // Upload profile photo
  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setUploadingProfilePhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/profile-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      setNewProfile({ ...newProfile, profile_photo_url: publicUrl });
      toast({
        title: "Photo Uploaded",
        description: "Profile photo has been uploaded",
      });
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  // Upload cover photo
  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    setUploadingCoverPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/cover-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      setNewProfile({ ...newProfile, cover_photo_url: publicUrl });
      toast({
        title: "Photo Uploaded",
        description: "Cover photo has been uploaded",
      });
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingCoverPhoto(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    const url = await uploadMediaToStorage(file);
    
    if (url) {
      setNewPost({ ...newPost, media_url: url, media_type: mediaType });
      toast({
        title: "File Uploaded",
        description: "You can continue adding your post",
      });
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
        
        const url = await uploadMediaToStorage(file);
        if (url) {
          setNewPost({ ...newPost, media_url: url, media_type: 'video' });
          toast({
            title: "Recording Saved",
            description: "Video has been successfully uploaded",
          });
        }
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordedChunks([]);
      
    } catch (error: any) {
      toast({
        title: "Camera Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!myProfile) throw new Error("Need influencer profile");

      const { error } = await supabase.from("influencer_posts").insert([{
        influencer_id: myProfile.id,
        title: newPost.title || null,
        content: newPost.content || null,
        media_url: newPost.media_url || null,
        media_type: newPost.media_type,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["influencerPosts"] });
      setShowPostDialog(false);
      setNewPost({ title: "", content: "", media_url: "", media_type: "image" });
      toast({
        title: "✅ Post Added",
        description: "Your post has been successfully published!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to add post",
        variant: "destructive",
      });
    },
  });

  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: async ({ influencerId, follow }: { influencerId: string; follow: boolean }) => {
      if (!user) throw new Error("Must be logged in");

      if (follow) {
        const { error } = await supabase.from("influencer_followers").insert([{
          influencer_id: influencerId,
          follower_id: user.id,
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("influencer_followers")
          .delete()
          .eq("influencer_id", influencerId)
          .eq("follower_id", user.id);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Update local state
      setFollowStatusMap(prev => ({
        ...prev,
        [variables.influencerId]: variables.follow
      }));
      queryClient.invalidateQueries({ queryKey: ["isFollowing"] });
      queryClient.invalidateQueries({ queryKey: ["topInfluencers"] });
      toast({
        title: variables.follow ? "✅ Following" : "❌ Unfollowed",
        description: variables.follow ? "You are now following this influencer" : "You stopped following this influencer",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Must be logged in");

      // Check if already liked
      const { data: existing } = await supabase
        .from("influencer_post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Unlike
        const { error } = await supabase
          .from("influencer_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase.from("influencer_post_likes").insert([{
          post_id: postId,
          user_id: user.id,
        }]);
        if (error) throw error;
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
            <CardDescription>
              You need to log in to access Influ-King
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/auth"}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="h-12 w-12 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Influ-King
            </h1>
            <Crown className="h-12 w-12 text-yellow-500" />
          </div>
          <p className="text-muted-foreground text-lg mb-6">
            Become a TOP influencer in the world!
          </p>

          {/* Detailed Description Section */}
          <Card className="max-w-4xl mx-auto mb-8 text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                What is Influ-King?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong>Influ-King</strong> is your ultimate platform to build and grow your influencer career. 
                Create your professional profile, share engaging content, attract followers, and climb the leaderboard 
                to become a TOP influencer recognized worldwide.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">How to Get Started:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                  <li><strong>Create Your Profile</strong> – Click "Become an Influencer" to set up your professional influencer profile with bio, photos, and social media links.</li>
                  <li><strong>Share Content</strong> – Post photos and videos to engage your audience. Use the "Add Post" button to upload or record content directly.</li>
                  <li><strong>Grow Your Following</strong> – The more engaging your content, the more followers you will attract. Your rank improves as your follower count increases.</li>
                  <li><strong>Go Live</strong> – Start live streams to interact with your fans in real-time and boost engagement.</li>
                  <li><strong>Receive Gifts & Tips</strong> – Your followers can send you virtual gifts and tips as appreciation for your content.</li>
                  <li><strong>Track Earnings</strong> – Monitor your earnings from gifts, tips, and sponsorships in your personal dashboard.</li>
                  <li><strong>Withdraw Earnings</strong> – Request withdrawals when your balance reaches the minimum threshold (€50).</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Key Features:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span>Leaderboard ranking system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Follower management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-pink-500" />
                    <span>Gift & tip monetization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-500" />
                    <span>Live streaming capability</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Earnings tracking & withdrawal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Verified influencer badges</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground border-t pt-3">
                <strong>Tip:</strong> Consistency is key! Post regularly, engage with your followers, and use trending topics to maximize your reach and earnings potential.
              </p>
            </CardContent>
          </Card>

          {myProfile ? (
            <div className="flex items-center justify-center gap-4">
              <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>New Post</DialogTitle>
                    <DialogDescription>
                      Publish new content for your followers
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="post-title">Title</Label>
                      <Input
                        id="post-title"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        placeholder="Enter title..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="post-content">Content</Label>
                      <Textarea
                        id="post-content"
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="Write something interesting..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Foto/Video</Label>
                      
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                            disabled={uploadingMedia || isRecording}
                            className="cursor-pointer"
                          />
                        </div>
                        
                        {!isRecording ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={startRecording}
                            disabled={uploadingMedia}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Start Camera
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={stopRecording}
                          >
                            Stop Recording
                          </Button>
                        )}
                      </div>
                      
                      {newPost.media_url && (
                        <div className="mt-3">
                          {newPost.media_type === 'video' ? (
                            <video 
                              src={newPost.media_url} 
                              controls 
                              className="w-full rounded-lg max-h-64"
                            />
                          ) : (
                            <img 
                              src={newPost.media_url} 
                              alt="Preview" 
                              className="w-full rounded-lg max-h-64 object-cover"
                            />
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => createPostMutation.mutate()}
                      disabled={createPostMutation.isPending || uploadingMedia || isRecording}
                    >
                      {uploadingMedia ? "Uploading..." : createPostMutation.isPending ? "Adding..." : "Publish"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <GoLiveButton influencerId={myProfile.id} />
              <Button variant="outline" onClick={() => navigate("/influencer/earnings")}>
                My Earnings
              </Button>
              <Button variant="outline" onClick={() => setSelectedInfluencer(myProfile)}>
                My Profile
              </Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  if (!myProfile || !user) return;
                  
                  const confirmDelete = window.confirm('Do you really want to delete your influencer profile? This action is irreversible.');
                  if (!confirmDelete) return;
                  
                  const { error } = await supabase
                    .from('influencer_profiles')
                    .delete()
                    .eq('id', myProfile.id)
                    .eq('user_id', user.id);
                  
                  if (error) {
                    toast({
                      title: "❌ Error",
                      description: "Failed to delete profile",
                      variant: "destructive",
                    });
                  } else {
                    queryClient.invalidateQueries({ queryKey: ["myInfluencerProfile"] });
                    queryClient.invalidateQueries({ queryKey: ["topInfluencers"] });
                    toast({
                      title: "✅ Profile Deleted",
                      description: "Your influencer profile has been removed",
                    });
                  }
                }}
              >
                Delete Profile
              </Button>
            </div>
          ) : (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Star className="h-5 w-5 mr-2" />
                  Become an Influencer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Your Influencer Profile</DialogTitle>
                  <DialogDescription>
                    Start your path to fame!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name / Nickname *</Label>
                    <Input
                      id="name"
                      value={newProfile.display_name}
                      onChange={(e) => setNewProfile({ ...newProfile, display_name: e.target.value })}
                      placeholder="e.g. @influencer_king"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">About Me</Label>
                    <Textarea
                      id="bio"
                      value={newProfile.bio}
                      onChange={(e) => setNewProfile({ ...newProfile, bio: e.target.value })}
                      placeholder="Write something about yourself..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={newProfile.category}
                      onChange={(e) => setNewProfile({ ...newProfile, category: e.target.value })}
                      className="w-full p-2 border rounded-md bg-black text-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-black text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-photo">Profile Photo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="profile-photo"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoUpload}
                        disabled={uploadingProfilePhoto}
                        className="flex-1"
                      />
                      {uploadingProfilePhoto && (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    {newProfile.profile_photo_url && (
                      <div className="mt-2">
                        <img 
                          src={newProfile.profile_photo_url} 
                          alt="Profile preview" 
                          className="w-20 h-20 object-cover rounded-full border-2 border-border"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Or enter URL:</p>
                    <Input
                      value={newProfile.profile_photo_url}
                      onChange={(e) => setNewProfile({ ...newProfile, profile_photo_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cover-photo">Cover Photo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cover-photo"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverPhotoUpload}
                        disabled={uploadingCoverPhoto}
                        className="flex-1"
                      />
                      {uploadingCoverPhoto && (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    {newProfile.cover_photo_url && (
                      <div className="mt-2">
                        <img 
                          src={newProfile.cover_photo_url} 
                          alt="Cover preview" 
                          className="w-full h-32 object-cover rounded-lg border-2 border-border"
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Or enter URL:</p>
                    <Input
                      value={newProfile.cover_photo_url}
                      onChange={(e) => setNewProfile({ ...newProfile, cover_photo_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={newProfile.instagram}
                        onChange={(e) => setNewProfile({ ...newProfile, instagram: e.target.value })}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiktok">TikTok</Label>
                      <Input
                        id="tiktok"
                        value={newProfile.tiktok}
                        onChange={(e) => setNewProfile({ ...newProfile, tiktok: e.target.value })}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        value={newProfile.youtube}
                        onChange={(e) => setNewProfile({ ...newProfile, youtube: e.target.value })}
                        placeholder="@channel"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">Twitter/X</Label>
                      <Input
                        id="twitter"
                        value={newProfile.twitter}
                        onChange={(e) => setNewProfile({ ...newProfile, twitter: e.target.value })}
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => createProfileMutation.mutate()}
                    disabled={createProfileMutation.isPending}
                  >
                    {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Influencer Detail Dialog */}
        <Dialog open={!!selectedInfluencer} onOpenChange={() => setSelectedInfluencer(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedInfluencer && (
              <>
                {/* Cover Photo */}
                {selectedInfluencer.cover_photo_url && (
                  <div className="h-48 -mt-6 -mx-6 mb-4 rounded-t-lg overflow-hidden">
                    <img
                      src={selectedInfluencer.cover_photo_url}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
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
                      {selectedInfluencer.is_verified && (
                        <CheckCircle className="h-6 w-6 text-blue-500 fill-blue-500" />
                      )}
                    </div>
                    <Badge className="mb-3 bg-black text-white hover:bg-black/90">{selectedInfluencer.category}</Badge>
                    <p className="text-muted-foreground mb-4">{selectedInfluencer.bio}</p>
                    
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="font-bold">{selectedInfluencer.followers_count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">followers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-muted-foreground" />
                        <span className="font-bold">{selectedInfluencer.total_likes.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">likes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-muted-foreground" />
                        <span className="font-bold">{selectedInfluencer.total_views.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">views</span>
                      </div>
                    </div>

                    {selectedInfluencer.user_id !== user?.id && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => followMutation.mutate({ 
                            influencerId: selectedInfluencer.id, 
                            follow: !isFollowing 
                          })}
                          disabled={followMutation.isPending}
                          variant={isFollowing ? "outline" : "default"}
                        >
                          {isFollowing ? "Following" : "Follow"}
                        </Button>
                        <Button
                          onClick={() => setShowGiftDialog(true)}
                          variant="outline"
                          className="gap-2"
                        >
                          <Gift className="h-4 w-4" />
                          Send Gift
                        </Button>
                      </div>
                    )}

                    {/* Social Links */}
                    {selectedInfluencer.social_links && (
                      <div className="flex items-center gap-3 mt-4">
                        {selectedInfluencer.social_links.instagram && (
                          <a
                            href={`https://instagram.com/${selectedInfluencer.social_links.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Posts */}
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => likePostMutation.mutate(post.id)}
                                disabled={likePostMutation.isPending}
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                {post.likes_count}
                              </Button>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                {post.views_count}
                              </div>
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

        {/* Send Gift Dialog */}
        {selectedInfluencer && (
          <SendInfluencerGiftDialog
            open={showGiftDialog}
            onOpenChange={setShowGiftDialog}
            influencerId={selectedInfluencer.id}
            influencerName={selectedInfluencer.display_name}
          />
        )}

        {/* Top Influencers Leaderboard */}
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
                TOP Influencers
              </CardTitle>
              <CardDescription>
                Leaderboard of top influencers by follower count
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : topInfluencers.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No influencers yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topInfluencers.map((influencer, index) => (
                    <div
                      key={influencer.id}
                      onClick={() => setSelectedInfluencer(influencer)}
                      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all hover:bg-accent ${
                        index < 3 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : ""
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12">
                        {index === 0 && <Crown className="h-8 w-8 text-yellow-500" />}
                        {index === 1 && <Crown className="h-7 w-7 text-gray-400" />}
                        {index === 2 && <Crown className="h-6 w-6 text-orange-600" />}
                        {index > 2 && (
                          <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                        )}
                      </div>
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={influencer.profile_photo_url || undefined} />
                        <AvatarFallback>{influencer.display_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{influencer.display_name}</h3>
                          {influencer.is_verified && (
                            <CheckCircle className="h-5 w-5 text-blue-500 fill-blue-500" />
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {influencer.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-6 text-sm mr-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-bold">{influencer.followers_count.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-muted-foreground" />
                            <span className="font-bold">{influencer.total_likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="font-bold">{influencer.total_views.toLocaleString()}</span>
                          </div>
                        </div>
                        {user && influencer.user_id !== user.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const isCurrentlyFollowing = followStatusMap[influencer.id] || false;
                              followMutation.mutate({ 
                                influencerId: influencer.id, 
                                follow: !isCurrentlyFollowing 
                              });
                            }}
                            disabled={followMutation.isPending}
                          >
                            {followStatusMap[influencer.id] ? "Following" : "Follow"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InfluKing;
