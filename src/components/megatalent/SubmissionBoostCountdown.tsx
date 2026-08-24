import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BoostCountdown from "@/components/megatalent/BoostCountdown";

interface Props {
  submissionId: string;
  className?: string;
}

/** Fetches the active boost for a submission and shows its remaining time. */
export default function SubmissionBoostCountdown({ submissionId, className }: Props) {
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("megatalent_boosts")
      .select("expires_at")
      .eq("submission_id", submissionId)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setExpiresAt((data as any)?.expires_at ?? null);
  };

  useEffect(() => {
    load();
  }, [submissionId]);

  if (!expiresAt) return null;

  return (
    <span className={className}>
      <BoostCountdown expiresAt={expiresAt} onExpired={() => setExpiresAt(null)} />
    </span>
  );
}
