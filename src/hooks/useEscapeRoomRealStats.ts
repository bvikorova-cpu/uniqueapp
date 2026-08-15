import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EscapeGlobalStats {
  rooms: number;
  players: number;
  escapes: number;
  puzzles: number;
}

export interface EscapeUserStats {
  completed: number;
  weeklyRooms: number;
  weeklyPuzzles: number;
  streakDays: number;
  bestScore: number;
  bestTime: number | null;
  hintFreeRuns: number;
  under20Runs: number;
  totalXp: number;
  themesCompleted: Record<string, number>;
  roomsToday: number;
  createdRooms: number;
}

const EMPTY_USER: EscapeUserStats = {
  completed: 0,
  weeklyRooms: 0,
  weeklyPuzzles: 0,
  streakDays: 0,
  bestScore: 0,
  bestTime: null,
  hintFreeRuns: 0,
  under20Runs: 0,
  totalXp: 0,
  themesCompleted: {},
  roomsToday: 0,
  createdRooms: 0,
};

/** Real, always-fresh escape room stats (global + current user). */
export function useEscapeRoomRealStats() {
  const [global, setGlobal] = useState<EscapeGlobalStats>({ rooms: 0, players: 0, escapes: 0, puzzles: 0 });
  const [user, setUser] = useState<EscapeUserStats>(EMPTY_USER);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [{ data: auth }, roomsRes, escapesRes, puzzlesRes] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("escape_rooms").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("escape_room_sessions").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("escape_room_puzzles_public").select("id", { count: "exact", head: true }),
    ]);

    const { data: playerRows } = await supabase
      .from("escape_room_sessions")
      .select("user_id")
      .not("user_id", "is", null)
      .limit(5000);
    const uniquePlayers = new Set((playerRows || []).map((r: any) => r.user_id)).size;

    setGlobal({
      rooms: roomsRes.count ?? 0,
      players: uniquePlayers,
      escapes: escapesRes.count ?? 0,
      puzzles: puzzlesRes.count ?? 0,
    });

    const uid = auth?.user?.id;
    if (!uid) {
      setUser(EMPTY_USER);
      setLoading(false);
      return;
    }

    const [{ data: sessions }, { data: created }] = await Promise.all([
      supabase
        .from("escape_room_sessions")
        .select("id, room_id, status, score, hints_used, completion_time_seconds, completed_at, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("escape_rooms").select("id", { count: "exact", head: true }).eq("creator_id", uid),
    ]);

    const done = (sessions || []).filter((s: any) => s.status === "completed");
    const roomIds = Array.from(new Set(done.map((s: any) => s.room_id).filter(Boolean)));
    let themesCompleted: Record<string, number> = {};
    if (roomIds.length) {
      const { data: roomRows } = await supabase.from("escape_rooms").select("id, theme").in("id", roomIds);
      for (const r of roomRows || []) {
        const t = (r as any).theme || "other";
        themesCompleted[t] = (themesCompleted[t] || 0) + 1;
      }
    }

    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const weekly = done.filter((s: any) => new Date(s.completed_at || s.created_at).getTime() >= weekAgo);

    const dayKeys = new Set(
      done.map((s: any) => new Date(s.completed_at || s.created_at).toISOString().slice(0, 10)),
    );
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const key = new Date(now - i * 86400000).toISOString().slice(0, 10);
      if (dayKeys.has(key)) streak++;
      else if (i > 0) break;
    }

    const todayKey = new Date(now).toISOString().slice(0, 10);
    const roomsToday = done.filter(
      (s: any) => new Date(s.completed_at || s.created_at).toISOString().slice(0, 10) === todayKey,
    ).length;

    const times = done.map((s: any) => s.completion_time_seconds).filter((t: any) => typeof t === "number" && t > 0);

    setUser({
      completed: done.length,
      weeklyRooms: weekly.length,
      weeklyPuzzles: weekly.length * 3,
      streakDays: streak,
      bestScore: done.reduce((m: number, s: any) => Math.max(m, s.score || 0), 0),
      bestTime: times.length ? Math.min(...times) : null,
      hintFreeRuns: done.filter((s: any) => (s.hints_used || 0) === 0).length,
      under20Runs: times.filter((t: number) => t < 1200).length,
      totalXp: done.reduce((sum: number, s: any) => sum + (s.score || 0), 0),
      themesCompleted,
      roomsToday,
      createdRooms: (created as any)?.length ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("escape-room-live-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "escape_room_sessions" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "escape_room_leaderboard" }, () => load())
      .subscribe();
    const interval = setInterval(load, 60000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [load]);

  return { global, user, loading, refresh: load };
}
