import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";

interface JournalEntryFormProps {
  onSuccess: () => void;
}

const JournalEntryForm = ({ onSuccess }: JournalEntryFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { credits, spendCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("neutral");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast({ title: "Error", description: "Please write your journal entry", variant: "destructive" });
      return;
    }

    if ((credits?.credits_remaining || 0) < 1) {
      handleEdgeError({ status: 402 }, { navigate, context: "Journal Analysis" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        handleEdgeError({ status: 401 }, { navigate, context: "Journal Analysis" });
        return;
      }

      await spendCredit("effect");

      const { data: { session } } = await supabase.auth.getSession();
      const insightsResponse = await supabase.functions.invoke("analyze-journal", {
        body: { journalContent: content, mood },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const insights = throwIfInvokeError(insightsResponse);

      const { error: insertError } = await supabase.from("journal_entries").insert([{
        title: title || "Journal Entry",
        content,
        mood: mood as any,
        entry_date: new Date().toISOString().split('T')[0],
        ai_insights: insights.insights,
        emotions_detected: insights.emotions,
        user_id: user.id
      }]);

      if (insertError) throw insertError;

      toast({ title: "Success", description: "Journal entry analyzed and saved!" });
      setTitle("");
      setContent("");
      setMood("neutral");
      onSuccess();
    } catch (error: any) {
      if (!handleEdgeError(error, { navigate, context: "Journal Analysis" })) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title (Optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Today's thoughts..."
          />
        </div>
        <div>
          <Label htmlFor="mood">Current Mood</Label>
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_good">😄 Very Good</SelectItem>
              <SelectItem value="good">🙂 Good</SelectItem>
              <SelectItem value="neutral">😐 Neutral</SelectItem>
              <SelectItem value="bad">😕 Bad</SelectItem>
              <SelectItem value="very_bad">😢 Very Bad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="content">Journal Entry</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How are you feeling today? What's on your mind?"
          rows={8}
        />
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Credits: {credits?.credits_remaining || 0}</p>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Analyze Entry
        </Button>
      </div>
    </form>
  );
};

export default JournalEntryForm;