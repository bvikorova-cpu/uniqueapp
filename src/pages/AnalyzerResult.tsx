import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Share2, Heart, ShoppingBag, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AIChatFollowup } from "@/components/analyzer/AIChatFollowup";
import { exportAnalysisPDF, shareAnalysisCard } from "@/components/analyzer/exportHelpers";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface AnalysisData {
  id: string;
  image_url: string;
  category: string;
  main_identification: string;
  confidence_score: number;
  detailed_info: {
    mainIdentification: string;
    confidence: number;
    category: string;
    details: {
      description: string;
      specifications: string[];
      careInstructions: string;
      safety: string;
      value: string;
      whereToFind: string;
    };
    tags: string[];
    additionalInfo: string;
    shopping?: { links: string[]; alternatives: string[] };
  };
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

export default function AnalyzerResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadAnalysis(); }, [id]);

  const loadAnalysis = async () => {
    try {
      const { data, error } = await supabase.from('vision_analyses').select('*').eq('id', id).single();
      if (error) throw error;
      setAnalysis(data as unknown as AnalysisData);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to load analysis");
      navigate('/analyzer');
    } finally { setIsLoading(false); }
  };

  const toggleFavorite = async () => {
    if (!analysis) return;
    try {
      const { error } = await supabase.from('vision_analyses').update({ is_favorite: !analysis.is_favorite }).eq('id', analysis.id);
      if (error) throw error;
      setAnalysis({ ...analysis, is_favorite: !analysis.is_favorite });
      toast.success(analysis.is_favorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) { toast.error("Failed to update favorite"); }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <FloatingHowItWorks
        title="Analyzer Result"
        intro="Detailed report from a single analysis."
        steps={[
          { title: "Read the summary", desc: "Key findings at the top." },
          { title: "Explore sections", desc: "Ingredients, warnings, recommendations." },
          { title: "Save to collection", desc: "Keep the report for later." },
          { title: "Share", desc: "Copy link or export as PDF." },
          { title: "Reanalyze", desc: "Rerun with a different mode." }
        ]}
      />
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
    </div>
  );

  if (!analysis) return null;
  const rawInfo: any = analysis.detailed_info || {};

  // The AI often returns one long markdown blob. Derive a short, clean title
  // from it and render the rest as proper markdown instead of raw text.
  const cleanTitle = (raw: string) => {
    const text = (raw || "").replace(/\r/g, "");
    const line = text
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !/^-{2,}$/.test(l)) || "Analysis result";
    const stripped = line
      .replace(/[#*_`>]/g, "")
      .replace(/^\d+\.\s*/, "")
      .replace(/^Here is an? .*?:\s*/i, "")
      .trim();
    return (stripped.length > 70 ? stripped.slice(0, 70).trimEnd() + "…" : stripped) || "Analysis result";
  };
  const info: any = { mainIdentification: cleanTitle(rawInfo.mainIdentification || analysis.main_identification || ""),
    confidence: typeof rawInfo.confidence === "number" ? rawInfo.confidence : (analysis.confidence_score ?? 0),
    category: rawInfo.category || analysis.category,
    details: rawInfo.details || {
      description: rawInfo.result || analysis.main_identification || "",
      specifications: [],
      careInstructions: "",
      safety: "",
      value: "",
      whereToFind: "" },
    tags: rawInfo.tags || [],
    additionalInfo: rawInfo.additionalInfo || "",
    shopping: rawInfo.shopping };
  const confidencePercent = Math.round((info.confidence || 0) * 100);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/analyzer')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analyzer
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="border-cyan-500/20" title="Share" onClick={async () => {
              const r = await shareAnalysisCard(info.mainIdentification || "Analysis", window.location.href);
              if (r === "copied") toast.success("Link copied!");
              else if (r === "shared") toast.success("Shared");
              else if (r === "failed") toast.error("Sharing not available");
            }}><Share2 className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" className="border-cyan-500/20" title="Export PDF" onClick={() => {
              exportAnalysisPDF(
                info.mainIdentification,
                analysis.image_url,
                [
                  { heading: "Description", body: info.details.description || "" },
                  ...(info.details.specifications?.length ? [{ heading: "Specifications", body: info.details.specifications.join("\n") }] : []),
                  ...(info.details.careInstructions ? [{ heading: "Care", body: info.details.careInstructions }] : []),
                  ...(info.details.safety ? [{ heading: "Safety", body: info.details.safety }] : []),
                  ...(info.details.value ? [{ heading: "Value", body: info.details.value }] : []),
                  ...(info.additionalInfo ? [{ heading: "Additional Info", body: info.additionalInfo }] : []),
                ]
              );
            }}><FileDown className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" className="border-cyan-500/20" title="Download image + description" onClick={async () => {
              const base = (info.mainIdentification || "analysis").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-") || "analysis";
              const saveBlob = (blob: Blob, filename: string) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a); a.click(); a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 2000);
              };
              try {
                const blob = await (await fetch(analysis.image_url)).blob();
                saveBlob(blob, `${base}.jpg`);
              } catch { toast.error("Image download failed"); }

              const lines = [
                info.mainIdentification,
                `Category: ${analysis.category}`,
                `Confidence: ${confidencePercent}%`,
                "",
                "DESCRIPTION",
                info.details.description || "",
                ...(info.details.specifications?.length ? ["", "SPECIFICATIONS", info.details.specifications.join("\n")] : []),
                ...(info.details.careInstructions ? ["", "CARE INSTRUCTIONS", info.details.careInstructions] : []),
                ...(info.details.safety ? ["", "SAFETY", info.details.safety] : []),
                ...(info.details.value ? ["", "ESTIMATED VALUE", info.details.value] : []),
                ...(info.details.whereToFind ? ["", "WHERE TO FIND", info.details.whereToFind] : []),
                ...(info.additionalInfo ? ["", "ADDITIONAL INFORMATION", info.additionalInfo] : []),
                ...(analysis.tags?.length ? ["", `Tags: ${analysis.tags.join(", ")}`] : []),
              ].join("\n");
              saveBlob(new Blob([lines], { type: "text/plain;charset=utf-8" }), `${base}.txt`);
              toast.success("Downloaded image + description");
            }}><Download className="w-4 h-4" /></Button>
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="p-6 border-cyan-500/20 bg-card/80 backdrop-blur-sm">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4 border border-cyan-500/10">
                <img src={analysis.image_url} alt={analysis.main_identification} className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">{tag}</Badge>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Card className="p-6 border-cyan-500/20 bg-card/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl sm:text-3xl font-black">{info.mainIdentification}</h1>
                    <Badge className={confidencePercent > 80 ? "bg-cyan-500/20 text-cyan-400" : ""}>
                      {confidencePercent}% confident
                    </Badge>
                  </div>
                  <Badge className="capitalize bg-cyan-500/10 text-cyan-300 border-cyan-500/20">{analysis.category}</Badge>
                </div>
                <Separator className="bg-cyan-500/20" />
                <div>
                  <h2 className="text-lg font-bold mb-2 text-cyan-400">Details</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none break-words
                                  prose-headings:text-foreground prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-1
                                  prose-h1:text-base prose-h2:text-base prose-h3:text-sm
                                  prose-p:text-muted-foreground prose-li:text-muted-foreground
                                  prose-strong:text-foreground prose-hr:border-cyan-500/20">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {String(info.details.description || "")}
                    </ReactMarkdown>
                  </div>
                </div>

                {info.details.specifications?.length > 0 && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-cyan-400">Specifications</h2>
                    <ul className="list-disc list-inside space-y-1">
                      {info.details.specifications.map((spec, i) => <li key={i} className="text-muted-foreground text-sm">{spec}</li>)}
                    </ul>
                  </div>
                </>)}
                {info.details.careInstructions && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-cyan-400">Care Instructions</h2>
                    <p className="text-muted-foreground text-sm">{info.details.careInstructions}</p>
                  </div>
                </>)}
                {info.details.safety && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h2 className="text-lg font-bold mb-2 text-red-400">⚠️ Safety Information</h2>
                    <p className="text-muted-foreground text-sm">{info.details.safety}</p>
                  </div>
                </>)}
                {info.details.value && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-emerald-400">Estimated Value</h2>
                    <p className="text-muted-foreground text-sm">{info.details.value}</p>
                  </div>
                </>)}
                {info.details.whereToFind && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-blue-400">Where to Find</h2>
                    <p className="text-muted-foreground text-sm">{info.details.whereToFind}</p>
                    {info.shopping?.links?.length ? (
                      <Button className="mt-2 bg-gradient-to-r from-cyan-600 to-blue-600" variant="default" onClick={() => { const link = info.shopping?.links?.[0]; const url = typeof link === "string" ? link : (link as any)?.url; if (url) window.open(url, "_blank", "noopener"); }}>
                        <ShoppingBag className="w-4 h-4 mr-2" /> Shop Similar Items
                      </Button>
                    ) : null}
                  </div>
                </>)}
                {info.additionalInfo && info.additionalInfo !== info.details.description && (<>
                  <Separator className="bg-cyan-500/20" />
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-cyan-400">Additional Information</h2>
                    <p className="text-muted-foreground text-sm">{info.additionalInfo}</p>
                  </div>
                </>)}
              </div>
            </Card>

            <AIChatFollowup
              context={`Item: ${info.mainIdentification}\nCategory: ${analysis.category}\nDescription: ${info.details.description}\nAdditional: ${info.additionalInfo || ""}`}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
