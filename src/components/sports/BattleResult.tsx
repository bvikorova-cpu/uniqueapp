import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Skull, Swords, Star, Zap, Coins, Clock, Download, FileImage, FileText, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import megatalentLogo from "@/assets/megatalent-logo.png";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface BattleResultProps {
  result: {
    won: boolean;
    home_score: number;
    away_score: number;
    opponent_name: string;
    mvp?: string;
    mvp_stats?: string;
    /** Optional label of the period where MVP shined (e.g. "Q3", "Set 2") */
    mvp_period?: string;
    /** Optional label of the period where the biggest coin reward was earned */
    reward_period?: string;
    highlights?: string[];
    coins_reward: number;
    home_power: number;
    away_power: number;
    /** Period/quarter/set breakdown — generic */
    breakdown?: { label: string; home: number; away: number }[];
  };
  homeName: string;
  /** Watermark / contest name shown in exports (default: "Megatalent") */
  watermark?: string;
  /** Logo image URL used as visual watermark in PNG/PDF exports */
  watermarkLogo?: string;
}

/**
 * Bucket highlight strings into period buckets. If the highlight starts with
 * a period token (e.g. "Q2:", "Set 1 -", "P3 ") it is assigned there; otherwise
 * highlights are distributed evenly across the available periods.
 */
function bucketHighlights(
  highlights: string[],
  periods: { label: string }[]
): { label: string; items: string[] }[] {
  const buckets = periods.map((p) => ({ label: p.label, items: [] as string[] }));
  if (buckets.length === 0) return [];
  const remaining: string[] = [];
  highlights.forEach((h) => {
    const match = buckets.find((b) =>
      new RegExp(`^\\s*${b.label.replace(/\s+/g, "\\s*")}\\b`, "i").test(h)
    );
    if (match) {
      match.items.push(h.replace(new RegExp(`^\\s*${match.label}\\s*[:\\-–]?\\s*`, "i"), ""));
    } else {
      remaining.push(h);
    }
  });
  // Distribute the rest round-robin
  remaining.forEach((h, i) => buckets[i % buckets.length].items.push(h));
  return buckets;
}

export function BattleResult({ result, homeName, watermark = "Megatalent", watermarkLogo = megatalentLogo }: BattleResultProps) {
  const totalPower = Math.max(result.home_power + result.away_power, 1);
  const homePct = Math.round((result.home_power / totalPower) * 100);
  const awayPct = 100 - homePct;
  const margin = Math.abs(result.home_score - result.away_score);
  const dominance =
    margin === 0 ? "DRAW" : margin <= 2 ? "CLOSE FIGHT" : margin <= 6 ? "SOLID WIN" : "DOMINATION";

  const periods = result.breakdown ?? [];
  // Best period for the home side (largest positive home-away delta)
  const bestPeriod =
    periods.length > 0
      ? periods.reduce((best, p) =>
          p.home - p.away > best.home - best.away ? p : best
        )
      : null;
  const mvpPeriod = result.mvp_period ?? bestPeriod?.label;
  const rewardPeriod = result.reward_period ?? bestPeriod?.label;
  const timeline = result.highlights && periods.length > 0
    ? bucketHighlights(result.highlights, periods)
    : null;

  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<null | "png" | "pdf">(null);

  const baseFilename = () => {
    const verdict = result.won ? "victory" : "defeat";
    const slug = `${homeName}-vs-${result.opponent_name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `battle-${verdict}-${slug}`.slice(0, 80);
  };

  const captureCanvas = async (timestamp: string) => {
    if (!cardRef.current) throw new Error("Nothing to export");
    // Wait one paint so the watermark/footer becomes visible in the DOM
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(r, 30));
    const html2canvas = (await import("html2canvas")).default;
    return html2canvas(cardRef.current, {
      backgroundColor: "#0b0b0f",
      scale: 2,
      useCORS: true,
      logging: false,
    });
  };

  const formatTimestamp = () =>
    new Date().toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const exportPNG = async () => {
    setExporting("png");
    try {
      const ts = formatTimestamp();
      const canvas = await captureCanvas(ts);
      const link = document.createElement("a");
      link.download = `${baseFilename()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("PNG exported");
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(null);
    }
  };

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const ts = formatTimestamp();
      const canvas = await captureCanvas(ts);
      const { jsPDF } = await import("jspdf");
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 32;
      const maxW = pageW - margin * 2;
      const ratio = canvas.height / canvas.width;
      const imgW = maxW;
      const imgH = Math.min(maxW * ratio, pageH - margin * 2 - 80);
      pdf.setFillColor(11, 11, 15);
      pdf.rect(0, 0, pageW, pageH, "F");

      // Header
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text(`${homeName} vs ${result.opponent_name}`, margin, margin);
      pdf.setFontSize(10);
      pdf.setTextColor(180, 180, 190);
      pdf.text(
        `${result.won ? "VICTORY" : "DEFEAT"}  •  ${result.home_score}-${result.away_score}  •  +${result.coins_reward} coins${
          rewardPeriod ? ` (decisive in ${rewardPeriod})` : ""
        }${result.mvp ? `  •  MVP: ${result.mvp}${mvpPeriod ? ` (${mvpPeriod})` : ""}` : ""}`,
        margin,
        margin + 14
      );

      pdf.addImage(imgData, "PNG", margin, margin + 28, imgW, imgH);

      // Diagonal logo + text watermark across page
      const anyPdf = pdf as any;
      const setOpacity = (o: number) => {
        if (anyPdf.GState) {
          try { anyPdf.setGState(new anyPdf.GState({ opacity: o })); } catch { /* noop */ }
        }
      };
      if (watermarkLogo) {
        try {
          setOpacity(0.07);
          const logoSize = Math.min(pageW, pageH) * 0.55;
          pdf.addImage(
            watermarkLogo,
            "PNG",
            (pageW - logoSize) / 2,
            (pageH - logoSize) / 2,
            logoSize,
            logoSize,
            undefined,
            "FAST"
          );
          setOpacity(1);
        } catch { /* noop */ }
      }
      setOpacity(0.08);
      pdf.setTextColor(120, 120, 140);
      pdf.setFontSize(48);
      pdf.text(watermark.toUpperCase(), pageW / 2, pageH / 2 + 70, {
        align: "center",
        angle: -20,
      } as any);
      setOpacity(1);

      // Footer with small logo
      if (watermarkLogo) {
        try {
          pdf.addImage(watermarkLogo, "PNG", margin, pageH - margin / 2 - 14, 16, 16, undefined, "FAST");
        } catch { /* noop */ }
      }
      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 160);
      pdf.text(`${watermark} • Generated ${ts}`, margin + (watermarkLogo ? 22 : 0), pageH - margin / 2);
      pdf.text("uniqueapp.fun", pageW - margin, pageH - margin / 2, { align: "right" });

      pdf.save(`${baseFilename()}.pdf`);
      toast.success("PDF exported");
    } catch (e: any) {
      toast.error(e.message || "Export failed");
    } finally {
      setExporting(null);
    }
  };

  return (
    <><FloatingHowItWorks title="BattleResult — How it works" steps={[{title:"Open this section",desc:"Access BattleResult from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-xl border-2 p-5 ${
        result.won
          ? "bg-gradient-to-br from-emerald-500/15 via-background to-amber-500/10 border-emerald-500/40"
          : "bg-gradient-to-br from-red-500/15 via-background to-zinc-900/40 border-red-500/40"
      }`}
    >
      {/* Export button */}
      <div className="absolute top-2 right-2 z-10" data-html2canvas-ignore="true">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" disabled={!!exporting}>
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportPNG} disabled={!!exporting}>
              <FileImage className="h-4 w-4 mr-2" /> Save as PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportPDF} disabled={!!exporting}>
              <FileText className="h-4 w-4 mr-2" /> Save as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Verdict banner */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 mb-2"
        >
          {result.won ? (
            <Trophy className="h-7 w-7 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          ) : (
            <Skull className="h-7 w-7 text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.6)]" />
          )}
          <span
            className={`text-2xl font-black tracking-wider ${
              result.won ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {result.won ? "VICTORY" : "DEFEAT"}
          </span>
        </motion.div>
        <div className="flex justify-center items-center gap-3 text-3xl font-black">
          <span className={result.won ? "text-emerald-200" : "text-foreground"}>{result.home_score}</span>
          <Swords className="h-5 w-5 text-muted-foreground" />
          <span className={!result.won ? "text-red-200" : "text-foreground"}>{result.away_score}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {homeName} <span className="opacity-60">vs</span> {result.opponent_name}
        </p>
        <Badge variant="outline" className="mt-2 text-[10px] tracking-widest">
          {dominance}
        </Badge>
      </div>

      {/* Power bar — battle style */}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] font-semibold mb-1">
          <span className="text-emerald-300 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {result.home_power}
          </span>
          <span className="text-muted-foreground">BATTLE POWER</span>
          <span className="text-red-300 flex items-center gap-1">
            {result.away_power}
            <Zap className="h-3 w-3" />
          </span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden bg-muted/40 border border-border/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${homePct}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${awayPct}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400"
          />
        </div>
      </div>

      {/* Breakdown */}
      {periods.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {periods.map((b, i) => {
            const isBest = bestPeriod && b.label === bestPeriod.label;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className={`text-center p-2 rounded border ${
                  isBest
                    ? "bg-amber-500/15 border-amber-500/50 shadow-[0_0_12px_-2px_rgba(251,191,36,0.4)]"
                    : "bg-muted/30 border-border/40"
                }`}
              >
                <p className="text-[10px] text-muted-foreground">{b.label}</p>
                <p className="text-sm font-bold">
                  {b.home}-{b.away}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MVP */}
      {result.mvp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-3"
        >
          <Star className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-amber-300">MVP: {result.mvp}</p>
              {mvpPeriod && (
                <Badge
                  variant="outline"
                  className="text-[9px] tracking-wider border-amber-500/40 text-amber-300"
                >
                  <Clock className="h-2.5 w-2.5 mr-1" />
                  PEAKED IN {mvpPeriod.toUpperCase()}
                </Badge>
              )}
            </div>
            {result.mvp_stats && <p className="text-muted-foreground mt-0.5">{result.mvp_stats}</p>}
          </div>
        </motion.div>
      )}

      {/* Timeline of highlights per period */}
      {timeline && timeline.some((b) => b.items.length > 0) ? (
        <div className="mb-3">
          <p className="text-[11px] font-semibold text-muted-foreground tracking-wider mb-2">
            HIGHLIGHT TIMELINE
          </p>
          <div className="relative pl-3 space-y-3 border-l-2 border-border/40">
            {timeline.map((bucket, bi) => {
              if (bucket.items.length === 0) return null;
              const period = periods.find((p) => p.label === bucket.label);
              const draw = period ? period.home === period.away : false;
              const homeWon = period ? period.home > period.away : false;
              const winnerBadge = !period
                ? null
                : draw
                  ? { text: "DRAW", cls: "border-muted-foreground/40 text-muted-foreground bg-muted/30" }
                  : homeWon
                    ? { text: `${homeName.toUpperCase()} WON`, cls: "border-emerald-500/50 text-emerald-300 bg-emerald-500/10" }
                    : { text: `${result.opponent_name.toUpperCase()} WON`, cls: "border-red-500/50 text-red-300 bg-red-500/10" };
              return (
                <motion.div
                  key={bi}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + bi * 0.1 }}
                  className="relative"
                >
                  <span
                    className={`absolute -left-[17px] top-1 h-3 w-3 rounded-full border-2 ${
                      draw
                        ? "bg-muted border-muted-foreground/50"
                        : homeWon
                          ? "bg-emerald-500 border-emerald-300"
                          : "bg-red-500 border-red-300"
                    }`}
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[11px] font-bold text-foreground/90">{bucket.label}</p>
                    {period && (
                      <span className="text-[10px] font-normal text-muted-foreground">
                        {period.home}-{period.away}
                      </span>
                    )}
                    {winnerBadge && (
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 h-4 tracking-wider ${winnerBadge.cls}`}
                      >
                        {winnerBadge.text}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {bucket.items.map((h, hi) => (
                      <p key={hi} className="text-xs text-muted-foreground">
                        ⚡ {h}
                      </p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        result.highlights && result.highlights.length > 0 && (
          <div className="space-y-1 mb-3">
            <p className="text-[11px] font-semibold text-muted-foreground tracking-wider">HIGHLIGHTS</p>
            {result.highlights.map((h, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="text-xs text-muted-foreground"
              >
                ⚡ {h}
              </motion.p>
            ))}
          </div>
        )
      )}

      <div className="pt-2 border-t border-border/40">
        <div className="flex items-center justify-center gap-1 text-primary font-bold">
          <Coins className="h-4 w-4" />
          <span>+{result.coins_reward} coins earned</span>
        </div>
        {rewardPeriod && (
          <p className="text-center text-[10px] text-muted-foreground mt-0.5 tracking-wider">
            DECISIVE MOMENT IN {rewardPeriod.toUpperCase()}
          </p>
        )}
      </div>

      {/* Watermark + footer (visible only during export to keep UI clean) */}
      {exporting && (
        <>
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            {watermarkLogo && (
              <img
                src={watermarkLogo}
                alt=""
                crossOrigin="anonymous"
                className="absolute select-none"
                style={{ width: "55%", opacity: 0.07, transform: "rotate(-15deg)" }}
              />
            )}
            <span
              className="font-black tracking-widest text-foreground/[0.06] select-none relative"
              style={{ fontSize: "4rem", transform: "rotate(-25deg)" }}
            >
              {watermark.toUpperCase()}
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground tracking-wider">
            <span className="font-bold flex items-center gap-1.5">
              {watermarkLogo && <img src={watermarkLogo} alt="" crossOrigin="anonymous" className="h-3.5 w-3.5 object-contain" />}
              {watermark}
            </span>
            <span>Generated {formatTimestamp()}</span>
          </div>
        </>
      )}
    </motion.div>
  </>
  );
}
