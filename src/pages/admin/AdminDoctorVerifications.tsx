import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Stethoscope, Loader2, CheckCircle2, XCircle, FileText, ExternalLink } from "lucide-react";

interface DoctorRow {
  user_id: string;
  provider_name: string | null;
  specialty: string | null;
  license_number: string | null;
  license_country: string | null;
  license_document_url: string | null;
  license_submitted_at: string | null;
  verification_status: string;
  rejection_reason: string | null;
  is_accepting_bookings: boolean;
}

export default function AdminDoctorVerifications() {
  const [rows, setRows] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [reasonByDoctor, setReasonByDoctor] = useState<Record<string, string>>({});
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    let q = supabase
      .from("healthcare_profiles")
      .select(
        "user_id, provider_name, specialty, license_number, license_country, license_document_url, license_submitted_at, verification_status, rejection_reason, is_accepting_bookings",
      )
      .order("license_submitted_at", { ascending: false, nullsFirst: false });
    if (filter === "pending") q = q.eq("verification_status", "pending");
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setRows((data as DoctorRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function viewDocument(doctor: DoctorRow) {
    if (!doctor.license_document_url) return;
    if (signedUrls[doctor.user_id]) {
      window.open(signedUrls[doctor.user_id], "_blank");
      return;
    }
    const { data, error } = await supabase.storage
      .from("doctor-licenses")
      .createSignedUrl(doctor.license_document_url, 300);
    if (error || !data) {
      toast.error(error?.message ?? "Cannot open document");
      return;
    }
    setSignedUrls((s) => ({ ...s, [doctor.user_id]: data.signedUrl }));
    window.open(data.signedUrl, "_blank");
  }

  async function decide(doctor: DoctorRow, action: "approve" | "reject") {
    setBusy(doctor.user_id);
    try {
      const { error } = await supabase.functions.invoke("admin-verify-doctor", {
        body: {
          doctor_id: doctor.user_id,
          action,
          reason: action === "reject" ? reasonByDoctor[doctor.user_id] ?? "" : undefined,
        },
      });
      if (error) throw error;
      toast.success(action === "approve" ? "Doctor approved" : "Doctor rejected");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Helmet>
        <title>Doctor verifications · Admin</title>
      </Helmet>
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-8 pt-24 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary" /> Doctor verifications
          </h1>
          <div className="flex gap-2">
            <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
              Pending
            </Button>
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </p>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No {filter === "pending" ? "pending" : ""} verifications.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rows.map((d) => (
              <Card key={d.user_id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-base">
                        {d.provider_name || "(no name)"} · {d.specialty || "—"}
                      </CardTitle>
                      <CardDescription className="text-xs">User: {d.user_id}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        d.verification_status === "approved"
                          ? "default"
                          : d.verification_status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {d.verification_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div><span className="text-muted-foreground">License #:</span> {d.license_number || "—"}</div>
                    <div><span className="text-muted-foreground">Country:</span> {d.license_country || "—"}</div>
                    <div>
                      <span className="text-muted-foreground">Submitted:</span>{" "}
                      {d.license_submitted_at ? new Date(d.license_submitted_at).toLocaleString() : "—"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accepting bookings:</span>{" "}
                      {d.is_accepting_bookings ? "Yes" : "No"}
                    </div>
                  </div>

                  {d.rejection_reason && (
                    <div className="text-xs text-destructive">Previous rejection: {d.rejection_reason}</div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" disabled={!d.license_document_url} onClick={() => viewDocument(d)}>
                      <FileText className="w-4 h-4 mr-1" /> View license
                      {d.license_document_url && <ExternalLink className="w-3 h-3 ml-1" />}
                    </Button>
                  </div>

                  {d.verification_status !== "approved" && (
                    <>
                      <Textarea
                        rows={2}
                        placeholder="Rejection reason (required to reject)"
                        value={reasonByDoctor[d.user_id] ?? ""}
                        onChange={(e) =>
                          setReasonByDoctor((s) => ({ ...s, [d.user_id]: e.target.value }))
                        }
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => decide(d, "approve")}
                          disabled={busy === d.user_id}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => decide(d, "reject")}
                          disabled={busy === d.user_id || !(reasonByDoctor[d.user_id] ?? "").trim()}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
