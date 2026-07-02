import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Loader2, Mail, Star, MessageSquare, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_EMPLOYERATS = [
  { title: "Pipeline stages", desc: "Applied \u2192 Screening \u2192 Interview \u2192 Offer \u2192 Hired. Drag cards between stages." },
  { title: "Bulk actions", desc: "Select many candidates to move stage, send email or reject with a template." },
  { title: "Collaborate with team", desc: "Add hiring managers, leave scorecards, share feedback." },
  { title: "Analytics", desc: "Time-to-hire, source of hire and pipeline conversion charts." },
];

const STAGES = [
  { id: "pending", label: "Applied", color: "bg-blue-500/15 border-blue-500/30 text-blue-300" },
  { id: "viewed", label: "Reviewed", color: "bg-amber-500/15 border-amber-500/30 text-amber-300" },
  { id: "interview", label: "Interview", color: "bg-purple-500/15 border-purple-500/30 text-purple-300" },
  { id: "offer", label: "Offer", color: "bg-green-500/15 border-green-500/30 text-green-300" },
  { id: "rejected", label: "Rejected", color: "bg-rose-500/15 border-rose-500/30 text-rose-300" },
];

export default function EmployerATS() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [noteText, setNoteText] = useState("");
  const [noteRating, setNoteRating] = useState<number>(0);
  const [notes, setNotes] = useState<any[]>([]);
  const [rejectTemplate, setRejectTemplate] = useState<string>("");

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !jobId) { setLoading(false); return; }
    const { data: j } = await supabase.from("job_listings").select("*").eq("id", jobId).eq("employer_id", user.id).maybeSingle();
    setJob(j);
    const { data: a } = await supabase.from("job_applications").select("*").eq("job_id", jobId).order("created_at", { ascending: false });
    // Enrich with applicant profile
    const ids = (a ?? []).map((x: any) => x.applicant_id);
    let profilesMap: Record<string, any> = {};
    if (ids.length) {
      const { data: profs } = await (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", ids);
      profilesMap = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p]));
    }
    setApps((a ?? []).map((x: any) => ({ ...x, profile: profilesMap[x.applicant_id] })));
    const { data: t } = await (supabase as any).from("rejection_templates").select("*").eq("employer_id", user.id);
    setTemplates(t ?? []);
    setLoading(false);
  };

  useEffect(() => { load();   }, [jobId]);

  const moveStage = async (appId: string, status: string) => {
    const { error } = await supabase.from("job_applications").update({ status }).eq("id", appId);
    if (error) return toast.error(error.message);
    toast.success(`Moved to ${status}`);
    load();
  };

  const openCandidate = async (app: any) => {
    setSelectedApp(app);
    const { data } = await (supabase as any).from("ats_candidate_notes").select("*").eq("application_id", app.id).order("created_at", { ascending: false });
    setNotes(data ?? []);
  };

  const addNote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedApp || !noteText.trim()) return;
    const { error } = await (supabase as any).from("ats_candidate_notes").insert({
      application_id: selectedApp.id, employer_id: user.id, note: noteText.trim(), rating: noteRating || null,
    });
    if (error) return toast.error(error.message);
    setNoteText(""); setNoteRating(0);
    openCandidate(selectedApp);
    toast.success("Note added");
  };

  const sendRejection = async () => {
    const tpl = templates.find(t => t.id === rejectTemplate);
    if (!tpl || !selectedApp) return toast.error("Pick a template");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // resolve candidate email from auth via profiles is not available, fall back to contact_email
    const recipient = selectedApp.profile?.email || job?.contact_email || "candidate@unknown";
    const { error } = await (supabase as any).from("rejection_email_log").insert({
      application_id: selectedApp.id, employer_id: user.id,
      recipient_email: recipient, subject: tpl.subject, body: tpl.body,
    });
    if (error) return toast.error(error.message);
    await supabase.from("job_applications").update({ status: "rejected" }).eq("id", selectedApp.id);
    toast.success("Rejection logged & candidate moved to Rejected");
    setSelectedApp(null);
    load();
  };

  const grouped = (s: string) => apps.filter(a => (a.status || "pending") === s);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Employer ATS" intro="Applicant tracking system for your company." steps={HOW_STEPS_EMPLOYERATS} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/15 via-primary/10 to-pink-500/5 border border-purple-500/20 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/employer-dashboard")}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl"><Briefcase className="h-7 w-7 text-white" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">{job?.title || "ATS Pipeline"}</h1>
            <p className="text-sm text-muted-foreground">{apps.length} candidates • drag through stages</p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {STAGES.map(stage => {
            const items = grouped(stage.id);
            return (
              <div key={stage.id} className="space-y-2">
                <div className={`p-2 rounded-lg border ${stage.color} flex items-center justify-between`}>
                  <span className="text-sm font-bold">{stage.label}</span>
                  <Badge variant="outline" className={stage.color}>{items.length}</Badge>
                </div>
                <div className="space-y-2 min-h-[80px]">
                  {items.map(a => (
                    <Card key={a.id} className="hover:border-primary/40 cursor-pointer" onClick={() => openCandidate(a)}>
                      <CardContent className="p-3">
                        <h4 className="font-semibold text-sm">{a.profile?.full_name || "Anonymous"}</h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{a.cover_letter || "No cover letter"}</p>
                        <div className="text-[10px] text-muted-foreground mt-1">{format(new Date(a.created_at), "PP")}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {STAGES.filter(s => s.id !== (a.status || "pending")).map(s => (
                            <Button key={s.id} size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]"
                              onClick={(e) => { e.stopPropagation(); moveStage(a.id, s.id); }}>→ {s.label}</Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedApp} onOpenChange={(o) => !o && setSelectedApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedApp?.profile?.full_name || "Candidate"}</DialogTitle></DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              {selectedApp.cover_letter && (
                <Card><CardContent className="p-3 text-sm whitespace-pre-wrap">{selectedApp.cover_letter}</CardContent></Card>
              )}
              {selectedApp.resume_url && <Button variant="outline" asChild><a href={selectedApp.resume_url} target="_blank" rel="noreferrer">View Resume</a></Button>}

              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-1"><MessageSquare className="h-4 w-4" /> Notes & ratings</h4>
                <Textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add internal note…" />
                <div className="flex gap-2 items-center">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setNoteRating(n)} type="button">
                      <Star className={`h-5 w-5 ${n <= noteRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                  <Button size="sm" onClick={addNote}>Save</Button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {notes.map(n => (
                    <div key={n.id} className="text-xs p-2 rounded bg-muted/40">
                      <div className="flex justify-between"><span>{n.rating ? "★".repeat(n.rating) : ""}</span><span className="text-muted-foreground">{format(new Date(n.created_at), "PP")}</span></div>
                      <p>{n.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <h4 className="font-semibold text-sm flex items-center gap-1"><Mail className="h-4 w-4" /> Send rejection email</h4>
                <Select value={rejectTemplate} onValueChange={setRejectTemplate}>
                  <SelectTrigger><SelectValue placeholder="Pick template" /></SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 ? <SelectItem value="_" disabled>No templates yet</SelectItem> :
                      templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={sendRejection} disabled={!rejectTemplate}>Send & mark rejected</Button>
                  <Button variant="outline" onClick={() => navigate("/jobs/rejection-templates")}>Manage templates</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
