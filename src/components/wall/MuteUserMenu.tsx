import { VolumeX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useUserMutes } from "@/hooks/useUserMutes";

interface Props {
  userId: string;
  trigger?: React.ReactNode;
}

export const MuteUserMenu = ({ userId, trigger }: Props) => {
  const { muteUser, unmuteUser, mutedIds } = useUserMutes();
  const isMuted = mutedIds.includes(userId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <VolumeX className="w-4 h-4 mr-2" />
            {isMuted ? "Unmute" : "Mute"}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isMuted ? (
          <DropdownMenuItem onClick={() => unmuteUser(userId)}>
            Unmute
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuLabel>Mute for</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => muteUser({ userId, durationHours: 24 })}>
              24 hours
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => muteUser({ userId, durationHours: 24 * 7 })}>
              7 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => muteUser({ userId, durationHours: 24 * 30 })}>
              30 days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => muteUser({ userId })}>
              Permanently
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
