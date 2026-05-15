import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Share2, Sparkles, TrendingUp, Award, Flame } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function RewardsYearWrapped() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [wrapped, setWrapped] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const year = new Date().getFullYear();

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_year_wrapped")
      .select("*")
      .eq("user_id", user.id)
      .eq("year", year)
      .maybeSingle();
    setWrapped(data);
  };

  useEffect(() => { load(); }, [user?.id]);

  const generate = async () => {
    if (!user) return;
    setGenerating(true);
    // pull XP/badges/streak summary
    const { data: pts } = await supabase
      .from("user_points")
      .select("total_points, login_streak")
      .eq("user_id", user.id)
      .maybeSingle();
    const totalXp = pts?.total_points || 0;
    const streakMax = pts?.login_streak || 0;

    const { count: badges } = await supabase
      .from("user_badges" as any)
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const slug = `${user.id.slice(0, 6)}-${year}-${Math.random().toString(36).slice(2, 8)}`;

    const { error } = await supabase.from("user_year_wrapped").upsert({
      user_id: user.id, year, total_xp: totalXp, badges_earned: badges || 0,
      streak_max: streakMax,
      top_modules: [{ name: "Rewards", xp: totalXp }],
      highlights: { generated_at: new Date().toISOString() },
      share_slug: slug,
    }, { onConflict: "user_id,year" });

    if (error) toast.error(error.message);
    else toast.success(t("rewards.wrapped.ready"));
    setGenerating(false);
    load();
  };

  const togglePublic = async () => {
    if (!user || !wrapped) return;
    await supabase.from("user_year_wrapped").update({ is_public: !wrapped.is_public }).eq("id", wrapped.id);
    load();
  };

  const share = () => {
    if (!wrapped?.share_slug) return;
    const url = `${window.location.origin}/wrapped/${wrapped.share_slug}`;
    navigator.clipboard.writeText(url);
    toast.success(t("rewards.wrapped.linkCopied"));
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-amber-500 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5" />
          <span className="text-sm opacity-90">{t("rewards.wrapped.yearLabel", { year })}</span>
        </div>
        {wrapped ? (
          <>
            <h2 className="text-3xl font-bold mb-4">{t("rewards.wrapped.heading")}</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/15 backdrop-blur rounded-lg p-3">
                <TrendingUp className="h-5 w-5 mb-1 opacity-80" />
                <p className="text-2xl font-bold">{Number(wrapped.total_xp).toLocaleString()}</p>
                <p className="text-xs opacity-80">{t("rewards.wrapped.totalXp")}</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-lg p-3">
                <Award className="h-5 w-5 mb-1 opacity-80" />
                <p className="text-2xl font-bold">{wrapped.badges_earned}</p>
                <p className="text-xs opacity-80">{t("rewards.wrapped.badges")}</p>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-lg p-3">
                <Flame className="h-5 w-5 mb-1 opacity-80" />
                <p className="text-2xl font-bold">{wrapped.streak_max}</p>
                <p className="text-xs opacity-80">{t("rewards.wrapped.bestStreak")}</p>
              </div>
            </div>
          </>
        ) : (
          <h2 className="text-2xl font-bold">{t("rewards.wrapped.generatePrompt")}</h2>
        )}
      </div>
      <CardContent className="pt-4 space-y-3">
        {!wrapped ? (
          <Button onClick={generate} disabled={generating} className="w-full gap-2">
            <Sparkles className="h-4 w-4" /> {generating ? t("rewards.wrapped.generating") : t("rewards.wrapped.generate", { year })}
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={togglePublic}>
              {wrapped.is_public ? t("rewards.wrapped.makePrivate") : t("rewards.wrapped.makePublic")}
            </Button>
            <Button size="sm" onClick={share} disabled={!wrapped.is_public}>
              <Share2 className="h-4 w-4 mr-1" /> {t("rewards.wrapped.share")}
            </Button>
            <Button variant="ghost" size="sm" onClick={generate}>{t("rewards.wrapped.regenerate")}</Button>
            {wrapped.is_public && <Badge variant="secondary">{t("rewards.wrapped.public")}</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
