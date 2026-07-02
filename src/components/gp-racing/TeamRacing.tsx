import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Users, Shield, Trophy, Star, Plus, MessageSquare, Car, Flame, Crown } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const existingTeams = [
  {
    id: "1", name: "Velocity Corp", tag: "VEL", color: "#00e5ff", members: 4, maxMembers: 5,
    totalWins: 12, rating: 1850, captain: "James K.",
    roster: [
      { name: "James K.", role: "Captain", car: "Phantom X1", wins: 5 },
      { name: "Mei L.", role: "Driver", car: "Dragon MK3", wins: 4 },
      { name: "Alex M.", role: "Driver", car: "Bolt V2", wins: 2 },
      { name: "Sofia A.", role: "Reserve", car: "Nova S1", wins: 1 },
    ],
  },
  {
    id: "2", name: "Phoenix Racing", tag: "PHX", color: "#ff6b35", members: 3, maxMembers: 5,
    totalWins: 9, rating: 1720, captain: "Priya S.",
    roster: [
      { name: "Priya S.", role: "Captain", car: "Firebird R7", wins: 4 },
      { name: "Omar H.", role: "Driver", car: "Sandstorm X", wins: 3 },
      { name: "Carlos R.", role: "Driver", car: "Thunder V5", wins: 2 },
    ],
  },
  {
    id: "3", name: "Dragon Motorsport", tag: "DRG", color: "#e040fb", members: 5, maxMembers: 5,
    totalWins: 15, rating: 1920, captain: "Yuki T.",
    roster: [
      { name: "Yuki T.", role: "Captain", car: "Sakura GT", wins: 6 },
      { name: "Liam W.", role: "Driver", car: "Celtic Storm", wins: 4 },
      { name: "Nina P.", role: "Driver", car: "Aurora X3", wins: 3 },
      { name: "Raj K.", role: "Driver", car: "Monsoon MK2", wins: 1 },
      { name: "Eva M.", role: "Reserve", car: "Frost V1", wins: 1 },
    ],
  },
];

export function TeamRacing({ onBack }: { onBack: () => void }) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamTag, setTeamTag] = useState("");
  const [teamColor, setTeamColor] = useState("#00e5ff");

  const team = existingTeams.find(t => t.id === selectedTeam);

  const handleCreateTeam = () => {
    if (!teamName || !teamTag) { toast.error("Please fill in all fields"); return; }
    if (teamTag.length > 4) { toast.error("Tag must be 4 characters max"); return; }
    toast.success(`Team "${teamName}" [${teamTag.toUpperCase()}] created! 🏁`);
    setShowCreateTeam(false);
    setTeamName(""); setTeamTag("");
  };

  return (
    <>
      <FloatingHowItWorks title={"Team Racing - How it works"} steps={[{ title: 'Open', desc: 'Access the Team Racing section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Team Racing.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-cyan-400 hover:bg-cyan-950/30">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-wider">Team Racing</h2>
            <p className="text-[10px] font-mono text-cyan-400/40 uppercase tracking-[0.3em]">Form squads & compete together</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateTeam(true)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/30 font-mono text-xs uppercase tracking-wider">
          <Plus className="h-4 w-4 mr-1.5" /> Create Team
        </Button>
      </div>

      {/* Team Detail */}
      {team ? (
        <div className="space-y-4">
          <Button variant="outline" size="sm" onClick={() => setSelectedTeam(null)} className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/30 font-mono text-xs uppercase">
            ← All Teams
          </Button>

          <Card className="p-6 bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: team.color }} />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center font-mono font-black text-xl text-white" style={{ backgroundColor: team.color + "30", borderColor: team.color + "50", borderWidth: 2 }}>
                {team.tag}
              </div>
              <div>
                <h3 className="text-xl font-mono font-bold text-white">{team.name}</h3>
                <p className="text-xs font-mono text-cyan-400/50">Captain: {team.captain} • Rating: {team.rating}</p>
              </div>
              <div className="ml-auto flex gap-3">
                <div className="text-center">
                  <p className="font-mono font-bold text-lg text-amber-400">{team.totalWins}</p>
                  <p className="text-[10px] font-mono text-cyan-400/40">WINS</p>
                </div>
                <div className="text-center">
                  <p className="font-mono font-bold text-lg text-cyan-300">{team.members}/{team.maxMembers}</p>
                  <p className="text-[10px] font-mono text-cyan-400/40">MEMBERS</p>
                </div>
              </div>
            </div>

            <h4 className="font-mono font-bold text-sm text-cyan-300 uppercase tracking-wider mb-3">Roster</h4>
            <div className="space-y-2">
              {team.roster.map((member, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/50 border border-cyan-500/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    {member.role === "Captain" ? <Crown className="h-4 w-4 text-amber-400" /> : <Car className="h-4 w-4 text-cyan-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-mono font-bold text-sm text-white">{member.name}</p>
                    <p className="text-[10px] font-mono text-cyan-400/40">{member.car}</p>
                  </div>
                  <Badge className="bg-slate-800 text-cyan-300 border-cyan-500/20 font-mono text-[10px]">{member.role}</Badge>
                  <span className="text-xs font-mono text-amber-400">{member.wins}W</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              {team.members < team.maxMembers && (
                <Button onClick={() => toast.success("Join request sent!")}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-400/20 font-mono text-xs uppercase">
                  Request to Join
                </Button>
              )}
              <Button variant="outline" className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/30 font-mono text-xs uppercase" onClick={() => { window.location.href = `/messenger?team=${selectedTeam}`; }}>
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Team Chat
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* Team List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {existingTeams.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedTeam(t.id)}
              className="cursor-pointer">
              <Card className="p-4 bg-slate-900/60 border-cyan-500/20 backdrop-blur-sm hover:border-cyan-400/40 transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-0.5 transition-all group-hover:h-1" style={{ backgroundColor: t.color }} />
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center font-mono font-black text-sm text-white" style={{ backgroundColor: t.color + "25", borderColor: t.color + "40", borderWidth: 1 }}>
                    {t.tag}
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-white">{t.name}</h3>
                    <p className="text-[10px] font-mono text-cyan-400/40">Rating: {t.rating}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <span className="text-xs font-mono text-cyan-400/60"><Users className="h-3 w-3 inline mr-1" />{t.members}/{t.maxMembers}</span>
                    <span className="text-xs font-mono text-amber-400"><Trophy className="h-3 w-3 inline mr-1" />{t.totalWins}W</span>
                  </div>
                  {t.members < t.maxMembers && (
                    <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 font-mono text-[9px]">RECRUITING</Badge>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent className="bg-slate-950/95 border-cyan-500/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-cyan-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" /> Create Racing Team
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">Team Name</Label>
              <Input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Enter team name..."
                className="bg-slate-900/50 border-cyan-500/30 text-white font-mono placeholder:text-cyan-400/30" />
            </div>
            <div>
              <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">Team Tag (max 4 chars)</Label>
              <Input value={teamTag} onChange={e => setTeamTag(e.target.value.slice(0, 4).toUpperCase())} placeholder="e.g. VEL"
                className="bg-slate-900/50 border-cyan-500/30 text-white font-mono placeholder:text-cyan-400/30" maxLength={4} />
            </div>
            <div>
              <Label className="text-cyan-300 font-mono text-xs uppercase tracking-wider">Team Color</Label>
              <Input type="color" value={teamColor} onChange={e => setTeamColor(e.target.value)} className="h-12 bg-slate-900/50 border-cyan-500/30" />
            </div>
            <Button onClick={handleCreateTeam}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-400/20 font-mono uppercase tracking-wider">
              Create Team (200 Coins)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
