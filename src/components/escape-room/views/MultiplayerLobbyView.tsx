import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Plus, Crown, Clock, Gamepad2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Lobby {
  id: string;
  name: string;
  host_id: string;
  host_name: string;
  players: number;
  max_players: number;
  room: string;
  status: "waiting" | "starting" | "full" | "closed";
  invite_code: string;
}

export function MultiplayerLobbyView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [lobbyName, setLobbyName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);

  const { data: lobbies = [], isLoading } = useQuery({
    queryKey: ["escape-room-lobbies"],
    queryFn: async (): Promise<Lobby[]> => {
      const { data, error } = await supabase
        .from("escape_room_lobbies")
        .select("id, name, host_id, players, max_players, status, invite_code, escape_rooms(title), profiles!escape_room_lobbies_host_id_fkey(username, full_name)")
        .neq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ id: r.id,
        name: r.name,
        host_id: r.host_id,
        host_name: r.profiles?.username || r.profiles?.full_name || "Host",
        players: r.players,
        max_players: r.max_players,
        room: r.escape_rooms?.title || "Any room",
        status: r.status,
        invite_code: r.invite_code }));
    },
    refetchInterval: 10_000 });

  const createLobby = async () => {
    if (!user) { toast.error("Sign in to create a lobby"); return; }
    if (!lobbyName.trim()) { toast.error("Enter a lobby name"); return; }
    const { data, error } = await supabase
      .from("escape_room_lobbies")
      .insert({ name: lobbyName.trim(), host_id: user.id, max_players: maxPlayers, players: 1 })
      .select("invite_code")
      .single();
    if (error) { toast.error(error.message); return; }
    toast.success(`Lobby "${lobbyName}" created! Code: ${data!.invite_code}`);
    try { await navigator.clipboard.writeText(data!.invite_code); } catch {}
    setLobbyName("");
    qc.invalidateQueries({ queryKey: ["escape-room-lobbies"] });
  };

  const joinLobby = async (lobby: Lobby) => {
    if (lobby.status === "full") { toast.error("Lobby is full"); return; }
    if (!user) { toast.error("Sign in to join"); return; }
    toast.success(`Joined "${lobby.name}"! Waiting for host to start...`);
  };

  return (
    <>
      <FloatingHowItWorks title={"Multiplayer Lobby View - How it works"} steps={[{ title: 'Open', desc: 'Access the Multiplayer Lobby View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Multiplayer Lobby View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Multiplayer Lobby</h2>
            <p className="text-muted-foreground text-sm">Create or join real-time team escape rooms</p>
          </div>
        </div>
      </motion.div>

      {/* Create Lobby */}
      <Card className="mb-6 border-green-500/20">
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Create New Lobby</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Lobby name..." value={lobbyName} onChange={e => setLobbyName(e.target.value)} />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Max players:</span>
            {[2, 3, 4, 6, 8].map(n => (
              <Button key={n} size="sm" variant={maxPlayers === n ? "default" : "outline"} onClick={() => setMaxPlayers(n)}>{n}</Button>
            ))}
          </div>
          <Button onClick={createLobby} className="w-full bg-gradient-to-r from-green-600 to-emerald-700">
            <Gamepad2 className="w-4 h-4 mr-2" />Create & Copy Invite Code
          </Button>
        </CardContent>
      </Card>

      {/* Active Lobbies */}
      <h3 className="text-lg font-bold mb-3">Active Lobbies</h3>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-green-500" /></div>
      ) : lobbies.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          No active lobbies right now — be the first to create one!
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {lobbies.map((lobby, i) => (
            <motion.div key={lobby.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:border-green-500/30 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold">{lobby.name}</h4>
                      <Badge variant={lobby.status === "waiting" ? "secondary" : lobby.status === "starting" ? "default" : "destructive"} className="text-[10px]">
                        {lobby.status === "waiting" && <Clock className="w-2.5 h-2.5 mr-0.5" />}
                        {lobby.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Crown className="w-3 h-3" />{lobby.host_name} · {lobby.room} · <span className="font-mono">{lobby.invite_code}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono">{lobby.players}/{lobby.max_players}</span>
                    <Button size="sm" variant="outline" onClick={() => joinLobby(lobby)} disabled={lobby.status === "full"}>
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
