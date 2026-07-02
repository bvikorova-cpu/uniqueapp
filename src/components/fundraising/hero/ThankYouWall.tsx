import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface ThankYou {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
}

interface Props {
  campaignId: string;
}

export function ThankYouWall({ campaignId }: Props) {
  const [messages, setMessages] = useState<ThankYou[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("hero_thank_you_messages" as any)
      .select("id, author_name, message, created_at")
      .eq("campaign_id", campaignId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(50);
    setMessages((data as unknown as ThankYou[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`thanks-${campaignId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "hero_thank_you_messages", filter: `campaign_id=eq.${campaignId}` },
        () => load()
      )
      .subscribe();
    return (
    <>
      <FloatingHowItWorks title={"Thank You Wall - How it works"} steps={[{ title: 'Open', desc: 'Access the Thank You Wall section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Thank You Wall.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const handlePost = async () => {
    if (!authorName.trim() || message.trim().length < 3) {
      toast({ title: "Add your name and a message", variant: "destructive" });
      return;
    }
    setPosting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from("hero_thank_you_messages" as any).insert({
        campaign_id: campaignId,
        author_name: authorName.trim().slice(0, 80),
        message: message.trim().slice(0, 500),
        author_user_id: session?.user?.id ?? null,
      });
      if (error) throw error;
      setMessage("");
      toast({ title: "Thank you posted ❤️", description: "Your message is on the wall." });
    } catch (e: any) {
      toast({ title: "Could not post", description: e.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">Thank-You Wall</h3>
        <span className="text-xs text-muted-foreground ml-auto">{messages.length} messages</span>
      </div>

      <div className="space-y-2 mb-4">
        <Input
          placeholder="Your name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={80}
        />
        <Textarea
          placeholder="Leave a message of thanks — no donation required."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          maxLength={500}
          className="resize-none"
        />
        <Button onClick={handlePost} disabled={posting} className="w-full" size="sm">
          <Send className="w-4 h-4 mr-2" />
          {posting ? "Posting..." : "Post Thank-You"}
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Be the first to say thanks.</p>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg bg-muted/30 p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-sm font-medium truncate">{m.author_name}</span>
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">
                    {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{m.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
}
