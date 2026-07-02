import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UsersRound, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function GroupWorkshopsView({ onBack }: Props) {
  const [skillName, setSkillName] = useState("");
  const [groupSize, setGroupSize] = useState("5-10");
  const [workshopDuration, setWorkshopDuration] = useState("2 hours");
  const [difficultyLevel, setDifficultyLevel] = useState("beginner");
  const [format, setFormat] = useState("online");
  const [requirements, setRequirements] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!skillName.trim()) { toast.error("Enter a skill name"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("skill-swap-ai", {
        body: { action: "workshop-planner", skillName, groupSize, workshopDuration, difficultyLevel, format, requirements },
      });
      if (error) throw error;
      setResult(data.result);
      toast.success(`Workshop planned! (${data.credits_used} credits used)`);
    } catch (e: any) {
      toast.error(e.message || "Planning failed");
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Group Workshops View - How it works"} steps={[{ title: 'Open', desc: 'Access the Group Workshops View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Group Workshops View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <UsersRound className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Group Workshops</h2>
            <p className="text-muted-foreground text-sm">AI-designed group workshop plans for your skills · 4 CR</p>
          </div>
          <Badge className="ml-auto bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-0 shadow-md">
            <Sparkles className="w-3 h-3 mr-1" />4 Credits
          </Badge>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-indigo-500/10">
          <CardHeader><CardTitle>Workshop Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Skill to Teach *</label>
              <Input placeholder="e.g., Digital Marketing, Pottery..." value={skillName} onChange={e => setSkillName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Group Size</label>
                <Select value={groupSize} onValueChange={setGroupSize}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-5">3-5 (Small)</SelectItem>
                    <SelectItem value="5-10">5-10 (Medium)</SelectItem>
                    <SelectItem value="10-20">10-20 (Large)</SelectItem>
                    <SelectItem value="20+">20+ (Seminar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Duration</label>
                <Select value={workshopDuration} onValueChange={setWorkshopDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 hour">1 Hour</SelectItem>
                    <SelectItem value="2 hours">2 Hours</SelectItem>
                    <SelectItem value="half day">Half Day</SelectItem>
                    <SelectItem value="full day">Full Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Difficulty</label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="mixed">Mixed Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Format</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1.5 block">Special Requirements</label>
              <Textarea placeholder="Equipment, prerequisites, accessibility needs..." value={requirements} onChange={e => setRequirements(e.target.value)} rows={3} />
            </div>
            <Button onClick={generate} disabled={loading} className="w-full h-11 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Planning...</> : <><UsersRound className="w-4 h-4 mr-2" />Plan Workshop (4 CR)</>}
            </Button>
          </CardContent>
        </Card>

        <Card className={result ? "border-emerald-500/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{result ? "Workshop Plan" : "Results"}</CardTitle>
            {result && (
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}{copied ? "Copied!" : "Copy"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm bg-muted/50 rounded-xl p-5 border">{result}</div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">Configure your workshop and get AI-generated curriculum plan</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
