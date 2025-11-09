import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Upload } from "lucide-react";

interface JobApplicationDialogProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export const JobApplicationDialog = ({ jobId, jobTitle, companyName }: JobApplicationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Chyba",
          description: "Musíte byť prihlásený na uchádzanie sa o pozíciu.",
          variant: "destructive",
        });
        return;
      }

      let resumeUrl = null;
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const filePath = `${user.id}/${jobId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, resumeFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
        
        resumeUrl = publicUrl;
      }

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

      toast({
        title: "Úspech",
        description: "Vaša žiadosť bola úspešne odoslaná.",
      });

      setOpen(false);
      setCoverLetter("");
      setResumeFile(null);
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa odoslať žiadosť.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Briefcase className="mr-2 h-4 w-4" />
          Uchádzať sa o pozíciu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Uchádzať sa o pozíciu</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {jobTitle} v {companyName}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cover-letter">Motivačný list</Label>
            <Textarea
              id="cover-letter"
              placeholder="Napíšte, prečo ste vhodný kandidát pre túto pozíciu..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Životopis (voliteľné)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
              {resumeFile && (
                <Upload className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Podporované formáty: PDF, DOC, DOCX
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Zrušiť
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Odosiela sa..." : "Odoslať žiadosť"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
