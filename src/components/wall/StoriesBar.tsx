import { useState } from "react";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStories } from "@/hooks/useStories";
import { ScrollArea } from "@/components/ui/scroll-area";

export const StoriesBar = () => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const { stories, createStory, viewStory } = useStories();

  const handleCreateStory = () => {
    if (!selectedFile) return;
    
    createStory(
      { mediaFile: selectedFile, caption },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedFile(null);
          setCaption("");
        },
      }
    );
  };

  return (
    <>
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-4 overflow-x-auto">
          {/* Create Story */}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-2 min-w-[80px] hover:opacity-80 transition"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary flex items-center justify-center bg-accent">
                <Plus className="w-6 h-6 text-primary" />
              </div>
            </div>
            <span className="text-xs font-medium">Your Story</span>
          </button>

          {/* Stories */}
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => viewStory(story.id)}
              className="flex flex-col items-center gap-2 min-w-[80px] hover:opacity-80 transition"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background p-0.5">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={story.profiles?.avatar_url || undefined} />
                    <AvatarFallback>{story.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs font-medium truncate w-full text-center">
                {story.profiles?.full_name || "User"}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <Textarea
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <Button onClick={handleCreateStory} disabled={!selectedFile} className="w-full">
              Create Story
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
