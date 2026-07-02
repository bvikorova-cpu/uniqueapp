import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Camera, 
  Heart, 
  MessageCircle,
  Bell,
  Sparkles
} from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  actionUrl?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Unique!",
    description: "Discover a world of talents, creativity, and fun. Let's go through the basics together.",
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: "profile",
    title: "Create your profile",
    description: "Add a profile photo and fill in basic information about yourself.",
    icon: <User className="h-8 w-8" />,
    action: "Edit profile",
    actionUrl: "/profile",
  },
  {
    id: "post",
    title: "Share your talent",
    description: "Create your first post - video, photo, or text.",
    icon: <Camera className="h-8 w-8" />,
    action: "Create post",
    actionUrl: "/create",
  },
  {
    id: "interact",
    title: "Interact with the community",
    description: "Like, comment, and follow other creators.",
    icon: <Heart className="h-8 w-8" />,
    action: "Explore",
    actionUrl: "/explore",
  },
  {
    id: "messages",
    title: "Connect with others",
    description: "Send messages and build relationships with like-minded people.",
    icon: <MessageCircle className="h-8 w-8" />,
    action: "Messages",
    actionUrl: "/messages",
  },
  {
    id: "notifications",
    title: "Stay informed",
    description: "Enable notifications so you don't miss anything.",
    icon: <Bell className="h-8 w-8" />,
  },
];

interface ProgressiveOnboardingProps {
  onComplete?: () => void;
}

export const ProgressiveOnboarding = ({ onComplete }: ProgressiveOnboardingProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const isLovablePreview = typeof window !== "undefined" &&
    (window.location.hostname.includes("lovableproject.com") || window.location.hostname.includes("lovable.app"));

  useEffect(() => {
    if (isLovablePreview) {
      setHasSeenOnboarding(true);
      setIsVisible(false);
      return;
    }

    const pathname = window.location.pathname;
    const shouldShowOnboarding = pathname === "/" || pathname === "/index";

    if (!shouldShowOnboarding) {
      setHasSeenOnboarding(true);
      return;
    }

    const seen = localStorage.getItem("onboarding_completed");
    if (!seen) {
      // Delay showing onboarding to allow page to load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    setHasSeenOnboarding(true);
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    setIsVisible(false);
    onComplete?.();
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const step = onboardingSteps[currentStep];

  if (isLovablePreview || hasSeenOnboarding || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <Card className="w-full max-w-md p-6 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Progress */}
            <div className="mb-6">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Step {currentStep + 1} of {onboardingSteps.length}
              </p>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center relative z-10"
              >
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                  {step.icon}
                </div>
                
                <h2 className="text-xl font-bold mb-2">{step.title}</h2>
                <p className="text-muted-foreground mb-6">{step.description}</p>

                {step.action && step.actionUrl && (
                  <Button
                    variant="outline"
                    className="mb-4"
                    onClick={() => {
                      window.location.href = step.actionUrl!;
                    }}
                  >
                    {step.action}
                  </Button>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div className="flex gap-1">
                {onboardingSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <Button onClick={handleNext}>
                {currentStep === onboardingSteps.length - 1 ? (
                  "Finish"
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip link */}
            <button
              onClick={handleSkip}
              className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tutorial
            </button>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProgressiveOnboarding;
