import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Crown, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function TeamManagerView({ onBack }: Props) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const members = [
    { name: "You", role: "Captain", avatar: "👤", status: "online" },
    { name: "Alex Johnson", role: "Member", avatar: "🧑", status: "online" },
    { name: "Sarah Chen", role: "Member", avatar: "👩", status: "offline" },
    { name: "Mike Brown", role: "Member", avatar: "🧔", status: "online" },
  ];

  const invite = () => {
    if (!email.includes("@")) {
      toast({ title: "Invalid Email", variant: "destructive" });
      return;
    }
    toast({ title: "Invitation Sent!", description: `Invited ${email} to your team` });
    setEmail("");
  };

  return (
    <>
      <FloatingHowItWorks title={"Team Manager View - How it works"} steps={[{ title: 'Open', desc: 'Access the Team Manager View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Team Manager View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Team Manager</h2>
            <p className="text-muted-foreground">Manage your escape squad</p>
          </div>
        </div>

        <Card className="mb-4 border-green-500/10">
          <CardContent className="pt-4 space-y-3">
            <h3 className="font-semibold text-sm">Invite a teammate</h3>
            <div className="flex gap-2">
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="teammate@email.com" className="h-10" />
              <Button onClick={invite} className="bg-gradient-to-r from-green-500 to-emerald-600"><Mail className="w-4 h-4 mr-1" />Invite</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {members.map((m, i) => (
            <Card key={i}>
              <CardContent className="p-3 flex items-center gap-3">
                <span className="text-2xl">{m.avatar}</span>
                <div className="flex-1">
                  <div className="font-bold text-sm flex items-center gap-2">
                    {m.name}
                    {m.role === "Captain" && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{m.role}</div>
                </div>
                <Badge variant={m.status === "online" ? "default" : "secondary"} className="text-[10px]">
                  {m.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
