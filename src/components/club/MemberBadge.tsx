import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PublicMember {
  user_id: string;
  member_number: number;
  tier: "digital" | "physical";
  is_founding: boolean;
}

/**
 * Cache of public club-member records keyed by user_id. Shared with react-query
 * so multiple <MemberBadge /> instances on the same page hit the network once.
 */
export function useClubPublicMember(userId?: string | null) {
  return useQuery({
    queryKey: ["club-public-member", userId],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<PublicMember | null> => {
      const { data, error } = await supabase
        .from("club_public_members" as any)
        .select("user_id, member_number, tier, is_founding")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) return null;
      return (data as unknown as PublicMember) ?? null;
    } });
}

interface MemberBadgeProps {
  userId?: string | null;
  /** Optional pre-fetched member record; skips the query when provided. */
  member?: PublicMember | null;
  /** Extra ring thickness. Defaults to a subtle 2px gold halo. */
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Show tooltip on hover with the Unique VIP Club label + member number. */
  withTooltip?: boolean;
  children: ReactNode;
}

/**
 * Wraps an <Avatar /> (or anything round) with the Unique VIP Club gold ring.
 * Renders children untouched when the user is not a club member so it is safe
 * to sprinkle throughout the app.
 */
export function MemberBadge({ userId,
  member: memberProp,
  size = "md",
  className,
  withTooltip = true,
  children }: MemberBadgeProps) {
  const { data: fetched } = useClubPublicMember(memberProp === undefined ? userId : null);
  const member = memberProp !== undefined ? memberProp : fetched;

  if (!member) return <>{children}</>;

  const padding = { sm: "p-[2px]", md: "p-[3px]", lg: "p-[4px]" }[size];

  const ring = (
    <span
      className={cn(
        "relative inline-block rounded-full",
        padding,
        "bg-[conic-gradient(from_0deg,#fde68a,#f59e0b,#fbbf24,#fde68a,#b45309,#fde68a)]",
        "shadow-[0_0_10px_rgba(245,158,11,0.35)]",
        className,
      )}
      aria-label="Unique VIP Club Member"
      data-club-tier={member.tier}
    >
      <span className="block rounded-full bg-background p-[1px]">{children}</span>
    </span>
  );

  if (!withTooltip) return ring;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{ring}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="font-semibold">🎫 Unique VIP Club Member</div>
          <div className="text-muted-foreground">
            {member.tier === "physical" ? "Physical card" : "Digital card"}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
      </Tooltip>
    </TooltipProvider>
  );
}

export default MemberBadge;
