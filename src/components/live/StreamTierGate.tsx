import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Props {
  streamId: string;
  minTier: string | null;
  creatorUserId?: string | null;
  currentUserId?: string | null;
  children: React.ReactNode;
}

const tierLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export const StreamTierGate = ({ streamId, minTier, creatorUserId, currentUserId, children }: Props) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "granted" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!minTier) return setStatus("granted");
      if (currentUserId && creatorUserId && currentUserId === creatorUserId) return setStatus("granted");
      if (!currentUserId) return setStatus("denied");
      const { data, error } = await supabase.rpc("has_live_stream_access" as any, {
        _user_id: currentUserId,
        _stream_id: streamId,
      });
      if (cancelled) return;
      setStatus(!error && data === true ? "granted" : "denied");
    })();
    return () => {
      cancelled = true;
    };
  }, [streamId, minTier, creatorUserId, currentUserId]);

  if (status === "checking") {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (status === "denied") {
    return (
      <Card className="max-w-lg mx-auto border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-pink-500/5 to-purple-500/10">
        <CardContent className="text-center py-10 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-pink-600 flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold">Members-only broadcast</h3>
          <p className="text-muted-foreground">
            This live stream is reserved for{" "}
            <span className="font-semibold text-foreground inline-flex items-center gap-1">
              <Crown className="h-4 w-4 text-amber-500" />
              {tierLabel(minTier!)}
            </span>{" "}
            Fan Club members and above.
          </p>
          {creatorUserId && (
            <Button
              className="bg-gradient-to-r from-amber-500 to-pink-600 text-white"
              onClick={() => navigate(`/creator/${creatorUserId}`)}
            >
              Join Fan Club
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
