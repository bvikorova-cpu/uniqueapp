import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Trash2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type FounderRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  granted_at: string;
};

export default function AdminFounders() {
  const [rows, setRows] = useState<FounderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("list_verified_founders");
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((data ?? []) as FounderRow[]);
  };

  useEffect(() => {
    load();
  }, []);

  const handleGrant = async () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    setSubmitting(true);
    try {
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", email)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!profile) {
        toast.error("No user with that email");
        return;
      }
      const { error } = await supabase.rpc("grant_founder_role", { _user_id: profile.id });
      if (error) throw error;
      toast.success(`Granted founder role to ${email}`);
      setEmailInput("");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to grant role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (userId: string, email: string | null) => {
    if (!confirm(`Revoke founder role from ${email ?? userId}?`)) return;
    const { error } = await supabase.rpc("revoke_founder_role", { _user_id: userId });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Role revoked");
    await load();
  };

  return (
    <AdminGuard>
      <Helmet>
        <title>Verified Founders | Admin</title>
      </Helmet>
      <AdminPageShell>
        <AdminPageHeader
          title="Verified Founders"
          subtitle="Grant or revoke the Verified Founder badge for users."
          icon={Crown}
          badge="Admin"
          breadcrumbs={[{ label: "Verified Founders" }]}
        />

        <AdminGlassCard className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="user@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleGrant} disabled={submitting || !emailInput}>
              <Plus className="h-4 w-4 mr-1" />
              Grant founder
            </Button>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </AdminGlassCard>

        <AdminGlassCard className="p-4 sm:p-6 mt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No verified founders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Granted</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.user_id} className="border-b border-border/30">
                      <td className="py-2 pr-4 font-medium">{r.full_name ?? "—"}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{r.email ?? "—"}</td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        {new Date(r.granted_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRevoke(r.user_id, r.email)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
