import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, TrendingUp, Award, Flame, ArrowLeft } from "lucide-react";

export default function YearWrappedPublic() {
  const { slug } = useParams<{ slug: string }>();
  const [wrapped, setWrapped] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("user_year_wrapped")
        .select("*")
        .eq("share_slug", slug)
        .eq("is_public", true)
        .maybeSingle();
      if (!data) setNotFound(true);
      setWrapped(data);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFound || !wrapped) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-2">Wrapped not found</h1>
          <p className="text-muted-foreground mb-6">This recap is private or doesn't exist.</p>
          <Link to="/rewards"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Rewards</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-amber-500 p-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm opacity-90">{wrapped.year} wrapped</span>
            </div>
            <h1 className="text-3xl font-bold mb-6">A year of greatness ✨</h1>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/15 backdrop-blur rounded-lg p-3">
                <TrendingUp className="h-5 w-5 mb-1 opacity-80" />
                <p className="text-2xl font-bold">{Number(wrapped.total_xp).toLocaleString()}</p>
                <p className="text-xs opacity-80">Total XP</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-lg p-3">
                <Award className="h-5 w-5 mb-1 opacity-80" />
                <p className="text-2xl font-bold">{wrapped.badges_earned}</p>
                <p className="text-xs opacity-80">Badges</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-lg p-3">
                <Flame className="h-5 w-5 mb-1 opacity-80" />
                <p className="text-2xl font-bold">{wrapped.streak_max}</p>
                <p className="text-xs opacity-80">Best streak</p>
              </div>
            </div>
          </div>
          <CardContent className="pt-6 text-center">
            <Link to="/rewards"><Button><ArrowLeft className="h-4 w-4 mr-1" /> Make your own</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
