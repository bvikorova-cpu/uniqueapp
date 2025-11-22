import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCollaborators } from "@/hooks/useCollaborators";
import { Badge } from "@/components/ui/badge";

interface CollaboratorsDialogProps {
  postId: string;
}

export const CollaboratorsDialog = ({ postId }: CollaboratorsDialogProps) => {
  const [open, setOpen] = useState(false);
  const { collaborators } = useCollaborators(postId);

  const accepted = collaborators.filter(c => c.status === "accepted");
  const pending = collaborators.filter(c => c.status === "pending");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Collaborators ({accepted.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post Collaborators</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {accepted.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Collaborators</h4>
              <div className="space-y-2">
                {accepted.map((collab: any) => (
                  <div key={collab.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={collab.profiles?.avatar_url} />
                      <AvatarFallback>{collab.profiles?.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{collab.profiles?.full_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pending.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Pending Invites</h4>
              <div className="space-y-2">
                {pending.map((collab: any) => (
                  <div key={collab.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={collab.profiles?.avatar_url} />
                      <AvatarFallback>{collab.profiles?.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{collab.profiles?.full_name}</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          {collaborators.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No collaborators yet
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
