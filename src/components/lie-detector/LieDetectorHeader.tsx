import { Shield, Sparkles } from "lucide-react";

export const LieDetectorHeader = () => {
  return (
    <div className="text-center mb-6 sm:mb-12 animate-fade-in">
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Lie Detector Chat
        </h1>
        <Sparkles className="h-6 w-6 sm:h-10 sm:w-10 text-accent" />
      </div>
      <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2 sm:px-4">
        AI-powered truthfulness analysis for messages and conversations
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground mt-2 px-2">
        Detect deception, manipulation, and psychological patterns with advanced AI
      </p>
    </div>
  );
};