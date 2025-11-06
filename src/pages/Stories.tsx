import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Heart, Send, X, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface StoryProfile {
  full_name: string;
  avatar_url: string;
}

interface StoryPoll {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  votes_a: number;
  votes_b: number;
}

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
  views_count: number;
  profiles: StoryProfile | null;
  story_polls: StoryPoll[] | null;
}

export default function Stories() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [reaction, setReaction] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Fetch stories for the user
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["stories", userId],
    queryFn: async () => {
      const { data: storiesData, error } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", userId)
        .single();

      // Fetch polls for each story
      const { data: polls } = await supabase
        .from("story_polls")
        .select("*")
        .in("story_id", storiesData?.map((s) => s.id) || []);

      // Combine data
      return (storiesData || []).map((story) => ({
        ...story,
        profiles: profile,
        story_polls: polls?.filter((p) => p.story_id === story.id) || [],
      })) as Story[];
    },
    enabled: !!userId,
  });

  const currentStory = stories[currentIndex];

  // Record view
  useEffect(() => {
    if (!currentStory || !user) return;

    const recordView = async () => {
      await supabase.from("story_views").insert({
        story_id: currentStory.id,
        user_id: user.id,
      });
    };

    recordView();
  }, [currentStory?.id, user]);

  // Auto-progress through stories
  useEffect(() => {
    if (!currentStory) return;

    const duration = currentStory.media_type === "video" ? 15000 : 5000;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (duration / 100));
        if (newProgress >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((i) => i + 1);
            return 0;
          } else {
            navigate("/wall");
            return 100;
          }
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, currentStory, stories.length, navigate]);

  // Send reaction
  const sendReactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      if (!user || !currentStory) throw new Error("Not ready");

      const { error } = await supabase.from("story_reactions").insert({
        story_id: currentStory.id,
        user_id: user.id,
        reaction: emoji,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reakcia odoslaná!");
      setReaction("");
    },
  });

  // Vote on poll
  const voteMutation = useMutation({
    mutationFn: async ({ pollId, vote }: { pollId: string; vote: "a" | "b" }) => {
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase.from("story_poll_votes").insert({
        poll_id: pollId,
        user_id: user.id,
        vote,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories", userId] });
      toast.success("Hlas zaznamenaný!");
    },
  });

  // Delete story
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      if (!user) throw new Error("Not logged in");

      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Story odstránená!");
      queryClient.invalidateQueries({ queryKey: ["stories", userId] });
      setShowDeleteDialog(false);
      
      // Navigate to next story or back to feed
      if (currentIndex < stories.length - 1) {
        setCurrentIndex((i) => i + 1);
        setProgress(0);
      } else if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        setProgress(0);
      } else {
        navigate("/wall");
      }
    },
    onError: (error) => {
      toast.error("Chyba pri odstraňovaní story");
      console.error(error);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Načítavam...</p>
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p>Žiadne aktívne stories</p>
          <Button onClick={() => navigate("/wall")} className="mt-4">
            Back to Wall
          </Button>
        </div>
      </div>
    );
  }

  const poll = currentStory.story_polls?.[0];
  const totalVotes = poll ? poll.votes_a + poll.votes_b : 0;

  return (
    <div className="min-h-screen bg-black relative">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
        {stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-40 flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-white">
            <AvatarImage src={currentStory.profiles?.avatar_url} />
            <AvatarFallback>{currentStory.profiles?.full_name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="text-white">
            <p className="font-semibold">{currentStory.profiles?.full_name}</p>
            <p className="text-xs opacity-75">
              {new Date(currentStory.created_at).toLocaleTimeString("sk-SK", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Delete button (only for own stories) */}
          {user && currentStory.user_id === user.id && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="text-white hover:bg-white/20"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/wall")}
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Story content */}
      <div className="h-screen w-full flex items-center justify-center">
        {currentStory.media_type === "image" ? (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <video
            src={currentStory.media_url}
            autoPlay
            muted
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>

      {/* Caption */}
      {currentStory.caption && (
        <div className="absolute bottom-32 left-0 right-0 px-4">
          <p className="text-white text-center text-lg">{currentStory.caption}</p>
        </div>
      )}

      {/* Poll */}
      {poll && (
        <div className="absolute bottom-32 left-0 right-0 px-4">
          <Card className="bg-white/90 backdrop-blur-sm p-4">
            <p className="font-semibold mb-4">{poll.question}</p>
            <div className="space-y-2">
              <button
                onClick={() => voteMutation.mutate({ pollId: poll.id, vote: "a" })}
                className="w-full p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-primary/20"
                  style={{
                    width: totalVotes > 0 ? `${(poll.votes_a / totalVotes) * 100}%` : "0%",
                  }}
                />
                <div className="relative flex justify-between items-center">
                  <span>{poll.option_a}</span>
                  {totalVotes > 0 && (
                    <span className="text-sm font-semibold">
                      {Math.round((poll.votes_a / totalVotes) * 100)}%
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => voteMutation.mutate({ pollId: poll.id, vote: "b" })}
                className="w-full p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 bg-primary/20"
                  style={{
                    width: totalVotes > 0 ? `${(poll.votes_b / totalVotes) * 100}%` : "0%",
                  }}
                />
                <div className="relative flex justify-between items-center">
                  <span>{poll.option_b}</span>
                  {totalVotes > 0 && (
                    <span className="text-sm font-semibold">
                      {Math.round((poll.votes_b / totalVotes) * 100)}%
                    </span>
                  )}
                </div>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {totalVotes} {totalVotes === 1 ? "hlas" : totalVotes < 5 ? "hlasy" : "hlasov"}
            </p>
          </Card>
        </div>
      )}

      {/* Reaction bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex gap-2">
          <Input
            value={reaction}
            onChange={(e) => setReaction(e.target.value)}
            placeholder="Napíš správu..."
            className="flex-1 bg-white/90"
            onKeyDown={(e) => {
              if (e.key === "Enter" && reaction.trim()) {
                sendReactionMutation.mutate(reaction);
              }
            }}
          />
          <Button
            size="icon"
            onClick={() => sendReactionMutation.mutate("❤️")}
            className="bg-white/90 hover:bg-white text-red-500"
          >
            <Heart className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            onClick={() => reaction.trim() && sendReactionMutation.mutate(reaction)}
            disabled={!reaction.trim()}
            className="bg-white/90 hover:bg-white text-primary"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation areas */}
      <div className="absolute inset-0 flex">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex((i) => i - 1);
              setProgress(0);
            }
          }}
        />
        <div
          className="flex-1 cursor-pointer"
          onClick={() => {
            if (currentIndex < stories.length - 1) {
              setCurrentIndex((i) => i + 1);
              setProgress(0);
            } else {
              navigate("/wall");
            }
          }}
        />
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Odstrániť Story?</AlertDialogTitle>
            <AlertDialogDescription>
              Táto akcia je nezvratná. Story bude natrvalo odstránená.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušiť</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => currentStory && deleteStoryMutation.mutate(currentStory.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Odstrániť
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
