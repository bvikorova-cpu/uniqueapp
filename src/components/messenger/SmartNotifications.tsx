import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, BellOff, Star, Clock, Users, Zap, Volume2, VolumeX, Shield, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface SmartNotificationsProps {
  onBack: () => void;
  userId: string;
}

interface NotificationRule {
  id: string;
  label: string;
  description: string;
  icon: any;
  enabled: boolean;
  color: string;
}

interface ContactPriority {
  id: string;
  name: string;
  priority: "high" | "normal" | "muted";
}

export const SmartNotifications = ({ onBack, userId }: SmartNotificationsProps) => {
  const [rules, setRules] = useState<NotificationRule[]>([
    { id: "vip", label: "VIP Contacts Only", description: "Only notify for high-priority contacts during focus mode", icon: Star, enabled: false, color: "from-amber-500 to-orange-500" },
    { id: "quiet", label: "Quiet Hours", description: "Mute notifications between 11PM and 7AM", icon: Clock, enabled: true, color: "from-indigo-500 to-purple-500" },
    { id: "group-mute", label: "Smart Group Muting", description: "Auto-mute groups with 10+ unread messages", icon: Users, enabled: false, color: "from-cyan-500 to-blue-500" },
    { id: "urgent", label: "Urgent Detection", description: "AI detects urgent messages and always notifies", icon: Zap, enabled: true, color: "from-red-500 to-rose-500" },
    { id: "digest", label: "Notification Digest", description: "Bundle non-urgent notifications every 30 min", icon: Brain, enabled: false, color: "from-emerald-500 to-teal-500" },
    { id: "dnd", label: "Do Not Disturb", description: "Block all notifications except VIP contacts", icon: Shield, enabled: false, color: "from-gray-500 to-gray-600" },
  ]);
  const [contacts, setContacts] = useState<ContactPriority[]>([]);
  const [quietStart, setQuietStart] = useState("23:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, [userId]);

  const fetchContacts = async () => {
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .eq("user_id", userId);

    if (!parts) return;

    const contactIds = new Set<string>();
    for (const p of parts) {
      const { data: others } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", p.conversation_id)
        .neq("user_id", userId);
      others?.forEach(o => contactIds.add(o.user_id));
    }

    const contactList: ContactPriority[] = [];
    for (const cid of contactIds) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("id", cid)
        .single();
      if (profile) {
        contactList.push({ id: profile.id, name: profile.full_name || "Unknown", priority: "normal" });
      }
    }

    setContacts(contactList.slice(0, 12));
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    const rule = rules.find(r => r.id === ruleId);
    toast({
      title: rule?.enabled ? "Rule Disabled" : "Rule Enabled",
      description: `${rule?.label} has been ${rule?.enabled ? "disabled" : "enabled"}.`,
    });
  };

  const setPriority = (contactId: string, priority: "high" | "normal" | "muted") => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, priority } : c));
    toast({ title: "Priority Updated", description: `Contact priority set to ${priority}.` });
  };

  const priorityColors = {
    high: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    normal: "bg-muted/30 text-foreground border-border/40",
    muted: "bg-muted/10 text-muted-foreground border-border/20 opacity-60",
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Smart Notifications"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Smart Notifications</h2>
          <p className="text-sm text-muted-foreground">AI-powered notification management</p>
        </div>
      </div>

      {/* Rules */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <Bell className="h-5 w-5 text-primary" /> Notification Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rule.color} flex items-center justify-center shrink-0`}>
                <rule.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{rule.label}</p>
                <p className="text-[10px] text-muted-foreground">{rule.description}</p>
              </div>
              <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      {rules.find(r => r.id === "quiet")?.enabled && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-black text-base">
                <Clock className="h-5 w-5 text-primary" /> Quiet Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Start</label>
                  <input
                    type="time"
                    value={quietStart}
                    onChange={(e) => setQuietStart(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <span className="text-muted-foreground mt-4">→</span>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">End</label>
                  <input
                    type="time"
                    value={quietEnd}
                    onChange={(e) => setQuietEnd(e.target.value)}
                    className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Contact Priorities */}
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black">
            <Star className="h-5 w-5 text-primary" /> Contact Priorities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No contacts found. Start chatting first!</p>
          ) : (
            contacts.map((contact, i) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center justify-between p-2.5 rounded-xl border ${priorityColors[contact.priority]} transition-all`}
              >
                <span className="text-sm font-bold truncate">{contact.name}</span>
                <div className="flex gap-1">
                  {(["high", "normal", "muted"] as const).map(p => (
                    <Button
                      key={p}
                      size="sm"
                      variant={contact.priority === p ? "default" : "ghost"}
                      className="h-7 px-2 text-[10px]"
                      onClick={() => setPriority(contact.id, p)}
                    >
                      {p === "high" ? <Star className="h-3 w-3" /> : p === "muted" ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </Button>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
