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
import { TrendingView } from "@/components/stock-content/views/TrendingView";
import { EarningsDashboardView } from "@/components/stock-content/views/EarningsDashboardView";
import { MyContentView } from "@/components/stock-content/views/MyContentView";
import { MyPurchasesView } from "@/components/stock-content/views/MyPurchasesView";
import { AIContentGeneratorView } from "@/components/stock-content/views/AIContentGeneratorView";
import { CollectionsView } from "@/components/stock-content/views/CollectionsView";
import { GenericToolView } from "@/components/stock-content/views/GenericToolView";
import { PlagiarismScannerView } from "@/components/stock-content/views/PlagiarismScannerView";
import { ContentSubscriptionsView } from "@/components/stock-content/views/ContentSubscriptionsView";
import { CreatorLeaderboardView } from "@/components/stock-content/views/CreatorLeaderboardView";
import { BackgroundRemoverView } from "@/components/stock-content/views/BackgroundRemoverView";
import { BulkUploadView } from "@/components/stock-content/views/BulkUploadView";
import { ContentAnalyticsView } from "@/components/stock-content/views/ContentAnalyticsView";
import { ContributorPortfoliosView } from "@/components/stock-content/views/ContributorPortfoliosView";
import { SmartSearchView } from "@/components/stock-content/views/SmartSearchView";
import { EditorsPicksView } from "@/components/stock-content/views/EditorsPicksView";
import { AITagSuggesterView } from "@/components/stock-content/views/AITagSuggesterView";
import { LicenseManagerView } from "@/components/stock-content/views/LicenseManagerView";
import { WatermarkToolView } from "@/components/stock-content/views/WatermarkToolView";
import { Tags, Palette, Wand2, Star, Eye, Download } from "lucide-react";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const StockContentLibrary = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState("dashboard");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    const purchaseStatus = searchParams.get("purchase");
    if (purchaseStatus === "success") {
      toast({ title: "Purchase Successful!", description: "Your content is now available in 'My Purchases'" });
    } else if (purchaseStatus === "cancelled") {
      toast({ title: "Purchase Cancelled", description: "Your payment was cancelled", variant: "destructive" });
    }
  }, [searchParams, toast]);

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
      case "trending":
        return <TrendingView onBack={() => setActiveView("dashboard")} />;
      case "earnings":
        return <EarningsDashboardView onBack={() => setActiveView("dashboard")} />;
      case "my-content":
        return <MyContentView onBack={() => setActiveView("dashboard")} onUpload={() => setUploadDialogOpen(true)} />;
      case "purchases":
        return <MyPurchasesView onBack={() => setActiveView("dashboard")} />;
      case "ai-generator":
        return <AIContentGeneratorView onBack={() => setActiveView("dashboard")} />;
      case "collections":
        return <CollectionsView onBack={() => setActiveView("dashboard")} />;
      case "ai-tags":
        return <AITagSuggesterView onBack={() => setActiveView("dashboard")} />;
      case "color-search":
        return <GenericToolView onBack={() => setActiveView("dashboard")} title="Color Search" description="Find content by dominant colors. Upload a color palette or pick colors to discover matching stock assets." icon={Palette} iconColor="text-pink-500" features={["Color picker search", "Palette matching", "Complementary color suggestions", "Brand color filtering", "Hex/RGB input support", "Visual color wheel"]} />;
      case "ai-enhance":
        return <GenericToolView onBack={() => setActiveView("dashboard")} title="AI Image Enhancer" description="Upscale resolution, remove noise, enhance colors, and improve overall image quality using AI." icon={Wand2} iconColor="text-violet-500" credits={4} features={["4x upscaling", "Noise reduction", "Color enhancement", "Sharpening", "HDR effect", "Batch processing"]} />;
      case "featured":
        return <EditorsPicksView onBack={() => setActiveView("dashboard")} />;
      case "preview":
        return <WatermarkToolView onBack={() => setActiveView("dashboard")} />;
      case "download-history":
        return <LicenseManagerView onBack={() => setActiveView("dashboard")} />;
      case "plagiarism-scanner":
        return <PlagiarismScannerView onBack={() => setActiveView("dashboard")} />;
      case "subscriptions":
        return <ContentSubscriptionsView onBack={() => setActiveView("dashboard")} />;
      case "leaderboard":
        return <CreatorLeaderboardView onBack={() => setActiveView("dashboard")} />;
      case "bg-remover":
        return <BackgroundRemoverView onBack={() => setActiveView("dashboard")} />;
      case "bulk-upload":
        return <BulkUploadView onBack={() => setActiveView("dashboard")} />;
      case "content-analytics":
        return <ContentAnalyticsView onBack={() => setActiveView("dashboard")} />;
      case "contributors":
        return <ContributorPortfoliosView onBack={() => setActiveView("dashboard")} />;
      case "smart-search":
        return <SmartSearchView onBack={() => setActiveView("dashboard")} />;
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
