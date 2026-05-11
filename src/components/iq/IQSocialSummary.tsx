import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const KEYS = {
  invites: "iq_duel_invites",
  duelWins: "iq_duel_match_wins",
  clan: "iq_clan_name",
  groups: "iq_study_groups",
  friendInv: "iq_friend_invites_sent",
  mentor: "iq_mentor_match",
};

export default function IQSocialSummary() {
  const [stats, setStats] = useState({ invites: 0, duelWins: 0, clan: "—", groups: 0, friendInv: 0, mentor: "—" });

  useEffect(() => {
    try {
      setStats({
        invites: JSON.parse(localStorage.getItem(KEYS.invites) || "[]").length,
        duelWins: Number(localStorage.getItem(KEYS.duelWins) || 0),
        clan: localStorage.getItem(KEYS.clan) || "—",
        groups: JSON.parse(localStorage.getItem(KEYS.groups) || "[]").length,
        friendInv: Number(localStorage.getItem(KEYS.friendInv) || 0),
        mentor: localStorage.getItem(KEYS.mentor) || "—",
      });
    } catch {}
  }, []);

  const items = [
    { label: "Duel invites sent", val: stats.invites },
    { label: "Duel wins", val: stats.duelWins },
    { label: "Clan", val: stats.clan },
    { label: "Study groups", val: stats.groups },
    { label: "Friend invites", val: stats.friendInv },
    { label: "Mentor", val: stats.mentor },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" /> Social Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 text-sm">
        {items.map((i) => (
          <div key={i.label} className="bg-background/40 rounded p-2">
            <div className="text-xs text-muted-foreground">{i.label}</div>
            <div className="text-primary font-semibold truncate">{i.val}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
