import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarDays, Sparkles, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const SocialCalendarView = ({ onBack }: { onBack: () => void }) => {
  const [product, setProduct] = useState("");
  const [industry, setIndustry] = useState("");
  const [budget, setBudget] = useState("");
  const [platforms, setPlatforms] = useState("all platforms");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!product.trim()) { toast.error("Enter a product name"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("video-ad-tools", {
        body: { action: "social_calendar", product, industry, budget, platforms },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("Calendar generated! (3 CR)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Social Calendar View - How it works"} steps={[{ title: 'Open', desc: 'Access the Social Calendar View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Social Calendar View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div><h2 className="text-2xl font-black">AI Social Media Calendar</h2><p className="text-muted-foreground text-sm">30-day optimized posting schedule</p></div>
          <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0"><Sparkles className="w-3 h-3 mr-1" />3 CR</Badge>
        </div>
      </motion.div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Product / Brand *</Label><Input placeholder="e.g. Fitness App" value={product} onChange={e => setProduct(e.target.value)} /></div>
            <div><Label>Industry</Label><Input placeholder="e.g. Health & Fitness" value={industry} onChange={e => setIndustry(e.target.value)} /></div>
            <div><Label>Monthly Budget</Label><Input placeholder="e.g. $5,000" value={budget} onChange={e => setBudget(e.target.value)} /></div>
            <div><Label>Platforms</Label><Input placeholder="e.g. YouTube, Instagram, TikTok" value={platforms} onChange={e => setPlatforms(e.target.value)} /></div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><CalendarDays className="mr-2 h-4 w-4" />Generate (3 CR)</>}
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>30-Day Calendar</CardTitle></CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-12 text-muted-foreground"><CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-20" /><p>Generate your optimized posting calendar</p></div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                {result.weeklyThemes && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.weeklyThemes.map((t: string, i: number) => (
                      <Badge key={i} variant="secondary">Week {i + 1}: {t}</Badge>
                    ))}
                  </div>
                )}
                <div className="grid gap-2">
                  {result.calendar?.slice(0, 30).map((day: any, i: number) => (
                    <Card key={i} className="bg-muted/30">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm w-8">D{i + 1}</span>
                            <Badge variant="outline" className="text-[10px]">{day.platform}</Badge>
                            <span className="text-sm">{day.adType}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />{day.postTime}
                            {day.budgetAllocation && <Badge variant="secondary" className="text-[10px]">${day.budgetAllocation}</Badge>}
                          </div>
                        </div>
                        {day.caption && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{day.caption}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {result.monthlyGoals && <div className="mt-4 p-4 bg-primary/5 rounded-xl"><h4 className="font-bold mb-2">Monthly Goals</h4><p className="text-sm text-muted-foreground">{result.monthlyGoals}</p></div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
