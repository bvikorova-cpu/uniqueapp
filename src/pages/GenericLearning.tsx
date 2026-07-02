import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLearningContent } from "@/hooks/useLearningContent";
import { CheckCircle, Lock, Award, Clock, BookOpen } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Module {
  id: number;
  title: string;
  lessons: string[];
  duration: string;
}

const CONTENT_DATA: Record<string, {
  title: string;
  instructor: string;
  modules: Module[];
}> = {
  // Language Learning
  "spanish-complete": {
    title: "Complete Spanish Mastery",
    instructor: "María García",
    modules: [
      { id: 1, title: "Spanish Basics", lessons: ["Alphabet & Pronunciation", "Basic Greetings", "Numbers & Counting", "Common Phrases"], duration: "2 weeks" },
      { id: 2, title: "Grammar Foundations", lessons: ["Present Tense", "Articles", "Gender & Number", "Basic Sentences"], duration: "3 weeks" },
      { id: 3, title: "Conversation Skills", lessons: ["Daily Conversations", "Shopping", "Dining Out", "Travel Phrases"], duration: "4 weeks" },
    ]
  },
  "french-business": {
    title: "Business French Professional",
    instructor: "Jean Dupont",
    modules: [
      { id: 1, title: "Business Vocabulary", lessons: ["Office Terms", "Meeting Language", "Email Writing", "Phone Etiquette"], duration: "2 weeks" },
      { id: 2, title: "Professional Communication", lessons: ["Presentations", "Negotiations", "Reports", "Business Letters"], duration: "3 weeks" },
    ]
  },
  "german-intensive": {
    title: "Intensive German Bootcamp",
    instructor: "Hans Schmidt",
    modules: [
      { id: 1, title: "German Fundamentals", lessons: ["Alphabet", "Basic Grammar", "Pronouns", "Common Words"], duration: "1 week" },
      { id: 2, title: "Everyday German", lessons: ["Daily Activities", "Shopping", "Directions", "Food & Dining"], duration: "2 weeks" },
    ]
  },
  "mandarin-basics": {
    title: "Mandarin Chinese Fundamentals",
    instructor: "Li Wei",
    modules: [
      { id: 1, title: "Chinese Basics", lessons: ["Pinyin System", "Tones Practice", "Basic Characters", "Greetings"], duration: "2 weeks" },
      { id: 2, title: "Building Vocabulary", lessons: ["Numbers", "Family", "Colors", "Common Objects"], duration: "3 weeks" },
    ]
  },
  // Fitness & Wellness
  "yoga-mastery": {
    title: "Complete Yoga Mastery",
    instructor: "Priya Sharma",
    modules: [
      { id: 1, title: "Yoga Foundations", lessons: ["Breathing Basics", "Basic Poses", "Alignment", "Safety"], duration: "2 weeks" },
      { id: 2, title: "Intermediate Practice", lessons: ["Flow Sequences", "Balance Poses", "Flexibility", "Strength Building"], duration: "3 weeks" },
    ]
  },
  // Add more content as needed...
};

const GenericLearning = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getProgress, updateProgress, generateCertificate, isPurchased } = useLearningContent();
  const [currentModule, setCurrentModule] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  const content = CONTENT_DATA[contentId || ""] || {
    title: "Course Content",
    instructor: "Expert Instructor",
    modules: [
      { id: 1, title: "Module 1", lessons: ["Lesson 1", "Lesson 2", "Lesson 3"], duration: "2 weeks" },
      { id: 2, title: "Module 2", lessons: ["Lesson 1", "Lesson 2", "Lesson 3"], duration: "2 weeks" },
    ]
  };

  const totalLessons = content.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const progress = (completedLessons.length / totalLessons) * 100;

  useEffect(() => {
    if (!contentId) return;
    
    const savedProgress = getProgress(contentId, "course");
    if (savedProgress) {
      setCurrentModule(savedProgress.current_module || 0);
      setCompletedLessons(savedProgress.completed_modules || []);
    }
  }, [contentId, getProgress]);

  const handleLessonComplete = async (moduleIndex: number, lessonIndex: number) => {
    const lessonId = moduleIndex * 100 + lessonIndex;
    
    if (!completedLessons.includes(lessonId)) {
      const newCompleted = [...completedLessons, lessonId];
      setCompletedLessons(newCompleted);
      
      const newProgress = (newCompleted.length / totalLessons) * 100;
      
      if (contentId) {
        await updateProgress(contentId, "course", newProgress, currentModule, newCompleted);
      }

      toast({
        title: "Lesson Completed! 🎉",
        description: "Keep up the great work!",
      });
    }
  };

  const handleGenerateCertificate = async () => {
    if (!contentId) return;
    
    if (progress < 100) {
      toast({
        title: "Course Not Complete",
        description: "Complete all lessons to generate your certificate.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingCert(true);
    try {
      const cert = await generateCertificate(
        contentId,
        "course",
        content.title,
        content.instructor,
        100
      );

      if (cert) {
        toast({
          title: "Certificate Generated! 🎓",
          description: "Your certificate is ready for download.",
        });
        
        window.open(cert.certificate_url, '_blank');
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCert(false);
    }
  };

  if (!isPurchased(contentId || "", "course")) {
    return (
      <>
        <FloatingHowItWorks title="How Generic Learning works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-black mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You need to purchase this course to access the content.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
      </>
      );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            ← Back
          </Button>
          <h1 className="text-4xl font-black mb-2">{content.title}</h1>
          <p className="text-muted-foreground">Instructor: {content.instructor}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Your Progress</h2>
                <Badge variant={progress === 100 ? "default" : "secondary"}>
                  {Math.round(progress)}% Complete
                </Badge>
              </div>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {completedLessons.length} of {totalLessons} lessons completed
              </p>
            </Card>

            {content.modules.map((module, moduleIndex) => (
              <Card key={module.id} className="p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-xl font-bold">{module.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{module.duration}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Module {module.id}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const lessonId = moduleIndex * 100 + lessonIndex;
                    const isCompleted = completedLessons.includes(lessonId);

                    return (
                      <div
                        key={lessonIndex}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle
                            className={`w-5 h-5 ${
                              isCompleted ? "text-success" : "text-muted-foreground"
                            }`}
                          />
                          <span className={isCompleted ? "line-through text-muted-foreground" : ""}>
                            {lesson}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={isCompleted ? "outline" : "default"}
                          onClick={() => handleLessonComplete(moduleIndex, lessonIndex)}
                          disabled={isCompleted}
                        >
                          {isCompleted ? "Completed" : "Mark Complete"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Course Actions</h3>
              
              <Button
                onClick={handleGenerateCertificate}
                disabled={progress < 100 || isGeneratingCert}
                className="w-full mb-3"
                variant={progress === 100 ? "default" : "secondary"}
              >
                <Award className="w-4 h-4 mr-2" />
                {isGeneratingCert ? "Generating..." : "Generate Certificate"}
              </Button>

              {progress < 100 && (
                <p className="text-xs text-muted-foreground text-center">
                  Complete all lessons to generate your certificate
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericLearning;