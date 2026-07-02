import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { useReferralProgram, type ReferralEarning } from "@/hooks/useReferralProgram";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  Share2,
  Gift,
  Users,
  Euro,
  Loader2,
  CheckCircle2,
  Clock,
  CreditCard,
  MessageCircle,
  Send,
  Mail,
  ExternalLink,
  Calendar,
  Hash,
  ChevronRight,
  Search,
  X,
  Filter,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type ReferralStatus = "pending" | "paid" | "withdrawn";

const STATUS_META: Record<
  ReferralStatus,
  { label: string; badgeClass: string; icon: typeof Clock; description: string }
> = {
  pending: {
    label: "Pending",
    badgeClass: "bg-amber-500/20 text-amber-500 border border-amber-500/30",
    icon: Clock,
    description: "The invited person has registered but has not yet paid for a subscription.",
  },
  paid: {
    label: "Zaplatil",
    badgeClass: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    icon: CreditCard,
    description: "The invited person has paid — the reward is ready for payout.",
  },
  withdrawn: {
    label: "Paid Out",
    badgeClass: "bg-emerald-500/90 text-white",
    icon: CheckCircle2,
    description: "The reward has been paid out to your account.",
  },
};

function getStatus(r: ReferralEarning): ReferralStatus {
  if (r.paid) return "withdrawn";
  if (Number(r.amount) > 0) return "paid";
  return "pending";
}


/**
 * Compact "Invite a friend" panel for the user's profile/dashboard.
 * Shows: unique code, share actions, live stats, status badges,
 * and a scrollable history of rewards (paid + pending).
 *
 * Uses the same hook as /referral, so data stays consistent and
 * the auto-credit (€5 on every paid invoice) flows from stripe-webhook.
 */
export const InviteFriendPanel = () => {
  const { stats, loading, refreshStats } = useReferralProgram();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<ReferralEarning | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "subscription" | "one_off">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ReferralStatus>("all");

  const inviteUrl = useMemo(() => {
    if (!stats?.code) return "";
    return `${window.location.origin}/auth?ref=${stats.code}`;
  }, [stats?.code]);

  const copyCode = async () => {
    if (!stats?.code) return;
    await navigator.clipboard.writeText(stats.code);
    setCopied(true);
    toast({ title: "Copied!", description: `Code ${stats.code} is in the clipboard.` });
    setTimeout(() => setCopied(false), 1800);
  };

  const copyLink = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    toast({ title: "Link copied", description: "Send it to anyone." });
  };

  const nativeShare = async () => {
    if (!inviteUrl) return;
    const text = `Join me on Unique – use my code ${stats?.code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Unique", text, url: inviteUrl });
        return;
      } catch {
        /* user dismissed */
      }
    }
    copyLink();
  };

  const shareWhatsApp = () => {
    if (!inviteUrl) return;
    const text = `🎉 Join Unique and win €10,000! My code: ${stats?.code} – ${inviteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareTelegram = () => {
    if (!inviteUrl) return;
    const text = `🎉 Join Unique! My code: ${stats?.code}`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  const shareEmail = () => {
    if (!inviteUrl) return;
    const subject = encodeURIComponent("I invite you to Unique");
    const body = encodeURIComponent(
      `Hi!

I invite you to Unique – use my code: ${stats?.code}

${inviteUrl}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const totalEarnings = stats?.totalEarnings ?? 0;
  const pendingEarnings = stats?.pendingEarnings ?? 0;
  const paidEarnings = stats?.paidEarnings ?? 0;
  const totalReferrals = stats?.totalReferrals ?? 0;
  const recent = stats?.recentReferrals ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recent.filter((r) => {
      if (q) {
        const name = (r.profiles?.full_name || "").toLowerCase();
        if (!name.includes(q)) return false;
      }
      if (typeFilter !== "all" && r.source_kind !== typeFilter) return false;
      if (statusFilter !== "all" && getStatus(r) !== statusFilter) return false;
      return true;
    });
  }, [recent, search, typeFilter, statusFilter]);

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
      <FloatingHowItWorks
        title={"Invite Friend Panel"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const filtersActive = search.trim() !== "" || typeFilter !== "all" || statusFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Hero card with code + share */}
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/15 via-card/80 to-accent/15 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="h-5 w-5 text-primary" />
              Invite a friend
            </CardTitle>
            <Badge className="bg-primary/90 text-primary-foreground">+€5 / mesiac</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Your unique code
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-lg border border-primary/20 bg-background/60 px-4 py-3">
                <code className="break-all text-xl font-bold tracking-wider text-primary">
                  {stats?.code || "—"}
                </code>
              </div>
              <Button onClick={copyCode} className="gap-2">
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button variant="secondary" size="sm" onClick={nativeShare} className="gap-1.5">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={shareWhatsApp}
              className="gap-1.5 bg-[#25D366]/90 text-white hover:bg-[#25D366]"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={shareTelegram}
              className="gap-1.5 bg-[#0088cc]/90 text-white hover:bg-[#0088cc]"
            >
              <Send className="h-4 w-4" /> Telegram
            </Button>
            <Button variant="secondary" size="sm" onClick={shareEmail} className="gap-1.5">
              <Mail className="h-4 w-4" /> Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-primary/15 bg-card/70 backdrop-blur">
          <CardContent className="p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Invited
            </div>
            <div className="text-2xl font-bold">{totalReferrals}</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-card/70 backdrop-blur">
          <CardContent className="p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Euro className="h-3.5 w-3.5" /> Spolu
            </div>
            <div className="text-2xl font-bold text-emerald-500">€{totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-card/70 backdrop-blur">
          <CardContent className="p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" /> Paid Out
            </div>
            <div className="text-2xl font-bold text-emerald-500">€{paidEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-card/70 backdrop-blur">
          <CardContent className="p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Pending
            </div>
            <div className="text-2xl font-bold text-amber-500">€{pendingEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* History of rewards */}
      <Card className="border-primary/15 bg-card/80 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Reward History</CardTitle>
          <Button variant="ghost" size="sm" onClick={refreshStats}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {recent.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name..."
                    className="pl-9"
                    aria-label="Search invited person"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                  <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by type">
                    <SelectValue placeholder="Typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="one_off">One-time</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by status">
                    <SelectValue placeholder="Stav" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Zaplatil</SelectItem>
                    <SelectItem value="withdrawn">Paid Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  {filtered.length} of {recent.length} {recent.length === 1 ? "record" : "records"}
                </span>
                {filtersActive && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          )}

          {recent.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 py-10 text-center">
              <Gift className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No rewards yet. Share your code and get €5 for every paying friend.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 py-10 text-center">
              <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="mb-3 text-sm text-muted-foreground">
                No records match the filters.
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[320px] pr-3">
              <ul className="space-y-2">
                {filtered.map((r) => {
                  const name = r.profiles?.full_name || "New user";
                  const initial = name.charAt(0).toUpperCase();
                  const status = getStatus(r);
                  const meta = STATUS_META[status];
                  const StatusIcon = meta.icon;
                  return (
                    <li key={r.id}>
                      <HoverCard openDelay={150} closeDelay={80}>
                        <HoverCardTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setSelected(r)}
                            className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/40 p-3 text-left transition hover:border-primary/40 hover:bg-background/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={`Detail pozvania pre ${name}`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground">
                                {initial}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{name}</p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                                  </span>
                                  {r.source_kind === "subscription" && (
                                    <Badge
                                      variant="outline"
                                      className="border-emerald-500/40 px-1.5 py-0 text-[10px] text-emerald-400"
                                    >
                                      Subscription
                                    </Badge>
                                  )}
                                  {r.source_kind === "one_off" && (
                                    <Badge
                                      variant="outline"
                                      className="border-blue-500/40 px-1.5 py-0 text-[10px] text-blue-400"
                                    >
                                      One-time
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-base font-bold text-emerald-500">
                                  +€{Number(r.amount).toFixed(2)}
                                </span>
                                <Badge className={`${meta.badgeClass} gap-1`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {meta.label}
                                </Badge>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent
                          side="left"
                          align="start"
                          className="w-72 border-primary/20 bg-card/95 backdrop-blur-xl"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground">
                                {initial}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(r.created_at), "d. M. yyyy HH:mm")}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between rounded-md border border-border/40 bg-background/50 px-3 py-2">
                              <span className="text-xs text-muted-foreground">Odmena</span>
                              <span className="text-base font-bold text-emerald-500">
                                +€{Number(r.amount).toFixed(2)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Stav</span>
                              <Badge className={`${meta.badgeClass} gap-1`}>
                                <StatusIcon className="h-3 w-3" />
                                {meta.label}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Typ</span>
                              <span className="font-medium">
                                {r.source_kind === "subscription"
                                  ? "Subscription"
                                  : r.source_kind === "one_off"
                                  ? "One-time"
                                  : "—"}
                              </span>
                            </div>
                            {r.period_start && r.period_end && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Obdobie</span>
                                <span className="font-medium">
                                  {format(new Date(r.period_start), "d. M.")} –{" "}
                                  {format(new Date(r.period_end), "d. M. yyyy")}
                                </span>
                              </div>
                            )}

                            <p className="border-t border-border/40 pt-2 text-[11px] leading-relaxed text-muted-foreground">
                              {meta.description}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70">
                              Click for full details →
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}

          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full gap-2"
            onClick={() => navigate("/referral")}
          >
            Open full panel <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (() => {
            const status = getStatus(selected);
            const meta = STATUS_META[status];
            const StatusIcon = meta.icon;
            const name = selected.profiles?.full_name || "New user";
            const created = new Date(selected.created_at);
            const periodStart = selected.period_start ? new Date(selected.period_start) : null;
            const periodEnd = selected.period_end ? new Date(selected.period_end) : null;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    Detail pozvania
                  </DialogTitle>
                  <DialogDescription>{meta.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-base font-bold text-primary-foreground">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        Invited {formatDistanceToNow(created, { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Stav odmeny</span>
                      <Badge className={`${meta.badgeClass} gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {meta.label}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-emerald-500">
                      +€{Number(selected.amount).toFixed(2)}
                    </div>
                  </div>

                  <Separator />

                  <dl className="space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <Hash className="h-3.5 w-3.5" /> Typ
                      </dt>
                      <dd className="font-medium">
                        {selected.source_kind === "subscription"
                          ? "Subscription (monthly)"
                          : selected.source_kind === "one_off"
                          ? "One-time payment"
                          : "—"}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> Created
                      </dt>
                      <dd className="font-medium">{format(created, "d. M. yyyy HH:mm")}</dd>
                    </div>
                    {periodStart && periodEnd && (
                      <div className="flex items-start justify-between gap-3">
                        <dt className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" /> Obdobie
                        </dt>
                        <dd className="text-right font-medium">
                          {format(periodStart, "d. M. yyyy")} – {format(periodEnd, "d. M. yyyy")}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <Hash className="h-3.5 w-3.5" /> Record ID
                      </dt>
                      <dd className="max-w-[60%] truncate font-mono text-xs">{selected.id}</dd>
                    </div>
                  </dl>

                  {status === "pending" && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                      The invited person has registered but has not yet paid for the first subscription. After the first payment,
                      we will automatically credit you with €5.
                    </div>
                  )}
                  {status === "paid" && (
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">
                      The reward is yours - you can request it for payout in the full panel.
                    </div>
                  )}
                  {status === "withdrawn" && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                      This reward has already been paid out to your account.
                    </div>
                  )}

                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      setSelected(null);
                      navigate("/referral");
                    }}
                  >
                    Open full panel <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default InviteFriendPanel;
