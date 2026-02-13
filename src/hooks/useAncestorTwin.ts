import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HistoricalMatch {
  name: string;
  era: string;
  similarity: number;
  bio?: string;
  imageUrl?: string;
}

interface MatchResult {
  matches: HistoricalMatch[];
  tier: string;
}

interface AncestorTwinSubscription {
  hasSubscription: boolean;
  subscriptionEnd?: string;
  loading: boolean;
}

export const useAncestorTwin = () => {
  const [subscription, setSubscription] = useState<AncestorTwinSubscription>({
    hasSubscription: false,
    loading: true,
  });
  const [matchResults, setMatchResults] = useState<MatchResult | null>(null);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSubscription({
          hasSubscription: false,
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-ancestor-twin-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscription({
        hasSubscription: data?.hasSubscription || false,
        subscriptionEnd: data?.subscriptionEnd,
        loading: false,
      });
    } catch (error) {
      console.error('Subscription check error:', error);
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    checkSubscription();

    // Check subscription status every minute
    const interval = setInterval(checkSubscription, 60000);

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => {
      clearInterval(interval);
      authSubscription.unsubscribe();
    };
  }, []);

  const findMatches = async (imageFile: File, tier: 'basic' | 'extended' | 'heritage'): Promise<MatchResult | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to find matches");
        return null;
      }

      // Upload image to storage first
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ancestor-twin-photos')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload image');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ancestor-twin-photos')
        .getPublicUrl(fileName);

      // Convert image to base64 for AI analysis
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String);
        };
      });
      reader.readAsDataURL(imageFile);
      const imageBase64 = await base64Promise;

      const { data, error } = await supabase.functions.invoke('find-historical-match', {
        body: { imageBase64, tier, userImageUrl: publicUrl },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const result: MatchResult = {
        matches: data.matches,
        tier: data.tier,
      };

      setMatchResults(result);
      return result;
    } catch (error) {
      console.error('Find matches error:', error);
      throw error;
    }
  };

  const createCheckout = async (tier: string, priceId: string): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to purchase");
        return null;
      }

      const { data, error } = await supabase.functions.invoke('create-ancestor-twin-checkout', {
        body: { tier, priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      return data?.url || null;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Failed to create checkout session");
      return null;
    }
  };

  return {
    subscription,
    loading: subscription.loading,
    matchResults,
    findMatches,
    createCheckout,
    checkSubscription,
  };
};
