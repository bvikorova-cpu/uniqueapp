import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { StockContentHero } from "@/components/stock-content/StockContentHero";
import { StockContentEngagement } from "@/components/stock-content/StockContentEngagement";
import { StockContentToolGrid } from "@/components/stock-content/StockContentToolGrid";
import { UploadContentDialog } from "@/components/stock-library/UploadContentDialog";
import { BrowseLibraryView } from "@/components/stock-content/views/BrowseLibraryView";
import { EarningsDashboardView } from "@/components/stock-content/views/EarningsDashboardView";
import { AIContentGeneratorView } from "@/components/stock-content/views/AIContentGeneratorView";


import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const StockContentLibrary = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState("dashboard");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const purchaseStatus = params.get("purchase");
      const sessionId = params.get("session_id");

      if (purchaseStatus === "cancelled") {
        toast({ title: "Purchase Cancelled", description: "Your payment was cancelled", variant: "destructive" });
      }

      if (purchaseStatus === "success" && sessionId) {
        try {
          await supabase.functions.invoke("verify-payment", {
            body: { session_id: sessionId, product_type: "stock_content_purchase" },
          });
          toast({ title: "Purchase Successful!", description: "Your download is ready — watermark free." });
        } catch {
          toast({ title: "Verification pending", description: "We could not confirm the payment yet. Refresh in a moment.", variant: "destructive" });
        }
      }

      if (purchaseStatus) {
        const url = new URL(window.location.href);
        ["session_id", "purchase", "view"].forEach((k) => url.searchParams.delete(k));
        window.history.replaceState({}, "", url.pathname + url.search);
        if (purchaseStatus === "success") setActiveView("browse");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleToolSelect = (tool: string) => {
    if (tool === "upload") {
      setUploadDialogOpen(true);
    } else {
      setActiveView(tool);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "browse":
        return <BrowseLibraryView onBack={() => setActiveView("dashboard")} />;
      case "earnings":
        return <EarningsDashboardView onBack={() => setActiveView("dashboard")} />;
      case "ai-generator":
        return <AIContentGeneratorView onBack={() => setActiveView("dashboard")} />;
      default:
        return (
          <>
            <FloatingHowItWorks
              title="Stock Library"
              intro="Unlimited AI-generated stock photos, videos, audio."
              steps={[
                { title: "Search or browse", desc: "By keyword, mood, color or category." },
          { title: "Preview", desc: "See variations and licensing terms." },
          { title: "Generate on demand", desc: "Missing a shot? AI creates it \u2014 3 credits." },
          { title: "Download", desc: "Royalty-free for commercial use." },
          { title: "Save to collection", desc: "Build reusable brand libraries." }
              ]}
            />
            <StockContentHero />
            <HeroRewardedAd sectionKey="page_stockcontentlibrary" />

            <StockContentEngagement />
            <h2 className="text-xl font-bold mb-4">Tools & Features</h2>
            <StockContentToolGrid onToolSelect={handleToolSelect} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        {renderView()}
      </main>
      <UploadContentDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} onSuccess={() => {}} />
    </div>
  );
};

export default StockContentLibrary;
