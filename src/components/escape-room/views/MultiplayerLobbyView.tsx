import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Copy, Plus, Crown, Clock, Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Lobby {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  room: string;
  status: "waiting" | "starting" | "full";
}

const mockLobbies: Lobby[] = [
  { id: "1", name: "Night Shift Crew", host: "ShadowMaster", players: 3, maxPlayers: 4, room: "Haunted Asylum", status: "waiting" },
  { id: "2", name: "Puzzle Kings", host: "BrainTeaser", players: 4, maxPlayers: 4, room: "Ancient Tomb", status: "full" },
  { id: "3", name: "First Timers", host: "NewbieNinja", players: 1, maxPlayers: 6, room: "Mystery Mansion", status: "waiting" },
  { id: "4", name: "Speed Demons", host: "FlashEscape", players: 2, maxPlayers: 3, room: "Time Vault", status: "starting" },
];

export function MultiplayerLobbyView({ onBack }: { onBack: () => void }) {
  const [lobbyName, setLobbyName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [lobbies] = useState<Lobby[]>(mockLobbies);

  const createLobby = () => {
    if (!lobbyName.trim()) { toast.error("Enter a lobby name"); return; }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    toast.success(`Lobby "${lobbyName}" created! Code: ${code}`);
    navigator.clipboard.writeText(code);
    setLobbyName("");
  };

  const joinLobby = (lobby: Lobby) => {
    if (lobby.status === "full") { toast.error("Lobby is full"); return; }
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
                    <Crown className="w-3 h-3" />{lobby.host} · {lobby.room}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono">{lobby.players}/{lobby.maxPlayers}</span>
                  <Button size="sm" variant="outline" onClick={() => joinLobby(lobby)} disabled={lobby.status === "full"}>
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
    </>
  );
}
