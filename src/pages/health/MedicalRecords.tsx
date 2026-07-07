import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import HowItWorksHealth from "@/components/health/HowItWorksHealth";
import { Loader2, Trash2, Plus } from "lucide-react";

type RecordType = "diagnosis" | "allergy" | "medication" | "attachment";

interface Record {
  id: string;
  record_type: RecordType;
  title: string;
  description: string | null;
  recorded_at: string;
}

export default function MedicalRecords() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<RecordType>("diagnosis");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("medical_records")
      .select("id,record_type,title,description,recorded_at")
      .eq("patient_id", user.id)
      .order("recorded_at", { ascending: false });
    setRows((data as unknown as Record[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, [user]);

  async function add() {
    if (!user || !title.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("medical_records").insert({
      patient_id: user.id,
      record_type: type,
      title: title.trim(),
      description: description.trim() || null,
    });
    setSaving(false);
    if (error) return toast({ variant: "destructive", title: "Save failed", description: error.message });
    setTitle(""); setDescription("");
    refresh();
  }

  async function remove(id: string) {
    await supabase.from("medical_records").delete().eq("id", id);
    refresh();
  }

  return (
    <>
      <Helmet>
        <title>My medical records | Unique Health</title>
        <meta name="description" content="Track your diagnoses, allergies, medications and attachments." />
      </Helmet>
      <Navbar />
      <main className="container mx-auto space-y-6 px-4 py-8">
        <h1 className="text-2xl font-semibold">My medical records</h1>

        <Card>
          <CardHeader><CardTitle>Add record</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={type} onValueChange={(v) => setType(v as RecordType)}>
                <SelectTrigger className="sm:w-52"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diagnosis">Diagnosis</SelectItem>
                  <SelectItem value="allergy">Allergy</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="attachment">Attachment</SelectItem>
                </SelectContent>
              </Select>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            </div>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes (optional)" />
            <Button onClick={add} disabled={saving || !title.trim()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Save record
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records yet.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex items-start justify-between gap-3 pt-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{r.record_type}</Badge>
                      <span className="font-medium">{r.title}</span>
                    </div>
                    {r.description && <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(r.recorded_at).toLocaleString()}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <HowItWorksHealth
          title="Medical records"
          steps={[
            "Only you can see and edit your records — they're fully private.",
            "When you book a doctor, the platform grants them read-only access for 48 hours after the scheduled time.",
            "Access is revoked automatically if the appointment is cancelled.",
          ]}
        />
      </main>
    </>
  );
}
