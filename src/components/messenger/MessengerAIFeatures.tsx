import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Languages, FileText, Sparkles, Coins, Loader2 } from "lucide-react";
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

interface MessengerAIFeaturesProps {
  userId: string;
  selectedText?: string;
  messages: Array<{ sender_id: string; content: string; sender_name?: string }>;
  onInsertText: (text: string) => void;
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

export const MessengerAIFeatures = ({
  userId,
  selectedText,
  messages,
  onInsertText,
}: MessengerAIFeaturesProps) => {
  const { toast } = useToast();
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [showSmartReplies, setShowSmartReplies] = useState(false);
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);

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

  const handleTranslate = async (targetLanguage: string) => {
    if (!selectedText) {
      toast({ title: "Select text to translate", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("messenger-ai-translate", {
        body: { text: selectedText, targetLanguage },
      });

      if (error) throw error;
      if (data.error) {
        if (data.error.includes("Insufficient credits")) {
          setShowCreditsDialog(true);
        } else {
          throw new Error(data.error);
        }
        return;
      }

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

      const { data, error } = await supabase.functions.invoke("messenger-ai-summarize", {
        body: { messages: formattedMessages },
      });

      if (error) throw error;
      if (data.error) {
        if (data.error.includes("Insufficient credits")) {
          setShowCreditsDialog(true);
        } else {
          throw new Error(data.error);
        }
        return;
      }

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

      const { data, error } = await supabase.functions.invoke("messenger-ai-smart-reply", {
        body: { lastMessages },
      });

      if (error) throw error;
      if (data.error) {
        if (data.error.includes("Insufficient credits")) {
          setShowCreditsDialog(true);
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setSmartReplies(data.suggestions);
      setShowSmartReplies(true);
      await fetchCredits();
      toast({ title: "Suggestions ready!", description: `${data.creditsUsed} credit used` });
    } catch (error: any) {
      toast({ title: "Smart reply failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCredits = async (credits: number) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-messenger-ai-credits-payment", {
        body: { credits },
      });

      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({ title: "Payment failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Credits display */}
      <Dialog open={showCreditsDialog} onOpenChange={setShowCreditsDialog}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <Coins className="h-3 w-3" />
            {credits}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy AI Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Credits for AI features: Translation (2), Summary (5), Smart Reply (1)
            </p>
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
            {smartReplies.map((reply, i) => (
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
