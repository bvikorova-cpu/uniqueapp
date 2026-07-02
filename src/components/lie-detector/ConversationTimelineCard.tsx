import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Loader2, AlertTriangle, Plus, X } from "lucide-react";
import { useConversationTimeline } from "@/hooks/useLieDetectorAdvanced";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const ConversationTimelineCard = () => {
  const [msgs, setMsgs] = useState<string[]>(["", ""]);
  const [result, setResult] = useState<any>(null);
  const detect = useConversationTimeline();

  const update = (i: number, v: string) => {
    const next = [...msgs];
    next[i] = v;
    setMsgs(next);
  };

  const add = () => msgs.length < 30 && setMsgs([...msgs, ""]);
  const remove = (i: number) => msgs.length > 2 && setMsgs(msgs.filter((_, j) => j !== i));

  const run = () => {
    const filtered = msgs.filter((m) => m.trim());
    if (filtered.length < 2) return;
    detect.mutate({ messages: filtered }, { onSuccess: (d) => setResult(d) });
  };

  const chartData = (result?.results?.trustworthiness_curve || []).map((v: number, i: number) => ({
    msg: `#${i + 1}`,
    trust: v,
  }));

  return (
    <>
      <FloatingHowItWorks title={"Conversation Timeline Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Conversation Timeline Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Conversation Timeline Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-purple-950/30 via-card/60 to-card/60 backdrop-blur-md border-purple-900/40 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-purple-400" /> Conversation Timeline
          </CardTitle>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px]">10 cr</Badge>
        </div>
        <CardDescription className="text-xs">
          Add 2-30 messages in chronological order. AI plots a trust curve & flags spikes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 max-h-60 overflow-auto pr-1">
          {msgs.map((m, i) => (
            <div key={i} className="flex gap-2">
              <span className="mt-2 text-[10px] font-mono text-muted-foreground w-6">#{i + 1}</span>
              <Textarea
                value={m}
                onChange={(e) => update(i, e.target.value)}
                placeholder={`Message ${i + 1}…`}
                rows={2}
                className="text-xs flex-1"
              />
              {msgs.length > 2 && (
                <Button size="icon" variant="ghost" className="h-7 w-7 mt-1" onClick={() => remove(i)}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={add} disabled={msgs.length >= 30}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            onClick={run}
            disabled={detect.isPending || msgs.filter((m) => m.trim()).length < 2}
          >
            {detect.isPending ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Building timeline…</> : "Build Timeline"}
          </Button>
        </div>

        {result?.results && (
          <div className="p-3 rounded-lg bg-black/40 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Overall trust</span>
              <span className="text-xl font-black text-purple-300">{result.results.overall_score}%</span>
            </div>
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="msg" fontSize={9} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} fontSize={9} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
                  <ReferenceLine y={50} stroke="hsl(0 70% 50%)" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="trust" stroke="hsl(280 80% 65%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
            {result.results.spikes?.length > 0 && (
              <div className="text-[11px]">
                <div className="flex items-center gap-1 text-red-300 mb-1 font-bold">
                  <AlertTriangle className="h-3 w-3" /> Deception spikes
                </div>
                <ul className="space-y-1">
                  {result.results.spikes.slice(0, 4).map((s: any, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Badge variant="outline" className="text-[9px] h-4 border-red-500/40">#{s.index} • {s.score}%</Badge>
                      <span className="text-foreground/85 flex-1">{s.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.results.patterns?.length > 0 && (
              <div className="text-[11px]">
                <div className="text-muted-foreground mb-1 font-semibold">Patterns</div>
                <div className="flex flex-wrap gap-1">
                  {result.results.patterns.map((p: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
