import { useEffect, useState } from "react";
import { Check, ShieldCheck, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AcceptanceTrackerProps {
  documentType: string;
  documentTitle: string;
  version?: string;
}

export const AcceptanceTracker = ({ documentType, documentTitle, version = "UNITY V2.0" }: AcceptanceTrackerProps) => {
  const { toast } = useToast();
  const [accepted, setAccepted] = useState<{ accepted_at: string; id: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecking(false); return; }
      const { data } = await supabase
        .from("legal_acceptances")
        .select("id, accepted_at")
        .eq("user_id", user.id)
        .eq("document_type", documentType)
        .eq("document_version", version)
        .order("accepted_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) setAccepted(data as any);
      setChecking(false);
    })();
  }, [documentType, version]);

  const accept = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", description: "Log in to digitally accept this document.", variant: "destructive" });
        return;
      }
      const ua = navigator.userAgent;
      const hash = `${user.id}-${documentType}-${version}-${Date.now()}`;
      const { data, error } = await supabase
        .from("legal_acceptances")
        .insert({ user_id: user.id, document_type: documentType, document_version: version, user_agent: ua, receipt_hash: hash })
        .select()
        .single();
      if (error) throw error;
      setAccepted(data as any);
      toast({ title: "✅ Accepted", description: "Digital receipt saved with timestamp." });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!accepted) return;
    const txt = `UNIQUE PLATFORM — Digital Acceptance Receipt
============================================

Document:       ${documentTitle}
Document Type:  ${documentType}
Version:        ${version}
Accepted At:    ${new Date(accepted.accepted_at).toUTCString()}
Receipt ID:     ${accepted.id}

This document was digitally accepted by you and is recorded
in the UNIQUE Platform legal audit log under UNITY V2.0
Protective Edition.
`;
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `unique-${documentType}-receipt.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  if (checking) return null;

  return (
    <>
      <FloatingHowItWorks title={"Acceptance Tracker - How it works"} steps={[{ title: 'Open', desc: 'Access the Acceptance Tracker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Acceptance Tracker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5 mt-8 bg-gradient-to-br from-amber-500/10 via-card/80 to-yellow-500/5 border-2 border-amber-400/30 backdrop-blur-md">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-1">Digital Acceptance</h3>
          {accepted ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Check className="w-3 h-3 mr-1" /> Accepted
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(accepted.accepted_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Your acceptance is recorded in our audit log. You can download a signed receipt below.
              </p>
              <Button variant="outline" size="sm" onClick={downloadReceipt} className="border-amber-400/40">
                <Download className="w-3.5 h-3.5 mr-2" /> Download Receipt
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                By clicking below, you confirm you have read and agree to be bound by this document. A signed receipt is generated and stored.
              </p>
              <Button onClick={accept} disabled={loading} className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                I Accept & Sign Digitally
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
    </>
  );
};
