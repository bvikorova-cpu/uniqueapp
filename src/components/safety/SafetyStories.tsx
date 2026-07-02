import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, BookOpen, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const categories = ["School", "Workplace", "Online", "Neighborhood", "Family", "Other"];

const SafetyStories = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Other",
    is_anonymous: true
  });

  const { data: stories, isLoading } = useQuery({
    queryKey: ["safety-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const addStory = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to share your story");

      const { error } = await supabase
        .from("safety_stories")
        .insert({
          user_id: user.id,
          ...formData
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety-stories"] });
      toast.success("Your story has been shared. Thank you for your courage!");
      setShowForm(false);
      setFormData({ title: "", content: "", category: "Other", is_anonymous: true });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const supportStory = useMutation({
    mutationFn: async (storyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to show support");

      const { error } = await supabase
        .from("safety_story_supports")
        .insert({
          story_id: storyId,
          user_id: user.id
        });

      if (error && error.code !== "23505") throw error; // Ignore duplicate key error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety-stories"] });
      toast.success("Thank you for showing support!");
    },
    onError: (error: Error) => {
      if (!error.message.includes("duplicate")) {
        toast.error(error.message);
      }
    }
  });

  return (
    <>
      <FloatingHowItWorks title={"Safety Stories - How it works"} steps={[{ title: 'Open', desc: 'Access the Safety Stories section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Safety Stories.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Story Library
          </CardTitle>
          <CardDescription>
            Read and share anonymous stories of overcoming bullying. Your story can help others.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Share Your Story
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Give your story a title..."
                />
              </div>

              <div>
                <Label>Your Story</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Share your experience... What happened? How did you cope? What advice would you give?"
                  rows={6}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Label className="w-full">Category</Label>
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    variant={formData.category === cat ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFormData({...formData, category: cat})}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData({...formData, is_anonymous: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  Share anonymously (recommended)
                </Label>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => addStory.mutate()} 
                  disabled={addStory.isPending || !formData.title || !formData.content}
                >
                  Share Story
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stories Feed */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Community Stories</h3>
        {isLoading ? (
          <p className="text-muted-foreground">Loading stories...</p>
        ) : stories?.length === 0 ? (
          <p className="text-muted-foreground">No stories yet. Be the first to share!</p>
        ) : (
          stories?.map((story: any) => (
            <Card key={story.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{story.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{story.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-xs">Anonymous</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{story.content}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => supportStory.mutate(story.id)}
                    disabled={supportStory.isPending}
                  >
                    <Heart className="h-4 w-4 mr-1 text-red-500" />
                    Support ({story.support_count || 0})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default SafetyStories;
