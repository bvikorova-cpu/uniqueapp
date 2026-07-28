import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, RefreshCw, Search, Send, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Ticket {
  id: string;
  ticket_number: string | null;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

interface ThreadMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_role: string;
  content: string;
  created_at: string;
}

const STATUSES = ["open", "in_progress", "waiting", "resolved", "closed"];

const statusColor = (s: string) =>
  s === "open"
    ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
    : s === "in_progress"
      ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
      : s === "waiting"
        ? "bg-purple-500/15 text-purple-600 border-purple-500/30"
        : s === "resolved"
          ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
          : "bg-muted text-muted-foreground border-border";

export default function AdminSupportInbox() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("id, ticket_number, user_id, name, email, subject, message, category, priority, status, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) {
      toast.error("Failed to load support messages");
    } else {
      const rows = (data ?? []) as Ticket[];
      setTickets(rows);
      const ids = Array.from(new Set(rows.map((t) => t.user_id).filter(Boolean))) as string[];
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, username")
          .in("id", ids);
        const map: Record<string, string> = {};
        (profs ?? []).forEach((p: any) => {
          map[p.id] = p.full_name || p.username || "";
        });
        setProfileNames(map);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-support-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openTicket = async (t: Ticket) => {
    setSelected(t);
    setReply("");
    const { data } = await supabase
      .from("support_ticket_messages")
      .select("id, ticket_id, sender_id, sender_role, content, created_at")
      .eq("ticket_id", t.id)
      .order("created_at", { ascending: true });
    setThread((data ?? []) as ThreadMessage[]);
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      toast.error("Not authenticated");
      setSending(false);
      return;
    }
    const { error } = await supabase.from("support_ticket_messages").insert({
      ticket_id: selected.id,
      sender_id: uid,
      sender_role: "admin",
      content: reply.trim() });
    if (error) {
      toast.error(error.message);
      setSending(false);
      return;
    }
    await supabase
      .from("support_tickets")
      .update({ status: selected.status === "open" ? "in_progress" : selected.status })
      .eq("id", selected.id);
    toast.success("Reply sent");
    setReply("");
    await openTicket({ ...selected, status: selected.status === "open" ? "in_progress" : selected.status });
    await load();
    setSending(false);
  };

  const changeStatus = async (status: string) => {
    if (!selected) return;
    const patch: { status: string; resolved_at?: string } = { status };
    if (status === "resolved") patch.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("support_tickets").update(patch).eq("id", selected.id);
    if (error) return toast.error(error.message);
    setSelected({ ...selected, status });
    toast.success(`Marked as ${status.replace("_", " ")}`);
    load();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tickets.filter(
      (t) =>
        (statusFilter === "all" || t.status === statusFilter) &&
        (!q ||
          t.name?.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q) ||
          t.subject?.toLowerCase().includes(q) ||
          t.ticket_number?.toLowerCase().includes(q)),
    );
  }, [tickets, search, statusFilter]);

  const senderName = (t: Ticket) =>
    t.name || (t.user_id ? profileNames[t.user_id] : "") || t.email || "Guest";

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Support Inbox"
          subtitle="Messages sent from the Contact page — read, reply and change status."
          icon={Mail}
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, subject or ticket number"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-4">
          <AdminGlassCard className="p-3 max-h-[70vh] overflow-y-auto">
            {loading && <p className="text-sm text-muted-foreground p-4">Loading…</p>}
            {!loading && filtered.length === 0 && (
              <p className="text-sm text-muted-foreground p-4">No messages found.</p>
            )}
            <div className="space-y-2">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => openTicket(t)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selected?.id === t.id ? "bg-primary/10 border-primary/40" : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-semibold text-sm truncate">{senderName(t)}</span>
                    <Badge variant="outline" className={`text-[10px] ${statusColor(t.status)}`}>
                      {t.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm truncate">{t.subject}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {t.email} · {t.ticket_number ?? "—"} ·{" "}
                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                  </p>
                </button>
              ))}
            </div>
          </AdminGlassCard>

          <AdminGlassCard className="p-4">
            {!selected ? (
              <p className="text-sm text-muted-foreground">Select a message to read and reply.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{selected.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    From <span className="font-semibold text-foreground">{senderName(selected)}</span> · {selected.email}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {selected.ticket_number ?? "—"} · {selected.category} · {selected.priority} ·{" "}
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {STATUSES.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selected.status === s ? "default" : "outline"}
                      onClick={() => changeStatus(s)}
                    >
                      {s.replace("_", " ")}
                    </Button>
                  ))}
                </div>

                <div className="p-3 rounded-lg border bg-muted/30 whitespace-pre-wrap text-sm">
                  {selected.message}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {thread.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-lg border text-sm whitespace-pre-wrap ${
                        m.sender_role === "admin" ? "bg-primary/10 border-primary/30 ml-6" : "bg-muted/30 mr-6"
                      }`}
                    >
                      <p className="text-[11px] font-semibold mb-1">
                        {m.sender_role === "admin" ? "Support team" : senderName(selected)} ·{" "}
                        {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                      </p>
                      {m.content}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder={`Reply to ${senderName(selected)}…`}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={sendReply} disabled={sending || !reply.trim()} className="w-full sm:w-auto">
                    {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Send reply
                  </Button>
                </div>
              </div>
            )}
          </AdminGlassCard>
        </div>
      </AdminPageShell>
    </AdminGuard>
  );
}
