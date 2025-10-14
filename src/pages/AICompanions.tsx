import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Lock, Crown, Heart, Lightbulb, Smile, Brain } from "lucide-react";

const personalityIcons = {
  motivator: Lightbulb,
  therapist: Heart,
  humor: Smile,
  romance: Heart,
  mentor: Brain,
};

const AICompanions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [characters, setCharacters] = useState<any[]>([]);
  const [userAccess, setUserAccess] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load all characters
      const { data: chars } = await supabase
        .from("ai_characters")
        .select("*")
        .order("is_premium", { ascending: true });

      // Load user's access
      const { data: access } = await supabase
        .from("user_character_access")
        .select("character_id")
        .eq("user_id", user.id);

      setCharacters(chars || []);
      setUserAccess(new Set(access?.map(a => a.character_id) || []));
    } catch (error) {
      console.error("Error loading characters:", error);
      toast({
        title: "Error",
        description: "Failed to load characters",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (characterId: string, isPremium: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check access for premium characters
      if (isPremium && !userAccess.has(characterId)) {
        toast({
          title: "Premium Character",
          description: "This character requires premium access",
          variant: "destructive",
        });
        return;
      }

      // Create new conversation
      const { data: conversation, error } = await supabase
        .from("character_conversations")
        .insert({
          user_id: user.id,
          character_id: characterId,
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/companions/${conversation.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Character Companions
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Your personal AI companions with unique personalities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => {
            const Icon = personalityIcons[character.personality_type as keyof typeof personalityIcons] || MessageCircle;
            const hasAccess = !character.is_premium || userAccess.has(character.id);

            return (
              <Card key={character.id} className={!hasAccess ? "opacity-75" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{character.name}</CardTitle>
                        <CardDescription className="text-xs capitalize">
                          {character.personality_type}
                        </CardDescription>
                      </div>
                    </div>
                    {character.is_premium && (
                      <Badge variant={hasAccess ? "default" : "secondary"}>
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {character.description}
                  </p>
                  <Button
                    onClick={() => startConversation(character.id, character.is_premium)}
                    disabled={!hasAccess}
                    className="w-full"
                    variant={hasAccess ? "default" : "outline"}
                  >
                    {hasAccess ? (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Unlock Premium
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AICompanions;
