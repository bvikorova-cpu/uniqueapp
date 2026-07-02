import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { TopicContent } from "@/components/courses/TopicContent";
import { ProgressTracker } from "@/components/learning/ProgressTracker";
import { CertificateCard } from "@/components/learning/CertificateCard";
import { courseContent } from "@/data/courseContent";
import { ArrowLeft, BookOpen, Award, Clock } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function CourseLearning() {
  const { certificationId } = useParams<{ certificationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isPurchased, 
    getProgress, 
    updateProgress, 
    generateCertificate,
    certificates,
    loading 
  } = useLearningContent();

  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [completedTopics, setCompletedTopics] = useState<number[]>([]);

  const certificationTitle = certificationId?.replace(/-/g, " ") || "";
  const topics = courseContent[certificationTitle] || [];
  const progress = getProgress(certificationId || "", "certification");
  const certificate = certificates.find(
    (cert) => cert.content_id === certificationId && cert.content_type === "certification"
  );

  useEffect(() => {
    if (progress) {
      setCurrentTopicIndex(progress.current_module || 0);
      setCompletedTopics(progress.completed_modules || []);
    }
  }, [progress]);

  const handleCompleteModule = async (moduleIndex: number) => {
    if (!certificationId) return;

    const newCompletedTopics = [...completedTopics, moduleIndex];
    const progressPercentage = Math.round((newCompletedTopics.length / topics.length) * 100);

    setCompletedTopics(newCompletedTopics);
    
    await updateProgress(
      certificationId,
      "certification",
      progressPercentage,
      moduleIndex + 1,
      newCompletedTopics
    );

    toast({
      title: "Module Completed! 🎉",
      description: `You've completed module ${moduleIndex + 1}/${topics.length}`,
    });

    if (progressPercentage === 100 && !certificate) {
      const cert = await generateCertificate(
        certificationId,
        "certification",
        certificationTitle,
        "MegaMix Academy"
      );
      
      if (cert) {
        toast({
          title: "Congratulations! 🏆",
          description: "Your certificate has been generated!",
        });
      }
    }

    if (moduleIndex < topics.length - 1) {
      setCurrentTopicIndex(moduleIndex + 1);
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Course Learning works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course content...</p>
        </div>
      </div>
      </>
      );
  }

  if (!isPurchased(certificationId || "", "certification")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <h2 className="text-2xl font-black mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-6">
            You need to purchase this certification program to access the content.
          </p>
          <Button onClick={() => navigate("/certification-programs")}>
            View Certification Programs
          </Button>
        </Card>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md p-8 text-center">
          <h2 className="text-2xl font-black mb-4">Content Not Available</h2>
          <p className="text-muted-foreground mb-6">
            Course content is being prepared. Please check back soon.
          </p>
          <Button onClick={() => navigate("/certification-programs")}>
            Back to Programs
          </Button>
        </Card>
      </div>
    );
  }

  const overallProgress = Math.round((completedTopics.length / topics.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/certification-programs")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programs
          </Button>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                {certificationTitle}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{topics.length} Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{progress?.time_spent_minutes || 0} mins spent</span>
                </div>
              </div>
            </div>

            {certificate && (
              <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-lg">
                <Award className="h-5 w-5" />
                <span className="font-semibold">Certified</span>
              </div>
            )}
          </div>

          {/* Overall Progress */}
          <Card className="mt-6 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedTopics.length} of {topics.length} modules completed
            </p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <TopicContent
              topic={topics[currentTopicIndex]}
              topicIndex={currentTopicIndex}
              totalTopics={topics.length}
              isCompleted={completedTopics.includes(currentTopicIndex)}
              onComplete={() => handleCompleteModule(currentTopicIndex)}
              timeSpent={progress?.time_spent_minutes || 0}
            />

            {/* Module Navigation */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Course Modules</h3>
              <div className="space-y-2">
                {topics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTopicIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentTopicIndex === index
                        ? "bg-primary text-primary-foreground"
                        : completedTopics.includes(index)
                        ? "bg-success/10 text-success"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {index + 1}. {topic.title}
                      </span>
                      {completedTopics.includes(index) && (
                        <Award className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {progress && (
              <ProgressTracker
                progress={progress}
                totalModules={topics.length}
              />
            )}

            {certificate && (
              <CertificateCard certificate={certificate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

