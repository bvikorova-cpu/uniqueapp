import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function CompanyNew() {
  const [form, setForm] = useState({ name: "", website: "", industry: "", size: "", headquarters: "", description: "", logo_url: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const submit = async () => {
    if (!form.name.trim()) return toast({ title: "Name is required", variant: "destructive" });
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return toast({ title: "Sign in required", variant: "destructive" }); }
    const slug = slugify(form.name) + "-" + Math.random().toString(36).slice(2, 6);
    const { data, error } = await supabase.from("company_profiles").insert({ ...form, slug, owner_id: user.id }).select().maybeSingle();
    setBusy(false);
    if (error) return toast({ title: "Could not create", description: error.message, variant: "destructive" });
    toast({ title: "Company created" });
    navigate(`/jobs/companies/${data!.slug}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-pink-500"><Building2 className="h-5 w-5 text-white" /></div>
        <h1 className="text-2xl font-black">Add Company</h1>
      </div>
      <Card><CardContent className="p-5 space-y-3">
        {[
          ["name", "Name *", "Acme Inc."],
          ["website", "Website", "https://"],
          ["industry", "Industry", "IT & Software"],
          ["size", "Company size", "11-50"],
          ["headquarters", "Headquarters", "Bratislava, Slovakia"],
          ["logo_url", "Logo URL", "https://"],
        ].map(([k, label, ph]) => (
          <div key={k}>
            <Label>{label}</Label>
            <Input value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={ph} />
          </div>
        ))}
        <div>
          <Label>Description</Label>
          <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does the company do?" />
        </div>
        <Button onClick={submit} disabled={busy} className="w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create company"}
        </Button>
      </CardContent></Card>
    </div>
  );
}
