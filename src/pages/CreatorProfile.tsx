import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionTiers } from "@/components/creator/SubscriptionTiers";
import { ExclusivePostsList } from "@/components/creator/ExclusivePostsList";
import { CreatorMessaging } from "@/components/creator/CreatorMessaging";
import { CreatorMediaUpload } from "@/components/creator/CreatorMediaUpload";
import { CreatorContentPackForm } from "@/components/creator/CreatorContentPackForm";
import { CreatorContentPacks } from "@/components/creator/CreatorContentPacks";
import { SendCreatorGiftDialog } from "@/components/creator/SendCreatorGiftDialog";
import { CreatorProfileEditForm } from "@/components/creator/CreatorProfileEditForm";
import { PaidMessageDialog } from "@/components/creator/PaidMessageDialog";
import { CreatorLiveStreams } from "@/components/creator/CreatorLiveStreams";
import { CreatorMerchStore } from "@/components/creator/CreatorMerchStore";
import { SubscriptionStatusBadge } from "@/components/creator/SubscriptionStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, CheckCircle2, Crown, ShieldAlert, Instagram, Twitter, Gift, MessageCircle, Camera, ImagePlus, UserPlus, UserMinus } from "lucide-react";
import { useIsFollowing, useFollowMutation, useUnfollowMutation } from "@/hooks/useFollow";

interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  cover_image_url: string | null;
  total_subscribers: number;
  is_verified: boolean;
  is_adult_content: boolean;
  social_links: any;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  description: string | null;
  benefits: string[] | null;
}

export default function CreatorProfile() {
  const { creatorId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<{
    subscribed: boolean;
    tier_id?: string;
    subscription_end?: string;
  }>({ subscribed: false });
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [paidMessageDialogOpen, setPaidMessageDialogOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { data: isFollowing, isLoading: followLoading } = useIsFollowing(currentUserId ?? undefined, creator?.user_id);
  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();

  useEffect(() => {
    loadCreatorProfile();
    getCurrentUser();
  }, [creatorId]);

  useEffect(() => {
    if (creator?.id) {
      loadTiers();
      checkSubscription();
    }
  }, [creator?.id]);

  useEffect(() => {
    const subscription = searchParams.get('subscription');
    const purchase = searchParams.get('purchase');
    const giftParam = searchParams.get('gift');
    const giftSuccess = searchParams.get('gift_success');
    const sessionId = searchParams.get('session_id');

    if (giftParam === 'true' && creator) {
      setGiftDialogOpen(true);
      window.history.replaceState({}, '', `/creator/${creatorId}`);
    }

    if (giftSuccess === 'true' && sessionId) {
      // Verify and record the gift payment
      supabase.functions.invoke('verify-gift-payment', {
        body: { sessionId },
      }).then(({ error }) => {
        if (error) {
          console.error('Gift verification error:', error);
        }
        toast({
          title: "Gift Sent! 🎉",
          description: `Your gift has been delivered! The creator receives 90% of the value.`,
        });
      });
      window.history.replaceState({}, '', `/creator/${creatorId}`);
    }

    if (subscription === 'success') {
      checkSubscription();
      toast({
        title: "Subscription Activated!",
        description: "Welcome to the creator's community!",
      });
      window.history.replaceState({}, '', `/creator/${creatorId}`);
    } else if (purchase === 'success') {
      toast({
        title: "Purchase Complete!",
        description: "Content pack purchased successfully!",
      });
      window.history.replaceState({}, '', `/creator/${creatorId}`);
    }
  }, [searchParams, creatorId, toast, creator]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadCreatorProfile = async () => {
    try {
      // Try by user_id first, then by profile id
      let { data, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', creatorId)
        .maybeSingle();

      if (!data) {
        ({ data, error } = await supabase
          .from('creator_profiles')
          .select('*')
          .eq('id', creatorId)
          .maybeSingle());
      }

      if (error) throw error;
      
      if (!data) {
        toast({
          variant: "destructive",
          title: "Creator Not Found",
          description: "This creator profile doesn't exist.",
        });
        navigate('/discover-creators');
        return;
      }
      
      setCreator(data);
    } catch (error: any) {
      console.error('Error loading creator:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load creator profile",
      });
      navigate('/discover-creators');
    } finally {
      setLoading(false);
    }
  };

  const loadTiers = async () => {
    if (!creator?.id) return;
    try {
      const { data, error } = await supabase
        .from('creator_subscription_tiers')
        .select('*')
        .eq('creator_id', creator.id)
        .order('price', { ascending: true });

      if (error) throw error;
      setTiers(data || []);
    } catch (error: any) {
      console.error('Error loading tiers:', error);
    }
  };

  const checkSubscription = async () => {
    if (!creator?.id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('check-creator-subscription', {
        body: { creatorId: creator.id },
      });

      if (error) throw error;

      setUserSubscription({
        subscribed: data?.subscribed || false,
        tier_id: data?.tier_id,
        subscription_end: data?.subscription_end,
      });
    } catch (error: any) {
      console.error('Error checking subscription:', error);
    }
  };

  const isOwnProfile = currentUserId === creatorId || currentUserId === creator?.user_id;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !creator) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${creator.id}-avatar-${Date.now()}.${fileExt}`;
      const filePath = `creator-avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('creator-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('creator-media')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('creator_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', creator.id);

      if (updateError) throw updateError;

      setCreator({ ...creator, avatar_url: publicUrl });
      toast({
        title: "Avatar Updated",
        description: "Your profile photo has been changed.",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload avatar",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !creator) return;

    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${creator.id}-cover-${Date.now()}.${fileExt}`;
      const filePath = `creator-covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('creator-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('creator-media')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('creator_profiles')
        .update({ cover_image_url: publicUrl })
        .eq('id', creator.id);

      if (updateError) throw updateError;

      setCreator({ ...creator, cover_image_url: publicUrl });
      toast({
        title: "Cover Updated",
        description: "Your cover photo has been changed.",
      });
    } catch (error: any) {
      console.error('Error uploading cover:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload cover",
      });
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="h-64 w-full relative bg-gradient-to-br from-primary/20 to-primary/5">
        {creator.cover_image_url && (
          <img
            src={creator.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        
        {/* Cover Upload Button */}
        {isOwnProfile && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              {uploadingCover ? "Uploading..." : "Change Cover"}
            </Button>
          </>
        )}
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Profile Header */}
        <div className={creator.cover_image_url ? "-mt-20" : "pt-8"}>
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={creator.avatar_url || undefined} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-purple-500 text-white">
                      {creator.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Avatar Upload Button */}
                  {isOwnProfile && (
                    <>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full h-10 w-10"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-3xl">{creator.display_name}</CardTitle>
                    {creator.is_verified && (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                    {creator.is_adult_content && (
                      <Badge variant="destructive">
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        18+
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-lg mb-4">
                    {creator.bio}
                  </CardDescription>
                  
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span className="font-semibold">{creator.total_subscribers}</span>
                      <span>subscribers</span>
                    </div>
                  </div>

                  {/* Social Links */}
                  {creator.social_links && Object.values(creator.social_links).some(link => link) && (
                    <div className="flex gap-2">
                      {creator.social_links.instagram && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={creator.social_links.instagram} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-4 w-4 mr-1" />
                            Instagram
                          </a>
                        </Button>
                      )}
                      {creator.social_links.twitter && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={creator.social_links.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4 mr-1" />
                            Twitter
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Subscribe Badge & Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {userSubscription.subscribed && !isOwnProfile && (
                    <Badge variant="secondary" className="flex items-center gap-1 text-lg px-4 py-2">
                      <Crown className="h-5 w-5" />
                      Subscribed
                    </Badge>
                  )}
                  {!isOwnProfile && currentUserId && currentUserId !== creator.user_id && (
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      onClick={() => {
                        if (!currentUserId) return;
                        if (isFollowing) {
                          unfollowMutation.mutate({ followerId: currentUserId, followingId: creator.user_id });
                        } else {
                          followMutation.mutate({ followerId: currentUserId, followingId: creator.user_id });
                        }
                      }}
                      disabled={followLoading || followMutation.isPending || unfollowMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {isFollowing ? (
                        <><UserMinus className="h-4 w-4" /> Unfollow</>
                      ) : (
                        <><UserPlus className="h-4 w-4" /> Follow</>
                      )}
                    </Button>
                  )}
                  {!isOwnProfile && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setPaidMessageDialogOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Paid DM
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setGiftDialogOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <Gift className="h-5 w-5" />
                        Gift
                      </Button>
                    </>
                  )}
                  {isOwnProfile && (
                    <CreatorProfileEditForm creator={creator} onSave={loadCreatorProfile} />
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-8 pb-12">
          {/* Subscription Tiers - Only show if not subscribed and not own profile */}
          {!userSubscription.subscribed && !isOwnProfile && (
            <SubscriptionTiers
              creatorId={creatorId!}
              tiers={tiers}
              currentTierId={userSubscription.tier_id}
              onSubscribe={() => {
                checkSubscription();
              }}
            />
          )}

          {/* Live Streams */}
          {!isOwnProfile && <CreatorLiveStreams creatorId={creatorId!} />}

          {/* Merch Store */}
          {!isOwnProfile && <CreatorMerchStore creatorId={creatorId!} />}

          {/* Content Packs */}
          {!isOwnProfile && (
            <CreatorContentPacks
              creatorId={creatorId!}
              canPurchase={true}
            />
          )}

          {/* Creator's Content Pack Management */}
          {isOwnProfile && (
            <CreatorContentPackForm
              creatorId={creatorId!}
              onSuccess={() => window.location.reload()}
            />
          )}

          {/* Messaging - Only for subscribers */}
          {userSubscription.subscribed && !isOwnProfile && (
            <CreatorMessaging
              creatorId={creatorId!}
              creatorName={creator.display_name}
              canMessage={userSubscription.subscribed}
            />
          )}

          {/* Creator's Media Upload */}
          {isOwnProfile && (
            <CreatorMediaUpload
              creatorId={creatorId!}
              onUploadComplete={() => {
                loadCreatorProfile();
              }}
            />
          )}

          {/* Exclusive Content */}
          <ExclusivePostsList
            creatorId={creatorId!}
            userTierId={userSubscription.tier_id}
            isSubscribed={userSubscription.subscribed || isOwnProfile}
          />
        </div>
      </div>

      {/* Gift Dialog */}
      <SendCreatorGiftDialog
        open={giftDialogOpen}
        onOpenChange={setGiftDialogOpen}
        creatorId={creator.id}
        creatorName={creator.display_name}
      />

      {/* Paid Message Dialog */}
      <PaidMessageDialog
        open={paidMessageDialogOpen}
        onOpenChange={setPaidMessageDialogOpen}
        creatorId={creator.id}
        creatorName={creator.display_name}
      />
    </div>
  );
}
