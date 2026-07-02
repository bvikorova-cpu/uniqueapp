import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_duel_lobby_ready";

export default function IQDuelLobby() {
  const [ready, setReady] = useState(false);
  const [opponents] = useState(() => Math.floor(Math.random() * 8) + 2);

  useEffect(() => { setReady(localStorage.getItem(KEY) === "1"); }, []);

  const toggle = () => {
    const v = !ready;
    setReady(v);
    localStorage.setItem(KEY, v ? "1" : "0");
  };

  return (
    <>
      <FloatingHowItWorks title="How IQDuel Lobby works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" /> Duel Lobby
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">Players online: <span className="text-primary font-semibold">{opponents}</span></div>
        <Button onClick={toggle} variant={ready ? "default" : "outline"} className="w-full">
          {ready ? "Ready ✓" : "Mark Ready"}
        </Button>
      </CardContent>
    </Card>
    </>
    );
}
