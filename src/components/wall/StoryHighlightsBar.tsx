import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoryHighlights } from "@/hooks/useStoryHighlights";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const StoryHighlightsBar = () => {
  const { user } = useAuth();
  const { highlights, createHighlight, isLoading } = useStoryHighlights(user?.id);
  const [newTitle, setNewTitle] = useState("");
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    if (newTitle.trim()) {
      createHighlight({ title: newTitle });
      setNewTitle("");
      setOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-hide">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
            <div className="w-12 h-3 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-hide">
      {/* Create new highlight */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="flex flex-col items-center gap-2 min-w-[80px] group">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-dashed border-primary/40 group-hover:border-primary transition-all">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">New Story</span>
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Story Highlight</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Highlight title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} className="w-full">
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing highlights */}
      {highlights?.map((highlight) => (
        <button
          key={highlight.id}
          className="flex flex-col items-center gap-2 min-w-[80px] group"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all overflow-hidden">
              {highlight.cover_image ? (
                <img
                  src={highlight.cover_image}
                  alt={highlight.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">📚</span>
              )}
            </div>
            {highlight.post_count && highlight.post_count > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {highlight.post_count}
              </div>
            )}
          </div>
          <span className="text-xs text-foreground/80 font-medium truncate w-20 text-center">
            {highlight.title}
          </span>
        </button>
      ))}
    </div>
  );
};
