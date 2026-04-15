import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { TutorialHero } from "@/components/tutorial-platform/TutorialHero";
import { TutorialEngagement } from "@/components/tutorial-platform/TutorialEngagement";
import { TutorialToolGrid } from "@/components/tutorial-platform/TutorialToolGrid";
import { MyCourseEnrollments } from "@/components/tutorial-platform/MyCourseEnrollments";
import { MyInstructorEarnings } from "@/components/tutorial-platform/MyInstructorEarnings";
import { BrowseCoursesView } from "@/components/tutorial-platform/views/BrowseCoursesView";
import { AIQuizGeneratorView } from "@/components/tutorial-platform/views/AIQuizGeneratorView";
import { AICourseOutlineView } from "@/components/tutorial-platform/views/AICourseOutlineView";
import { AITutorChatView } from "@/components/tutorial-platform/views/AITutorChatView";
import { AICertificateDesignerView } from "@/components/tutorial-platform/views/AICertificateDesignerView";
import { TrendingCoursesView } from "@/components/tutorial-platform/views/TrendingCoursesView";
import { InstructorLeaderboardView } from "@/components/tutorial-platform/views/InstructorLeaderboardView";
import { CourseAnalyticsView } from "@/components/tutorial-platform/views/CourseAnalyticsView";
import { StudentCommunityView } from "@/components/tutorial-platform/views/StudentCommunityView";
import { LiveSessionsView } from "@/components/tutorial-platform/views/LiveSessionsView";
import { ResourceLibraryView } from "@/components/tutorial-platform/views/ResourceLibraryView";
import { MentorshipProgramView } from "@/components/tutorial-platform/views/MentorshipProgramView";
import { PlagiarismCheckerView } from "@/components/tutorial-platform/views/PlagiarismCheckerView";
import { VisualCourseBuilderView } from "@/components/tutorial-platform/views/VisualCourseBuilderView";
import { CourseSchedulerView } from "@/components/tutorial-platform/views/CourseSchedulerView";
import { CertificateGalleryView } from "@/components/tutorial-platform/views/CertificateGalleryView";
import { AICourseTranslatorView } from "@/components/tutorial-platform/views/AICourseTranslatorView";
import { StudentProgressHeatmapView } from "@/components/tutorial-platform/views/StudentProgressHeatmapView";
import { CourseReviewSystemView } from "@/components/tutorial-platform/views/CourseReviewSystemView";
import { GamificationBadgesView } from "@/components/tutorial-platform/views/GamificationBadgesView";
import { AffiliateProgramView } from "@/components/tutorial-platform/views/AffiliateProgramView";
import { AIVideoSummarizerView } from "@/components/tutorial-platform/views/AIVideoSummarizerView";
import { AIHomeworkGraderView } from "@/components/tutorial-platform/views/AIHomeworkGraderView";
import { AIStudyPlanView } from "@/components/tutorial-platform/views/AIStudyPlanView";
import { AIFlashcardMakerView } from "@/components/tutorial-platform/views/AIFlashcardMakerView";
import { AIPresentationBuilderView } from "@/components/tutorial-platform/views/AIPresentationBuilderView";

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
      navigate("/course-creator");
    } else {
      setActiveView(tool);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "browse": return <BrowseCoursesView onBack={() => setActiveView("dashboard")} />;
      case "enrollments": return <div><button onClick={() => setActiveView("dashboard")} className="mb-4 text-sm text-muted-foreground hover:text-foreground">← Back to Dashboard</button><MyCourseEnrollments /></div>;
      case "my-courses": return <BrowseCoursesView onBack={() => setActiveView("dashboard")} />;
      case "earnings": return <div><button onClick={() => setActiveView("dashboard")} className="mb-4 text-sm text-muted-foreground hover:text-foreground">← Back to Dashboard</button><MyInstructorEarnings /></div>;
      case "ai-quiz": return <AIQuizGeneratorView onBack={() => setActiveView("dashboard")} />;
      case "ai-outline": return <AICourseOutlineView onBack={() => setActiveView("dashboard")} />;
      case "ai-tutor": return <AITutorChatView onBack={() => setActiveView("dashboard")} />;
      case "ai-certificate": return <AICertificateDesignerView onBack={() => setActiveView("dashboard")} />;
      case "ai-translator": return <AICourseTranslatorView onBack={() => setActiveView("dashboard")} />;
      case "ai-summarizer": return <AIVideoSummarizerView onBack={() => setActiveView("dashboard")} />;
      case "ai-grader": return <AIHomeworkGraderView onBack={() => setActiveView("dashboard")} />;
      case "ai-study-plan": return <AIStudyPlanView onBack={() => setActiveView("dashboard")} />;
      case "ai-flashcards": return <AIFlashcardMakerView onBack={() => setActiveView("dashboard")} />;
      case "ai-presentation": return <AIPresentationBuilderView onBack={() => setActiveView("dashboard")} />;
      case "reviews": return <CourseReviewSystemView onBack={() => setActiveView("dashboard")} />;
      case "trending": return <TrendingCoursesView onBack={() => setActiveView("dashboard")} />;
      case "leaderboard": return <InstructorLeaderboardView onBack={() => setActiveView("dashboard")} />;
      case "analytics": return <CourseAnalyticsView onBack={() => setActiveView("dashboard")} />;
      case "heatmap": return <StudentProgressHeatmapView onBack={() => setActiveView("dashboard")} />;
      case "badges": return <GamificationBadgesView onBack={() => setActiveView("dashboard")} />;
      case "affiliates": return <AffiliateProgramView onBack={() => setActiveView("dashboard")} />;
      case "community": return <StudentCommunityView onBack={() => setActiveView("dashboard")} />;
      case "live-sessions": return <LiveSessionsView onBack={() => setActiveView("dashboard")} />;
      case "resources": return <ResourceLibraryView onBack={() => setActiveView("dashboard")} />;
      case "mentorship": return <MentorshipProgramView onBack={() => setActiveView("dashboard")} />;
      case "plagiarism": return <PlagiarismCheckerView onBack={() => setActiveView("dashboard")} />;
      case "course-builder": return <VisualCourseBuilderView onBack={() => setActiveView("dashboard")} />;
      case "scheduler": return <CourseSchedulerView onBack={() => setActiveView("dashboard")} />;
      case "certificates": return <CertificateGalleryView onBack={() => setActiveView("dashboard")} />;
      default:
        return (
          <>
            <TutorialHero />
            <TutorialEngagement />
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