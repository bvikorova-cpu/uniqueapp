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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useStripeConnect } from "@/hooks/useStripeConnect";
import { Helmet } from "react-helmet-async";
import { Stethoscope, Loader2, ShieldCheck, Upload, FileCheck2, CreditCard, AlertCircle } from "lucide-react";

interface StripeConnectStatus {
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  onboarding_complete?: boolean;
  account_id?: string | null;
}

export default function BecomeDoctor() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const { startOnboarding, loading: connectLoading } = useStripeConnect();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("unverified");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [licenseDocPath, setLicenseDocPath] = useState<string | null>(null);
  const [licenseSubmittedAt, setLicenseSubmittedAt] = useState<string | null>(null);
  const [connect, setConnect] = useState<StripeConnectStatus>({});
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
    license_number: "",
    license_country: "",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: hp }, { data: profile }] = await Promise.all([
        supabase.from("healthcare_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles")
          .select("stripe_connect_account_id, stripe_connect_charges_enabled, stripe_connect_payouts_enabled, stripe_connect_onboarding_complete")
          .eq("id", user.id).maybeSingle(),
      ]);
      if (hp) {
        setExistingId(hp.id);
        setVerificationStatus(hp.verification_status ?? "unverified");
        setRejectionReason(hp.rejection_reason ?? null);
        setLicenseDocPath(hp.license_document_url ?? null);
        setLicenseSubmittedAt(hp.license_submitted_at ?? null);
        setForm({
          provider_name: hp.provider_name ?? "",
          specialty: hp.specialty ?? "",
          bio: hp.bio ?? "",
          languages: (hp.languages ?? ["en"]).join(","),
          consultation_price_cents: hp.consultation_price_cents ?? 5000,
          consultation_duration_min: hp.consultation_duration_min ?? 30,
          timezone: hp.timezone ?? "UTC",
          is_accepting_bookings: hp.is_accepting_bookings ?? false,
          provider_logo_url: hp.provider_logo_url ?? "",
          license_number: hp.license_number ?? "",
          license_country: hp.license_country ?? "",
        });
      }
      if (profile) {
        setConnect({
          account_id: profile.stripe_connect_account_id,
          charges_enabled: profile.stripe_connect_charges_enabled ?? false,
          payouts_enabled: profile.stripe_connect_payouts_enabled ?? false,
          onboarding_complete: profile.stripe_connect_onboarding_complete ?? false,
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

  const stripeReady = !!(connect.charges_enabled && connect.payouts_enabled);
  const canAcceptBookings = verificationStatus === "approved" && stripeReady;

  async function save() {
    if (!user) return;
    if (!form.provider_name || !form.specialty) {
      toast({ variant: "destructive", title: "Missing fields", description: "Provider name and specialty are required." });
      return;
    }
    if (form.is_accepting_bookings && !canAcceptBookings) {
      toast({
        variant: "destructive",
        title: "Cannot accept bookings yet",
        description: "Complete verification and Stripe Connect first.",
      });
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
      license_number: form.license_number.trim() || null,
      license_country: form.license_country.trim() || null,
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
    if (!existingId) {
      const { data } = await supabase.from("healthcare_profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (data) setExistingId(data.id);
    }
  }

  async function uploadLicense(file: File) {
    if (!user) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Max 10 MB." });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const path = `${user.id}/license-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("doctor-licenses").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (up.error) throw up.error;
      const patch = {
        license_document_url: path,
        license_submitted_at: new Date().toISOString(),
        verification_status: "pending" as const,
        rejection_reason: null,
      };
      const res = existingId
        ? await supabase.from("healthcare_profiles").update(patch).eq("id", existingId)
        : await supabase.from("healthcare_profiles").insert({ user_id: user.id, ...patch });
      if (res.error) throw res.error;
      setLicenseDocPath(path);
      setLicenseSubmittedAt(patch.license_submitted_at);
      setVerificationStatus("pending");
      setRejectionReason(null);
      if (!existingId) {
        const { data } = await supabase.from("healthcare_profiles").select("id").eq("user_id", user.id).maybeSingle();
        if (data) setExistingId(data.id);
      }
      toast({ title: "License submitted", description: "We will review it shortly." });
    } catch (e) {
      toast({ variant: "destructive", title: "Upload failed", description: (e as Error).message });
    } finally {
      setUploading(false);
    }
  }

  const verificationBadge =
    verificationStatus === "approved" ? (
      <Badge className="bg-emerald-500/15 text-emerald-600">Approved</Badge>
    ) : verificationStatus === "pending" ? (
      <Badge variant="secondary">Pending review</Badge>
    ) : verificationStatus === "rejected" ? (
      <Badge variant="destructive">Rejected</Badge>
    ) : (
      <Badge variant="outline">Not submitted</Badge>
    );

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
            {existingId ? "Doctor profile" : "Become a doctor"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Register your practice. You must verify your medical license and connect Stripe before accepting paid bookings.
          </p>
        </div>

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading…
          </p>
        ) : (
          <>
            {/* Step 1 – license verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Step 1 · License verification {verificationBadge}
                </CardTitle>
                <CardDescription>Upload a scan of your medical license. Reviewed manually within 1–3 business days.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationStatus === "rejected" && rejectionReason && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>License rejected</AlertTitle>
                    <AlertDescription>{rejectionReason} — please re-upload a corrected document.</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="lic-num">License number</Label>
                    <Input id="lic-num" value={form.license_number}
                      onChange={(e) => setForm({ ...form, license_number: e.target.value })}
                      placeholder="e.g. SK-1234567" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lic-co">Issuing country</Label>
                    <Input id="lic-co" value={form.license_country}
                      onChange={(e) => setForm({ ...form, license_country: e.target.value })}
                      placeholder="Slovakia" />
                  </div>
                </div>

                {licenseDocPath ? (
                  <p className="flex items-center gap-2 text-sm text-emerald-700">
                    <FileCheck2 className="h-4 w-4" /> License uploaded
                    {licenseSubmittedAt && (
                      <span className="text-xs text-muted-foreground">
                        ({new Date(licenseSubmittedAt).toLocaleDateString()})
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No license on file yet.</p>
                )}

                <div>
                  <input
                    id="lic-file"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadLicense(f);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant={licenseDocPath ? "outline" : "default"}
                    disabled={uploading}
                    onClick={() => document.getElementById("lic-file")?.click()}
                  >
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {licenseDocPath ? "Re-upload license" : "Upload license (PDF / JPG / PNG)"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 – Stripe Connect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-primary" /> Step 2 · Stripe Connect{" "}
                  {stripeReady ? (
                    <Badge className="bg-emerald-500/15 text-emerald-600">Ready</Badge>
                  ) : connect.account_id ? (
                    <Badge variant="secondary">Incomplete</Badge>
                  ) : (
                    <Badge variant="outline">Not connected</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Payouts (85% of each consultation) go directly to your Stripe account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {!stripeReady && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Charges enabled: {connect.charges_enabled ? "yes" : "no"} · Payouts enabled:{" "}
                      {connect.payouts_enabled ? "yes" : "no"}
                    </AlertDescription>
                  </Alert>
                )}
                <Button onClick={startOnboarding} disabled={connectLoading}>
                  {connectLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {connect.account_id ? "Continue Stripe onboarding" : "Connect Stripe account"}
                </Button>
              </CardContent>
            </Card>

            {/* Step 3 – practice details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Step 3 · Practice details</CardTitle>
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

                <div className="flex items-start justify-between gap-3 rounded-md border p-3">
                  <div>
                    <Label htmlFor="acc" className="text-sm">Accepting bookings</Label>
                    <p className="text-xs text-muted-foreground">
                      Requires: verification approved + Stripe Connect ready.
                    </p>
                    {!canAcceptBookings && (
                      <p className="text-xs text-destructive mt-1">
                        Locked — finish steps 1 and 2 first.
                      </p>
                    )}
                  </div>
                  <Switch
                    id="acc"
                    checked={form.is_accepting_bookings}
                    disabled={!canAcceptBookings}
                    onCheckedChange={(v) => setForm({ ...form, is_accepting_bookings: v })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={save} disabled={saving} className="flex-1">
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : existingId ? "Save changes" : "Create doctor profile"}
                  </Button>
                  {existingId && (
                    <Button variant="outline" onClick={() => nav("/doctor-dashboard")}>Dashboard</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </>
  );
}
