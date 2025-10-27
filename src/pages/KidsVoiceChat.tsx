import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { characterCategories } from "@/data/kidsCharacters";
import type { Character } from "@/data/kidsCharacters";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { CharacterCard } from "@/components/kids/CharacterCard";

export default function KidsVoiceChat() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedCharacter || isLoading) return;

    const userMessage = { role: "user", content: inputMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/kids-character-chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages,
            characterName: selectedCharacter.name,
            characterPersonality: selectedCharacter.personality,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

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
          if (!line.trim() || line.startsWith(':')) continue;
          if (!line.startsWith('data: ')) continue;

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
          } catch (e) {
            // Ignore parsing errors for incomplete JSON
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = (character: Character) => {
    setSelectedCharacter(character);
    setMessages([
      {
        role: "assistant",
        content: `Hi! I'm ${character.name}! What would you like to talk about?`,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-100 to-teal-100">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/kids-channel")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-green-700 mb-4">
              💬 Chat with Characters!
            </h1>
            <p className="text-xl text-gray-700">
              Choose a character and start chatting!
            </p>
          </div>

          {!selectedCharacter ? (
            <div className="space-y-8">
              {characterCategories.map((category) => (
                <Card key={category.id} className="p-6 bg-white/90 backdrop-blur-sm">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {category.name}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {category.characters.map((character) => (
                      <CharacterCard
                        key={character.id}
                        character={character}
                        onClick={() => startNewChat(character)}
                      />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCharacter.emoji}</span>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedCharacter.name}
                  </h2>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCharacter(null);
                    setMessages([]);
                  }}
                >
                  Choose Another Character
                </Button>
              </div>

              <ScrollArea className="h-[400px] mb-4 p-4 border rounded-lg bg-white/50">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-blue-500 text-white"
                            : `bg-gradient-to-br ${selectedCharacter.color} text-white`
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
