import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PresenceUser } from "@/hooks/usePresenceChannel";
import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PresenceAvatarsProps {
  users: PresenceUser[];
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Stacked online-user avatars with overflow chip.
 * Pure presentation — feed it from `usePresenceChannel().presentUsers`.
 */
export function PresenceAvatars({ users, max = 5, size = "sm", className }: PresenceAvatarsProps) {
  if (!users.length) return null;
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;

  const dim = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <>
      <FloatingHowItWorks title={"Presence Avatars - How it works"} steps={[{ title: 'Open', desc: 'Access the Presence Avatars section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Presence Avatars.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <TooltipProvider delayDuration={150}>
      <div className={cn("flex items-center -space-x-2", className)}>
        {visible.map((u) => (
          <Tooltip key={u.user_id}>
            <TooltipTrigger asChild>
              <span className="relative inline-block">
                <Avatar className={cn(dim, "ring-2 ring-background")}>
                  <AvatarImage src={u.avatar_url ?? undefined} alt={u.display_name ?? "User"} />
                  <AvatarFallback className="text-[10px]">
                    {(u.display_name ?? "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span
                  aria-hidden
                  className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background"
                />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {u.display_name ?? "Online user"}
            </TooltipContent>
          </Tooltip>
        ))}
        {overflow > 0 && (
          <span
            className={cn(
              dim,
              "ring-2 ring-background bg-muted text-muted-foreground inline-flex items-center justify-center rounded-full text-[10px] font-medium"
            )}
          >
            +{overflow}
          </span>
        )}
      </div>
    </TooltipProvider>
    </>
  );
}
