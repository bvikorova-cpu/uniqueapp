import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Download, FileDown, RotateCw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import clubCardPreview from "@/assets/club-card-preview.png.asset.json";
import { useClubMembership } from "@/hooks/useClubMembership";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShippingStatusCard } from "@/components/club/ShippingStatusCard";

export default function ClubCard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { membership, loading, isMember, refresh } = useClubMembership();
  const [flipped, setFlipped] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [exporting, setExporting] = useState<null | "png" | "pdf">(null);
  const frontRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <Skeleton className="h-96 max-w-md mx-auto rounded-3xl" />
      </div>
    );
  }

  if (!isMember || !membership) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <Crown className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-black">No membership yet</h1>
        <Button onClick={() => navigate("/club")}>Join the Unique VIP Club</Button>
      </div>
    );
  }

  const memberNum = String(membership.member_number).padStart(4, "0");

  const handleExport = async (kind: "png" | "pdf") => { if (!frontRef.current) return;
    try {
      setExporting(kind);
      const canvas = await html2canvas(frontRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true });
      const dataUrl = canvas.toDataURL("image/png");
      const filename = `unique-club-card-${memberNum}`;
      if (kind === "png") {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${filename}.png`;
        a.click();
      } else {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: [85.6, 53.98], // ISO/IEC 7810 ID-1 credit card
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, 85.6, 53.98);
        pdf.save(`${filename}.pdf`);
      }
      toast({ title: `Card saved as ${kind.toUpperCase()}`, description: "Enjoy your VIP membership ✨" });
    } catch (err) {
      console.error(err);
      toast({ title: "Export failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-pink-950 to-amber-950 p-6 flex flex-col items-center pt-16">
      <Button variant="ghost" className="text-white self-start mb-4" onClick={() => navigate("/club")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <h1 className="text-3xl font-black text-white mb-2">Your Unique VIP Club Card</h1>
      <p className="text-white/70 mb-8 text-sm">Tap the card to flip</p>

      <div className="perspective-1000 w-full max-w-md" style={{ perspective: 1000 }}>
        <motion.div
          className="relative w-full aspect-[1.586/1] cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* FRONT — the official Unique VIP Club card design */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <img
              src={clubCardPreview.url}
              alt="Unique VIP Club card"
              className="w-full h-full object-cover"
            />
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-3xl p-6 flex flex-col justify-between shadow-2xl bg-gradient-to-br from-slate-900 to-purple-950 border border-white/10"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="h-10 bg-black -mx-6 my-2" />
            <div className="text-white/80 text-xs space-y-1">
              <div>Holder: <strong className="text-white">{email ?? "—"}</strong></div>
              <div>{membership.tier === "physical" ? "Physical NFC" : "Digital"}</div>
              <div>Since: {new Date(membership.started_at).toLocaleDateString()}</div>
              <div>Renews: {membership.current_period_end ? new Date(membership.current_period_end).toLocaleDateString() : "—"}</div>
            </div>
            <div className="text-white/60 text-[10px] leading-tight">
              This card entitles the holder to all Unique VIP Club benefits. Powered by love, supporting good causes. uniqueapp.fun
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-md px-4 sm:px-0">
        <Button variant="secondary" onClick={() => setFlipped((f) => !f)} className="w-full sm:w-auto">
          <RotateCw className="h-4 w-4 mr-2" /> Flip card
        </Button>
        <Button
          onClick={() => handleExport("png")}
          disabled={exporting !== null}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting === "png" ? "Preparing…" : "Download PNG"}
        </Button>
        <Button
          onClick={() => handleExport("pdf")}
          disabled={exporting !== null}
          variant="outline"
          className="w-full sm:w-auto text-white border-white/40 bg-white/10 hover:bg-white/20"
        >
          <FileDown className="h-4 w-4 mr-2" />
          {exporting === "pdf" ? "Preparing…" : "Download PDF"}
        </Button>
      </div>

      {membership.tier === "physical" && (
        <div className="w-full max-w-md mt-6">
          <ShippingStatusCard membership={membership} onUpdated={refresh} />
        </div>
      )}


      {/* Hidden high-res capture surface */}
      <div style={{ position: "fixed", left: "-10000px", top: 0, pointerEvents: "none" }} aria-hidden>
        <div
          ref={frontRef}
          style={{ width: 856, height: 540, borderRadius: 48, overflow: "hidden" }}
        >
          <img
            src={clubCardPreview.url}
            alt=""
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </div>
  );
}

