import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, X, MapPin, User, Loader2 } from "lucide-react";

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
}

interface Props {
  userId: string;
  currentProfile?: DatingProfile;
  onMatch: (match: Match & { profile?: DatingProfile }, partner: DatingProfile) => void;
  onLikesSeen?: (count: number) => void;
}

const hasRealLocation = (location?: string | null) =>
  !!location && !location.toLowerCase().includes("unknown") && location.trim() !== "";

export const LikesYouList = ({ userId, currentProfile, onMatch, onLikesSeen }: Props) => {
  const [likes, setLikes] = useState<DatingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  const loadLikers = async () => {
    setLoading(true);
    try {
      // Server-side function: returns everyone who liked me and whom I haven't
      // answered yet (RLS prevents reading other people's swipes directly).
      const { data, error } = await supabase.rpc("get_dating_likes_you" as any);
      if (error) throw error;

      const profiles = ((data || []) as any[]).map((row) => ({
        id: row.user_id,
        user_id: row.user_id,
        display_name: row.display_name,
        bio: row.bio,
        age: row.age,
        gender: row.gender,
        looking_for: row.looking_for,
        location: row.location,
        profile_photo_url: row.profile_photo_url,
        additional_photos: row.additional_photos,
        interests: row.interests,
      })) as DatingProfile[];

      setLikes(profiles);
      onLikesSeen?.(profiles.length);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  const handleLikeBack = async (profile: DatingProfile) => {
    setProcessing(profile.user_id);
    try {
      const { error } = await supabase
        .from("dating_swipes")
        .upsert(
          [{ swiper_id: userId, swiped_id: profile.user_id, action: "like" }],
          { onConflict: "swiper_id,swiped_id" }
        );

      if (error) throw error;

      await supabase
        .from("dating_likes_you")
        .upsert(
          [{ liker_id: userId, liked_id: profile.user_id }],
          { onConflict: "liker_id,liked_id", ignoreDuplicates: true }
        );

      const { data: match } = await supabase
        .from("dating_matches")
        .select("*")
        .or(
          `and(user1_id.eq.${userId},user2_id.eq.${profile.user_id}),and(user1_id.eq.${profile.user_id},user2_id.eq.${userId})`
        )
        .maybeSingle();

      if (match) {
        onMatch({ ...(match as Match), profile }, profile);
        toast({ title: "🎉 New Match!", description: `You matched with ${profile.display_name}.` });
      } else {
        toast({ title: "❤️ Liked Back", description: `You liked ${profile.display_name}.` });
      }

      setLikes((prev) => prev.filter((p) => p.user_id !== profile.user_id));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const handlePass = async (profile: DatingProfile) => {
    setProcessing(profile.user_id);
    try {
      await supabase
        .from("dating_swipes")
        .upsert(
          [{ swiper_id: userId, swiped_id: profile.user_id, action: "dislike" }],
          { onConflict: "swiper_id,swiped_id" }
        );
      setLikes((prev) => prev.filter((p) => p.user_id !== profile.user_id));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    loadLikers();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading people who liked you...</p>
      </div>
    );
  }

  if (likes.length === 0) {
    return (
      <Card className="max-w-md mx-auto p-8 text-center">
        <div className="h-20 w-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
          <Heart className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-xl font-bold mb-2">No Likes Yet</h2>
        <p className="text-sm text-muted-foreground">Keep swiping in Discover — when someone likes you, they'll appear here.</p>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">People Who Like You</h2>
        <span className="text-sm text-muted-foreground">{likes.length} pending</span>
      </div>
      {likes.map((profile) => (
        <Card key={profile.user_id} className="overflow-hidden border-border/50">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex-shrink-0">
                {profile.profile_photo_url ? (
                  <img src={profile.profile_photo_url} alt={profile.display_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg truncate">{profile.display_name}</h3>
                  <span className="text-sm text-muted-foreground">{profile.age}</span>
                </div>
                {hasRealLocation(profile.location) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </p>
                )}
                {profile.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{profile.bio}</p>}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {profile.interests.slice(0, 5).map((interest) => (
                      <span key={interest} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => handleLikeBack(profile)}
                disabled={!!processing}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"
              >
                {processing === profile.user_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                Like Back
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePass(profile)}
                disabled={!!processing}
                className="flex-1 gap-2"
              >
                <X className="h-4 w-4" />
                Pass
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
