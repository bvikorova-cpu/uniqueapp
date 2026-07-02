import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Lightbulb } from "lucide-react";
import { Lesson } from "@/data/educationalContent";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface LessonViewerProps {
  lessons: Lesson[];
  currentLesson: number;
  onLessonComplete: () => void;
  onBack: () => void;
}

export const LessonViewer = ({
  lessons,
  currentLesson,
  onLessonComplete,
  onBack,
}: LessonViewerProps) => {
  const lesson = lessons[currentLesson];
  const progress = ((currentLesson + 1) / lessons.length) * 100;
  const isLastLesson = currentLesson === lessons.length - 1;

  return (
    <>
      <FloatingHowItWorks title="How Lesson Viewer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6 animate-fade-in">
      <Button
        variant="ghost"
        onClick={onBack}
        className="hover:bg-white/50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Topics
      </Button>

      <Card className="bg-gradient-to-br from-white to-blue-50 border-4 border-blue-200">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-600">
                Lesson {currentLesson + 1} of {lessons.length}
              </h3>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="text-center mb-8">
            <div className="text-8xl mb-4">{lesson.imageEmoji}</div>
            <h2 className="text-3xl font-bold text-orange-600 mb-4">
              {lesson.title}
            </h2>
          </div>

          <Card className="bg-white border-2 border-orange-200 mb-6">
            <CardContent className="p-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                {lesson.content}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-yellow-700 mb-1">Fun Fact!</h4>
                  <p className="text-yellow-800">{lesson.funFact}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-8">
            <Button
              onClick={onLessonComplete}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-12 py-6 text-xl"
            >
              {isLastLesson ? (
                <>
                  <CheckCircle className="mr-2 h-6 w-6" />
                  Finish Lessons!
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-6 w-6" />
                  Next Lesson
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
    );
};
