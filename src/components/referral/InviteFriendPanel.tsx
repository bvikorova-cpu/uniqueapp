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
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type ReferralStatus = "pending" | "paid" | "withdrawn";

const STATUS_META: Record<
  ReferralStatus,
  { label: string; badgeClass: string; icon: typeof Clock; description: string }
> = {
  pending: {
    label: "Čaká",
    badgeClass: "bg-amber-500/20 text-amber-500 border border-amber-500/30",
    icon: Clock,
    description: "Pozvaný sa zaregistroval, ale ešte nezaplatil predplatné.",
  },
  paid: {
    label: "Zaplatil",
    badgeClass: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    icon: CreditCard,
    description: "Pozvaný zaplatil — odmena je pripravená na výplatu.",
  },
  withdrawn: {
    label: "Vyplatené",
    badgeClass: "bg-emerald-500/90 text-white",
    icon: CheckCircle2,
    description: "Odmena bola vyplatená na tvoj účet.",
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

  const inviteUrl = useMemo(() => {
    if (!stats?.code) return "";
    return `${window.location.origin}/auth?ref=${stats.code}`;
  }, [stats?.code]);

  const copyCode = async () => {
    if (!stats?.code) return;
    await navigator.clipboard.writeText(stats.code);
    setCopied(true);
    toast({ title: "Skopírované!", description: `Kód ${stats.code} je v schránke.` });
    setTimeout(() => setCopied(false), 1800);
  };

  const copyLink = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    toast({ title: "Link skopírovaný", description: "Pošli ho komukoľvek." });
  };

  const nativeShare = async () => {
    if (!inviteUrl) return;
    const text = `Pridaj sa ku mne na Unique – použi môj kód ${stats?.code}`;
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
    const text = `🎉 Pridaj sa na Unique a vyhraj €10 000! Môj kód: ${stats?.code} – ${inviteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareTelegram = () => {
    if (!inviteUrl) return;
    const text = `🎉 Pridaj sa na Unique! Môj kód: ${stats?.code}`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  const shareEmail = () => {
    if (!inviteUrl) return;
    const subject = encodeURIComponent("Pozývam ťa na Unique");
    const body = encodeURIComponent(
      `Ahoj!\n\nPozývam ťa na Unique – použi môj kód: ${stats?.code}\n\n${inviteUrl}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-card/80 backdrop-blur-xl">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const totalEarnings = stats?.totalEarnings ?? 0;
  const pendingEarnings = stats?.pendingEarnings ?? 0;
  const paidEarnings = stats?.paidEarnings ?? 0;
  const totalReferrals = stats?.totalReferrals ?? 0;
  const recent = stats?.recentReferrals ?? [];

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
              Pozvi priateľa
            </CardTitle>
            <Badge className="bg-primary/90 text-primary-foreground">+€5 / mesiac</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Tvoj unikátny kód
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-lg border border-primary/20 bg-background/60 px-4 py-3">
                <code className="break-all text-xl font-bold tracking-wider text-primary">
                  {stats?.code || "—"}
                </code>
              </div>
              <Button onClick={copyCode} className="gap-2">
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Skopírované" : "Kopírovať"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button variant="secondary" size="sm" onClick={nativeShare} className="gap-1.5">
              <Share2 className="h-4 w-4" /> Zdieľať
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
              <Users className="h-3.5 w-3.5" /> Pozvaní
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
              <CheckCircle2 className="h-3.5 w-3.5" /> Vyplatené
            </div>
            <div className="text-2xl font-bold text-emerald-500">€{paidEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-card/70 backdrop-blur">
          <CardContent className="p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Čaká
            </div>
            <div className="text-2xl font-bold text-amber-500">€{pendingEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* History of rewards */}
      <Card className="border-primary/15 bg-card/80 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">História odmien</CardTitle>
          <Button variant="ghost" size="sm" onClick={refreshStats}>
            Obnoviť
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {recent.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 py-10 text-center">
              <Gift className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Zatiaľ žiadne odmeny. Zdieľaj svoj kód a získaj €5 za každého platiaceho priateľa.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[320px] pr-3">
              <ul className="space-y-2">
                {recent.map((r) => {
                  const name = r.profiles?.full_name || "Nový používateľ";
                  const initial = name.charAt(0).toUpperCase();
                  const status = getStatus(r);
                  const meta = STATUS_META[status];
                  const StatusIcon = meta.icon;
                  return (
                    <li key={r.id}>
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
                                  Predplatné
                                </Badge>
                              )}
                              {r.source_kind === "one_off" && (
                                <Badge
                                  variant="outline"
                                  className="border-blue-500/40 px-1.5 py-0 text-[10px] text-blue-400"
                                >
                                  Jednorazová
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
            Otvoriť plný panel <ExternalLink className="h-3.5 w-3.5" />
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
            const name = selected.profiles?.full_name || "Nový používateľ";
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
                        Pozvaný {formatDistanceToNow(created, { addSuffix: true })}
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
                          ? "Predplatné (mesačne)"
                          : selected.source_kind === "one_off"
                          ? "Jednorazová platba"
                          : "—"}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> Vytvorené
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
                        <Hash className="h-3.5 w-3.5" /> ID záznamu
                      </dt>
                      <dd className="max-w-[60%] truncate font-mono text-xs">{selected.id}</dd>
                    </div>
                  </dl>

                  {status === "pending" && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                      Pozvaný sa zaregistroval, ale ešte neuhradil prvé predplatné. Po prvej platbe
                      ti automaticky pripíšeme €5.
                    </div>
                  )}
                  {status === "paid" && (
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">
                      Odmena je tvoja — môžeš si ju vyžiadať na výplatu v plnom paneli.
                    </div>
                  )}
                  {status === "withdrawn" && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                      Táto odmena bola už vyplatená na tvoj účet.
                    </div>
                  )}

                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      setSelected(null);
                      navigate("/referral");
                    }}
                  >
                    Otvoriť plný panel <ExternalLink className="h-3.5 w-3.5" />
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
