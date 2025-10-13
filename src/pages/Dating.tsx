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
import { Heart, X, MessageCircle, User, Sparkles, Send, Settings, Trash2, Upload, Image as ImageIcon, RotateCcw, Gift, Zap, Eye, Check, CheckCheck } from "lucide-react";
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
    
    // Mark messages as read
    if (data && data.length > 0) {
      await supabase
        .from("dating_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("match_id", matchId)
        .neq("sender_id", user?.id || "")
        .is("read_at", null);
    }
    
    // Load sent gifts
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

    // Placeholder for payment gateway integration
    // TODO: Integrate Tatra Banka payment gateway here
    toast({
      title: "Payment Ready",
      description: "Tatra Banka payment gateway integration will be here",
    });

    // For now, activate subscription directly (remove this when payment is integrated)
    const price = planType === 'monthly' ? 2.00 : 20.00;
    const expiresAt = planType === 'monthly' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days

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

    // Save last swipe for rewind
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
      // Track in likes_you for the other person
      await supabase
        .from("dating_likes_you")
        .insert([{
          liker_id: user.id,
          liked_id: currentCard.user_id,
        }]);

      // Check if it's a match
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
        description: `${uploadedUrls.length} photos have been uploaded`,
      });
      
      await loadUserProfile(user.id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload photos",
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

    // Delete the last swipe
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

    // Go back to previous profile
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
      // Mark as seen
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

  // Subscription landing page
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  
  if (!isSubscribed) {

    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-8">
            <Badge className="bg-pink-500 text-white">
              <Heart className="h-4 w-4 mr-1" />
              Dating
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Find Your Love
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of people who have already found their match. Swipe, match, and chat!
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Monthly Plan */}
              <Card className={`relative cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'ring-2 ring-pink-500' : ''}`} onClick={() => setSelectedPlan('monthly')}>
                <CardHeader className="text-center">
                  <div className="text-5xl font-bold text-pink-500 mb-2">2 €</div>
                  <p className="text-muted-foreground">monthly</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pink-500" />
                      <span>Unlimited swiping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-pink-500" />
                      <span>Chat with matches</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-pink-500" />
                      <span>Premium filters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-pink-500" />
                      <span>Detailed profiles</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Yearly Plan */}
              <Card className={`relative cursor-pointer transition-all ${selectedPlan === 'yearly' ? 'ring-2 ring-pink-500' : ''}`} onClick={() => setSelectedPlan('yearly')}>
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white">Save 2 months!</Badge>
                </div>
                <CardHeader className="text-center">
                  <div className="text-5xl font-bold text-pink-500 mb-2">20 €</div>
                  <p className="text-muted-foreground">yearly</p>
                  <p className="text-sm text-green-500 font-medium">Just 1.67 € / month</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pink-500" />
                      <span>Unlimited swiping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-pink-500" />
                      <span>Chat with matches</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-pink-500" />
                      <span>Premium filters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-pink-500" />
                      <span>Detailed profiles</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={() => handleSubscribe(selectedPlan)} 
              className="w-full max-w-md mx-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              Start Searching ({selectedPlan === 'monthly' ? '2 €/month' : '20 €/year'})
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Profile creation dialog
  if (!currentProfile) {
    return (
      <Dialog open={true} onOpenChange={(open) => {
        if (!open) {
          navigate('/');
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Your Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={profileForm.display_name}
                onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Age</label>
...
            </div>
            <div>
              <label className="text-sm font-medium">Gender</label>
              <select 
                className="w-full p-2 border rounded bg-background text-foreground"
                value={profileForm.gender}
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Looking For</label>
              <select 
                className="w-full p-2 border rounded bg-background text-foreground"
                value={profileForm.looking_for}
                onChange={(e) => setProfileForm({ ...profileForm, looking_for: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">About Me</label>
              <Textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Write something about yourself..."
                className="min-h-24"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                placeholder="City"
              />
            </div>
            <Button onClick={handleCreateProfile} className="w-full">
              Create Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Tabs defaultValue="swipe" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto mb-8">
            <TabsTrigger value="swipe">
              <Heart className="h-4 w-4 mr-2" />
              Swipe
            </TabsTrigger>
            <TabsTrigger value="matches">
              <MessageCircle className="h-4 w-4 mr-2" />
              Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="likes">
              <Eye className="h-4 w-4 mr-2" />
              Likes You ({likesYouCount})
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Settings className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Swipe Tab */}
          <TabsContent value="swipe" className="flex justify-center">
            {currentIndex < profiles.length ? (
              <Card className="w-full max-w-sm">
                <CardContent className="p-0">
                  <div 
                    className="aspect-[3/4] bg-gradient-to-br from-pink-100 to-purple-100 rounded-t-lg flex items-center justify-center cursor-pointer"
                    onClick={() => profiles[currentIndex].profile_photo_url && setLightboxImage(profiles[currentIndex].profile_photo_url)}
                  >
                    {profiles[currentIndex].profile_photo_url ? (
                      <img
                        src={profiles[currentIndex].profile_photo_url}
                        alt={profiles[currentIndex].display_name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <User className="h-24 w-24 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {profiles[currentIndex].display_name}, {profiles[currentIndex].age}
                      </h2>
                      {profiles[currentIndex].location && (
                        <p className="text-muted-foreground">{profiles[currentIndex].location}</p>
                      )}
                    </div>
                    {profiles[currentIndex].bio && (
                      <p className="text-sm">{profiles[currentIndex].bio}</p>
                    )}
                    <div className="space-y-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canRewind}
                          onClick={handleRewind}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Rewind
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={viewLikesYou}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Likes You ({likesYouCount})
                        </Button>
                      </div>
                      <div className="flex gap-4 justify-center pt-4">
                        <Button
                          variant="outline"
                          size="lg"
                          className="rounded-full w-16 h-16 border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => handleSwipe("dislike")}
                        >
                          <X className="h-8 w-8" />
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="rounded-full w-16 h-16 border-blue-500 text-blue-500 hover:bg-blue-50"
                          onClick={() => handleSwipe("like", true)}
                          disabled={superLikesRemaining <= 0}
                        >
                          <Sparkles className="h-8 w-8" />
                        </Button>
                        <Button
                          size="lg"
                          className="rounded-full w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                          onClick={() => handleSwipe("like")}
                        >
                          <Heart className="h-8 w-8" />
                        </Button>
                      </div>
                      <p className="text-center text-sm text-muted-foreground">
                        Super Likes: {superLikesRemaining}/5 today
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full max-w-sm p-12 text-center">
                <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">You've seen everyone!</h3>
                <p className="text-muted-foreground">Check back later for new people</p>
              </Card>
            )}
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Your Matches</h3>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {matches.map((match) => (
                      <Card
                        key={match.id}
                        className={`cursor-pointer hover:bg-accent ${
                          selectedMatch?.id === match.id ? "bg-accent" : ""
                        }`}
                        onClick={() => {
                          setSelectedMatch(match);
                          loadMessages(match.id);
                        }}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold">{match.profile?.display_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {match.profile?.age} years old
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {matches.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No matches yet. Keep swiping!
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {selectedMatch && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{selectedMatch.profile?.display_name}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex flex-col ${
                              message.sender_id === user?.id ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.sender_id === user?.id
                                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                                  : "bg-secondary"
                              }`}
                            >
                              {message.content}
                            </div>
                            {message.sender_id === user?.id && (
                               <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                {message.read_at ? (
                                  <>
                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                    Read
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Delivered
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        {sentGifts.map((gift) => (
                          <div
                            key={gift.id}
                            className={`flex ${
                              gift.sender_id === user?.id ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className="bg-accent p-4 rounded-lg text-center">
                              <div className="text-4xl mb-2">{gift.gift.icon}</div>
                              <p className="text-sm font-medium">{gift.gift.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowGiftDialog(true)}
                      >
                        <Gift className="h-4 w-4" />
                      </Button>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Write a message..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">My Profile</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Profile?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Your profile, all matches and messages will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteProfile}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Profile
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-6">
                  <div 
                    className="relative h-32 w-32 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0 group cursor-pointer"
                    onClick={() => currentProfile?.profile_photo_url && setLightboxImage(currentProfile.profile_photo_url)}
                  >
                    {currentProfile?.profile_photo_url ? (
                      <img
                        src={currentProfile.profile_photo_url}
                        alt={currentProfile.display_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <User className="h-16 w-16 text-muted-foreground" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Upload className="h-8 w-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadProfilePhoto}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <label className="text-sm text-muted-foreground">Name</label>
                      <p className="text-lg font-semibold">{currentProfile?.display_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Age</label>
                        <p className="font-medium">{currentProfile?.age} years old</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Gender</label>
                        <p className="font-medium capitalize">{currentProfile?.gender}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Looking For</label>
                      <p className="font-medium capitalize">{currentProfile?.looking_for}</p>
                    </div>
                    {currentProfile?.location && (
                      <div>
                        <label className="text-sm text-muted-foreground">Location</label>
                        <p className="font-medium">{currentProfile.location}</p>
                      </div>
                    )}
                  </div>
                </div>
                {currentProfile?.bio && (
                  <div>
                    <label className="text-sm text-muted-foreground">About Me</label>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{currentProfile.bio}</p>
                  </div>
                )}
                
                {/* Additional Photos Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Additional Photos</label>
                    <label className="cursor-pointer">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={uploadingAdditional}
                        asChild
                      >
                        <span>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {uploadingAdditional ? "Uploading..." : "Add Photos"}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUploadAdditionalPhotos}
                        className="hidden"
                        disabled={uploadingAdditional}
                      />
                    </label>
                  </div>
                  {currentProfile?.additional_photos && currentProfile.additional_photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {currentProfile.additional_photos.map((photoUrl, index) => (
                        <div key={index} className="relative aspect-square group">
                          <img
                            src={photoUrl}
                            alt={`Additional photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setLightboxImage(photoUrl)}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAdditionalPhoto(photoUrl);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!currentProfile?.additional_photos || currentProfile.additional_photos.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No additional photos yet
                    </p>
                  )}
                </div>

                {/* Subscription management section */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Subscription</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Subscription Status</p>
                        <p className="text-sm text-muted-foreground">
                          {isSubscribed ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <Badge variant={isSubscribed ? "default" : "secondary"}>
                        {isSubscribed ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {isSubscribed && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full text-red-500 border-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                            disabled={cancelingSubscription}
                          >
                            {cancelingSubscription ? 'Canceling...' : 'Cancel Subscription'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Your subscription will remain active until the end of paid period. 
                              Paid amount is non-refundable. After expiration you will lose access to premium features.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleCancelSubscription}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Confirm Cancellation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Age</label>
...
              </div>
              <div>
                <label className="text-sm font-medium">Gender</label>
                <select 
                  className="w-full p-2 border rounded bg-background text-foreground"
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Looking For</label>
                <select 
                  className="w-full p-2 border rounded bg-background text-foreground"
                  value={editForm.looking_for}
                  onChange={(e) => setEditForm({ ...editForm, looking_for: e.target.value })}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">About Me</label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Write something about yourself..."
                  className="min-h-24"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="City"
                />
              </div>
              <Button onClick={handleUpdateProfile} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lightbox Dialog */}
        <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
            <div className="relative">
              <img
                src={lightboxImage || ""}
                alt="Preview"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={() => setLightboxImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Gift Dialog */}
        <Dialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send a Gift 🎁</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              {availableGifts.map((gift) => (
                <Card
                  key={gift.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleSendGift(gift.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">{gift.icon}</div>
                    <p className="font-semibold mb-1">{gift.name}</p>
                    <p className="text-sm text-muted-foreground">{gift.price} €</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dating;