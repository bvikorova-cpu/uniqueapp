import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Download, ArrowLeft, Palette, Type, Share2, Eye, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const STYLE_GUIDE_COST = 2;

interface BrandStyleGuidePDFProps {
  credits: number;
  onBack: () => void;
}

const BrandStyleGuidePDF = ({ credits, onBack }: BrandStyleGuidePDFProps) => {
  const { toast } = useToast();
  const [brandKits, setBrandKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrandKits();
  }, []);

  const loadBrandKits = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("brand_kits")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setBrandKits(data);
    setLoading(false);
  };

  const downloadPDF = async (kit: any) => {
    // Charge 2 credits per exported style guide
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to export your style guide.", variant: "destructive" });
      return;
    }
    if (credits < STYLE_GUIDE_COST) {
      toast({ title: "Not enough credits", description: `Exporting a style guide costs ${STYLE_GUIDE_COST} credits.`, variant: "destructive" });
      return;
    }
    const { error: creditError } = await supabase.rpc("deduct_ai_credits_atomic", { _user_id: user.id, _amount: STYLE_GUIDE_COST });
    if (creditError) {
      toast({ title: "Not enough credits", description: `Exporting a style guide costs ${STYLE_GUIDE_COST} credits.`, variant: "destructive" });
      return;
    }
    window.dispatchEvent(new Event("ai-credits-updated"));

    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;
    let y = 0;

    const ensureSpace = (needed: number) => {
      if (y + needed > pageH - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const section = (title: string) => {
      ensureSpace(48);
      y += 18;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(29, 78, 216);
      doc.text(title, margin, y);
      y += 8;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageW - margin, y);
      y += 16;
      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
    };

    const para = (text: string) => {
      const lines = doc.splitTextToSize(text || "Not specified", pageW - margin * 2);
      lines.forEach((line: string) => {
        ensureSpace(16);
        doc.text(line, margin, y);
        y += 16;
      });
    };

    // Cover header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 130, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text(String(kit.business_name || "Brand"), margin, 62);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.text("Brand Style Guide", margin, 88);
    doc.setFontSize(10);
    doc.text(new Date(kit.created_at).toLocaleDateString(), margin, 108);
    y = 160;
    doc.setTextColor(17, 24, 39);

    section("1. Brand Overview");
    para(`Business name: ${kit.business_name || "N/A"}`);
    para(`Business type: ${kit.business_type || "N/A"}`);
    if (kit.slogan) para(`Slogan: "${kit.slogan}"`);
    if (kit.tagline) para(`Tagline: "${kit.tagline}"`);
    y += 6;
    para(`Mission: ${kit.mission_statement || "Not specified"}`);

    section("2. Color Palette");
    const colors = Array.isArray(kit.color_palette) ? kit.color_palette : [];
    if (colors.length === 0) {
      para("No colors defined");
    } else {
      colors.forEach((c: any) => {
        ensureSpace(30);
        const hex = String(c?.hex || "#000000");
        try {
          doc.setFillColor(hex);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(margin, y - 10, 22, 22, 3, 3, "FD");
        } catch { /* invalid hex — skip swatch */ }
        doc.text(`${c?.name || "Color"} — ${hex}${c?.usage ? ` (${c.usage})` : ""}`, margin + 34, y + 5);
        y += 30;
      });
    }

    section("3. Typography");
    para(kit.visual_identity?.typography);

    section("4. Brand Tone & Voice");
    para(kit.visual_identity?.tone);

    section("5. Imagery Style");
    para(kit.visual_identity?.imagery);

    section("6. Taglines");
    const taglines = Array.isArray(kit.taglines) ? kit.taglines : [];
    if (taglines.length === 0) para("No taglines");
    else taglines.forEach((t: string, i: number) => para(`${i + 1}. "${t}"`));

    section("7. Social Media Strategy");
    const social = Object.entries(kit.social_media_strategy || {});
    if (social.length === 0) para("Not specified");
    else social.forEach(([p, s]) => {
      doc.setFont("helvetica", "bold");
      ensureSpace(16);
      doc.text(String(p).toUpperCase(), margin, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      para(typeof s === "string" ? s : JSON.stringify(s));
      y += 4;
    });

    // Footer on every page
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated by Brand Builder · page ${p}/${pages}`, margin, pageH - 24);
    }

    doc.save(`${kit.business_name?.replace(/\s+/g, "_") || "brand"}_style_guide.pdf`);
    toast({ title: "📄 Downloaded!", description: `Brand style guide exported as PDF. ${STYLE_GUIDE_COST} credits used.` });
  };

  return (
    <>
      <FloatingHowItWorks title={"Brand Style Guide P D F - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Style Guide P D F section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Style Guide P D F.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
          <FileText className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-semibold text-emerald-500">Brand Style Guide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Export Your Brand Guidelines</h2>
        <p className="text-muted-foreground mt-2">Download professional brand style guides from your generated kits</p>
        <Badge variant="secondary" className="mt-2">{STYLE_GUIDE_COST} credits per export</Badge>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : brandKits.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No brand kits yet. Create one first from the hub!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brandKits.map((kit, i) => (
            <motion.div key={kit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-lg transition-shadow hover:border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{kit.business_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{kit.business_type}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{new Date(kit.created_at).toLocaleDateString()}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {kit.color_palette?.slice(0, 5).map((c: any, idx: number) => (
                      <div key={idx} className="h-6 w-6 rounded-full border" style={{ backgroundColor: c.hex }} title={c.name} />
                    ))}
                  </div>
                  {kit.slogan && <p className="text-sm italic text-primary/80">"{kit.slogan}"</p>}
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Palette className="h-3 w-3" /> Colors</span>
                    <span className="flex items-center gap-1"><Type className="h-3 w-3" /> Typography</span>
                    <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> Social</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Visual</span>
                  </div>
                  <Button
                    onClick={() => downloadPDF(kit)}
                    disabled={!hasCredits}
                    className="w-full gap-2"
                    variant="outline"
                    title={hasCredits ? undefined : `You need ${STYLE_GUIDE_COST} credits to export`}
                  >
                    {hasCredits ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {hasCredits ? "Download Style Guide" : `Need ${STYLE_GUIDE_COST} credits`}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};

export default BrandStyleGuidePDF;
