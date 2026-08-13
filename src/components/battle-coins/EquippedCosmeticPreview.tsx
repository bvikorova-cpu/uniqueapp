import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useEquippedCosmetics } from "@/hooks/useEquippedCosmetics";

/**
 * Live preview of how your equipped frame, sticker and badge look publicly.
 * Without this, equipping an item changed nothing you could actually see.
 */
export default function EquippedCosmeticPreview() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ username: string | null; avatar_url: string | null } | null>(null);
  const cosmetics = useEquippedCosmetics([userId]);
  const mine = userId ? cosmetics[userId] : undefined;

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive || !session) return;
      setUserId(session.user.id);
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", session.user.id)
        .maybeSingle();
      if (alive) setProfile((data as { username: string | null; avatar_url: string | null }) || null);
    })();
    return () => { alive = false; };
  }, []);

  if (!userId) return null;
  const name = profile?.username || "You";

  return (
    <div className="rounded-xl border border-primary/20 bg-background/60 p-3 flex items-center gap-3">
      <Avatar className={`h-11 w-11 shrink-0 ${mine?.frame?.css_class || ""}`}>
        <AvatarImage src={profile?.avatar_url || undefined} alt={name} />
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-sm font-semibold flex items-center gap-1 truncate">
          <span className="truncate">{name}</span>
          {mine?.badge && <span title={mine.badge.name} aria-label={mine.badge.name}>{mine.badge.preview}</span>}
          {mine?.sticker && <span title={mine.sticker.name} aria-label={mine.sticker.name}>{mine.sticker.preview}</span>}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {mine?.frame || mine?.badge || mine?.sticker
            ? "This is exactly how you appear on the live leaderboard."
            : "Equip a frame, sticker or badge below to decorate this card."}
        </p>
      </div>
    </div>
  );
}
