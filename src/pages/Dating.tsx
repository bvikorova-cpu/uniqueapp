import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, X, MessageCircle, User, Sparkles, Send, Settings, Trash2, Upload, Image as ImageIcon, RotateCcw, Gift, Zap, Eye, Check, CheckCheck, Camera, Video, Plus, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DatingProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  age: number;
  gender: string;
  looking_for: string;
  location: string | null;
  profile_photo_url: string | null;
  additional_photos: string[] | null;
  interests: string[] | null;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  profile?: DatingProfile;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface GiftType {
  id: string;
  name: string;
  icon: string;
  price: number;
}

interface SentGift {
  id: string;
  sender_id: string;
  gift: GiftType;
  created_at: string;
}

const Dating = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<DatingProfile | null>(null);
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: "",
    age: 18,
    gender: "male",
    looking_for: "female",
    bio: "",
    location: "",
  });
  
  const [profileForm, setProfileForm] = useState({
    display_name: "",
    age: 18,
    gender: "male",
    looking_for: "female",
    bio: "",
    location: "",
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [availableGifts, setAvailableGifts] = useState<GiftType[]>([]);
  const [sentGifts, setSentGifts] = useState<SentGift[]>([]);
  const [canRewind, setCanRewind] = useState(false);
  const [lastSwipe, setLastSwipe] = useState<{ swiped_profile_id: string; action: string } | null>(null);
  const [likesYouCount, setLikesYouCount] = useState(0);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(5);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      await checkSubscription(user.id);
    }
  };

  const checkSubscription = async (userId: string) => {
    const { data } = await supabase
      .from("dating_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    
    if (data) {
      setIsSubscribed(true);
      await loadUserProfile(userId);
      await loadProfiles();
      await loadMatches(userId);
      await loadGifts();
      await loadLikesYou(userId);
      await checkLastSwipe(userId);
    }
  };

  const loadUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("dating_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (data) {
      setCurrentProfile(data);
      setEditForm({
        display_name: data.display_name,
        age: data.age,
        gender: data.gender,
        looking_for: data.looking_for,
        bio: data.bio || "",
        location: data.location || "",
      });
    }
  };

  const loadProfiles = async () => {
    const { data: swipedProfiles } = await supabase
      .from("dating_swipes")
      .select("swiped_id")
      .eq("swiper_id", user?.id || "");

    const swipedIds = swipedProfiles?.map(s => s.swiped_id) || [];

    const { data } = await supabase
      .from("dating_profiles")
      .select("*")
      .eq("is_active", true)
      .neq("user_id", user?.id || "")
      .not("user_id", "in", `(${swipedIds.join(",") || "NULL"})`)
      .limit(20);

    setProfiles(data || []);
  };

  const loadMatches = async (userId: string) => {
    const { data } = await supabase
      .from("dating_matches")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (data) {
      const matchesWithProfiles = await Promise.all(
        data.map(async (match) => {
          const otherId = match.user1_id === userId ? match.user2_id : match.user1_id;
          const { data: profile } = await supabase
            .from("dating_profiles")
            .select("*")
            .eq("user_id", otherId)
            .single();
          return { ...match, profile };
        })
      );
      setMatches(matchesWithProfiles);
    }
  };

  const loadMessages = async (matchId: string) => {
    const { data } = await supabase
      .from("dating_messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    setMessages(data || []);
    
    if (data && data.length > 0) {
      await supabase
        .from("dating_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("match_id", matchId)
        .neq("sender_id", user?.id || "")
        .is("read_at", null);
    }
    
    const { data: gifts } = await supabase
      .from("dating_sent_gifts")
      .select(`
        *,
        gift:gift_id (*)
      `)
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });
    
    setSentGifts(gifts || []);
  };

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must log in to access",
        variant: "destructive",
      });
      return;
    }

    const price = planType === 'monthly' ? 2.00 : 20.00;
    const expiresAt = planType === 'monthly' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from("dating_subscriptions")
      .insert([{
        user_id: user.id,
        price: price,
        subscription_type: planType,
        expires_at: expiresAt.toISOString(),
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to activate subscription",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Subscription has been activated",
      });
      setIsSubscribed(true);
      setShowProfileDialog(true);
    }
  };

  const handleCreateProfile = async () => {
    if (!user || !profileForm.display_name || !profileForm.bio) {
      toast({
        title: "Incomplete Data",
        description: "Fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("dating_profiles")
      .insert([{
        ...profileForm,
        user_id: user.id,
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile has been created",
      });
      setShowProfileDialog(false);
      await loadUserProfile(user.id);
      await loadProfiles();
    }
  };

  const handleSwipe = async (action: "like" | "dislike", isSuper = false) => {
    if (!user || currentIndex >= profiles.length) return;

    const currentCard = profiles[currentIndex];

    await supabase
      .from("dating_last_swipe")
      .upsert({
        user_id: user.id,
        swiped_profile_id: currentCard.user_id,
        action: isSuper ? "super_like" : action,
      });
    
    setCanRewind(true);
    setLastSwipe({ swiped_profile_id: currentCard.user_id, action: isSuper ? "super_like" : action });

    if (isSuper) {
      const { error: superError } = await supabase
        .from("dating_super_likes")
        .insert([{
          swiper_id: user.id,
          swiped_id: currentCard.user_id,
        }]);

      if (superError) {
        toast({
          title: "Error",
          description: "Failed to send Super Like",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "⭐ Super Like!",
        description: `${currentCard.display_name} will be notified!`,
      });
      
      setSuperLikesRemaining(superLikesRemaining - 1);
    }

    const { error } = await supabase
      .from("dating_swipes")
      .insert([{
        swiper_id: user.id,
        swiped_id: currentCard.user_id,
        action: isSuper ? "like" : action,
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save swipe",
        variant: "destructive",
      });
      return;
    }

    if (action === "like" || isSuper) {
      await supabase
        .from("dating_likes_you")
        .insert([{
          liker_id: user.id,
          liked_id: currentCard.user_id,
        }]);

      const { data } = await supabase
        .from("dating_matches")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .or(`user1_id.eq.${currentCard.user_id},user2_id.eq.${currentCard.user_id}`)
        .maybeSingle();

      if (data) {
        toast({
          title: "🎉 It's a Match!",
          description: `You matched with ${currentCard.display_name}!`,
        });
        await loadMatches(user.id);
      }
    }

    setCurrentIndex(currentIndex + 1);
  };

  const handleSendMessage = async () => {
    if (!selectedMatch || !newMessage.trim()) return;

    const { error } = await supabase
      .from("dating_messages")
      .insert([{
        match_id: selectedMatch.id,
        sender_id: user.id,
        content: newMessage,
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } else {
      setNewMessage("");
      await loadMessages(selectedMatch.id);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !currentProfile || !editForm.display_name || !editForm.bio) {
      toast({
        title: "Incomplete Data",
        description: "Fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("dating_profiles")
      .update({
        display_name: editForm.display_name,
        age: editForm.age,
        gender: editForm.gender,
        looking_for: editForm.looking_for,
        bio: editForm.bio,
        location: editForm.location,
      })
      .eq("id", currentProfile.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile has been updated",
      });
      setShowEditDialog(false);
      await loadUserProfile(user.id);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user || !currentProfile) return;

    const { error } = await supabase
      .from("dating_profiles")
      .delete()
      .eq("id", currentProfile.id)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile has been deleted",
      });
      setCurrentProfile(null);
    }
  };

  const handleUploadProfilePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !currentProfile) return;

    // Check if file is image or video
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      toast({
        title: "Invalid File",
        description: "Please upload an image or video file",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-profile-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('dating_profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', currentProfile.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile photo has been uploaded",
      });
      
      await loadUserProfile(user.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUploadAdditionalPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user || !currentProfile) return;

    setUploadingAdditional(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        // Check if file is image or video
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-additional-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      const currentPhotos = currentProfile.additional_photos || [];
      const newPhotos = [...currentPhotos, ...uploadedUrls];

      const { error: updateError } = await supabase
        .from('dating_profiles')
        .update({ additional_photos: newPhotos })
        .eq('id', currentProfile.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `${uploadedUrls.length} media files have been uploaded`,
      });
      
      await loadUserProfile(user.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setUploadingAdditional(false);
    }
  };

  const handleRemoveAdditionalPhoto = async (photoUrl: string) => {
    if (!user || !currentProfile) return;

    const updatedPhotos = (currentProfile.additional_photos || []).filter(url => url !== photoUrl);

    const { error } = await supabase
      .from('dating_profiles')
      .update({ additional_photos: updatedPhotos })
      .eq('id', currentProfile.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove photo",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Photo has been removed",
      });
      await loadUserProfile(user.id);
    }
  };

  const loadGifts = async () => {
    const { data } = await supabase
      .from("dating_gifts")
      .select("*")
      .order("price", { ascending: true });
    
    setAvailableGifts(data || []);
  };

  const handleSendGift = async (giftId: string) => {
    if (!selectedMatch || !user) return;

    const otherId = selectedMatch.user1_id === user.id 
      ? selectedMatch.user2_id 
      : selectedMatch.user1_id;

    const { error } = await supabase
      .from("dating_sent_gifts")
      .insert([{
        sender_id: user.id,
        receiver_id: otherId,
        gift_id: giftId,
        match_id: selectedMatch.id,
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send gift",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Gift Sent! 🎁",
        description: "Your gift has been delivered",
      });
      setShowGiftDialog(false);
      await loadMessages(selectedMatch.id);
    }
  };

  const handleRewind = async () => {
    if (!user || !lastSwipe || !canRewind) return;

    const { error } = await supabase
      .from("dating_swipes")
      .delete()
      .eq("swiper_id", user.id)
      .eq("swiped_id", lastSwipe.swiped_profile_id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to rewind swipe",
        variant: "destructive",
      });
      return;
    }

    setCurrentIndex(Math.max(0, currentIndex - 1));
    setCanRewind(false);
    setLastSwipe(null);

    toast({
      title: "Swipe Rewinded!",
      description: "You can change your mind",
    });
  };

  const checkLastSwipe = async (userId: string) => {
    const { data } = await supabase
      .from("dating_last_swipe")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (data) {
      setCanRewind(true);
      setLastSwipe(data);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    setCancelingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionType: 'dating' }
      });

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: data.message || "Subscription will be cancelled at the end of current period",
      });

      await checkSubscription(user.id);
    } catch (error) {
      console.error('Cancellation error:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setCancelingSubscription(false);
    }
  };

  const loadLikesYou = async (userId: string) => {
    const { data } = await supabase
      .from("dating_likes_you")
      .select("*")
      .eq("liked_id", userId)
      .eq("seen", false);
    
    setLikesYouCount(data?.length || 0);
  };

  const viewLikesYou = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("dating_likes_you")
      .select(`
        *,
        liker:liker_id (
          id,
          dating_profiles (*)
        )
      `)
      .eq("liked_id", user.id)
      .eq("seen", false);

    if (data && data.length > 0) {
      await supabase
        .from("dating_likes_you")
        .update({ seen: true })
        .eq("liked_id", user.id);
      
      toast({
        title: `${data.length} people liked you!`,
        description: "Check their profiles in swipe section",
      });
      
      setLikesYouCount(0);
    } else {
      toast({
        title: "No Likes Yet",
        description: "Keep swiping!",
      });
    }
  };

  const isVideoUrl = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg px-6 py-2">
                <Heart className="h-5 w-5 mr-2" />
                Premium Dating
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Find Your Perfect Match
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join thousands of people who have already found their love story. Swipe, match, and start meaningful conversations!
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
              <Card 
                className={`relative cursor-pointer transition-all hover:scale-105 ${
                  selectedPlan === 'monthly' 
                    ? 'ring-4 ring-pink-500 shadow-2xl shadow-pink-500/50' 
                    : 'hover:ring-2 hover:ring-pink-300'
                }`} 
                onClick={() => setSelectedPlan('monthly')}
              >
                <CardHeader className="text-center pb-8">
                  <div className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
                    2 €
                  </div>
                  <p className="text-xl text-muted-foreground font-medium">per month</p>
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
                      <Heart className="h-6 w-6 text-pink-500 flex-shrink-0" />
                      <span className="text-base">Unlimited swiping</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-purple-500 flex-shrink-0" />
                      <span className="text-base">Chat with matches</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
                      <Sparkles className="h-6 w-6 text-pink-500 flex-shrink-0" />
                      <span className="text-base">Premium filters</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <Camera className="h-6 w-6 text-purple-500 flex-shrink-0" />
                      <span className="text-base">Photo & video profiles</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
                      <Zap className="h-6 w-6 text-pink-500 flex-shrink-0" />
                      <span className="text-base">5 Super Likes daily</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`relative cursor-pointer transition-all hover:scale-105 ${
                  selectedPlan === 'yearly' 
                    ? 'ring-4 ring-purple-500 shadow-2xl shadow-purple-500/50' 
                    : 'hover:ring-2 hover:ring-purple-300'
                }`} 
                onClick={() => setSelectedPlan('yearly')}
              >
                <div className="absolute -top-4 right-6">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base px-4 py-2 shadow-lg">
                    Save 17% 🎉
                  </Badge>
                </div>
                <CardHeader className="text-center pb-8 pt-10">
                  <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
                    20 €
                  </div>
                  <p className="text-xl text-muted-foreground font-medium">per year</p>
                  <p className="text-lg text-green-500 font-semibold mt-2">Only 1.67 € / month</p>
                </CardHeader>
                <CardContent className="space-y-4 pb-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <Heart className="h-6 w-6 text-purple-500 flex-shrink-0" />
                      <span className="text-base">Unlimited swiping</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
                      <MessageCircle className="h-6 w-6 text-pink-500 flex-shrink-0" />
                      <span className="text-base">Chat with matches</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <Sparkles className="h-6 w-6 text-purple-500 flex-shrink-0" />
                      <span className="text-base">Premium filters</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
                      <Camera className="h-6 w-6 text-pink-500 flex-shrink-0" />
                      <span className="text-base">Photo & video profiles</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <Zap className="h-6 w-6 text-purple-500 flex-shrink-0" />
                      <span className="text-base">5 Super Likes daily</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={() => handleSubscribe(selectedPlan)} 
              size="lg"
              className="w-full max-w-md mx-auto text-lg py-6 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 hover:from-pink-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all"
            >
              <Heart className="mr-2 h-5 w-5" />
              Start Your Journey ({selectedPlan === 'monthly' ? '2 €/month' : '20 €/year'})
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              Cancel anytime • Secure payment • Money back guarantee
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <Dialog open={true} onOpenChange={(open) => {
        if (!open) {
          navigate('/');
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Create Your Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Display Name *</label>
                <Input
                  value={profileForm.display_name}
                  onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                  placeholder="Your name"
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Age *</label>
                <Input
                  type="number"
                  min="18"
                  max="99"
                  value={profileForm.age}
                  onChange={(e) => setProfileForm({ ...profileForm, age: parseInt(e.target.value) })}
                  className="text-base"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">I am</label>
                <select 
                  className="w-full p-3 border rounded-lg bg-background text-foreground text-base"
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Looking For</label>
                <select 
                  className="w-full p-3 border rounded-lg bg-background text-foreground text-base"
                  value={profileForm.looking_for}
                  onChange={(e) => setProfileForm({ ...profileForm, looking_for: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">About Me *</label>
              <Textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Tell others about yourself, your hobbies, what you're looking for..."
                className="min-h-32 text-base"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                placeholder="City, Country"
                className="text-base"
              />
            </div>

            <Button 
              onClick={handleCreateProfile} 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-lg py-6"
            >
              <Heart className="mr-2" />
              Create Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-purple-50/50 to-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <Tabs defaultValue="swipe" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8 h-14 bg-background/80 backdrop-blur">
            <TabsTrigger value="swipe" className="text-base">
              <Heart className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-base">
              <MessageCircle className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Matches</span> ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="likes" className="text-base">
              <Eye className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Likes</span> ({likesYouCount})
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-base">
              <Settings className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Swipe Tab */}
          <TabsContent value="swipe" className="flex justify-center">
            {currentIndex < profiles.length ? (
              <Card className="w-full max-w-md shadow-2xl border-2">
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-pink-100 to-purple-100 rounded-t-lg overflow-hidden group">
                    {profiles[currentIndex].profile_photo_url ? (
                      <>
                        {isVideoUrl(profiles[currentIndex].profile_photo_url!) ? (
                          <video
                            src={profiles[currentIndex].profile_photo_url!}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setLightboxImage(profiles[currentIndex].profile_photo_url)}
                            autoPlay
                            loop
                            muted
                          />
                        ) : (
                          <img
                            src={profiles[currentIndex].profile_photo_url!}
                            alt={profiles[currentIndex].display_name}
                            className="w-full h-full object-cover cursor-pointer transform group-hover:scale-105 transition-transform duration-300"
                            onClick={() => setLightboxImage(profiles[currentIndex].profile_photo_url)}
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-32 w-32 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
                      <h2 className="text-3xl font-bold mb-1">
                        {profiles[currentIndex].display_name}, {profiles[currentIndex].age}
                      </h2>
                      {profiles[currentIndex].location && (
                        <p className="text-white/90 mb-2 flex items-center">
                          📍 {profiles[currentIndex].location}
                        </p>
                      )}
                      {profiles[currentIndex].bio && (
                        <p className="text-sm text-white/80 line-clamp-3">{profiles[currentIndex].bio}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex gap-3 justify-center items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={!canRewind}
                        onClick={handleRewind}
                        className="h-14 w-14 rounded-full hover:bg-yellow-100 hover:border-yellow-500"
                      >
                        <RotateCcw className="h-6 w-6 text-yellow-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSwipe("dislike")}
                        className="h-16 w-16 rounded-full hover:bg-red-100 hover:border-red-500"
                      >
                        <X className="h-8 w-8 text-red-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSwipe("like", true)}
                        disabled={superLikesRemaining === 0}
                        className="h-14 w-14 rounded-full hover:bg-blue-100 hover:border-blue-500"
                      >
                        <Sparkles className="h-6 w-6 text-blue-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSwipe("like")}
                        className="h-16 w-16 rounded-full hover:bg-green-100 hover:border-green-500"
                      >
                        <Heart className="h-8 w-8 text-green-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={viewLikesYou}
                        className="h-14 w-14 rounded-full hover:bg-purple-100 hover:border-purple-500"
                      >
                        <Eye className="h-6 w-6 text-purple-500" />
                      </Button>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                      {superLikesRemaining} Super Likes remaining
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full max-w-md p-12">
                <div className="text-center space-y-4">
                  <User className="h-24 w-24 mx-auto text-muted-foreground" />
                  <h3 className="text-2xl font-bold">No More Profiles</h3>
                  <p className="text-muted-foreground">
                    You've seen everyone! Check back later for new people.
                  </p>
                  <Button onClick={() => loadProfiles()} className="mt-4">
                    Refresh
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches">
            {selectedMatch ? (
              <Card className="max-w-4xl mx-auto shadow-xl">
                <CardHeader className="border-b bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedMatch(null)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
                        {selectedMatch.profile?.display_name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{selectedMatch.profile?.display_name}</h3>
                        <p className="text-sm text-muted-foreground">Online</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowGiftDialog(true)}
                      className="ml-auto"
                    >
                      <Gift className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] p-6">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                              msg.sender_id === user?.id
                                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <div className="flex items-center gap-1 mt-1 justify-end">
                              <span className={`text-xs ${msg.sender_id === user?.id ? "text-white/70" : "text-muted-foreground"}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {msg.sender_id === user?.id && (
                                msg.read_at ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {sentGifts.map((gift) => (
                        <div
                          key={gift.id}
                          className={`flex ${gift.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl px-6 py-4 text-center">
                            <div className="text-4xl mb-2">{gift.gift.icon}</div>
                            <p className="font-semibold">{gift.gift.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="border-t p-4 bg-background">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} size="icon" className="bg-gradient-to-r from-pink-500 to-purple-500">
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {matches.map((match) => (
                  <Card
                    key={match.id}
                    className="cursor-pointer hover:shadow-xl transition-all hover:scale-105"
                    onClick={() => {
                      setSelectedMatch(match);
                      loadMessages(match.id);
                    }}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-t-lg overflow-hidden">
                        {match.profile?.profile_photo_url ? (
                          <>
                            {isVideoUrl(match.profile.profile_photo_url) ? (
                              <video
                                src={match.profile.profile_photo_url}
                                className="w-full h-full object-cover"
                                muted
                              />
                            ) : (
                              <img
                                src={match.profile.profile_photo_url}
                                alt={match.profile.display_name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold truncate">{match.profile?.display_name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {match.profile?.age} • {match.profile?.location}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {matches.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Matches Yet</h3>
                    <p className="text-muted-foreground">
                      Start swiping to find your perfect match!
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Likes You Tab */}
          <TabsContent value="likes">
            <Card className="max-w-2xl mx-auto p-8 text-center">
              <div className="space-y-6">
                <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <Eye className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {likesYouCount} {likesYouCount === 1 ? "Person" : "People"} Like You
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    See who's interested in you and make the first move!
                  </p>
                </div>
                <Button
                  onClick={viewLikesYou}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-lg px-8 py-6"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  View Likes
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="max-w-2xl mx-auto shadow-xl">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">My Profile</h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditDialog(true)}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Profile Photo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Profile Photo</h3>
                    <label htmlFor="profile-photo-upload">
                      <Button variant="outline" size="sm" asChild className="cursor-pointer">
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          {uploadingPhoto ? "Uploading..." : "Upload Photo/Video"}
                        </span>
                      </Button>
                      <input
                        id="profile-photo-upload"
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleUploadProfilePhoto}
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                  <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl overflow-hidden">
                    {currentProfile.profile_photo_url ? (
                      <>
                        {isVideoUrl(currentProfile.profile_photo_url) ? (
                          <video
                            src={currentProfile.profile_photo_url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={currentProfile.profile_photo_url}
                            alt={currentProfile.display_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-32 w-32 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Media */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Additional Photos & Videos</h3>
                    <label htmlFor="additional-photos-upload">
                      <Button variant="outline" size="sm" asChild className="cursor-pointer">
                        <span>
                          <Plus className="h-4 w-4 mr-2" />
                          {uploadingAdditional ? "Uploading..." : "Add Media"}
                        </span>
                      </Button>
                      <input
                        id="additional-photos-upload"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={handleUploadAdditionalPhotos}
                        disabled={uploadingAdditional}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {currentProfile.additional_photos?.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                        {isVideoUrl(photo) ? (
                          <video
                            src={photo}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={photo}
                            alt={`Additional ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          onClick={() => handleRemoveAdditionalPhoto(photo)}
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Name & Age</h3>
                    <p className="text-lg font-semibold">{currentProfile.display_name}, {currentProfile.age}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Looking For</h3>
                    <p className="text-lg">{currentProfile.looking_for}</p>
                  </div>
                  {currentProfile.location && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                      <p className="text-lg">📍 {currentProfile.location}</p>
                    </div>
                  )}
                  {currentProfile.bio && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">About Me</h3>
                      <p className="text-base whitespace-pre-wrap">{currentProfile.bio}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Profile
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your profile and remove all your data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="flex-1" disabled={cancelingSubscription}>
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will lose access to premium features at the end of your current billing period.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription}>
                          {cancelingSubscription ? "Canceling..." : "Cancel Subscription"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Display Name</label>
                <Input
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Age</label>
                <Input
                  type="number"
                  min="18"
                  max="99"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Gender</label>
                <select 
                  className="w-full p-3 border rounded-lg bg-background text-foreground"
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Looking For</label>
                <select 
                  className="w-full p-3 border rounded-lg bg-background text-foreground"
                  value={editForm.looking_for}
                  onChange={(e) => setEditForm({ ...editForm, looking_for: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">About Me</label>
              <Textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Write something about yourself..."
                className="min-h-32"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleUpdateProfile} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gift Dialog */}
      <Dialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a Gift 🎁</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            {availableGifts.map((gift) => (
              <Card
                key={gift.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => handleSendGift(gift.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{gift.icon}</div>
                  <p className="text-sm font-semibold mb-1">{gift.name}</p>
                  <p className="text-xs text-muted-foreground">{gift.price} €</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          {isVideoUrl(lightboxImage) ? (
            <video
              src={lightboxImage}
              className="max-w-full max-h-full"
              controls
              autoPlay
            />
          ) : (
            <img
              src={lightboxImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dating;