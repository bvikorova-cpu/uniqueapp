import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { generateAllCourseContent, generateCourseContentFile } from "@/utils/generateAllCourses";
import { Loader2, Download, RefreshCw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function GenerateCourses() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStatus("Starting course generation...");
    
    try {
      const results = await generateAllCourseContent();
      
      // Generate the file content
      const fileContent = generateCourseContentFile(results);
      setGeneratedContent(fileContent);
      
      setProgress(100);
      setStatus("All courses generated successfully!");
      
      toast({
        title: "Success",
        description: "All course content has been generated. Download the file below.",
      });
    } catch (error) {
      console.error("Generation error:", error);
      setStatus("Error generating courses");
      toast({
        title: "Error",
        description: "Failed to generate course content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedContent) return;
    
    const blob = new Blob([generatedContent], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'courseContent.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Course content file downloaded successfully",
    });
  };

  return (
    <>
      <FloatingHowItWorks title="How Generate Courses works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
      <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Generate All Course Content</CardTitle>
            <CardDescription>
              This will generate detailed content for all 25 courses using AI.
              Each course will have 10 comprehensive topics in English.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                size="lg"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate All Courses
                  </>
                )}
              </Button>
              
              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">{status}</p>
                </div>
              )}
              
              {generatedContent && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Content Generated Successfully!</p>
                    <p className="text-xs text-muted-foreground">
                      Preview (first 500 characters):
                    </p>
                    <pre className="text-xs mt-2 overflow-auto max-h-40 bg-background p-2 rounded">
                      {generatedContent.substring(0, 500)}...
                    </pre>
                  </div>
                  
                  <Button 
                    onClick={handleDownload}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download courseContent.ts
                  </Button>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Next steps:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Download the courseContent.ts file</li>
                      <li>Replace the existing src/data/courseContent.ts file</li>
                      <li>Verify the content looks correct</li>
                      <li>Test the courses in your application</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Note:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>This process will generate content for 25 courses</li>
                <li>Each course will have 10 detailed topics (400-600 words each)</li>
                <li>The process may take several minutes due to API rate limits</li>
                <li>All content will be in English</li>
                <li>A 2-second delay is added between courses to avoid rate limiting</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
}
