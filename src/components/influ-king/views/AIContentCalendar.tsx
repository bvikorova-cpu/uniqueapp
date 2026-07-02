import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Loader2, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props { onBack: () => void; }

export default function AIContentCalendar({ onBack }: Props) {
  const [niche, setNiche] = useState("Fashion & Beauty");
  const [days, setDays] = useState("7");
  const [plan, setPlan] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("influ-king-ai", {
        body: { action: "content-calendar", niche, days: Number(days) },
      });
      if (error) throw error;
      setPlan(data.calendar || []);
      toast.success("Content calendar generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate calendar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title="How AI Content Calendar works"
        steps={[
          { title: 'Pick niche & duration', description: 'Choose your niche and 7/14/30 days.' },
          { title: 'Generate (5 credits)', description: 'AI drafts a full posting plan.' },
          { title: 'Review the schedule', description: 'See daily posts, reels, hashtags.' },
          { title: 'Export & schedule', description: 'Copy items into your publishing tool.' },
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="h-8 w-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold">AI Content Calendar</h2>
          <p className="text-muted-foreground">AI plans your entire content schedule — posts, reels, stories</p>
        </div>
      </div>

      <Card className="p-6 space-y-4 border-cyan-500/20">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Niche</label>
            <Select value={niche} onValueChange={setNiche}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Fashion & Beauty", "Fitness & Wellness", "Travel & Adventure", "Food & Cooking", "Technology & Gaming", "Art & Design", "Business & Finance", "Lifestyle & Vlog"].map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Duration</label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Generate Calendar (5 credits)
        </Button>
      </Card>

      {plan && plan.length > 0 && (
        <div className="grid gap-3">
          {plan.map((item: any, i: number) => (
            <Card key={i} className="p-4 border-cyan-500/10 hover:border-cyan-500/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">Day {item.day || i + 1}: {item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {item.type || "Post"}
                </span>
              </div>
              {item.hashtags && <p className="text-xs text-cyan-400/70 mt-2">{item.hashtags}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
