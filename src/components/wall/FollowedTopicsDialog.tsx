import { useState } from "react";
import { Hash, X, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFollowedTopics } from "@/hooks/useFollowedTopics";

export const FollowedTopicsDialog = ({ trigger }: { trigger?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { topics, followTopic, unfollowTopic } = useFollowedTopics();

  const submit = () => {
    if (!input.trim()) return;
    followTopic(input);
    setInput("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Hash className="w-4 h-4 mr-2" /> Topics
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Followed topics</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            placeholder="Add topic (e.g. fitness)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <Button onClick={submit}><Plus className="w-4 h-4" /></Button>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="flex flex-wrap gap-2">
            {topics.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No topics yet</p>
            )}
            {topics.map((t: any) => (
              <Badge key={t.id} variant="secondary" className="gap-1 pr-1">
                #{t.topic}
                <Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => unfollowTopic(t.topic)}>
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
