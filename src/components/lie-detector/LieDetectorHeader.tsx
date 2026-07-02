import { Shield, Sparkles, MessageSquare, Users, Brain, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const LieDetectorHeader = () => {
  return (
    <>
      <FloatingHowItWorks title={"Lie Detector Header - How it works"} steps={[{ title: 'Open', desc: 'Access the Lie Detector Header section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Lie Detector Header.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-6 sm:mb-12 animate-fade-in">
      <div className="text-center mb-6">
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
      </div>

      <Card className="glassmorphism border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">What is Lie Detector Chat?</h2>
          
          <p className="text-muted-foreground text-sm sm:text-base mb-4 leading-relaxed">
            Lie Detector Chat uses advanced AI technology to analyze text messages and conversations for signs of deception, 
            manipulation, and psychological patterns. Whether you're questioning the authenticity of a message from a partner, 
            friend, colleague, or online contact, our AI provides detailed insights into the truthfulness of the communication.
          </p>

          <h3 className="font-semibold mb-3 text-base sm:text-lg">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Single Message Analysis</p>
                <p className="text-xs text-muted-foreground">Paste any text message to get an instant truthfulness assessment with detailed breakdown.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Conversation Thread</p>
                <p className="text-xs text-muted-foreground">Analyze entire chat threads to detect patterns of deception across multiple messages.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Brain className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Psychological Profile</p>
                <p className="text-xs text-muted-foreground">Get deep psychological insights about communication styles and behavioral patterns.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Detailed Reports</p>
                <p className="text-xs text-muted-foreground">Receive comprehensive reports with truthfulness scores, red flags, and AI explanations.</p>
              </div>
            </div>
          </div>

          <h3 className="font-semibold mb-2 text-base sm:text-lg">How to Use</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Choose your analysis type from the tabs below (Single Message, Thread, or Profile)</li>
            <li>Paste the message or conversation you want to analyze</li>
            <li>Add optional context about the sender and situation for better accuracy</li>
            <li>Click "Analyze" and receive your detailed AI-powered truthfulness report</li>
          </ol>

          <p className="text-xs text-muted-foreground mt-4 italic text-center">
            Note: This tool is for entertainment and informational purposes. Results should not be used as definitive proof of deception.
          </p>
        </CardContent>
      </Card>
    </div>
    </>
  );
};