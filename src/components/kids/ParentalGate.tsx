import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";

interface ParentalGateProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  featureName?: string;
}

function generateMathQuestion(): { question: string; answer: number } {
  const num1 = Math.floor(Math.random() * 20) + 10; // 10-29
  const num2 = Math.floor(Math.random() * 20) + 5;  // 5-24
  return {
    question: `What is ${num1} + ${num2}?`,
    answer: num1 + num2,
  };
}

export function ParentalGate({ isOpen, onSuccess, onClose, featureName = "this feature" }: ParentalGateProps) {
  const [mathQuestion, setMathQuestion] = useState(generateMathQuestion());
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMathQuestion(generateMathQuestion());
      setUserAnswer("");
      setError(false);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const numAnswer = parseInt(userAnswer, 10);
    if (numAnswer === mathQuestion.answer) {
      setSuccess(true);
      setError(false);
      // Store in sessionStorage for 1 hour
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
      sessionStorage.setItem('parental_gate_verified', JSON.stringify({ expiresAt }));
      setTimeout(() => {
        onSuccess();
      }, 800);
    } else {
      setError(true);
      setSuccess(false);
      // Generate new question after wrong answer
      setTimeout(() => {
        setMathQuestion(generateMathQuestion());
        setUserAnswer("");
        setError(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl text-purple-700">
            <Shield className="w-6 h-6 text-purple-500" />
            Parent Check 👨‍👩‍👧
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            To access {featureName}, please ask your parent or guardian to solve this math problem.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-white/80 rounded-xl p-6 text-center shadow-inner border-2 border-purple-100">
            <p className="text-sm text-purple-600 mb-2 font-medium">
              Ask your parent: 🧮
            </p>
            <p className="text-3xl font-bold text-purple-800 mb-4">
              {mathQuestion.question}
            </p>
            
            <Input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter the answer"
              className="text-center text-xl font-semibold h-14 border-2 border-purple-200 focus:border-purple-400"
              disabled={success}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg animate-shake">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">That's not right. Try again!</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Correct! Opening {featureName}...</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={success}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={!userAnswer || success}
            >
              {success ? "Opening..." : "Verify"}
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500">
            🔒 This safety check helps ensure adult supervision for AI-interactive features.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check if parental gate has been verified recently
export function useParentalGate() {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    checkVerification();
  }, []);

  const checkVerification = () => {
    const stored = sessionStorage.getItem('parental_gate_verified');
    if (stored) {
      try {
        const { expiresAt } = JSON.parse(stored);
        if (Date.now() < expiresAt) {
          setIsVerified(true);
          return true;
        } else {
          sessionStorage.removeItem('parental_gate_verified');
        }
      } catch {
        sessionStorage.removeItem('parental_gate_verified');
      }
    }
    setIsVerified(false);
    return false;
  };

  const resetVerification = () => {
    sessionStorage.removeItem('parental_gate_verified');
    setIsVerified(false);
  };

  return { isVerified, checkVerification, resetVerification };
}
