import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompanionsSubscription } from "@/hooks/useCompanionsSubscription";
import { MessageCircle, Lock, Crown, Heart, Lightbulb, Smile, Brain, Star, Users, Sparkles, Settings } from "lucide-react";

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
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  
  const { subscription, createCheckout, manageSubscription, refresh } = useCompanionsSubscription();

  useEffect(() => {
    loadCharacters();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast({ title: "Subscription successful!", description: "You now have unlimited conversations." });
      refresh();
      window.history.replaceState({}, "", "/companions");
    }
  }, []);

  const loadCharacters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: chars } = await supabase
        .from("ai_characters")
        .select("*")
        .order("is_premium", { ascending: true });

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

      // Check subscription for non-premium characters (Max and Alex)
      if (!isPremium) {
        const freeMessagesRemaining = subscription.freeMessagesLimit - subscription.freeMessagesUsed;
        if (!subscription.subscribed && freeMessagesRemaining <= 0) {
          setShowSubscribeDialog(true);
          return;
        }
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

  const handleSubscribe = async () => {
    try {
      await createCheckout();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    }
  };

  if (loading || subscription.loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const freeMessagesRemaining = subscription.freeMessagesLimit - subscription.freeMessagesUsed;

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Character Companions
            </span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-4 px-2">
            Your personal companions with unique personalities
          </p>

          {/* Subscription Status */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            {subscription.subscribed ? (
              <>
                <Badge variant="default" className="text-sm px-3 py-1">
                  <Crown className="h-4 w-4 mr-1" />
                  Unlimited Access
                </Badge>
                <Button variant="outline" size="sm" onClick={manageSubscription}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </>
            ) : (
              <>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {freeMessagesRemaining} / {subscription.freeMessagesLimit} free messages
                </Badge>
                <Button variant="default" size="sm" onClick={handleSubscribe}>
                  Subscribe €5/month
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Detailed Description Section */}
        <Card className="max-w-4xl mx-auto mb-8 text-left">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              What are Character Companions?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              <strong>Character Companions</strong> are AI-powered virtual personalities designed to provide 
              meaningful conversations tailored to your needs. Each companion has a unique personality type 
              and communication style, from motivational coaching to humor and emotional support.
            </p>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">How to Use:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                <li><strong>Choose a Companion</strong> – Select a character that matches your current mood or needs (motivator, comedian, therapist, etc.).</li>
                <li><strong>Start a Conversation</strong> – Click "Start Chat" to begin a new conversation with your chosen companion.</li>
                <li><strong>Chat Naturally</strong> – Type your messages and receive personalized AI responses tailored to each character's personality.</li>
                <li><strong>Multiple Conversations</strong> – You can have ongoing conversations with different companions based on your needs.</li>
                <li><strong>Upgrade for Unlimited Access</strong> – Subscribe to remove message limits and enjoy unlimited conversations.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Available Companions:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <span><strong>Alex</strong> – The Motivator</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-orange-500" />
                  <span><strong>Max</strong> – The Comedian</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <span><strong>Dr. Emma</strong> – Therapist (Premium)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span><strong>Sophia</strong> – Romance (Premium)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span><strong>Professor Lee</strong> – Mentor (Premium)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Pricing:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>5 free messages to try</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span>€5/month for unlimited access</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground border-t pt-3">
              <strong>Tip:</strong> Each companion has a distinct personality. Try different ones to find the perfect match for your needs – whether you need motivation, laughter, guidance, or emotional support.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {characters.map((character) => {
            const Icon = personalityIcons[character.personality_type as keyof typeof personalityIcons] || MessageCircle;
            const hasAccess = !character.is_premium || userAccess.has(character.id);
            const canChat = character.is_premium 
              ? hasAccess 
              : (subscription.subscribed || freeMessagesRemaining > 0);

            return (
              <Card key={character.id} className={!canChat ? "opacity-75" : ""}>
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
                    onClick={() => {
                      if (character.is_premium && !hasAccess) {
                        navigate("/subscription");
                      } else if (!character.is_premium && !subscription.subscribed && freeMessagesRemaining <= 0) {
                        setShowSubscribeDialog(true);
                      } else {
                        startConversation(character.id, character.is_premium);
                      }
                    }}
                    className="w-full"
                    variant={canChat ? "default" : "outline"}
                  >
                    {canChat ? (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Chat
                      </>
                    ) : character.is_premium ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Unlock Premium
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Subscribe to Chat
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Free Messages Used</DialogTitle>
            <DialogDescription>
              You have used all your free messages. Subscribe for €5/month to get unlimited conversations with all AI Companions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Subscription Benefits:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unlimited conversations with Max & Alex</li>
                <li>• No daily message limits</li>
                <li>• Cancel anytime</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSubscribeDialog(false)} className="flex-1">
                Maybe Later
              </Button>
              <Button onClick={handleSubscribe} className="flex-1">
                Subscribe €5/month
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AICompanions;
