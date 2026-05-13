import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Users, 
  MessageCircle, 
  Gamepad2, 
  Crown, 
  Plus,
  Lock,
  Globe,
  Play,
  Settings
} from "lucide-react";

interface Player {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  isReady: boolean;
  isHost: boolean;
}

interface Lobby {
  id: string;
  name: string;
  game: string;
  players: number;
  maxPlayers: number;
  isPrivate: boolean;
  host: string;
}

const defaultLobbies: Lobby[] = [
  { id: "1", name: "Turnaj #1", game: "Brain Duel", players: 6, maxPlayers: 8, isPrivate: false, host: "Peter" },
  { id: "2", name: "Friends", game: "Trivia", players: 4, maxPlayers: 4, isPrivate: true, host: "Mária" },
  { id: "3", name: "New Players", game: "Brain Duel", players: 2, maxPlayers: 8, isPrivate: false, host: "Ján" },
];

const defaultPlayers: Player[] = [
  { id: "1", name: "Peter K.", level: 42, isReady: true, isHost: true },
  { id: "2", name: "Mária S.", level: 38, isReady: true, isHost: false },
  { id: "3", name: "Ján H.", level: 25, isReady: false, isHost: false },
  { id: "4", name: "Vy", level: 15, isReady: false, isHost: false },
];

export const MultiplayerLobby = () => {
  const [view, setView] = useState<"browse" | "lobby">("browse");
  const [isReady, setIsReady] = useState(false);
  const [players, setPlayers] = useState(defaultPlayers);
  const [chatMessages, setChatMessages] = useState<{ user: string; message: string }[]>([
    { user: "Peter K.", message: "Hi everyone!" },
    { user: "Mária S.", message: "I'm ready 👍" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleReady = () => {
    setIsReady(!isReady);
    setPlayers(players.map(p => 
      p.name === "Vy" ? { ...p, isReady: !isReady } : p
    ));
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages([...chatMessages, { user: "Vy", message: newMessage }]);
    setNewMessage("");
  };

  if (view === "lobby") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setView("browse")}>
            ← Back
          </Button>
          <Badge variant="outline">Brain Duel</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Turnaj #1
              </span>
              <Badge>{players.length}/8 players</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Players Grid */}
            <div className="grid grid-cols-2 gap-3">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border ${
                    player.isReady ? "border-green-500 bg-green-500/10" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium truncate">{player.name}</p>
                        {player.isHost && <Crown className="h-3 w-3 text-yellow-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground">Lv. {player.level}</p>
                    </div>
                    <Badge variant={player.isReady ? "default" : "secondary"} className="text-xs">
                      {player.isReady ? "Ready" : "Waiting"}
                    </Badge>
                  </div>
                </motion.div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: 8 - players.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="p-3 rounded-lg border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Empty slot
                </div>
              ))}
            </div>

            {/* Chat */}
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="h-32 overflow-y-auto space-y-2 mb-3">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{msg.user}:</span>{" "}
                      <span className="text-muted-foreground">{msg.message}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Write a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button size="icon" onClick={sendMessage}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant={isReady ? "default" : "outline"}
                className="flex-1"
                onClick={handleReady}
              >
                {isReady ? "✓ Ready" : "Get ready"}
              </Button>
              <Button variant="outline" size="icon" onClick={() => toast.info("This action — coming soon")}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            {players.every(p => p.isReady) && (
              <Button className="w-full" size="lg" onClick={() => toast.info("Start game — coming soon")}>
                <Play className="h-4 w-4 mr-2" />
                Start game
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Multiplayer Lobby
        </h2>
        <Button onClick={() => toast.info("Create Game — coming soon")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Game
        </Button>
      </div>

      <div className="space-y-3">
        {defaultLobbies.map((lobby, index) => (
          <motion.div
            key={lobby.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setView("lobby")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Gamepad2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{lobby.name}</p>
                        {lobby.isPrivate ? (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Globe className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {lobby.game} • Host: {lobby.host}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={lobby.players < lobby.maxPlayers ? "default" : "secondary"}>
                      {lobby.players}/{lobby.maxPlayers}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MultiplayerLobby;
