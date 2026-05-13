import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw } from "lucide-react";

interface CaptchaProps {
  onVerify: (verified: boolean) => void;
}

const generateMathProblem = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operators = ['+', '-', '×'];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  
  let answer: number;
  switch (operator) {
    case '+':
      answer = num1 + num2;
      break;
    case '-':
      answer = Math.max(num1, num2) - Math.min(num1, num2);
      return { 
        question: `${Math.max(num1, num2)} ${operator} ${Math.min(num1, num2)}`, 
        answer 
      };
    case '×':
      answer = num1 * num2;
      break;
    default:
      answer = num1 + num2;
  }
  
  return { question: `${num1} ${operator} ${num2}`, answer };
};

export const Captcha = ({ onVerify }: CaptchaProps) => {
  const [problem, setProblem] = useState(generateMathProblem);
  const [userAnswer, setUserAnswer] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);

  const refreshProblem = useCallback(() => {
    setProblem(generateMathProblem());
    setUserAnswer("");
    setError(false);
    setVerified(false);
    onVerify(false);
  }, [onVerify]);

  const handleVerify = () => {
    const isCorrect = parseInt(userAnswer) === problem.answer;
    setVerified(isCorrect);
    setError(!isCorrect);
    onVerify(isCorrect);
    
    if (!isCorrect) {
      setTimeout(() => {
        refreshProblem();
      }, 1500);
    }
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="text-sm text-green-500 font-medium">Verified</span>
      </div>
    );
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-card space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Prove you are not a robot</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={refreshProblem}
          className="h-8 w-8"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-lg font-mono font-bold">{problem.question} =</span>
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className={`w-20 px-3 py-2 border rounded-md bg-background text-foreground ${
              error ? 'border-destructive' : 'border-input'
            }`}
            placeholder="?"
          />
        </div>
        <Button
          type="button"
          onClick={handleVerify}
          disabled={!userAnswer}
          size="sm"
        >
          Verify
        </Button>
      </div>
      
      {error && (
        <p className="text-sm text-destructive">Incorrect answer, try again</p>
      )}
    </div>
  );
};

export default Captcha;
