import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Users, Loader2, Sparkles, Handshake, Lightbulb, Star } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CollaborationMatcherView = () => {
  const { toast } = useToast();
  const [myTalent, setMyTalent] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const findMatches = async () => {
    if (!myTalent || !lookingFor) { toast({ title: "Error", description: "Please fill your talent and what you're looking for", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("megatalent-ai", {
        body: { action: "collaboration_matcher", myTalent, lookingFor, description },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast({ title: "Matches Found! 🤝" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Collaboration Matcher View - How it works"} steps={[{ title: 'Open', desc: 'Access the Collaboration Matcher View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collaboration Matcher View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">AI Collaboration Matcher</h2>
          <p className="text-muted-foreground mt-2">Find the perfect collaboration partner to boost your talent</p>
          <Badge variant="outline" className="mt-2 border-blue-500/30 text-blue-500">4 Credits per search</Badge>
        </div>
      </motion.div>

      <Card className="bg-card/80 backdrop-blur-xl border-blue-500/20">
        <CardHeader><CardTitle className="text-lg">Your Collaboration Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={myTalent} onValueChange={setMyTalent}>
            <SelectTrigger><SelectValue placeholder="Your primary talent..." /></SelectTrigger>
            <SelectContent>
              {["Singer", "Dancer", "Musician", "Artist", "Photographer", "Comedian", "Athlete", "Cook/Chef", "Actor", "Writer", "Editor/Filmmaker", "Other"].map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={lookingFor} onValueChange={setLookingFor}>
            <SelectTrigger><SelectValue placeholder="Looking for..." /></SelectTrigger>
            <SelectContent>
              {["Singer", "Dancer", "Musician", "Videographer", "Photographer", "Editor", "Beat Producer", "Graphic Designer", "Comedian", "Actor", "Any creative talent"].map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what kind of collaboration you want to create, your style, goals..." className="min-h-[100px]" />
          <Button onClick={findMatches} disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" size="lg">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Finding matches...</> : <><Handshake className="h-4 w-4 mr-2" /> Find Collaboration Ideas</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {result.collaboration_ideas?.map((idea: any, i: number) => (
            <Card key={i} className="bg-card/80 backdrop-blur-xl border-blue-500/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Lightbulb className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{idea.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {idea.skills_needed?.map((s: string, j: number) => (
                        <Badge key={j} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-500">
                        <Star className="h-2.5 w-2.5 mr-0.5" /> Viral Potential: {idea.viral_potential}/10
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{idea.difficulty}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {result.tips && (
            <Card className="bg-blue-500/10 border-blue-500/20">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-500" /> Collaboration Tips</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.tips.map((t: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm"><span className="text-blue-500">→</span>{t}</div>
                ))}
              </CardContent>
            </Card>
          )}

          <Badge variant="outline" className="text-xs">Credits remaining: {result.credits_remaining}</Badge>
        </motion.div>
      )}
    </div>
    </>
  );
};