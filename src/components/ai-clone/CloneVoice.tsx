import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mic, Loader2, Volume2, Sparkles } from "lucide-react";

const VOICE_STYLES = [
  { value: "warm", label: "Warm & Friendly" },
  { value: "professional", label: "Professional" },
  { value: "energetic", label: "Energetic & Upbeat" },
  { value: "calm", label: "Calm & Soothing" },
  { value: "authoritative", label: "Authoritative" },
];

import { supabase } from "@/integrations/supabase/client";

export function CloneVoice() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("warm");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({ title: "Enter some text", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { type: "voice_transform", prompt: text.trim(), style: voiceStyle },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setGeneratedText(data.transformed || data.message || data.text || data.result);
      toast({ title: "Voice Style Applied!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to transform", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          Clone Voice Style Studio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Define how your clone communicates. Enter sample text and choose a voice style to see how your clone would say it.
        </p>

        <Textarea
          placeholder="Type a message you'd normally send... e.g., 'Hey, I saw your project and wanted to connect!'"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex gap-3">
          <Select value={voiceStyle} onValueChange={setVoiceStyle}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICE_STYLES.map((v) => (
                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleGenerate} disabled={isGenerating || !text.trim()}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {isGenerating ? "Generating..." : "Transform"}
          </Button>
        </div>

        {generatedText && (
          <div className="bg-background/50 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase">Clone Voice Output</span>
            </div>
            <p className="text-sm text-foreground">{generatedText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
