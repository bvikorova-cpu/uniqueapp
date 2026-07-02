import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  profileUserId: string;
  viewerId?: string | null;
}

export const ProfileViewsCounter = ({ profileUserId, viewerId }: Props) => {
  const [total, setTotal] = useState<number>(0);
  const [week, setWeek] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Log the view (skip if viewing own profile)
      if (viewerId && viewerId !== profileUserId) {
        await supabase.from("profile_views").insert({
          profile_id: profileUserId,
          viewer_id: viewerId,
          source: "profile_page",
        });
      }
      // Fetch counters
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [{ count: totalC }, { count: weekC }] = await Promise.all([
        supabase.from("profile_views").select("*", { count: "exact", head: true }).eq("profile_id", profileUserId),
        supabase
          .from("profile_views")
          .select("*", { count: "exact", head: true })
          .eq("profile_id", profileUserId)
          .gte("created_at", sevenDaysAgo),
      ]);
      if (cancelled) return;
      setTotal(totalC || 0);
      setWeek(weekC || 0);
    })();
    return (
    <>
      <FloatingHowItWorks title={"Profile Views Counter - How it works"} steps={[{ title: 'Open', desc: 'Access the Profile Views Counter section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Profile Views Counter.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { cancelled = true; };
  }, [profileUserId, viewerId]);

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full">
      <Eye className="w-3.5 h-3.5" />
      <span>{total.toLocaleString()} views</span>
      {week > 0 && <span className="text-primary">· +{week} this week</span>}
    </div>
  );
};
