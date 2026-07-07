import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet-async";
import { Stethoscope, Loader2, ShieldCheck } from "lucide-react";

/**
 * Doctor onboarding — creates or updates the caller's row in `healthcare_profiles`.
 * Same page doubles as "edit profile" from the DoctorDashboard.
 */
export default function BecomeDoctor() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    provider_name: "",
    specialty: "",
    bio: "",
    languages: "en",
    consultation_price_cents: 5000,
    consultation_duration_min: 30,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    is_accepting_bookings: false,
    provider_logo_url: "",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("healthcare_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setExistingId(data.id);
        setForm({
          provider_name: data.provider_name ?? "",
          specialty: data.specialty ?? "",
          bio: data.bio ?? "",
          languages: (data.languages ?? ["en"]).join(","),
          consultation_price_cents: data.consultation_price_cents ?? 5000,
          consultation_duration_min: data.consultation_duration_min ?? 30,
          timezone: data.timezone ?? "UTC",
          is_accepting_bookings: data.is_accepting_bookings ?? false,
          provider_logo_url: data.provider_logo_url ?? "",
        });
      }
      setLoading(false);
    })();
  }, [user]);

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto max-w-2xl px-4 py-8 pt-24">
          <Alert>
            <AlertTitle>Sign in required</AlertTitle>
            <AlertDescription>
              You must sign in before you can register as a doctor.
              <Button asChild size="sm" className="ml-3">
                <a href="/auth?next=/doctors/apply">Sign in</a>
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </>
    );
  }

  async function save() {
    if (!user) return;
    if (!form.provider_name || !form.specialty) {
      toast({ variant: "destructive", title: "Missing fields", description: "Provider name and specialty are required." });
      return;
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      provider_name: form.provider_name.trim(),
      specialty: form.specialty.trim(),
      bio: form.bio.trim() || null,
      languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
      consultation_price_cents: Math.max(0, Math.round(form.consultation_price_cents)),
      consultation_duration_min: Math.max(10, Math.round(form.consultation_duration_min)),
      timezone: form.timezone,
      is_accepting_bookings: form.is_accepting_bookings,
      provider_logo_url: form.provider_logo_url.trim() || null,
    };
    const res = existingId
      ? await supabase.from("healthcare_profiles").update(payload).eq("id", existingId)
      : await supabase.from("healthcare_profiles").insert(payload);
    setSaving(false);
    if (res.error) {
      toast({ variant: "destructive", title: "Save failed", description: res.error.message });
      return;
    }
    toast({ title: existingId ? "Profile updated" : "Doctor profile created" });
    nav("/doctor-dashboard");
  }

  return (
    <>
      <Helmet>
        <title>Become a Doctor · Unique Health</title>
        <meta name="description" content="Register as a verified doctor on Unique and accept paid video consultations in EUR." />
      </Helmet>
      <Navbar />
      <main className="container mx-auto max-w-2xl space-y-6 px-4 py-8 pt-24">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Stethoscope className="h-6 w-6 text-primary" />
            {existingId ? "Edit doctor profile" : "Become a doctor"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Register your practice. Patients will only see you once you toggle "Accepting bookings".
          </p>
        </div>

        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Verification</AlertTitle>
          <AlertDescription>
            Your first live booking will trigger a manual verification review by our medical team. Payouts stay on hold
            until you connect Stripe and complete verification.
          </AlertDescription>
        </Alert>

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading…
          </p>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Practice details</CardTitle>
              <CardDescription>Shown on your public doctor page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="pn">Provider name *</Label>
                  <Input id="pn" value={form.provider_name}
                    onChange={(e) => setForm({ ...form, provider_name: e.target.value })}
                    placeholder="Dr. Jane Smith" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sp">Specialty *</Label>
                  <Input id="sp" value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    placeholder="General practitioner" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="10 years of experience in family medicine, ..." />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="price">Price (€)</Label>
                  <Input id="price" type="number" min={0} step="1"
                    value={(form.consultation_price_cents / 100).toString()}
                    onChange={(e) => setForm({ ...form, consultation_price_cents: Math.round(Number(e.target.value) * 100) })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dur">Duration (min)</Label>
                  <Input id="dur" type="number" min={10} step="5"
                    value={form.consultation_duration_min}
                    onChange={(e) => setForm({ ...form, consultation_duration_min: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="tz">Timezone</Label>
                  <Input id="tz" value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    placeholder="Europe/Bratislava" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="lang">Languages (comma-separated)</Label>
                  <Input id="lang" value={form.languages}
                    onChange={(e) => setForm({ ...form, languages: e.target.value })}
                    placeholder="en, sk, cs" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input id="logo" value={form.provider_logo_url}
                    onChange={(e) => setForm({ ...form, provider_logo_url: e.target.value })}
                    placeholder="https://…/photo.jpg" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label htmlFor="acc" className="text-sm">Accepting bookings</Label>
                  <p className="text-xs text-muted-foreground">Turn on when your calendar is ready.</p>
                </div>
                <Switch id="acc" checked={form.is_accepting_bookings}
                  onCheckedChange={(v) => setForm({ ...form, is_accepting_bookings: v })} />
              </div>

              <Button onClick={save} disabled={saving} className="w-full">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : existingId ? "Save changes" : "Create doctor profile"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
