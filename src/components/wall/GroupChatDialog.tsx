import { useState } from "react";
import { Users, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGroupChats, useGroupMessages } from "@/hooks/useGroupChats";
import { toast } from "sonner";

export const GroupChatDialog = () => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [memberIdsText, setMemberIdsText] = useState("");
  const [activeId, setActiveId] = useState<string | undefined>();
  const [draft, setDraft] = useState("");

  const { groups, createGroup } = useGroupChats();
  const { messages, send } = useGroupMessages(activeId);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const ids = memberIdsText
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const conv = await createGroup({ name, memberIds: ids });
      toast.success("Group created");
      setActiveId(conv.id);
      setCreating(false);
      setName("");
      setMemberIdsText("");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to create group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Groups
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Group Chats</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 h-[500px]">
          <div className="col-span-1 border-r pr-2 flex flex-col">
            <Button size="sm" variant="outline" onClick={() => setCreating(true)} className="mb-2">
              <Plus className="w-4 h-4 mr-1" /> New group
            </Button>
            <ScrollArea className="flex-1">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActiveId(g.id)}
                  className={`w-full text-left px-2 py-2 rounded text-sm hover:bg-muted ${
                    activeId === g.id ? "bg-muted" : ""
                  }`}
                >
                  <p className="font-medium truncate">{g.name || "Unnamed group"}</p>
                </button>
              ))}
              {groups.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">No groups yet</p>
              )}
            </ScrollArea>
          </div>

          <div className="col-span-2 flex flex-col">
            {creating ? (
              <div className="space-y-2">
                <Input
                  placeholder="Group name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Textarea
                  placeholder="Member user IDs (comma or space separated)"
                  value={memberIdsText}
                  onChange={(e) => setMemberIdsText(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreate}>Create</Button>
                  <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
                </div>
              </div>
            ) : activeId ? (
              <>
                <ScrollArea className="flex-1 mb-2 pr-2">
                  <div className="space-y-2">
                    {messages.map((m: any) => (
                      <div key={m.id} className="text-sm bg-muted rounded-lg px-3 py-2">
                        <p className="text-xs text-muted-foreground">{m.sender_id.slice(0, 8)}</p>
                        <p>{m.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Message"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && draft.trim()) {
                        send({ content: draft });
                        setDraft("");
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={() => {
                      if (draft.trim()) {
                        send({ content: draft });
                        setDraft("");
                      }
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground m-auto">Select or create a group</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
