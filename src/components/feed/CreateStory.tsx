import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Image as ImageIcon, Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function CreateStory() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptionA, setPollOptionA] = useState("");
  const [pollOptionB, setPollOptionB] = useState("");
  const [includePoll, setIncludePoll] = useState(false);

  const createStoryMutation = useMutation({
    mutationFn: async () => {
      if (!mediaFile) throw new Error("Select media");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You are not logged in");

      // Upload media
      const fileExt = mediaFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("media")
        .upload(fileName, mediaFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(fileName);

      // Create story
      const { data: story, error: storyError } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: mediaType,
          caption: caption || null,
        })
        .select()
        .single();

      if (storyError) throw storyError;

      // Create poll if included
      if (includePoll && pollQuestion && pollOptionA && pollOptionB) {
        const { error: pollError } = await supabase.from("story_polls").insert({
          story_id: story.id,
          question: pollQuestion,
          option_a: pollOptionA,
          option_b: pollOptionB,
        });

        if (pollError) throw pollError;
      }

      return story;
    },
    onSuccess: () => {
      toast.success("Story created!");
      setOpen(false);
      setMediaFile(null);
      setCaption("");
      setPollQuestion("");
      setPollOptionA("");
      setPollOptionB("");
      setIncludePoll(false);
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: (error) => {
      toast.error("Error creating story");
      console.error(error);
    },
  });

  return (
    <>
      <FloatingHowItWorks title={"Create Story - How it works"} steps={[{ title: 'Open', desc: 'Access the Create Story section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Create Story.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Story
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new Story</DialogTitle>
          <DialogDescription>Share a moment with friends (24h)</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="image" onValueChange={(v) => setMediaType(v as "image" | "video")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Photo
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="image-file">Upload photo</Label>
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              />
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="video-file">Upload video</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div>
            <Label htmlFor="caption">Description (optional)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's happening?"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="include-poll"
              checked={includePoll}
              onChange={(e) => setIncludePoll(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="include-poll" className="cursor-pointer">
              Add poll
            </Label>
          </div>

          {includePoll && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Poll</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="poll-question">Question</Label>
                  <Input
                    id="poll-question"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="E.g: What's better?"
                  />
                </div>
                <div>
                  <Label htmlFor="poll-a">Option A</Label>
                  <Input
                    id="poll-a"
                    value={pollOptionA}
                    onChange={(e) => setPollOptionA(e.target.value)}
                    placeholder="E.g: Summer"
                  />
                </div>
                <div>
                  <Label htmlFor="poll-b">Option B</Label>
                  <Input
                    id="poll-b"
                    value={pollOptionB}
                    onChange={(e) => setPollOptionB(e.target.value)}
                    placeholder="E.g: Winter"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={() => createStoryMutation.mutate()}
            disabled={!mediaFile || createStoryMutation.isPending}
            className="w-full"
          >
            {createStoryMutation.isPending ? "Creating..." : "Share Story"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
