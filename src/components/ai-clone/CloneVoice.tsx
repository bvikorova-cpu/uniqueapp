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

const transformText = (text: string, style: string): string => {
  const transforms: Record<string, (t: string) => string> = {
    warm: (t) => `Hey! ${t} 😊 Would love to hear your thoughts on this!`,
    professional: (t) => `I'd like to bring to your attention: ${t}. I look forward to discussing this further at your convenience.`,
    energetic: (t) => `OMG yes! ${t}!! This is SO exciting, let's make it happen! 🚀`,
    calm: (t) => `Take a moment to consider this... ${t}. There's no rush — let's explore this together when you're ready.`,
    authoritative: (t) => `Here's what needs to happen: ${t}. This is the direction we're taking, and I'm confident in this approach.`,
  };
  return transforms[style]?.(text) || text;
};

export function CloneVoice() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("warm");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({ title: "Enter some text", description: "Provide text for your clone's voice style", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    setGeneratedText(transformText(text.trim(), voiceStyle));
    toast({ title: "Voice Style Applied!", description: "Your text has been transformed" });
    setIsGenerating(false);
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
