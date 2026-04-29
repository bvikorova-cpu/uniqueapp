import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReferralProgram } from "@/hooks/useReferralProgram";
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
  MessageCircle,
  Send,
  Mail,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
                  return (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/40 p-3"
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
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-base font-bold text-emerald-500">
                          +€{Number(r.amount).toFixed(2)}
                        </span>
                        <Badge
                          className={
                            r.paid
                              ? "bg-emerald-500/90 text-white"
                              : "bg-amber-500/20 text-amber-500"
                          }
                        >
                          {r.paid ? "Vyplatené" : "Čaká"}
                        </Badge>
                      </div>
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
    </motion.div>
  );
};

export default InviteFriendPanel;
