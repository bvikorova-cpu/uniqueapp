import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface MutualUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

/**
 * Shows count + small stack of mutual followers/follows between the
 * currently logged-in user and the visited profile owner.
 */
export const MutualConnections = ({
  viewerId,
  profileUserId,
}: {
  viewerId: string | null;
  profileUserId: string;
}) => {
  const [count, setCount] = useState<number | null>(null);
  const [sample, setSample] = useState<MutualUser[]>([]);

  useEffect(() => {
    if (!viewerId || viewerId === profileUserId) return;
    let cancelled = false;

    (async () => {
      // who I follow
      const { data: mine } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", viewerId);
      // who they follow
      const { data: theirs } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", profileUserId);

      if (cancelled) return;
      const mineSet = new Set((mine || []).map((r: any) => r.following_id));
      const mutualIds = (theirs || [])
        .map((r: any) => r.following_id)
        .filter((id) => mineSet.has(id));

      setCount(mutualIds.length);
      if (mutualIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", mutualIds.slice(0, 5));
        if (!cancelled) setSample(profiles || []);
      }
    })();

    return (
    <>
      <FloatingHowItWorks title={"Mutual Connections - How it works"} steps={[{ title: 'Open', desc: 'Access the Mutual Connections section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mutual Connections.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { cancelled = true; };
  }, [viewerId, profileUserId]);

  if (!viewerId || viewerId === profileUserId || count == null || count === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-md px-3 py-2 mb-4 flex items-center gap-3">
      <div className="flex -space-x-2">
        {sample.map((u) => (
          <Avatar key={u.id} className="h-7 w-7 ring-2 ring-background">
            <AvatarImage src={u.avatar_url || undefined} />
            <AvatarFallback className="text-[10px]">
              {(u.full_name || "?").slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <Users className="h-3 w-3" />
        <span><strong className="text-foreground">{count}</strong> mutual connection{count === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
};
