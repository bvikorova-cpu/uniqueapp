import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Loader2, Copy, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function AIStoryWriterView({ onBack }: Props) {
  const { toast } = useToast();
  const [theme, setTheme] = useState("");
  const [genre, setGenre] = useState("horror");
  const [roomCount, setRoomCount] = useState("5");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (theme.trim().length < 5) {
      toast({ title: "Too Short", description: "Enter at least 5 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stock-content-ai", {
        body: { action: "escape-story-gen", theme, genre, roomCount: parseInt(roomCount), additionalNotes }
      });
      if (error) throw error;
      setResult(data.result);
      toast({ title: "Story Created!", description: "4 credits used" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Story Writer View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Story Writer View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Story Writer View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Story Writer</h2>
            <p className="text-muted-foreground">Generate immersive room storylines & narrative arcs</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>

        <Card className="mb-6 border-emerald-500/10">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Genre</label>
                <select value={genre} onChange={e => setGenre(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="horror">Horror</option>
                  <option value="mystery">Mystery / Detective</option>
                  <option value="sci-fi">Sci-Fi</option>
                  <option value="fantasy">Fantasy</option>
                  <option value="adventure">Adventure</option>
                  <option value="thriller">Thriller</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Room Count</label>
                <select value={roomCount} onChange={e => setRoomCount(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2.5 text-sm">
                  <option value="3">3 Rooms</option>
                  <option value="5">5 Rooms</option>
                  <option value="7">7 Rooms</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Theme / Setting</label>
              <Input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g., Abandoned Victorian hospital with supernatural entities..." className="h-11" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Additional Notes (optional)</label>
              <Textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} placeholder="Any specific characters, plot twists, or narrative elements you want included..." rows={3} />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Writing Story...</> : <><BookOpen className="w-4 h-4 mr-2" />Generate Story (4 Credits)</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" />Room Story</CardTitle>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}
