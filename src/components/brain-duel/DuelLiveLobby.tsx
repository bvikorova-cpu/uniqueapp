import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Swords, Wifi, WifiOff, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Isolated live lobby for friend-challenge duels.
 * Both players heartbeat into `brain_duel_live_lobby`; when both are ready and
 * online the server flips the row to `live`. After ~60s of waiting we fall back
 * to the classic asynchronous duel so nothing ever blocks.
 */

type LobbyRow = {
  match_id: string;
  player1_id: string;
  player2_id: string | null;
  player1_ready: boolean;
  player2_ready: boolean;
  player1_seen_at: string | null;
  player2_seen_at: string | null;
  status: string;
  live_started_at: string | null;
  created_at: string;
};

const WAIT_SECONDS = 60;

const isOnline = (seenAt: string | null) =>
  !!seenAt && Date.now() - new Date(seenAt).getTime() < 25_000;

interface Props {
  matchId: string;
  onResolved: (mode: "live" | "async") => void;
}

export function DuelLiveLobby({ matchId, onResolved }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [lobby, setLobby] = useState<LobbyRow | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);
  const resolvedRef = useRef(false);

  const resolve = useCallback(
    (mode: "live" | "async") => {
      if (resolvedRef.current) return;
      resolvedRef.current = true;
      onResolved(mode);
    },
    [onResolved]
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Heartbeat (auto-ready: the player already clicked "Play duel").
  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    const beat = async () => {
      const { data, error } = await supabase.rpc("brain_duel_live_heartbeat" as any, {
        p_match_id: matchId,
        p_ready: true,
      });
      if (cancelled || error) return;
      const row = (Array.isArray(data) ? data[0] : data) as LobbyRow | null;
      if (row) setLobby(row);
    };

    beat();
    const id = setInterval(beat, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [matchId]);

  // Realtime updates from the opponent.
  useEffect(() => {
    if (!matchId) return;
    const channel = supabase
      .channel(`duel-lobby-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "brain_duel_live_lobby",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const row = payload.new as LobbyRow | undefined;
          if (row) setLobby(row);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Countdown + fallback.
  useEffect(() => {
    if (!lobby) return;
    const start = new Date(lobby.created_at).getTime();
    const tick = async () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, WAIT_SECONDS - elapsed);
      setSecondsLeft(left);
      if (left === 0 && lobby.status === "waiting" && !resolvedRef.current) {
        await supabase.rpc("brain_duel_live_fallback" as any, { p_match_id: matchId });
        resolve("async");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lobby, matchId, resolve]);

  useEffect(() => {
    if (lobby?.status === "live") resolve("live");
    if (lobby?.status === "async") resolve("async");
  }, [lobby?.status, resolve]);

  if (!lobby || !userId) {
    return (
      <Card className="border-primary/30">
        <CardContent className="p-6 flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Opening duel lobby…</span>
        </CardContent>
      </Card>
    );
  }

  const iAmPlayer1 = userId === lobby.player1_id;
  const opponentReady = iAmPlayer1 ? lobby.player2_ready : lobby.player1_ready;
  const opponentOnline = isOnline(iAmPlayer1 ? lobby.player2_seen_at : lobby.player1_seen_at);

  return (
    <Card className="border-primary/30">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Waiting for your opponent…</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">You</p>
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" /> Ready
            </Badge>
          </div>
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Opponent</p>
            <Badge variant={opponentReady ? "default" : "secondary"} className="gap-1">
              {opponentOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {opponentReady ? "Ready" : opponentOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          The duel starts the moment you are both here. Starting solo in{" "}
          <span className="font-semibold text-foreground">{secondsLeft}s</span>.
        </p>

        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            await supabase.rpc("brain_duel_live_fallback" as any, { p_match_id: matchId });
            resolve("async");
          }}
        >
          Play now without waiting
        </Button>
      </CardContent>
    </Card>
  );
}

export default DuelLiveLobby;
