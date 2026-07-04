import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Languages, FileText, Sparkles, Coins, Loader2, 
  Clock, Cloud, Zap, Heart, Wand2 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface MessengerAIFeaturesProps {
  userId: string;
  selectedText?: string;
  messages: Array<{ sender_id: string; content: string; sender_name?: string }>;
  onInsertText: (text: string) => void;
  recipientId?: string;
  recipientName?: string;
}

const LANGUAGES = [
  "English", "Slovak", "Czech", "German", "French", "Spanish", 
  "Italian", "Polish", "Hungarian", "Ukrainian", "Russian", "Chinese"
];

const CREDIT_PACKAGES = [
  { credits: 20, price: 5 },
  { credits: 50, price: 10 },
  { credits: 150, price: 25 },
];

const WEATHER_ICONS: Record<string, string> = {
  sunny: "☀️",
  cloudy: "☁️",
  rainy: "🌧️",
  stormy: "⛈️",
  rainbow: "🌈",
  foggy: "🌫️",
};

export const MessengerAIFeatures = ({
  userId,
  selectedText,
  messages,
  onInsertText,
  recipientId,
  recipientName,
}: MessengerAIFeaturesProps) => {
  const { toast } = useToast();
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [showSmartReplies, setShowSmartReplies] = useState(false);
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  
  // New feature states
  const [showTimeCapsule, setShowTimeCapsule] = useState(false);
  const [timeCapsuleMessage, setTimeCapsuleMessage] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  
  const [showEmotionalWeather, setShowEmotionalWeather] = useState(false);
  const [emotionalAnalysis, setEmotionalAnalysis] = useState<any>(null);
  
  const [showQuantumMessage, setShowQuantumMessage] = useState(false);
  const [quantumOriginal, setQuantumOriginal] = useState("");
  const [quantumType, setQuantumType] = useState("mood");
  const [quantumVariations, setQuantumVariations] = useState<any[]>([]);
  
  const [showCompliment, setShowCompliment] = useState(false);
  const [complimentContext, setComplimentContext] = useState("");
  const [complimentStyle, setComplimentStyle] = useState("heartfelt");
  const [generatedCompliment, setGeneratedCompliment] = useState<any>(null);
  
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [whatIfScenario, setWhatIfScenario] = useState("");
  const [whatIfStory, setWhatIfStory] = useState<any>(null);

  useEffect(() => {
    fetchCredits();
  }, [userId]);

  const fetchCredits = async () => {
    const { data } = await supabase
      .from("messenger_ai_credits")
      .select("credits_remaining")
      .eq("user_id", userId)
      .single();
    setCredits(data?.credits_remaining || 0);
  };

  /** Returns true if it handled the error (caller should bail). */
  const handleAIError = (error: any, data: any, fallbackTitle = "Failed"): boolean => {
    const msg = String(error?.message || data?.error || "");
    const status = error?.context?.status ?? error?.status;
    const isCredits =
      status === 402 ||
      /insufficient credits/i.test(msg) ||
      /402/.test(msg);
    if (isCredits) {
      setCredits(0);
      setShowCreditsDialog(true);
      toast({
        title: "AI credits depleted",
        description: "Buy more credits to continue using AI features.",
        variant: "destructive",
      });
      return true;
    }
    if (error || data?.error) {
      toast({ title: fallbackTitle, description: msg || "Unknown error", variant: "destructive" });
      return true;
    }
    return false;
  };


  const handleTranslate = async (targetLanguage: string) => {
    if (!selectedText) {
      toast({ title: "Select text to translate", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("messenger-ai", {
        body: { action: "translate", text: selectedText, targetLanguage },
      });

      if (handleAIError(error, data)) return;

      onInsertText(data.translation);
      await fetchCredits();
      toast({ title: "Translated!", description: `${data.creditsUsed} credits used` });
    } catch (error: any) {
      toast({ title: "Translation failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (messages.length < 3) {
      toast({ title: "Need more messages to summarize", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const formattedMessages = messages.slice(-20).map(m => ({
        sender: m.sender_name || (m.sender_id === userId ? "Me" : "Them"),
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("messenger-ai", {
        body: { action: "summarize", messages: formattedMessages },
      });

      if (handleAIError(error, data)) return;

      setSummary(data.summary);
      setShowSummary(true);
      await fetchCredits();
      toast({ title: "Summary ready!", description: `${data.creditsUsed} credits used` });
    } catch (error: any) {
      toast({ title: "Summarization failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartReply = async () => {
    if (messages.length < 1) {
      toast({ title: "Need messages for smart replies", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const lastMessages = messages.slice(-5).map(m => ({
        isMe: m.sender_id === userId,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("messenger-ai", {
        body: { action: "smart-reply", lastMessages },
      });

      if (handleAIError(error, data)) return;

      const suggestions: string[] = Array.isArray(data?.suggestions)
        ? data.suggestions
        : Array.isArray(data?.replies)
          ? data.replies
          : [];
      if (suggestions.length === 0) {
        toast({ title: "No suggestions returned", description: "Try again in a moment", variant: "destructive" });
        return;
      }
      setSmartReplies(suggestions);
      setShowSmartReplies(true);
      await fetchCredits();
      const used = data?.creditsUsed ?? data?.credits_used ?? 1;
      toast({ title: "Suggestions ready!", description: `${used} credit used` });
    } catch (error: any) {
      toast({ title: "Smart reply failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeCapsule = async () => {
    if (!timeCapsuleMessage || !deliveryDate || !recipientId) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("messenger-ai", {
        body: { action: "time-capsule", 
          message: timeCapsuleMessage, 
          deliveryDate, 
          recipientId,
          generateImage: true 
        },
      });

      if (handleAIError(error, data)) return;

      setShowTimeCapsule(false);
      setTimeCapsuleMessage("");
      setDeliveryDate("");
      await fetchCredits();
      toast({ title: "⏰ Time Capsule Created!", description: `Will be delivered on ${deliveryDate}` });
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmotionalWeather = async () => {
    if (messages.length < 3) {
      toast({ title: "Need more messages to analyze", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const formattedMessages = messages.slice(-15).map(m => ({
        sender: m.sender_name || (m.sender_id === userId ? "Me" : "Them"),
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("messenger-ai", {
        body: { action: "emotional-weather", messages: formattedMessages },
      });

      if (handleAIError(error, data)) return;

      setEmotionalAnalysis(data.analysis);
      setShowEmotionalWeather(true);
      await fetchCredits();
      toast({ title: "Analysis ready!", description: `${data.creditsUsed} credits used` });
    } catch (error: any) {
      toast({ title: "Analysis failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantumMessage = async () => {
    if (!quantumOriginal) {
      toast({ title: "Enter a message first", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("messenger-ai", {
        body: { action: "quantum-message", originalMessage: quantumOriginal, variationType: quantumType },
      });

      if (handleAIError(error, data)) return;

      setQuantumVariations(data.variations?.variations || []);
      await fetchCredits();
      toast({ title: "Variations ready!", description: `${data.creditsUsed} credits used` });
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousCompliment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("messenger-ai", {
        body: { action: "anonymous-compliment", 
          recipientName: recipientName || "someone special", 
          context: complimentContext,
          style: complimentStyle 
        },
      });

      if (handleAIError(error, data)) return;

      setGeneratedCompliment(data);
      await fetchCredits();
      toast({ title: "Compliment ready!", description: `${data.creditsUsed} credits used` });
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatIf = async () => {
    if (!whatIfScenario) {
      toast({ title: "Enter a scenario", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("messenger-ai", {
        body: { action: "what-if", scenario: whatIfScenario },
      });

      if (handleAIError(error, data)) return;

      setWhatIfStory(data);
      await fetchCredits();
      toast({ title: "Story ready!", description: `${data.creditsUsed} credits used` });
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCredits = async (credits: number) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: "messenger_ai", packKey: String(credits) },
      });

      if (error) throw error;
      if (data?.url) {
        const __w = window.open(data.url, "_blank", "noopener,noreferrer");
        if (!__w) window.location.href = data.url;
      }
    } catch (error: any) {
      toast({ title: "Payment failed", description: error?.message || "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto flex-nowrap scrollbar-none py-1 -mx-1 px-1">




      {/* Credits display */}
      <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
        <DialogTrigger asChild>
          <Button
            variant={credits === 0 ? "destructive" : credits < 5 ? "outline" : "ghost"}
            size="sm"
            className="gap-1 text-xs"
            title={credits === 0 ? "No AI credits — click to buy" : `${credits} AI credits`}
          >
            <Coins className="h-3 w-3" />
            {credits}
            {credits === 0 && <span className="ml-1">Buy</span>}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className={`rounded-lg p-3 text-sm ${credits === 0 ? "bg-destructive/10 text-destructive" : credits < 10 ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" : "bg-primary/5"}`}>
              <p className="font-medium">
                {credits === 0
                  ? "⚠️ You have no AI credits."
                  : credits < 10
                  ? `⚡ Low balance: ${credits} credits left.`
                  : `✅ Available: ${credits} credits.`}
              </p>
              <p className="text-xs opacity-80 mt-1">
                AI features require credits. Buy a pack below to keep using translate, smart reply, summaries and more.
              </p>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Credit costs:</p>
              <ul className="text-xs grid grid-cols-2 gap-1">
                <li>🌐 Translate: 2</li>
                <li>📝 Summary: 5</li>
                <li>✨ Smart Reply: 1</li>
                <li>⏰ Time Capsule: 5</li>
                <li>🌤️ Emotional Weather: 3</li>
                <li>⚡ Quantum Message: 10</li>
                <li>💜 Anonymous Compliment: 2</li>
                <li>🔮 What If Story: 15</li>
              </ul>
            </div>
            <div className="grid gap-2">
              {CREDIT_PACKAGES.map((pkg) => (
                <Button
                  key={pkg.credits}
                  variant="outline"
                  onClick={() => handleBuyCredits(pkg.credits)}
                  className="justify-between"
                >
                  <span>{pkg.credits} credits</span>
                  <span className="font-bold">€{pkg.price}</span>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Translate */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading} title="Translate (2 credits)">
            <Languages className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <p className="px-2 py-1 text-xs text-muted-foreground">Translate to (2 credits)</p>
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem key={lang} onClick={() => handleTranslate(lang)}>
              {lang}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Summarize */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSummarize}
          disabled={isLoading}
          title="Summarize (5 credits)"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conversation Summary</DialogTitle>
          </DialogHeader>
          <p className="text-sm">{summary}</p>
        </DialogContent>
      </Dialog>

      {/* Smart Reply */}
      <Dialog open={showSmartReplies} onOpenChange={setShowSmartReplies}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSmartReply}
          disabled={isLoading}
          title="Smart Reply (1 credit)"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Smart Reply Suggestions</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {(smartReplies ?? []).map((reply, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => {
                  onInsertText(reply);
                  setShowSmartReplies(false);
                }}
              >
                {reply}
              </Button>
            ))}
            {(!smartReplies || smartReplies.length === 0) && (
              <p className="text-sm text-muted-foreground">No suggestions available.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Capsule */}
      <Dialog open={showTimeCapsule} onOpenChange={setShowTimeCapsule}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Time Capsule (5 credits)">
            <Clock className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⏰ Time Capsule Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send a message to the future! It will be delivered on the date you choose.
            </p>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={timeCapsuleMessage}
                onChange={(e) => setTimeCapsuleMessage(e.target.value)}
                placeholder="Write your message for the future..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Delivery Date</Label>
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              />
            </div>
            <Button onClick={handleTimeCapsule} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Time Capsule (5 credits)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emotional Weather */}
      <Dialog open={showEmotionalWeather} onOpenChange={setShowEmotionalWeather}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEmotionalWeather}
          disabled={isLoading}
          title="Emotional Weather (3 credits)"
        >
          <Cloud className="h-4 w-4" />
        </Button>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>🌤️ Emotional Weather Report</DialogTitle>
          </DialogHeader>
          {emotionalAnalysis && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <span className="text-6xl">
                  {WEATHER_ICONS[emotionalAnalysis.weather] || emotionalAnalysis.emoji || "🌈"}
                </span>
                <p className="text-lg font-medium mt-2 capitalize">
                  {emotionalAnalysis.weather} & {emotionalAnalysis.temperature}
                </p>
                <p className="text-sm text-muted-foreground">
                  Positivity Score: {emotionalAnalysis.emotionalScore}/100
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Dominant Emotions:</p>
                <div className="flex flex-wrap gap-1">
                  {emotionalAnalysis.dominantEmotions?.map((emotion: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-primary/10 rounded text-xs">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
              {emotionalAnalysis.dynamics && (
                <div>
                  <p className="font-medium">Dynamics:</p>
                  <p className="text-sm text-muted-foreground">{emotionalAnalysis.dynamics}</p>
                </div>
              )}
              {emotionalAnalysis.advice && (
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="font-medium">💡 Advice:</p>
                  <p className="text-sm">{emotionalAnalysis.advice}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quantum Message */}
      <Dialog open={showQuantumMessage} onOpenChange={setShowQuantumMessage}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Quantum Message (10 credits)">
            <Zap className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>⚡ Quantum Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create 5 variations of your message for different contexts!
            </p>
            <div className="space-y-2">
              <Label>Your Message</Label>
              <Textarea
                value={quantumOriginal}
                onChange={(e) => setQuantumOriginal(e.target.value)}
                placeholder="Enter your message..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Variation Type</Label>
              <Select value={quantumType} onValueChange={setQuantumType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mood">By Mood</SelectItem>
                  <SelectItem value="time">By Time of Day</SelectItem>
                  <SelectItem value="personality">By Personality</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleQuantumMessage} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Generate Variations (10 credits)
            </Button>
            {quantumVariations.length > 0 && (
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {quantumVariations.map((v, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => {
                        onInsertText(v.message);
                        setShowQuantumMessage(false);
                      }}
                    >
                      <span className="mr-2">{v.emoji}</span>
                      <span className="flex-1">
                        <span className="text-xs text-muted-foreground block">{v.type}</span>
                        {v.message}
                      </span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Anonymous Compliment */}
      <Dialog open={showCompliment} onOpenChange={setShowCompliment}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Anonymous Compliment (2 credits)">
            <Heart className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>💜 Anonymous Compliment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a beautiful anonymous compliment for {recipientName || "your friend"}!
            </p>
            <div className="space-y-2">
              <Label>Context (optional)</Label>
              <Input
                value={complimentContext}
                onChange={(e) => setComplimentContext(e.target.value)}
                placeholder="e.g., always supportive, great listener..."
              />
            </div>
            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={complimentStyle} onValueChange={setComplimentStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heartfelt">Heartfelt</SelectItem>
                  <SelectItem value="poetic">Poetic</SelectItem>
                  <SelectItem value="funny">Funny</SelectItem>
                  <SelectItem value="motivational">Motivational</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAnonymousCompliment} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Generate Compliment (2 credits)
            </Button>
            {generatedCompliment && (
              <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                <p className="text-lg">{generatedCompliment.emoji} {generatedCompliment.compliment}</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onInsertText(`💜 Anonymous compliment: ${generatedCompliment.compliment}`);
                    setShowCompliment(false);
                  }}
                >
                  Send as Anonymous
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* What If Story */}
      <Dialog open={showWhatIf} onOpenChange={setShowWhatIf}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="What If Story (15 credits)">
            <Wand2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>🔮 What If Story Generator</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              <p className="text-sm text-muted-foreground">
                Generate an AI story about an alternative life path!
              </p>
              <div className="space-y-2">
                <Label>Scenario</Label>
                <Textarea
                  value={whatIfScenario}
                  onChange={(e) => setWhatIfScenario(e.target.value)}
                  placeholder="e.g., What if I had studied abroad? What if I had started my business earlier?"
                  rows={2}
                />
              </div>
              <Button onClick={handleWhatIf} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Generate Story (15 credits)
              </Button>
              {whatIfStory && (
                <div className="space-y-4">
                  {whatIfStory.imageUrl && (
                    <img 
                      src={whatIfStory.imageUrl} 
                      alt="What If visualization" 
                      className="w-full rounded-lg"
                    />
                  )}
                  <h3 className="text-lg font-bold">{whatIfStory.title}</h3>
                  <p className="text-sm whitespace-pre-wrap">{whatIfStory.story}</p>
                  {whatIfStory.keyMoments && (
                    <div>
                      <p className="font-medium">Key Moments:</p>
                      <ul className="list-disc list-inside text-sm">
                        {whatIfStory.keyMoments.map((m: string, i: number) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {whatIfStory.lifeLesson && (
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="font-medium">💡 Life Lesson:</p>
                      <p className="text-sm">{whatIfStory.lifeLesson}</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onInsertText(`🔮 What If Story: "${whatIfStory.title}"\n\n${whatIfStory.story?.substring(0, 200)}...`);
                      setShowWhatIf(false);
                    }}
                  >
                    Share Preview in Chat
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
