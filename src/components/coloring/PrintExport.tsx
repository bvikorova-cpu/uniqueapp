import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Printer, FileText, Download, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function PrintExport() {
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [paperSize, setPaperSize] = useState("a4");
  const [isExporting, setIsExporting] = useState(false);

  const { data: myPages } = useQuery({
    queryKey: ["my-coloring-pages-for-print"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("coloring_pages")
        .select("id, processed_image_url, created_at, difficulty")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleExport = async () => {
    if (!selectedPage) return;
    setIsExporting(true);
    try {
      const page = myPages?.find((p) => p.id === selectedPage);
      if (!page?.processed_image_url) throw new Error("Page not found");
      const pageTitle = `Coloring Page - ${page.difficulty}`;

      // Create a print-ready canvas
      const sizes: Record<string, { w: number; h: number }> = {
        a4: { w: 2480, h: 3508 },
        letter: { w: 2550, h: 3300 },
        a3: { w: 3508, h: 4961 },
      };
      const size = sizes[paperSize] || sizes.a4;

      const canvas = document.createElement("canvas");
      canvas.width = size.w;
      canvas.height = size.h;
      const ctx = canvas.getContext("2d")!;

      // White background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, size.w, size.h);

      // Load and center the image with margins
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = page.processed_image_url!;
      });

      const margin = 150; // ~1.5cm margin
      const maxW = size.w - margin * 2;
      const maxH = size.h - margin * 2 - 100; // extra space for title
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const x = (size.w - drawW) / 2;
      const y = margin + 80 + (maxH - drawH) / 2;

      ctx.drawImage(img, x, y, drawW, drawH);

      // Add title
      ctx.fillStyle = "#333333";
      ctx.font = "bold 48px serif";
      ctx.textAlign = "center";
      ctx.fillText(pageTitle, size.w / 2, margin + 50);

      // Add border around image
      ctx.strokeStyle = "#EEEEEE";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 5, y - 5, drawW + 10, drawH + 10);

      // Download as PNG (high quality for print)
      const link = document.createElement("a");
      link.download = `coloring-page-${paperSize}-print.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success(`Exported as ${paperSize.toUpperCase()} print-ready file!`);
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Print Export - How it works"} steps={[{ title: 'Open', desc: 'Access the Print Export section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Print Export.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden relative">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl" />
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center">
              <Printer className="h-5 w-5 text-blue-500" />
            </div>
            Print-Ready Export
          </CardTitle>
          <CardDescription>Export your coloring pages in professional print-ready format</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4">
          {/* Page selection */}
          <div>
            <p className="text-sm font-medium mb-2">Select Coloring Page</p>
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose a page..." /></SelectTrigger>
              <SelectContent>
                {myPages?.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {`${page.difficulty} — ${new Date(page.created_at).toLocaleDateString()}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Paper size */}
          <div>
            <p className="text-sm font-medium mb-2">Paper Size</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "a4", label: "A4", desc: "210 × 297mm" },
                { value: "letter", label: "Letter", desc: "8.5 × 11in" },
                { value: "a3", label: "A3", desc: "297 × 420mm" },
              ].map((size) => (
                <button
                  key={size.value}
                  onClick={() => setPaperSize(size.value)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    paperSize === size.value ? "border-primary bg-primary/5" : "border-border/30 hover:border-primary/30"
                  }`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-sm font-semibold">{size.label}</p>
                  <p className="text-[10px] text-muted-foreground">{size.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="p-3 bg-muted/30 rounded-xl space-y-1.5">
            <p className="text-xs font-medium mb-2">Export includes:</p>
            {[
              "High-resolution 300 DPI output",
              "Proper margins for printing",
              "Centered artwork with title",
              "White background (printer-friendly)",
            ].map((f) => (
              <p key={f} className="text-xs flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" /> {f}
              </p>
            ))}
          </div>

          <Button onClick={handleExport} disabled={!selectedPage || isExporting} className="w-full h-12 rounded-xl">
            {isExporting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparing print file...</>
            ) : (
              <><Download className="mr-2 h-5 w-5" /> Export Print-Ready File</>
            )}
          </Button>

          {/* Preview */}
          {selectedPage && myPages && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Preview</p>
              <div className="bg-white rounded-xl p-4 border border-border/30 max-w-xs mx-auto shadow-lg">
                <img
                  src={myPages.find((p) => p.id === selectedPage)?.processed_image_url || ""}
                  alt="Preview"
                  className="w-full rounded-lg"
                />
                <p className="text-center text-xs text-gray-500 mt-2">Coloring Page</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
}
