import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Sparkles } from "lucide-react";
import { characterCategories } from "@/data/kidsCharacters";
import type { Character } from "@/data/kidsCharacters";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ParentalGate, useParentalGate } from "@/components/kids/ParentalGate";
import { SafeContentBadge } from "@/components/kids/SafeContentBadge";
import { AnimatePresence, motion } from "framer-motion";
import { useChatCredits } from "@/hooks/useChatCredits";
import { ChatCreditBanner } from "@/components/kids/chat/ChatCreditBanner";

// New chat components
import { AnimatedChatBubble } from "@/components/kids/chat/AnimatedChatBubble";
import { TypingIndicator } from "@/components/kids/chat/TypingIndicator";
import { VoiceInputWaveform } from "@/components/kids/chat/VoiceInputWaveform";
import { CharacterMoodIndicator } from "@/components/kids/chat/CharacterMoodIndicator";
import { ChatAchievements } from "@/components/kids/chat/ChatAchievements";
import { StoryModePrompt } from "@/components/kids/chat/StoryModePrompt";
import { ImmersiveCharacterCard } from "@/components/kids/chat/ImmersiveCharacterCard";
import { MagicalParticles } from "@/components/kids/chat/MagicalParticles";
import { characterImages } from "@/data/characterImages";
import Navbar from "@/components/Navbar";

const HISTORY_PREFIX = "kids_voicechat_history_v1:";

export default function KidsVoiceChat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { credits_remaining, loading: creditsLoading, canSendMessage, refresh: refreshCredits } = useChatCredits();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStoryMode, setShowStoryMode] = useState(false);

  // Stats tracking (starts from zero)
  const [messagesSent, setMessagesSent] = useState(0);
  const [charactersUsed, setCharactersUsed] = useState<Set<string>>(new Set());
  const [reactionsGiven, setReactionsGiven] = useState(0);

  // Parental Gate
  const { checkVerification } = useParentalGate();
  const [showParentalGate, setShowParentalGate] = useState(false);

  useEffect(() => {
    if (!checkVerification()) {
      setShowParentalGate(true);
    }
  }, []);

  // Persist messages per character so conversation survives refresh.
  useEffect(() => {
    if (!selectedCharacter) return;
    try {
      const raw = localStorage.getItem(HISTORY_PREFIX + selectedCharacter.id);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {}
  }, [selectedCharacter?.id]);

  useEffect(() => {
    if (!selectedCharacter || messages.length === 0) return;
    try {
      // Keep last 50 messages to bound storage.
      const trimmed = messages.slice(-50);
      localStorage.setItem(HISTORY_PREFIX + selectedCharacter.id, JSON.stringify(trimmed));
    } catch {}
  }, [messages, selectedCharacter?.id]);

  // Verify Stripe checkout return (?payment=success&session_id=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("payment");
    const sessionId = params.get("session_id");
    if (status === "success" && sessionId) {
      (async () => {
        try {
          await supabase.functions.invoke("verify-credits-payment", {
            body: { session_id: sessionId },
          });
          await refreshCredits();
          toast({ title: "Credits added! 🎉", description: "You can now keep chatting." });
        } catch (e) {
          console.error("verify-credits-payment failed", e);
        } finally {
          window.history.replaceState({}, "", "/kids-voice-chat");
        }
      })();
    } else if (status === "canceled") {
      toast({ title: "Payment canceled", description: "No credits were added." });
      window.history.replaceState({}, "", "/kids-voice-chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (overrideMessage?: string) => {
    const msgText = overrideMessage || inputMessage.trim();
    if (!msgText || !selectedCharacter || isLoading) return;

    // Paid-only guard
    if (!canSendMessage) {
      toast({
        title: "Out of Chat credits",
        description: "Buy more credits to keep chatting with your characters!",
        variant: "destructive",
      });
      navigate("/kids-voice-chat-pricing");
      return;
    }

    const userMessage = { role: "user", content: msgText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);
    setMessagesSent(prev => prev + 1);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
      const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/character-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token ?? SUPABASE_ANON}`,
            'apikey': SUPABASE_ANON,
          },
          body: JSON.stringify({
            messages: newMessages,
            characterName: selectedCharacter.name,
            characterPersonality: selectedCharacter.personality,
          }),
        }
      );

      if (response.status === 401) {
        toast({ title: "Sign in required", description: "Please sign in to chat.", variant: "destructive" });
        navigate("/auth");
        return;
      }
      if (response.status === 402) {
        toast({
          title: "Out of credits",
          description: "You need more Chat credits to continue.",
          variant: "destructive",
        });
        setMessages(prev => prev.slice(0, -1));
        await refreshCredits();
        navigate("/kids-voice-chat-pricing");
        return;
      }
      if (response.status === 429) {
        toast({ title: "Slow down!", description: "Too many messages. Wait a moment.", variant: "destructive" });
        setMessages(prev => prev.slice(0, -1));
        return;
      }
      if (!response.ok || !response.body) throw new Error('Failed to get response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':') || !line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantMessage };
                return updated;
              });
            }
          } catch {}
        }
      }

      // Refresh credit balance after successful message
      await refreshCredits();
    } catch (error) {
      console.error('Chat error:', error);
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = (character: Character) => {
    setSelectedCharacter(character);
    setCharactersUsed(prev => new Set(prev).add(character.id));
    setShowStoryMode(true);
    setMessages([
      { role: "assistant", content: `Hi! I'm ${character.name}! 👋 What would you like to talk about? We can chat, or try Story Mode for an interactive adventure!` },
    ]);
  };

  const handleStorySelect = (prompt: string) => {
    setShowStoryMode(false);
    sendMessage(prompt);
  };

  const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-pink-50 to-cyan-100 relative overflow-hidden">
      <Navbar />
      <MagicalParticles count={10} />


      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <Button variant="ghost" onClick={() => navigate("/kids-channel")} className="mb-6 hover:bg-white/50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.h1
              className="text-5xl md:text-6xl font-black bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent mb-3"
              animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "200%" }}
            >
              💬 Character Chat
            </motion.h1>
            <p className="text-lg text-gray-600">Choose a character and start an amazing conversation!</p>
          </motion.div>

          {/* Credit balance banner (paid-only) */}
          <ChatCreditBanner credits={credits_remaining} loading={creditsLoading} />

          {!selectedCharacter ? (
            /* Character Selection */
            <div className="space-y-8">
              {characterCategories.map((category, catIdx) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIdx * 0.1 }}
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-md border-white/50 shadow-xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{category.name}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {category.characters.map((character, charIdx) => (
                        <ImmersiveCharacterCard
                          key={character.id}
                          character={character}
                          onClick={() => startNewChat(character)}
                          index={charIdx}
                        />
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Chat Interface */
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Chat */}
              <div className="lg:col-span-3">
                <Card className="bg-white/85 backdrop-blur-md border-white/50 shadow-xl overflow-hidden">
                  {/* Chat Header */}
                  <div className={`bg-gradient-to-r ${selectedCharacter.color} p-4`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {characterImages[selectedCharacter.id] ? (
                          <motion.img
                            src={characterImages[selectedCharacter.id]}
                            alt={selectedCharacter.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white/60 shadow-lg flex-shrink-0"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                          />
                        ) : (
                          <motion.span
                            className="text-4xl"
                            animate={{ rotate: [0, -10, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                          >
                            {selectedCharacter.emoji}
                          </motion.span>
                        )}
                        <div className="min-w-0">
                          <h2 className="text-xl font-bold text-white truncate">{selectedCharacter.name}</h2>
                          <CharacterMoodIndicator
                            character={selectedCharacter}
                            messageCount={messages.length}
                            lastMessage={lastUserMessage}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowStoryMode(!showStoryMode)}
                          className="bg-white/20 text-white hover:bg-white/30 border-0 px-2 sm:px-3"
                          aria-label="Story Mode"
                        >
                          <Sparkles className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Story Mode</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => { setSelectedCharacter(null); setMessages([]); setShowStoryMode(false); }}
                          className="bg-white/20 text-white hover:bg-white/30 border-0 px-2 sm:px-3"
                          aria-label="Change Character"
                        >
                          <ArrowLeft className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Change</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Story Mode Prompt */}
                  <AnimatePresence>
                    {showStoryMode && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-b">
                          <StoryModePrompt
                            characterName={selectedCharacter.name}
                            onSelectStory={handleStorySelect}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Messages */}
                  <ScrollArea className="h-[450px] p-4">
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <AnimatedChatBubble
                          key={index}
                          message={message}
                          character={selectedCharacter}
                          index={index}
                          onReaction={() => setReactionsGiven(prev => prev + 1)}
                        />
                      ))}
                      <AnimatePresence>
                        {isLoading && <TypingIndicator character={selectedCharacter} />}
                      </AnimatePresence>
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-4 border-t bg-white/50">
                    <div className="flex gap-2 items-center">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-1 rounded-full border-2 border-purple-200 focus:border-purple-400 px-4"
                      />
                      <VoiceInputWaveform
                        onTranscript={(text) => { setInputMessage(text); }}
                        disabled={isLoading}
                      />
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          onClick={() => sendMessage()}
                          disabled={isLoading || !inputMessage.trim()}
                          className="rounded-full h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-0"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card className="p-4 bg-white/85 backdrop-blur-md border-white/50 shadow-xl">
                  <ChatAchievements
                    messagesSent={messagesSent}
                    charactersUsed={charactersUsed.size}
                    reactionsGiven={reactionsGiven}
                  />
                </Card>

                <Card className="p-4 bg-white/85 backdrop-blur-md border-white/50 shadow-xl">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">📊 Chat Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Messages Sent</span>
                      <span className="font-bold text-purple-600">{messagesSent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Characters Met</span>
                      <span className="font-bold text-pink-600">{charactersUsed.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Reactions Given</span>
                      <span className="font-bold text-orange-600">{reactionsGiven}</span>
                    </div>
                  </div>
                </Card>

                <SafeContentBadge />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parental Gate */}
      <ParentalGate
        isOpen={showParentalGate}
        onSuccess={() => setShowParentalGate(false)}
        onClose={() => {
          if (!checkVerification()) navigate('/kids-channel');
          setShowParentalGate(false);
        }}
        featureName="Character Chat"
      />
    </div>
  );
}
