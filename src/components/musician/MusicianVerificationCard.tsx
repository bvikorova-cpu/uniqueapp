import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, ShieldAlert, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  profile: any;
  onUpdated: () => void;
}

export const MusicianVerificationCard = ({ profile, onUpdated }: Props) => {
  const [legalName, setLegalName] = useState("");
  const [socialProof, setSocialProof] = useState("");
  const [notes, setNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const status = profile?.verification_status || "unverified";
  const verified = !!profile?.verified;

  useEffect(() => {
    (async () => {
      if (!profile?.user_id) return;
      const { data } = await supabase
        .from("musician_kyc")
        .select("legal_name, social_proof_url, verification_notes")
        .eq("user_id", profile.user_id)
        .maybeSingle();
      if (data) {
        setLegalName(data.legal_name || "");
        setSocialProof(data.social_proof_url || "");
        setAdminNotes(data.verification_notes);
      }
    })();
  }, [profile?.user_id]);

  const submit = async () => {
    if (!legalName.trim() || !socialProof.trim()) {
      toast.error("Legal name and social proof URL are required");
      return;
    }
    setSubmitting(true);
    try {
      const { error: kycErr } = await supabase
        .from("musician_kyc")
        .upsert({
          user_id: profile.user_id,
          legal_name: legalName.trim(),
          social_proof_url: socialProof.trim(),
          verification_notes: notes.trim() || null,
        }, { onConflict: "user_id" });
      if (kycErr) throw kycErr;

      const { error } = await supabase
        .from("musician_profiles")
        .update({
          verification_status: "pending",
          verification_requested_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
      if (error) throw error;
      toast.success("Verification request submitted — admin will review");
      onUpdated();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const StatusBadge = () => {
    if (verified) return <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/40 gap-1"><BadgeCheck className="h-3 w-3" />Verified</Badge>;
    if (status === "pending") return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending review</Badge>;
    if (status === "rejected") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
    return <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-400"><ShieldAlert className="h-3 w-3" />Unverified</Badge>;
  };

  return (
    <>
      <FloatingHowItWorks title="How Musician Verification Card works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">Artist Verification <StatusBadge /></CardTitle>
            <CardDescription>
              {verified
                ? "Your identity is verified. You can use reserved artist names and unlimited ticket prices."
                : "Get a Verified badge so fans know it's really you. Required for famous artist names."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {!verified && (
        <CardContent className="space-y-3">
          {status === "rejected" && adminNotes && (
            <div className="text-sm rounded-md bg-destructive/10 border border-destructive/30 p-3">
              <strong>Admin notes:</strong> {adminNotes}
            </div>
          )}
          <div className="space-y-2">
            <Label>Legal Name *</Label>
            <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="As on your ID" disabled={status === "pending"} />
          </div>
          <div className="space-y-2">
            <Label>Social Proof URL *</Label>
            <Input value={socialProof} onChange={(e) => setSocialProof(e.target.value)} placeholder="Official Instagram / website / Wikipedia link" disabled={status === "pending"} />
            <p className="text-xs text-muted-foreground">Link to an account that proves you own this artist identity. Admin may also request additional proof.</p>
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anything that helps admin verify you" disabled={status === "pending"} />
          </div>
          <Button onClick={submit} disabled={submitting || status === "pending"} className="w-full">
            {status === "pending" ? "Awaiting admin review..." : submitting ? "Submitting..." : "Submit verification request"}
          </Button>
        </CardContent>
      )}
    </Card>
    </>
    );
};
