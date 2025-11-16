import { useState, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, CheckCircle2, Crown, ShieldAlert, Instagram, Twitter } from "lucide-react";

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

  useEffect(() => {
    loadCreatorProfile();
    loadTiers();
    checkSubscription();
    getCurrentUser();
  }, [creatorId]);

  useEffect(() => {
    const subscription = searchParams.get('subscription');
    const purchase = searchParams.get('purchase');

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
  }, [searchParams, creatorId, toast]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const loadCreatorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', creatorId)
        .single();

      if (error) throw error;
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
    try {
      const { data, error } = await supabase
        .from('creator_subscription_tiers')
        .select('*')
        .eq('creator_id', creatorId)
        .order('price', { ascending: true });

      if (error) throw error;
      setTiers(data || []);
    } catch (error: any) {
      console.error('Error loading tiers:', error);
    }
  };

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('check-creator-subscription', {
        body: { creatorId },
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

  const isOwnProfile = currentUserId === creatorId;

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
      {creator.cover_image_url && (
        <div className="h-64 w-full relative">
          <img
            src={creator.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>
      )}

      <div className="container mx-auto px-4 relative">
        {/* Profile Header */}
        <div className={creator.cover_image_url ? "-mt-20" : "pt-8"}>
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={creator.avatar_url || undefined} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-purple-500 text-white">
                    {creator.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

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

                {/* Subscribe Badge */}
                {userSubscription.subscribed && !isOwnProfile && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-lg px-4 py-2">
                    <Crown className="h-5 w-5" />
                    Subscribed
                  </Badge>
                )}
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
    </div>
  );
}
