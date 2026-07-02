import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FileText, CheckCircle2 } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/** Lightweight DAC7 / W-9 / W-8 self-cert form — stores a single row per user. */
export function TaxFormWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    form_type: "DAC7",
    full_name: "",
    tax_id: "",
    country: "SK",
    vat_id: "",
  });

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from("tax_forms")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setForm({
          form_type: data.form_type,
          full_name: data.full_name || "",
          tax_id: data.tax_id || "",
          country: data.country || "SK",
          vat_id: data.vat_id || "",
        });
        setSubmitted(true);
      }
    })();
  }, [user?.id]);

  const submit = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { error } = await supabase.from("tax_forms").upsert(
      { user_id: user.id, ...form },
      { onConflict: "user_id" },
    );
    setLoading(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tax form saved" });
      setSubmitted(true);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tax Form Widget - How it works"} steps={[{ title: 'Open', desc: 'Access the Tax Form Widget section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tax Form Widget.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" /> Tax certification
        </CardTitle>
        {submitted && <Badge className="gap-1 bg-emerald-500/20 text-emerald-500 border-emerald-500/40"><CheckCircle2 className="h-3 w-3" /> On file</Badge>}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Form type</Label>
            <Select value={form.form_type} onValueChange={(v) => setForm({ ...form, form_type: v })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DAC7">DAC7 (EU)</SelectItem>
                <SelectItem value="W-9">W-9 (US)</SelectItem>
                <SelectItem value="W-8BEN">W-8BEN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Country</Label>
            <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })} maxLength={2} />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Full legal name</Label>
          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Tax ID / SSN</Label>
            <Input value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">VAT ID (optional)</Label>
            <Input value={form.vat_id} onChange={(e) => setForm({ ...form, vat_id: e.target.value })} />
          </div>
        </div>
        <Button onClick={submit} disabled={loading || !form.full_name} size="sm" className="w-full">
          {loading ? "Saving…" : submitted ? "Update" : "Submit"}
        </Button>
      </CardContent>
    </Card>
    </>
  );
}
