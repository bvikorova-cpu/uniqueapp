import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, MessageSquare, Sparkles, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const encouragements = [
  "You are stronger than you know 💪",
  "This too shall pass. Hold on! 🌟",
  "You matter. You are valued. You are loved. ❤️",
  "Better days are coming, I promise! 🌈",
  "You're not alone in this fight! 🤝",
];

const SafetySupportWall = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["safety-support-wall"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_support_wall")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  const addMessage = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to post");

      const { error } = await supabase
        .from("safety_support_wall")
        .insert({
          user_id: user.id,
          message: message.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety-support-wall"] });
      toast.success("Your message of support has been posted!");
      setShowForm(false);
      setMessage("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const quickEncourage = async (encouragement: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to post encouragement");
      return;
    }

    const { error } = await supabase
      .from("safety_support_wall")
      .insert({
        user_id: user.id,
        message: encouragement
      });

    if (error) {
      toast.error("Failed to post");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["safety-support-wall"] });
    toast.success("Encouragement posted!");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Anonymous Support Wall
          </CardTitle>
          <CardDescription>
            A safe space to share encouragement and support. All posts are anonymous. You are not alone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showForm ? (
            <div className="space-y-4">
              <Button onClick={() => setShowForm(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Write a Message of Support
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">or send quick encouragement:</div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {encouragements.map((enc, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-2 px-3"
                    onClick={() => quickEncourage(enc)}
                  >
                    {enc}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share words of encouragement, support, or hope... Your message could help someone who really needs it."
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{message.length}/500 characters</span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Posted anonymously
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => addMessage.mutate()} 
                  disabled={addMessage.isPending || message.trim().length < 10}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Share Support
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Wall Feed */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Messages of Hope
        </h3>
        
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Loading messages...</p>
        ) : messages?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-pink-500/50" />
              <p className="text-muted-foreground">Be the first to share a message of support!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {messages?.map((msg: any) => (
              <Card key={msg.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <p className="text-lg">{msg.message}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> Anonymous
                    </span>
                    <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Reminder */}
      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            💛 Remember: If you're struggling, you can also use our <strong>Support Chat</strong> or check <strong>SOS Contacts</strong> for professional help.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SafetySupportWall;
