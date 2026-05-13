import { useState } from "react";
import { VolumeX, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserMutes } from "@/hooks/useUserMutes";
import { formatDistanceToNow } from "date-fns";

export const MutedUsersDialog = ({ trigger }: { trigger?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { mutes, unmuteUser } = useUserMutes();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <VolumeX className="w-4 h-4 mr-2" />
            Muted users
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Muted users</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          {mutes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No muted users
            </p>
          )}
          <div className="space-y-2">
            {mutes.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={m.profiles?.avatar_url || undefined} />
                    <AvatarFallback>{m.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{m.profiles?.full_name || "User"}</p>
                    {m.expires_at && (
                      <p className="text-xs text-muted-foreground">
                        Expires {formatDistanceToNow(new Date(m.expires_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => unmuteUser(m.muted_user_id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
