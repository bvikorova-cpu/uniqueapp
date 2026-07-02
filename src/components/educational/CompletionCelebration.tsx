import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Award, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { useEducationalCertificates } from "@/hooks/useEducationalCertificates";
import { CertificateViewer } from "./CertificateViewer";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CompletionCelebrationProps {
  totalTopicsCompleted: number;
  totalStarsEarned: number;
  averageQuizScore: number;
  onClose: () => void;
}

export const CompletionCelebration = ({
  totalTopicsCompleted,
  totalStarsEarned,
  averageQuizScore,
  onClose,
}: CompletionCelebrationProps) => {
  const [studentName, setStudentName] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);
  const { certificates, createCertificate, isCreating } = useEducationalCertificates();

  const handleCreateCertificate = () => {
    if (!studentName.trim()) {
      return;
    }

    createCertificate({
      studentName: studentName.trim(),
      totalTopicsCompleted,
      totalStarsEarned,
      averageQuizScore,
    });
    
    // Show certificate after a short delay
    setTimeout(() => {
      setShowCertificate(true);
      // Celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 1000);
  };

  const latestCertificate = certificates?.[0];

  if (showCertificate && latestCertificate) {
    return (
      <>
        <FloatingHowItWorks title="How Completion Celebration works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-100 to-red-100 p-8">
        <div className="max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={onClose}
            className="mb-4"
          >
            ← Back to Topics
          </Button>
          <CertificateViewer certificate={latestCertificate} />
        </div>
      </div>
      </>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-orange-100 to-red-100 flex items-center justify-center p-8">
      <Card className="max-w-2xl w-full bg-white border-4 border-yellow-300 shadow-2xl">
        <CardContent className="p-12 text-center">
          <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-6 animate-bounce" />
          
          <h2 className="text-5xl font-bold text-orange-600 mb-4">
            Congratulations! 🎉
          </h2>
          
          <p className="text-2xl text-gray-700 mb-8">
            You've completed all topics in Learn & Play!
          </p>

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-4xl font-bold text-orange-600">
                  {totalTopicsCompleted}
                </div>
                <div className="text-sm text-gray-600">Topics</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-500">
                  {totalStarsEarned}
                </div>
                <div className="text-sm text-gray-600">Stars</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600">
                  {averageQuizScore.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <Award className="w-6 h-6" />
              <span className="text-xl font-semibold">Get Your Certificate!</span>
              <Sparkles className="w-6 h-6" />
            </div>
            
            <div className="max-w-md mx-auto text-left">
              <Label htmlFor="studentName" className="text-lg">
                Enter your name for the certificate
              </Label>
              <Input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Your full name"
                className="mt-2 text-lg h-12"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={onClose}
              variant="outline"
              size="lg"
              className="px-8"
            >
              Back to Topics
            </Button>
            <Button
              onClick={handleCreateCertificate}
              disabled={!studentName.trim() || isCreating}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8"
            >
              <Award className="mr-2 h-5 w-5" />
              {isCreating ? "Creating..." : "Create Certificate"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
