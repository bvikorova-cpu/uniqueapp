import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const courses = ["Royal Etiquette", "Ballroom Dancing", "Royal Speech", "Crown Jewels History", "Castle Management", "Diplomatic Arts", "Royal Fashion", "Horse Riding"];

export function PrincessAcademy({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [course, setCourse] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const generate = async () => {
    if (!course) return toast({ title: "Select a course", variant: "destructive" });
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("glamour-ai-generate", {
        body: { type: "academy", prompt: `Teach a fun ${course} lesson at the Princess Academy. ${question}. Include: key rules, fun facts, practice exercises, and a mini quiz at the end.`, coins: 4 },
      });
      if (error) throw error;
      setResult(data.result);
      await supabase.from("glamour_creations").insert({
        user_id: user.id, creation_type: "academy", title: course,
        prompt: question, result_text: data.result, credits_used: 4,
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <h2 className="text-2xl font-black">👑 Princess Academy</h2>
      <p className="text-muted-foreground">Learn the arts of royalty!</p>
      <Select value={course} onValueChange={setCourse}>
        <SelectTrigger><SelectValue placeholder="Choose Course" /></SelectTrigger>
        <SelectContent>{courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
      </Select>
      <Textarea placeholder="Any specific questions..." value={question} onChange={e => setQuestion(e.target.value)} />
      <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-purple-500 to-pink-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        Start Lesson (4 coins)
      </Button>
      {result && <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-6 whitespace-pre-wrap">{result}</div>}
    </div>
  );
}
