import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CertificateGeneratorProps {
  courseId: string;
  courseTitle: string;
  studentName: string;
  completionDate: string;
  instructorName: string;
}

export const CertificateGenerator = ({
  courseId,
  courseTitle,
  studentName,
  completionDate,
  instructorName,
}: CertificateGeneratorProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkExistingCertificate();
  }, [courseId]);

  const checkExistingCertificate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('course_certificates' as any)
      .select('certificate_url')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (data && (data as any).certificate_url) {
      setCertificateUrl((data as any).certificate_url);
    }
  };

  const generateCertificate = async () => {
    if (!certificateRef.current) return;

    setLoading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      
      const pdfBlob = pdf.output("blob");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const fileName = `certificate-${courseId}-${user.id}-${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, pdfBlob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("certificates")
        .getPublicUrl(fileName);

      await supabase
        .from('course_certificates' as any)
        .insert({
          course_id: courseId,
          user_id: user.id,
          certificate_url: urlData.publicUrl,
          issued_at: new Date().toISOString(),
        });

      setCertificateUrl(urlData.publicUrl);
      toast.success("Certificate generated successfully!");
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate");
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    if (certificateUrl) {
      window.open(certificateUrl, "_blank");
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Certificate Generator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Course Completion Certificate</h3>
        </div>

        {certificateUrl ? (
          <Button onClick={downloadCertificate} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
        ) : (
          <Button onClick={generateCertificate} disabled={loading} size="sm">
            <Award className="h-4 w-4 mr-2" />
            {loading ? "Generating..." : "Generate Certificate"}
          </Button>
        )}
      </div>

      <div
        ref={certificateRef}
        className="bg-gradient-to-br from-primary/5 to-primary/10 p-12 rounded-lg border-4 border-primary/20"
        style={{ minHeight: "600px" }}
      >
        <div className="text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-serif font-bold text-primary">
              Certificate of Completion
            </h1>
            <p className="text-lg text-muted-foreground">
              This is to certify that
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-bold">{studentName}</h2>
            <p className="text-lg text-muted-foreground">
              has successfully completed
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-semibold text-primary">
              {courseTitle}
            </h3>
          </div>

          <div className="pt-8 flex justify-between items-end px-12">
            <div className="text-left space-y-2">
              <div className="border-t-2 border-primary/30 pt-2 w-48">
                <p className="font-medium">{instructorName}</p>
                <p className="text-sm text-muted-foreground">Course Instructor</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <Award className="h-16 w-16 text-primary mx-auto" />
              <p className="text-sm font-medium">Excellence in Learning</p>
            </div>

            <div className="text-right space-y-2">
              <div className="border-t-2 border-primary/30 pt-2 w-48">
                <p className="font-medium">
                  {new Date(completionDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">Date of Completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {certificateUrl && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          Your certificate has been generated and saved. You can download it anytime.
        </p>
      )}
    </Card>
    </>
    );
};
