import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Settings, Loader2, Plus, X, Users } from "lucide-react";
import { useHrStatus, useHrCheckout, useHrPortal, useHrBulkAnalyze } from "@/hooks/useHandwritingPremium";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

type Candidate = { name: string; imageUrl: string };

export const HrProCard = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [results, setResults] = useState<any>(null);
  const status = useHrStatus();
  const checkout = useHrCheckout();
  const portal = useHrPortal();
  const bulk = useHrBulkAnalyze();

  const isActive = (status.data as any)?.active;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onloadend = () => setCandidates(c => [...c, { name: f.name.replace(/\.[^.]+$/, ""), imageUrl: r.result as string }]);
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const updateName = (i: number, name: string) => setCandidates(c => c.map((x, idx) => idx === i ? { ...x, name } : x));
  const removeCandidate = (i: number) => setCandidates(c => c.filter((_, idx) => idx !== i));

  const runBulk = () => {
    if (!jobTitle || candidates.length === 0) return toast.error("Add job title + at least 1 candidate");
    bulk.mutate({ jobTitle, candidates }, {
      onSuccess: (d: any) => {
        setResults(d.results);
        setCandidates([]);
      }
    });
  };

  return (
    <>
      <FloatingHowItWorks title={"Hr Pro Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Hr Pro Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Hr Pro Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-indigo-50/40 border-blue-300/40 dark:from-slate-950/30 dark:via-blue-950/20 dark:to-indigo-950/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-700" />
            HR Pro Tier
          </span>
          <Badge className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white border-0">€99/mo</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isActive ? (
          <>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>💼 Bulk candidate screening (up to 50/month)</li>
              <li>📋 Job-fit scoring & shortlist export</li>
              <li>🧠 Leadership, integrity & stress profiling</li>
              <li>📑 White-labelled PDF reports</li>
              <li>👥 Multi-user team workspace (coming soon)</li>
            </ul>
            <Button
              onClick={() => checkout.mutate()}
              disabled={checkout.isPending}
              className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white"
            >
              {checkout.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Briefcase className="w-4 h-4 mr-2" />}
              Activate HR Pro
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 border border-blue-300/40">
              <div className="text-xs">
                <div className="font-bold text-blue-900 dark:text-blue-200">HR Pro Active</div>
                <div className="text-[10px] text-blue-700/70 dark:text-blue-300/70">
                  {(status.data as any)?.candidates_used ?? 0} / 50 used this month
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => portal.mutate()} disabled={portal.isPending}>
                <Settings className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-2">
              <div>
                <Label className="text-xs">Job title</Label>
                <Input
                  placeholder="e.g. Senior Sales Manager"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <Label className="text-xs flex items-center gap-1"><Users className="w-3 h-3" /> Candidates ({candidates.length})</Label>
                <div className="space-y-1 max-h-40 overflow-auto">
                  {candidates.map((c, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <img src={c.imageUrl} alt="" className="w-8 h-8 rounded object-cover border" />
                      <Input value={c.name} onChange={(e) => updateName(i, e.target.value)} className="text-xs h-7" />
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => removeCandidate(i)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <label className="flex items-center justify-center gap-1 mt-1 p-2 border border-dashed border-blue-400/40 rounded text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30">
                  <Plus className="w-3 h-3" /> Add candidate
                  <input type="file" accept="image/*" onChange={onFile} className="hidden" />
                </label>
              </div>

              <Button
                onClick={runBulk}
                disabled={bulk.isPending || candidates.length === 0 || !jobTitle}
                className="w-full bg-gradient-to-r from-blue-700 to-indigo-700 text-white"
              >
                {bulk.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Screening…</> : `Run bulk screening (${candidates.length * 4} cr)`}
              </Button>
            </div>

            {results && (
              <div className="space-y-1 pt-2 max-h-48 overflow-auto">
                <div className="text-xs font-bold">Shortlist</div>
                {results.sort((a: any, b: any) => b.fit_score - a.fit_score).map((r: any, i: number) => (
                  <div key={i} className="p-2 rounded bg-card/60 border text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{r.name}</span>
                      <Badge variant={r.fit_score >= 75 ? "default" : "secondary"}>{r.fit_score}%</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{r.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
};
