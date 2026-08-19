import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { TutorialHero } from "@/components/tutorial-platform/TutorialHero";
import { TutorialToolGrid } from "@/components/tutorial-platform/TutorialToolGrid";
import { BrowseCoursesView } from "@/components/tutorial-platform/views/BrowseCoursesView";
import { AIQuizGeneratorView } from "@/components/tutorial-platform/views/AIQuizGeneratorView";
import { AITutorChatView } from "@/components/tutorial-platform/views/AITutorChatView";
import { AICertificateDesignerView } from "@/components/tutorial-platform/views/AICertificateDesignerView";
import { VisualCourseBuilderView } from "@/components/tutorial-platform/views/VisualCourseBuilderView";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const TutorialPlatform = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    const enrollStatus = searchParams.get("enrolled");
    if (enrollStatus === "success") {
      toast({ title: "Enrollment Successful!", description: "Your course is now available in 'My Enrollments'" });
    } else if (enrollStatus === "cancelled") {
      toast({ title: "Enrollment Cancelled", description: "Your payment was cancelled", variant: "destructive" });
    }
  }, [searchParams, toast]);

  const handleToolSelect = (tool: string) => {
    if (tool === "create") {
      setActiveView("course-builder");
    } else {
      setActiveView(tool);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "browse": return <BrowseCoursesView onBack={() => setActiveView("dashboard")} />;
      case "my-courses": return <BrowseCoursesView onBack={() => setActiveView("dashboard")} />;
      case "ai-quiz": return <AIQuizGeneratorView onBack={() => setActiveView("dashboard")} />;
      case "ai-tutor": return <AITutorChatView onBack={() => setActiveView("dashboard")} />;
      case "ai-certificate": return <AICertificateDesignerView onBack={() => setActiveView("dashboard")} />;
      case "course-builder": return <VisualCourseBuilderView onBack={() => setActiveView("dashboard")} />;
      default:
        return (
          <>
            <TutorialHero />
            <HeroRewardedAd sectionKey="page_tutorialplatform" />
            <TutorialToolGrid onToolSelect={handleToolSelect} />
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
    </div>
  );
};

export default TutorialPlatform;
