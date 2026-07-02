import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, MapPin, Euro, Briefcase } from "lucide-react";
import SellerReviewsList from "@/components/skills/SellerReviewsList";
import { SEO } from "@/components/SEO";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Profile = { id: string; full_name: string | null; avatar_url: string | null; bio: string | null; location: string | null };

type Offering = {
  id: string; title: string; description: string; category: string;
  price_per_hour: number | null; location: string | null; image_url: string | null; is_active: boolean;
};

export default function SkillsMarketplaceProvider() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: o }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("id,full_name,avatar_url,bio,location").eq("id", userId).maybeSingle(),
        supabase
          .from("skill_offerings")
          .select("id,title,description,category,price_per_hour,location,image_url,is_active")
          .eq("user_id", userId)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase.from("seller_reviews" as any).select("rating").eq("seller_id", userId).eq("is_hidden", false),
      ]);
      setProfile(p as Profile | null);
      setOfferings((o as Offering[]) || []);
      const ratings = ((r as any[]) || []).map((x) => x.rating);
      setReviewCount(ratings.length);
      setAvgRating(ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : 0);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 max-w-5xl space-y-4">
      <Skeleton className="h-24 w-full" /><Skeleton className="h-48 w-full" />
    </div>;
  }

  return (
    <>
      <FloatingHowItWorks title="How Skills Marketplace Provider works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
      <SEO title={`${profile?.full_name || "Provider"} — Skills Marketplace`} description={profile?.bio || "Provider profile"} />
      <Button asChild variant="ghost" className="mb-4 gap-2">
        <Link to="/skills-marketplace"><ArrowLeft className="h-4 w-4" /> Back to marketplace</Link>
      </Button>

      <Card className="mb-6">
        <CardContent className="flex flex-col md:flex-row md:items-center gap-4 py-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-2xl">{(profile?.full_name || "U").slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name || "Provider"}</h1>
            {profile?.location && (
              <p className="text-sm text-muted-foreground inline-flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" /> {profile.location}
              </p>
            )}
            {profile?.bio && <p className="text-sm mt-2 text-foreground/80 max-w-2xl">{profile.bio}</p>}
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</span>
            </div>
            <p className="text-xs text-muted-foreground">{reviewCount} reviews</p>
            <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> {offerings.length} active offerings
            </p>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-3">Active offerings</h2>
      {offerings.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No active offerings.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {offerings.map((o) => (
            <Card key={o.id} className="overflow-hidden hover:shadow-lg transition">
              {o.image_url && (
                <Link to={`/skills-marketplace/${o.id}`}>
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={o.image_url} alt={o.title} className="w-full h-full object-cover" />
                  </div>
                </Link>
              )}
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="capitalize w-fit mb-1">{o.category}</Badge>
                <CardTitle className="text-base line-clamp-2">
                  <Link to={`/skills-marketplace/${o.id}`} className="hover:underline">{o.title}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{o.description}</p>
                {o.price_per_hour != null && (
                  <p className="font-semibold inline-flex items-center text-primary">
                    <Euro className="h-4 w-4" /> {o.price_per_hour}/hr
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SellerReviewsList sellerId={userId!} />
    </div>
    </>
    );
}
