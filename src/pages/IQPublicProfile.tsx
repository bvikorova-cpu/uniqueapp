import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brain, Loader2, Trophy, Flame } from "lucide-react";
import { Helmet } from "react-helmet-async";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQPublicProfile() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["iq-public-profile", slug],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_iq_public_profile", { _slug: slug! });
      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <>
        <FloatingHowItWorks title="How IQPublic Profile works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      </>
      );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-muted-foreground">This IQ profile is private or does not exist.</p>
        </Card>
      </div>
    );
  }

  const name = data.display_name ?? "Anonymous";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 py-12 px-4">
      <Helmet>
        <title>{name}'s IQ Score: {data.best_iq ?? "—"} | Unique IQ</title>
        <meta name="description" content={`${name} scored ${data.best_iq ?? "—"} on Unique IQ. Tier: ${data.tier ?? "Bronze"}.`} />
      </Helmet>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="overflow-hidden border-primary/30">
          <div className="h-32 bg-gradient-to-r from-primary to-accent" />
          <CardContent className="pt-0 -mt-12 text-center">
            <Avatar className="h-24 w-24 mx-auto border-4 border-background">
              <AvatarImage src={data.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl">{name[0]}</AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-black mt-3">{name}</h1>
            {data.bio && <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">{data.bio}</p>}
            <Badge className="mt-3 bg-gradient-to-r from-primary to-accent border-0">{data.tier ?? "Bronze"}</Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><CardHeader className="p-4"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Brain className="h-3 w-3" /> Best IQ</CardTitle><p className="text-3xl font-black text-primary">{data.best_iq ?? "—"}</p></CardHeader></Card>
          <Card><CardHeader className="p-4"><CardTitle className="text-xs text-muted-foreground">Latest</CardTitle><p className="text-3xl font-black">{data.latest_iq ?? "—"}</p></CardHeader></Card>
          <Card><CardHeader className="p-4"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3" /> Tests</CardTitle><p className="text-3xl font-black">{data.total_tests ?? 0}</p></CardHeader></Card>
          <Card><CardHeader className="p-4"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3" /> Streak</CardTitle><p className="text-3xl font-black">{data.current_streak ?? 0}</p></CardHeader></Card>
        </div>

        <Card className="text-center p-6 bg-gradient-to-br from-primary/10 to-accent/10">
          <h2 className="text-xl font-bold mb-2">Think you can beat this?</h2>
          <a href="/iq" className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold">Take the IQ Test</a>
        </Card>
      </div>
    </div>
  );
}
