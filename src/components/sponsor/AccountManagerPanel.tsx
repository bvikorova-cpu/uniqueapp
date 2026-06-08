import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, Mail, Phone, Calendar } from "lucide-react";

interface Props { sponsorId: string; }

type AM = {
  manager_name: string;
  manager_email: string;
  manager_phone?: string | null;
  calendar_url?: string | null;
  notes?: string | null;
  assigned_at: string;
};

export function AccountManagerPanel({ sponsorId }: Props) {
  const [loading, setLoading] = useState(true);
  const [am, setAm] = useState<AM | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("brand_sponsor_account_managers")
        .select("manager_name, manager_email, manager_phone, calendar_url, notes, assigned_at")
        .eq("sponsor_id", sponsorId)
        .maybeSingle();
      setAm(data as AM | null);
      setLoading(false);
    })();
  }, [sponsorId]);

  if (loading) return <Loader2 className="h-6 w-6 animate-spin text-purple-400" />;

  return (
    <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <UserCheck className="h-5 w-5" /> Dedicated Account Manager
        </CardTitle>
        <CardDescription>
          Your direct contact for strategy, campaigns and platform support.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-white">
        {!am ? (
          <p className="text-gray-400">
            An account manager will be assigned within 2 business days after your Enterprise subscription activates.
            If it has been longer, email <a className="underline" href="mailto:enterprise@uniqueapp.fun">enterprise@uniqueapp.fun</a>.
          </p>
        ) : (
          <>
            <div className="text-lg font-semibold">{am.manager_name}</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" />
              <a className="underline" href={`mailto:${am.manager_email}`}>{am.manager_email}</a>
            </div>
            {am.manager_phone && (
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{am.manager_phone}</div>
            )}
            {am.calendar_url && (
              <Button asChild variant="outline" className="border-purple-500/50">
                <a href={am.calendar_url} target="_blank" rel="noreferrer">
                  <Calendar className="h-4 w-4 mr-2" /> Book a meeting
                </a>
              </Button>
            )}
            {am.notes && <p className="text-sm text-gray-300 whitespace-pre-wrap">{am.notes}</p>}
            <p className="text-xs text-gray-500">Assigned {new Date(am.assigned_at).toLocaleDateString()}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
