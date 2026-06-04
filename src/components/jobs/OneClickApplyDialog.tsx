import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OneClickApplyDialogProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export const OneClickApplyDialog = ({ jobId, jobTitle, companyName }: OneClickApplyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document (DOC/DOCX)",
        variant: "destructive",
      });
      return false;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Resume must be less than 10MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress("Preparing application...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to apply for a position.",
          variant: "destructive",
        });
        return;
      }

      let resumeUrl = null;
      if (resumeFile) {
        setUploadProgress("Uploading resume...");
        
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${user.id}/${jobId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, resumeFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          // Fallback to media bucket if resumes bucket doesn't exist
          const { error: mediaUploadError } = await supabase.storage
            .from('media')
            .upload(`resumes/${fileName}`, resumeFile);
          
          if (mediaUploadError) throw mediaUploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(`resumes/${fileName}`);
          
          resumeUrl = publicUrl;
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(fileName);
          
          resumeUrl = publicUrl;
        }
      }

      setUploadProgress("Submitting application...");

      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
          cover_letter: coverLetter,
          resume_url: resumeUrl,
          status: 'pending',
        });

      if (error) throw error;

      try {
        await (supabase as any).rpc("track_challenge_action", { _action: "job_application" });
      } catch (e) {
        console.warn("track_challenge_action failed", e);
      }

      toast({
        title: "✅ Application Submitted!",
        description: "Your application has been sent to the employer.",
      });

      setOpen(false);
      setCoverLetter("");
      setResumeFile(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <Briefcase className="h-4 w-4" />
          One-Click Apply
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Apply for Position
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {jobTitle} at {companyName}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cover-letter">Cover Letter</Label>
            <Textarea
              id="cover-letter"
              placeholder="Describe why you are a suitable candidate for this position..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume Upload (PDF/DOCX)</Label>
            <Card className={`border-2 border-dashed ${resumeFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <label 
                    htmlFor="resume" 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    {resumeFile ? (
                      <>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{resumeFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(resumeFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">Click to upload your resume</p>
                          <p className="text-xs text-muted-foreground">
                            PDF, DOC, DOCX (max 10MB)
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                  {resumeFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setResumeFile(null)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {uploadProgress && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploadProgress}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
