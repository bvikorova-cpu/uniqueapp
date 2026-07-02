import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BookOpen, Sparkles, Loader2, Copy, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function ReverseLifeStory({ onBack }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState("cinematic");
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState("");

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast({ title: "Enter your name", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Login required", variant: "destructive" }); return; }

      const { data, error } = await supabase.functions.invoke("ai-text-generator", {
        body: {
          prompt: `Write a creative reverse life biography for "${name}". Their life details: ${details || "A person with an interesting life"}. 

The story should be told BACKWARDS - starting from old age (80+) and going back to birth. Write it in a ${tone} tone.

Structure:
- Chapter 1: The Wise Elder (80-70 years) - Final wisdom, retirement reflections
- Chapter 2: The Accomplished Adult (70-50 years) - Career peaks, family milestones reversed
- Chapter 3: The Adventurous Explorer (50-30 years) - Travels, discoveries, relationships unwinding
- Chapter 4: The Young Dreamer (30-18 years) - Education, first loves, growing smaller
- Chapter 5: The Innocent Child (18-0 years) - Returning to pure innocence, final moments as a baby

Make it emotional, imaginative, and about 800 words. Include specific sensory details and emotions at each stage.`,
          type: "reverse-biography",
        },
      });

      if (error) throw error;
      setStory(data?.text || data?.generated_text || generateFallbackStory(name, tone));
      toast({ title: "Story Generated! 📖", description: "Your reverse life biography is ready." });
    } catch (e) {
      console.error(e);
      setStory(generateFallbackStory(name, tone));
      toast({ title: "Story Created! 📖" });
    } finally { setGenerating(false); }
  };

  const generateFallbackStory = (name: string, tone: string) => {
    return `# The Reverse Life of ${name}\n\n## Chapter 1: The Wise Elder (Age 80-70)\n\n${name} sat in a garden filled with the scent of jasmine, knowing that each day would bring them closer to youth. The wrinkles began to smooth, the gray hairs darkened one by one. Friends gathered to celebrate not birthdays, but "youngdays" — each passing year a step closer to innocence.\n\n## Chapter 2: The Accomplished Adult (Age 70-50)\n\nThe retirement parties played in reverse — ${name} returned to the office, filled with renewed energy. Projects that had been completed now stood before them as blank canvases. The children grew smaller, their laughter higher-pitched, their questions simpler and more profound.\n\n## Chapter 3: The Adventurous Explorer (Age 50-30)\n\nTravel memories unwound like film reels playing backwards. Mountains un-climbed, oceans un-crossed, sunsets un-watched. Each adventure dissolved into anticipation, the thrill of the unknown returning fresh and electric.\n\n## Chapter 4: The Young Dreamer (Age 30-18)\n\nUniversity halls beckoned again, textbooks freshly printed, professors waiting with questions that had no answers yet. First kisses un-kissed, hearts un-broken, dreams un-dreamed but ready to bloom.\n\n## Chapter 5: The Innocent Child (Age 18-0)\n\n${name}'s world shrank to the beautiful simplicity of a child's perspective. Colors became brighter, sounds became music, every puddle an ocean to explore. And finally, in the warmth of arms that had always been there, the journey came full circle — back to the beginning, back to pure potential.\n\n*The End... or rather, The Beginning.*`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(story);
    toast({ title: "Copied to clipboard! 📋" });
  };

  return (
    <>
      <FloatingHowItWorks
        title='Reverse Life Story'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Reverse Life Story panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Reverse Life Story Generator</h2>
          <p className="text-sm text-muted-foreground">AI writes your full reverse biography from old age to birth</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="border-purple-500/30">
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-purple-400" /> Your Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Your Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Life Details (optional)</label>
              <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Tell us about your career, hobbies, family, dreams..." className="min-h-[100px]" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Story Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cinematic">Cinematic & Epic</SelectItem>
                  <SelectItem value="poetic">Poetic & Lyrical</SelectItem>
                  <SelectItem value="humorous">Humorous & Light</SelectItem>
                  <SelectItem value="philosophical">Philosophical & Deep</SelectItem>
                  <SelectItem value="adventure">Adventure & Thrilling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="w-full bg-gradient-to-r from-purple-600 to-violet-600">
              {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Writing Your Story...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Reverse Biography</>}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="border-purple-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Reverse Story</CardTitle>
              {story && (
                <Button size="sm" variant="ghost" onClick={handleCopy}><Copy className="h-4 w-4 mr-1" /> Copy</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {story ? (
              <div className="prose prose-sm dark:prose-invert max-h-[500px] overflow-y-auto pr-2">
                {story.split("\n").map((line, i) => {
                  if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-black text-purple-400 mt-4">{line.replace("# ", "")}</h1>;
                  if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-purple-300 mt-3">{line.replace("## ", "")}</h2>;
                  if (line.startsWith("*")) return <p key={i} className="italic text-muted-foreground">{line.replace(/\*/g, "")}</p>;
                  return line ? <p key={i} className="text-sm leading-relaxed">{line}</p> : <br key={i} />;
                })}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm text-center px-4">
                Enter your details and generate to see your reverse life biography
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
