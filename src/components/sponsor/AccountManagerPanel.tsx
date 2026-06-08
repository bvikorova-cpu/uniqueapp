import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LifeBuoy, Mail, MessageSquare, Clock, Zap, CheckCircle2, Send, AlertTriangle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Props { sponsorId: string; }

const PRIORITY_EMAIL = "priority@uniqueapp.fun";

interface Ticket {
  id: string;
  ticket_number: string | null;
  subject: string;
  status: string;
  created_at: string;
  sla_response_due_at: string | null;
  first_response_at: string | null;
  sla_breached_at: string | null;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_role: string;
  content: string;
  created_at: string;
}

export function PrioritySupportPanel({ sponsorId: _sponsorId }: Props) {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [active, setActive] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);
      setUserEmail(user.email ?? "");
      setUserName(user.user_metadata?.full_name ?? user.email ?? "Sponsor");
      const { data } = await supabase
        .from("support_tickets")
        .select("id, ticket_number, subject, status, created_at, sla_response_due_at, first_response_at, sla_breached_at")
        .eq("user_id", user.id)
        .eq("category", "priority_support")
        .order("created_at", { ascending: false })
        .limit(50);
      setTickets((data ?? []) as Ticket[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!active) { setMessages([]); return; }
    (async () => {
      const { data } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", active.id)
        .order("created_at", { ascending: true });
      setMessages((data ?? []) as TicketMessage[]);
    })();
    const ch = supabase
      .channel(`ticket-msgs:${active.id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "support_ticket_messages", filter: `ticket_id=eq.${active.id}` },
        (p) => setMessages((m) => [...m, p.new as TicketMessage])
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active?.id]);

  const createTicket = async () => {
    if (!userId || !newSubject.trim() || !newMessage.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: userId,
        name: userName,
        email: userEmail,
        subject: newSubject.trim(),
        message: newMessage.trim(),
        category: "priority_support",
        priority: "urgent",
        status: "open",
      })
      .select("id, ticket_number, subject, status, created_at, sla_response_due_at, first_response_at, sla_breached_at")
      .single();
    setCreating(false);
    if (error || !data) {
      toast({ title: "Couldn't open ticket", description: error?.message, variant: "destructive" });
      return;
    }
    await supabase.from("support_ticket_messages").insert({
      ticket_id: data.id,
      sender_id: userId,
      sender_role: "sponsor",
      content: newMessage.trim(),
    });
    setTickets((t) => [data as Ticket, ...t]);
    setActive(data as Ticket);
    setNewSubject("");
    setNewMessage("");
    toast({ title: "Priority ticket opened", description: "We'll respond within 4 business hours." });
  };

  const sendReply = async () => {
    if (!active || !userId || !reply.trim()) return;
    const content = reply.trim();
    setReply("");
    const { error } = await supabase.from("support_ticket_messages").insert({
      ticket_id: active.id,
      sender_id: userId,
      sender_role: "sponsor",
      content,
    });
    if (error) toast({ title: "Send failed", description: error.message, variant: "destructive" });
  };

  const slaBadge = (t: Ticket) => {
    if (t.first_response_at) return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Replied</Badge>;
    if (t.sla_breached_at) return <Badge className="bg-red-500/20 text-red-300 border-red-500/30"><AlertTriangle className="h-3 w-3 mr-1" />SLA breached</Badge>;
    if (t.sla_response_due_at) return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30"><Clock className="h-3 w-3 mr-1" />Due {formatDistanceToNow(new Date(t.sla_response_due_at), { addSuffix: true })}</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-purple-400" />
            Priority Support
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-0 ml-2">Enterprise</Badge>
          </CardTitle>
          <CardDescription>
            Skip the queue. Guaranteed first response within 4 business hours, Mon–Fri 9:00–18:00 CET.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-white">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-purple-500/20">
              <Clock className="h-5 w-5 text-purple-400 mt-0.5" />
              <div><div className="font-semibold text-sm">4h response SLA</div><div className="text-xs text-gray-400">Auto-escalated if missed</div></div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-purple-500/20">
              <Zap className="h-5 w-5 text-purple-400 mt-0.5" />
              <div><div className="font-semibold text-sm">Priority queue</div><div className="text-xs text-gray-400">Handled before standard tickets</div></div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-purple-500/20">
              <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5" />
              <div><div className="font-semibold text-sm">Direct escalation</div><div className="text-xs text-gray-400">Engineering on call</div></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="outline" className="border-purple-500/50 text-white hover:bg-purple-500/10">
              <a href={`mailto:${PRIORITY_EMAIL}?subject=Priority%20Support%20Request`}>
                <Mail className="h-4 w-4 mr-2" /> Email {PRIORITY_EMAIL}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New ticket */}
      <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2"><Plus className="h-4 w-4" />Open a priority ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="bg-white/5 border-purple-500/30 text-white" />
          <Textarea placeholder="Describe your issue…" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={4} className="bg-white/5 border-purple-500/30 text-white" />
          <Button onClick={createTicket} disabled={creating || !newSubject.trim() || !newMessage.trim()} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Send className="h-4 w-4 mr-2" />{creating ? "Opening…" : "Submit"}
          </Button>
        </CardContent>
      </Card>

      {/* Ticket list + chat */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30 md:col-span-1">
          <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" />Your tickets</CardTitle></CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[400px]">
              {loading ? <div className="text-sm text-gray-400 p-3">Loading…</div> :
                tickets.length === 0 ? <div className="text-sm text-gray-400 p-3">No tickets yet.</div> :
                <div className="space-y-1">
                  {tickets.map((t) => (
                    <button key={t.id} onClick={() => setActive(t)}
                      className={`w-full text-left p-3 rounded-lg transition ${active?.id === t.id ? "bg-purple-500/20 border border-purple-500/50" : "hover:bg-white/5 border border-transparent"}`}>
                      <div className="text-sm font-medium text-white truncate">{t.subject}</div>
                      <div className="text-xs text-gray-400 mt-0.5">#{t.ticket_number ?? t.id.slice(0, 8)} · {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</div>
                      <div className="mt-2">{slaBadge(t)}</div>
                    </button>
                  ))}
                </div>
              }
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white text-base">
              {active ? active.subject : "Select a ticket"}
            </CardTitle>
            {active && <CardDescription>{slaBadge(active)}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-3">
            {active ? (
              <>
                <ScrollArea className="h-[320px] pr-3">
                  <div className="space-y-3">
                    {messages.map((m) => {
                      const mine = m.sender_id === userId;
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-purple-600 text-white" : "bg-white/10 text-white"}`}>
                            <div className="text-[10px] uppercase opacity-70 mb-1">{m.sender_role}</div>
                            <div className="whitespace-pre-wrap">{m.content}</div>
                            <div className="text-[10px] opacity-60 mt-1">{formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" rows={2}
                    className="bg-white/5 border-purple-500/30 text-white" />
                  <Button onClick={sendReply} disabled={!reply.trim()} className="bg-gradient-to-r from-purple-600 to-pink-600 self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-400 py-12 text-center">Pick a ticket on the left, or open a new one above.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Legacy export name for backwards compatibility
export { PrioritySupportPanel as AccountManagerPanel };
