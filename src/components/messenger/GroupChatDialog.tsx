import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface GroupChatDialogProps {
  userId: string;
  allUsers: Profile[];
  onGroupCreated: () => void;
}

export const GroupChatDialog = ({ userId, allUsers, onGroupCreated }: GroupChatDialogProps) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const toggleUser = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a group name and select at least one member",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from("group_chats")
        .insert({
          name: groupName.trim(),
          created_by: userId,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      const { error: creatorError } = await supabase
        .from("group_chat_members")
        .insert({
          group_id: group.id,
          user_id: userId,
          role: "creator",
        });

      if (creatorError) throw creatorError;

      // Add selected members
      const memberInserts = selectedUsers.map(memberId => ({
        group_id: group.id,
        user_id: memberId,
        role: "member",
      }));

      const { error: membersError } = await supabase
        .from("group_chat_members")
        .insert(memberInserts);

      if (membersError) throw membersError;

      toast({
        title: "Success",
        description: "Group created successfully!",
      });

      setOpen(false);
      setGroupName("");
      setSelectedUsers([]);
      onGroupCreated();
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <FloatingHowItWorks
        title={"Group Chat Dialog"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Select members ({selectedUsers.length} selected)
            </p>
            <ScrollArea className="h-60 border rounded-md p-2">
              <div className="space-y-2">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => toggleUser(user.id)}
                  >
                    <Checkbox checked={selectedUsers.includes(user.id)} />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.full_name || "User"}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((id) => {
                const user = allUsers.find(u => u.id === id);
                return (
                  <div
                    key={id}
                    className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-1 text-xs"
                  >
                    {user?.full_name || "User"}
                    <button onClick={() => toggleUser(id)}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <Button
            onClick={createGroup}
            disabled={isCreating || !groupName.trim() || selectedUsers.length === 0}
            className="w-full"
          >
            {isCreating ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
