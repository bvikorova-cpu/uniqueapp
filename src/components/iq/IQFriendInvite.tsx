import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_friend_invites_sent";

export default function IQFriendInvite() {
  const [email, setEmail] = useState("");
  const [count, setCount] = useState<number>(() => Number(localStorage.getItem(KEY) || 0));

  const send = () => {
    if (!email.includes("@")) return toast.error("Invalid email");
    const n = count + 1;
    setCount(n);
    localStorage.setItem(KEY, String(n));
    toast.success(`Invite sent to ${email}`);
    setEmail("");
  };

  return (
    <>
      <FloatingHowItWorks title="How IQFriend Invite works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="h-4 w-4 text-primary" /> Friend Invite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="friend@email.com" />
          <Button onClick={send} size="sm">Invite</Button>
        </div>
        <div className="text-xs text-muted-foreground">Total sent: <span className="text-primary font-semibold">{count}</span></div>
      </CardContent>
    </Card>
    </>
    );
}
