import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { useNavigate } from "react-router-dom";
import { handleEdgeError, throwIfInvokeError } from "@/lib/handleEdgeError";

interface DreamEntryFormProps {
  onSuccess: () => void;
}

const DreamEntryForm = ({ onSuccess }: DreamEntryFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { credits, spendCredit } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dreamDate, setDreamDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast({ title: "Error", description: "Please describe your dream", variant: "destructive" });
      return;
    }

    if ((credits?.credits_remaining || 0) < 1) {
      handleEdgeError({ status: 402 }, { navigate, context: "Dream Analysis" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        handleEdgeError({ status: 401 }, { navigate, context: "Dream Analysis" });
        return;
      }

      await spendCredit("effect");

      const { data: { session } } = await supabase.auth.getSession();
      const analysisResponse = await supabase.functions.invoke("analyze-dream", {
        body: { dreamContent: content },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const analysis = throwIfInvokeError(analysisResponse);

      const { error: insertError } = await supabase.from("dream_entries").insert([{
        title: title || "Dream Entry",
        content,
        dream_date: dreamDate,
        ai_analysis: analysis.analysis,
        themes: analysis.themes,
        emotions: analysis.emotions,
        symbols: analysis.symbols,
        user_id: user.id
      }]);

      if (insertError) throw insertError;

      toast({ title: "Success", description: "Dream analyzed and saved!" });
      setTitle("");
      setContent("");
      onSuccess();
    } catch (error: any) {
      if (!handleEdgeError(error, { navigate, context: "Dream Analysis" })) {
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
            placeholder="Give your dream a title..."
          />
        </div>
        <div>
          <Label htmlFor="dreamDate">Dream Date</Label>
          <Input
            id="dreamDate"
            type="date"
            value={dreamDate}
            onChange={(e) => setDreamDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="content">Describe Your Dream</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe your dream in as much detail as you remember..."
          rows={8}
        />
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Credits: {credits?.credits_remaining || 0}</p>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Analyze Dream
        </Button>
      </div>
    </form>
  );
};

export default DreamEntryForm;