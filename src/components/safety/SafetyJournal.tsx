import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Calendar, MapPin, Users, Smile, Meh, Frown, Lock, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { MoodTracker } from "./MoodTracker";
import { JournalExportPDF } from "./JournalExportPDF";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const incidentTypes = [
  "Verbal bullying", "Physical bullying", "Cyberbullying",
  "Social exclusion", "Harassment", "Threats", "Other",
];

const SafetyJournal = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    incident_type: "", description: "", location: "", witnesses: "", mood_rating: 5,
  });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["safety-journal"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("safety_journal_entries").select("*")
        .eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addEntry = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to use the journal");
      const { error } = await supabase.from("safety_journal_entries").insert({ user_id: user.id, ...formData });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety-journal"] });
      toast.success("Entry saved");
      setShowForm(false);
      setFormData({ incident_type: "", description: "", location: "", witnesses: "", mood_rating: 5 });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moodIcon = (r: number) =>
    r <= 3 ? <Frown className="h-4 w-4 text-red-400" /> : r <= 6 ? <Meh className="h-4 w-4 text-amber-400" /> : <Smile className="h-4 w-4 text-emerald-400" />;

  return (
    <>
      <FloatingHowItWorks title={"Safety Journal - How it works"} steps={[{ title: 'Open', desc: 'Access the Safety Journal section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Safety Journal.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-5">
      {/* Privacy banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 backdrop-blur-md flex items-center gap-3"
      >
        <Lock className="h-5 w-5 text-emerald-400 flex-shrink-0" />
        <div className="text-sm">
          <span className="font-bold text-emerald-400">Encrypted & private.</span>{" "}
          <span className="text-muted-foreground">Only you see your entries — protected by Row Level Security.</span>
        </div>
      </motion.div>

      {/* Mood tracker + AI insight */}
      <MoodTracker />

      {/* New entry */}
      <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-card/60 backdrop-blur-md">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-violet-400" /> Incident Journal
              </CardTitle>
              <CardDescription className="text-xs">Document for your records, school, or legal use.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <JournalExportPDF entries={entries} audience="school" />
              <JournalExportPDF entries={entries} audience="lawyer" />
              <JournalExportPDF entries={entries} audience="police" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full bg-violet-600 hover:bg-violet-500">
              <Plus className="h-4 w-4 mr-2" /> New Entry
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Incident Type</Label>
                <Select value={formData.incident_type} onValueChange={(v) => setFormData({ ...formData, incident_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">What happened?</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder="Describe in detail..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Location</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Where?" />
                </div>
                <div>
                  <Label className="text-xs">Witnesses</Label>
                  <Input value={formData.witnesses} onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })} placeholder="Who saw it?" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Your mood: <span className="font-bold">{formData.mood_rating}/10</span></Label>
                <div className="flex items-center gap-3 mt-1">
                  <Slider value={[formData.mood_rating]} onValueChange={([v]) => setFormData({ ...formData, mood_rating: v })} min={1} max={10} step={1} className="flex-1" />
                  {moodIcon(formData.mood_rating)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => addEntry.mutate()} disabled={addEntry.isPending} className="bg-violet-600 hover:bg-violet-500">Save</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entries list */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-violet-400" /> {entries.length} Entries
        </h3>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-muted-foreground text-sm">Start documenting to build your safety record.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {entries.map((e: any, i: number) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="border-border/40 bg-card/50 backdrop-blur-md hover:border-violet-400/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-[10px]">{e.incident_type || "General"}</Badge>
                      <div className="flex items-center gap-1 text-xs">{moodIcon(e.mood_rating || 5)}<span className="font-bold">{e.mood_rating || 5}</span></div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" /> {format(new Date(e.created_at), "PPp")}
                    </p>
                    <p className="text-sm text-foreground/90 mb-2">{e.description}</p>
                    {e.location && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</p>}
                    {e.witnesses && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> {e.witnesses}</p>}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default SafetyJournal;
