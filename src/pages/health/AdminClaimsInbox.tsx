import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";

interface Claim {
  id: string;
  patient_id: string;
  amount_cents: number;
  status: string;
  admin_note: string | null;
  created_at: string;
}

export default function AdminClaimsInbox() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Claim[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase
      .from("insurance_claims")
      .select("id,patient_id,amount_cents,status,admin_note,created_at")
      .order("created_at", { ascending: false });
    setRows((data as unknown as Claim[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin" as never,
      });
      setIsAdmin(!!data);
      if (data) refresh();
      else setLoading(false);
    })();
  }, [user]);

  async function decide(id: string, decision: "approved" | "rejected" | "paid") {
    const { error } = await supabase.functions.invoke("admin-decide-insurance-claim", {
      body: { claim_id: id, decision, admin_note: notes[id] ?? null },
    });
    if (error) return toast({ variant: "destructive", title: "Failed", description: error.message });
    toast({ title: `Claim ${decision}` });
    refresh();
  }

  if (!user) return <p className="p-8">Sign in required.</p>;
  if (!isAdmin && !loading) return <p className="p-8">Admins only.</p>;

  return (
    <>
      <Helmet><title>Insurance claims — Admin</title></Helmet>
      <Navbar />
      <main className="container mx-auto space-y-6 px-4 py-8">
        <h1 className="text-2xl font-semibold">Insurance claims — Admin inbox</h1>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No claims.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((c) => (
              <Card key={c.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    €{(c.amount_cents / 100).toFixed(2)} — patient {c.patient_id.slice(0, 8)}
                  </CardTitle>
                  <Badge>{c.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Admin note (optional)"
                    value={notes[c.id] ?? c.admin_note ?? ""}
                    onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => decide(c.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="secondary" onClick={() => decide(c.id, "paid")}>Mark paid</Button>
                    <Button size="sm" variant="destructive" onClick={() => decide(c.id, "rejected")}>Reject</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
