import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Loader2 } from "lucide-react";
import { CourseTest } from "@/components/courses/CourseTest";
import { Certificate } from "@/components/courses/Certificate";
import { CourseNavigation } from "@/components/courses/CourseNavigation";
import { TopicContent } from "@/components/courses/TopicContent";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Topic {
  title: string;
  content: string;
}

const CourseDetail = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTest, setShowTest] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [userName, setUserName] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const { progress: courseProgress, statistics, isLoading, updateProgress, saveCompletedCourse } = useCourseProgress(courseName || "");

  const currentTopic = courseProgress?.current_topic || 0;
  const completedTopics = courseProgress?.completed_topics || [];

  // Generate course content with AI
  useEffect(() => {
    const generateContent = async () => {
      if (!courseName) return;
      
      // Check if we have cached content in localStorage
      const cacheKey = `course_content_${courseName}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const parsedTopics = JSON.parse(cached);
          setTopics(parsedTopics);
          return;
        } catch (e) {
          console.error('Failed to parse cached content:', e);
        }
      }

      // Generate new content with AI
      setIsGeneratingContent(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-course-content', {
          body: { courseName }
        });

        if (error) throw error;

        if (data?.topics && Array.isArray(data.topics)) {
          setTopics(data.topics);
          // Cache the generated content
          localStorage.setItem(cacheKey, JSON.stringify(data.topics));
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error generating course content:', error);
        toast({
          title: "Chyba pri generovaní obsahu",
          description: "Nepodarilo sa vygenerovať obsah kurzu. Skúste to prosím neskôr.",
          variant: "destructive",
        });
        
        // Fallback to generic content
        setTopics([
          { title: "Téma 1: Úvod", content: "Obsah sa načítava..." },
          { title: "Téma 2: Základy", content: "Obsah sa načítava..." },
          { title: "Téma 3: Praktické aplikácie", content: "Obsah sa načítava..." },
          { title: "Téma 4: Pokročilé techniky", content: "Obsah sa načítava..." },
          { title: "Téma 5: Riešenie problémov", content: "Obsah sa načítava..." },
          { title: "Téma 6: Prípadové štúdie", content: "Obsah sa načítava..." },
          { title: "Téma 7: Najlepšie postupy", content: "Obsah sa načítava..." },
          { title: "Téma 8: Nástroje a zdroje", content: "Obsah sa načítava..." },
          { title: "Téma 9: Trendy a budúcnosť", content: "Obsah sa načítava..." },
          { title: "Téma 10: Zhrnutie", content: "Obsah sa načítava..." },
        ]);
      } finally {
        setIsGeneratingContent(false);
      }
    };

    generateContent();
  }, [courseName, toast]);

  useEffect(() => {
    if (courseProgress) {
      console.log('Course progress already exists:', courseProgress);
      return;
    }
    
    // Initialize progress for new users
    console.log('Initializing course progress...');
    updateProgress({
      current_topic: 0,
      completed_topics: [],
    });
  }, [courseProgress, updateProgress]);

  const handleTopicComplete = async (index: number) => {
    console.log('handleTopicComplete called with index:', index);
    console.log('Current courseProgress:', courseProgress);
    
    const currentCompleted = courseProgress?.completed_topics || [];
    console.log('Current completed topics:', currentCompleted);
    
    const newCompletedTopics = currentCompleted.includes(index) 
      ? currentCompleted 
      : [...currentCompleted, index];
    
    console.log('New completed topics:', newCompletedTopics);
    
    const nextTopic = index === 9 ? 9 : index + 1;
    console.log('Next topic will be:', nextTopic);

    // Call updateProgress and wait for it
    await updateProgress({
      current_topic: nextTopic,
      completed_topics: newCompletedTopics,
    });

    if (index === 9) {
      setShowTest(true);
    }
  };

  const handleTopicSelect = (index: number) => {
    const currentCompleted = courseProgress?.completed_topics || [];
    updateProgress({
      current_topic: index,
      completed_topics: currentCompleted,
    });
  };

  const handleTestPass = (name: string) => {
    setUserName(name);
    setTestPassed(true);
    // Save with default passing score
    saveCompletedCourse({
      test_score: 85,
      user_name: name,
    });
  };

  const progressPercentage = topics.length > 0 ? (completedTopics.length / topics.length) * 100 : 0;

  if (isLoading || isGeneratingContent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isGeneratingContent ? "AI generuje obsah kurzu..." : "Načítavam kurz..."}
          </p>
        </div>
      </div>
    );
  }

  if (testPassed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
        <Certificate
          userName={userName}
          courseName={courseName || ""}
          completionDate={new Date().toLocaleDateString('sk-SK')}
        />
      </div>
    );
  }

  if (showTest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowTest(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na kurz
          </Button>
          <CourseTest
            courseName={courseName || ""}
            onTestPass={handleTestPass}
          />
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">Nepodarilo sa načítať obsah kurzu.</p>
          <Button onClick={() => navigate("/education")}>
            Späť na vzdelávanie
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/education")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Späť na vzdelávanie
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">{courseName}</CardTitle>
                <CardDescription className="mt-2">
                  Online kurz s certifikáciou
                </CardDescription>
              </div>
              <Award className="h-12 w-12 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Postup kurzu</span>
                  <span className="text-sm text-muted-foreground">
                    {completedTopics.length}/{topics.length} tém dokončených
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              {statistics && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Čas strávený: {statistics.time_spent_minutes} min</span>
                  <span>•</span>
                  <span>Dokončených tém: {completedTopics.length}/{topics.length}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CourseNavigation
              topics={topics}
              currentTopic={currentTopic}
              completedTopics={completedTopics}
              onTopicSelect={handleTopicSelect}
            />
          </div>

          <div className="lg:col-span-3">
            <TopicContent
              topic={topics[currentTopic]}
              topicIndex={currentTopic}
              totalTopics={topics.length}
              isCompleted={completedTopics.includes(currentTopic)}
              onComplete={() => handleTopicComplete(currentTopic)}
              timeSpent={statistics?.time_spent_minutes}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
