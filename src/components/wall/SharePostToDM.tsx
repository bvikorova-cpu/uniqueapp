import { useState, useEffect } from "react";
import { Send } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { toast } from "sonner";

interface Props {
  postId: string;
  trigger?: React.ReactNode;
}

export const SharePostToDM = ({ postId, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [comment, setComment] = useState("");
  const [target, setTarget] = useState<any>(null);
  const { sendMessage } = useDirectMessages(target?.id);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await (supabase as any).rpc("search_users", { q: search, lim: 10 });
      setResults((data ?? []).map((p: any) => ({ id: p.id, full_name: p.full_name, avatar_url: p.avatar_url })));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const postUrl = `${window.location.origin}/post/${postId}`;

  const handleSend = () => {
    if (!target?.id) return;
    const body = `${comment ? comment + "\n" : ""}${postUrl}`;
    sendMessage({ receiverId: target.id, content: body });
    toast.success(`Shared with ${target.full_name}`);
    setOpen(false);
    setTarget(null);
    setComment("");
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share post to DM</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ScrollArea className="h-48">
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => setTarget(p)}
                className={`w-full text-left px-2 py-2 rounded hover:bg-muted ${
                  target?.id === p.id ? "bg-muted" : ""
                }`}
              >
                {p.full_name}
              </button>
            ))}
          </ScrollArea>
          {target && (
            <>
              <p className="text-sm text-muted-foreground">To: {target.full_name}</p>
              <Textarea
                placeholder="Add a message (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
              />
              <Button onClick={handleSend} className="w-full">
                Send
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
