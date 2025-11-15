import { GraduationCap } from "lucide-react";

const TutorialPlatform = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Tutorial & Course Platform</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create courses and tutorials. Earn 70% of revenue.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TutorialPlatform;
