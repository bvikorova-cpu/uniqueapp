import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Award } from "lucide-react";
import { CourseTest } from "@/components/courses/CourseTest";
import { Certificate } from "@/components/courses/Certificate";
import { CourseNavigation } from "@/components/courses/CourseNavigation";
import { TopicContent } from "@/components/courses/TopicContent";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { courseContent, generateDefaultTopics, type Topic } from "@/data/courseContent";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const CourseDetail = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const [showTest, setShowTest] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [userName, setUserName] = useState("");
  
  // Get topics from courseContent or generate default ones
  const topics = courseName 
    ? (courseContent[courseName] || generateDefaultTopics(courseName))
    : [];

  const { progress: courseProgress, statistics, isLoading, updateProgress, saveCompletedCourse } = useCourseProgress(courseName || "");

  const currentTopic = courseProgress?.current_topic || 0;
  const completedTopics = courseProgress?.completed_topics || [];

  // Initialize or reset progress only once
  useEffect(() => {
    // Don't initialize if we already have progress from either source
    const hasExistingProgress = courseProgress?.completed_topics && courseProgress.completed_topics.length > 0;
    
    if (!hasExistingProgress && courseProgress === undefined) {
      console.log('Initializing fresh course progress...');
      updateProgress({
        current_topic: 0,
        completed_topics: [],
      });
    }
  }, []); // Empty dependency array - only run once on mount

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

  if (isLoading) {
    return (
      <>
        <FloatingHowItWorks title="How Course Detail works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
      </>
      );
  }

  if (testPassed) {
    return (
      <div className="min-h-screen bg-background p-4">
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
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowTest(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to course
          </Button>
          <CourseTest
            courseName={courseName || ""}
            topics={topics}
            onTestPass={handleTestPass}
          />
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">Failed to load course content.</p>
          <Button onClick={() => navigate("/education")}>
            Back to Education
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">{courseName}</CardTitle>
                <CardDescription className="mt-2">
                  Online course with certification
                </CardDescription>
              </div>
              <Award className="h-12 w-12 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Course Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {completedTopics.length}/{topics.length} topics completed
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              {statistics && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Time spent: {statistics.time_spent_minutes} min</span>
                  <span>•</span>
                  <span>Completed topics: {completedTopics.length}/{topics.length}</span>
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
