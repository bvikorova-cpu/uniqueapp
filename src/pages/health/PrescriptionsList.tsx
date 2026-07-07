import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Helmet } from "react-helmet-async";
import HowItWorksHealth from "@/components/health/HowItWorksHealth";
import { FileText, Loader2, Download } from "lucide-react";

interface Rx {
  id: string;
  issued_at: string;
  medications: Array<{ name: string; dose: string; frequency: string; duration?: string }>;
  dosage_instructions: string | null;
  pdf_url: string | null;
  qr_token: string;
  expires_at: string;
}

export default function PrescriptionsList() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Rx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("prescriptions")
        .select("id,issued_at,medications,dosage_instructions,pdf_url,qr_token,expires_at")
        .eq("patient_id", user.id)
        .order("issued_at", { ascending: false });
      setRows((data as unknown as Rx[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  async function download(rx: Rx) {
    if (!rx.pdf_url) return;
    const { data } = await supabase.storage.from("prescriptions").createSignedUrl(rx.pdf_url, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <>
      <Helmet>
        <title>My prescriptions | Unique Health</title>
        <meta name="description" content="Your e-prescriptions from confirmed doctor consultations." />
      </Helmet>
      <Navbar />
      <main className="container mx-auto space-y-6 px-4 py-8">
        <h1 className="text-2xl font-semibold">My prescriptions</h1>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">You have no prescriptions yet.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((rx) => (
              <Card key={rx.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-primary" />
                    Issued {new Date(rx.issued_at).toLocaleDateString()}
                  </CardTitle>
                  <Badge variant={new Date(rx.expires_at) > new Date() ? "default" : "secondary"}>
                    {new Date(rx.expires_at) > new Date() ? "Valid" : "Expired"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="text-sm">
                    {rx.medications.map((m, i) => (
                      <li key={i}>
                        <strong>{m.name}</strong> — {m.dose}, {m.frequency}
                        {m.duration ? `, for ${m.duration}` : ""}
                      </li>
                    ))}
                  </ul>
                  {rx.dosage_instructions && (
                    <p className="text-xs text-muted-foreground">{rx.dosage_instructions}</p>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => download(rx)}>
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <HowItWorksHealth
          title="E-prescriptions"
          steps={[
            "Your doctor issues a prescription after a confirmed consultation.",
            "The PDF includes a QR code the pharmacy scans to verify authenticity.",
            "Download links expire after 5 minutes — reopen this page for a fresh link.",
          ]}
        />
      </main>
    </>
  );
}
