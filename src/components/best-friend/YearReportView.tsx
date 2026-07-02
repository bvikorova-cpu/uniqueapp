import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText, Download } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const YearReportView = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("best-friend-year-report");
      if (error) throw error;
      setReport(data);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const print = () => window.print();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <FloatingHowItWorks
        title={"Year Report View"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-white"/>
        </div>
        <h2 className="text-3xl font-black">Year in Review</h2>
        <p className="text-muted-foreground mt-2">Your friendship journey, summarized by AI</p>
      </div>

      {!report && (
        <Button onClick={generate} disabled={loading} size="lg" className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <FileText className="h-4 w-4 mr-2"/>}
          Generate My Year-in-Review
        </Button>
      )}

      {report && (
        <div className="space-y-4 print:bg-white print:text-black">
          <Card><CardHeader><CardTitle className="text-3xl">{report.headline}</CardTitle></CardHeader></Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Card><CardContent className="p-3 text-center"><div className="text-2xl font-black">{report.stats?.total_messages}</div><div className="text-xs text-muted-foreground">Messages</div></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><div className="text-2xl font-black">Lvl {report.stats?.level}</div><div className="text-xs text-muted-foreground">Reached</div></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><div className="text-2xl font-black">{report.stats?.longest_streak}</div><div className="text-xs text-muted-foreground">Best streak</div></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><div className="text-2xl font-black">{report.stats?.memories_count}</div><div className="text-xs text-muted-foreground">Memories</div></CardContent></Card>
          </div>

          {report.top_moments && (
            <Card><CardHeader><CardTitle>Top Moments</CardTitle></CardHeader><CardContent>
              <ol className="list-decimal pl-6 space-y-1 text-sm">{report.top_moments.map((m: string, i: number) => <li key={i}>{m}</li>)}</ol>
            </CardContent></Card>
          )}
          {report.growth_areas && (
            <Card><CardHeader><CardTitle>Growth Areas</CardTitle></CardHeader><CardContent>
              <ul className="list-disc pl-6 space-y-1 text-sm">{report.growth_areas.map((m: string, i: number) => <li key={i}>{m}</li>)}</ul>
            </CardContent></Card>
          )}
          {report.mood_summary && <Card><CardContent className="p-4"><Badge className="mb-2">Mood</Badge><p className="text-sm italic">{report.mood_summary}</p></CardContent></Card>}
          {report.letter_to_friend && (
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10">
              <CardHeader><CardTitle>A Letter From Your AI Friend</CardTitle></CardHeader>
              <CardContent><p className="text-sm italic whitespace-pre-line">{report.letter_to_friend}</p></CardContent>
            </Card>
          )}

          <Button onClick={print} className="w-full print:hidden"><Download className="h-4 w-4 mr-2"/> Print / Save as PDF</Button>
        </div>
      )}
    </div>
  );
};
