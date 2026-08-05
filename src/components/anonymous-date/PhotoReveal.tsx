import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Lock, Unlock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  matchId: string;
  partnerName: string;
}

interface PhotoState {
  partner_has_photo: boolean;
  unlock_at: string;
  unlocked: boolean;
  paid_unlock: boolean;
  reveal_days: number;
  credit_cost: number;
}

const fmtLeft = (target: number) => {
  const ms = target - Date.now();
  if (ms <= 0) return "now";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

/** Timed photo reveal: free after `reveal_days` (7), or earlier for credits. */
export const PhotoReveal = ({ matchId, partnerName }: Props) => {
  const { toast } = useToast();
  const [state, setState] = useState<PhotoState | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  const loadState = useCallback(async () => {
    const { data, error } = await supabase.rpc("anon_date_photo_state", { _match_id: matchId });
    if (error) return;
    setState(data as unknown as PhotoState);
  }, [matchId]);

  const loadPhoto = useCallback(async () => {
    setLoadingPhoto(true);
    setPhotoError(null);
    const { data, error } = await supabase.functions.invoke("anon-date-photo", { body: { matchId } });
    setLoadingPhoto(false);
    if (error) {
      setPhotoError(error.message || "Could not load the photo.");
      return;
    }
    const url = (data as { url?: string | null })?.url ?? null;
    setPhotoUrl(url);
    if (!url) setPhotoError("The photo isn't available yet.");
  }, [matchId]);


  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    if (state?.unlocked && state.partner_has_photo) loadPhoto();
  }, [state?.unlocked, state?.partner_has_photo, loadPhoto]);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const unlockNow = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("anon_date_unlock_photo", { _match_id: matchId });
    setBusy(false);
    if (error) {
      toast({
        title: error.message.includes("insufficient_credits") ? "Not enough credits" : "Unlock failed",
        description: error.message.includes("insufficient_credits")
          ? `Unlocking the photo costs ${state?.credit_cost ?? 5} credits.`
          : error.message,
        variant: "destructive",
      });
      return;
    }
    window.dispatchEvent(new Event("ai-credits-updated"));
    toast({ title: "Photo unlocked", description: `You can now see ${partnerName}'s photo.` });
    await loadState();
  };

  if (!state) return null;

  if (!state.partner_has_photo) {
    return (
      <Card className="p-3 text-center">
        <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <Camera className="h-3.5 w-3.5" /> {partnerName} hasn't added a reveal photo yet.
        </p>
      </Card>
    );
  }

  if (state.unlocked) {
    return (
      <Card className="p-3 space-y-2">
        <p className="text-sm font-bold flex items-center gap-1.5 text-emerald-500">
          <Unlock className="h-4 w-4" /> {partnerName}'s photo
        </p>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${partnerName} reveal photo`}
            loading="lazy"
            className="w-full max-h-72 object-cover rounded-lg border border-anon-date"
          />
        ) : loadingPhoto ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-anon-date" />
          </div>
        ) : (
          <div className="space-y-2 text-center py-4">
            <p className="text-[11px] text-muted-foreground">{photoError ?? "The photo isn't available."}</p>
            <Button size="sm" variant="outline" onClick={loadPhoto}>Try again</Button>
          </div>
        )}

      </Card>
    );
  }

  const left = fmtLeft(new Date(state.unlock_at).getTime() + tick * 0);

  return (
    <Card className="p-3 bg-anon-date-gradient-soft border-anon-date space-y-2">
      <p className="text-sm font-bold flex items-center gap-1.5">
        <Lock className="h-4 w-4 text-anon-date" /> Photo reveal
      </p>
      <p className="text-[11px] text-muted-foreground">
        {partnerName}'s photo unlocks automatically in {left} ({state.reveal_days} days after matching) — or unlock it now.
      </p>
      <Button onClick={unlockNow} disabled={busy} size="sm" className="w-full bg-anon-date-gradient">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Unlock now · {state.credit_cost} credits</>}
      </Button>
    </Card>
  );
};
