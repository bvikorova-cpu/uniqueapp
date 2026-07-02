import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import { Award, Download, Share2, Check } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CertificateGeneratorProps {
  courseTitle: string;
  studentName: string;
  completionDate: string;
  userId: string;
  courseId: string;
}

export function CertificateGenerator({
  courseTitle,
  studentName,
  completionDate,
  userId,
  courseId,
}: CertificateGeneratorProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Background gradient effect (using rectangles)
      doc.setFillColor(249, 250, 251);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Border
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(2);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Inner border
      doc.setDrawColor(147, 197, 253);
      doc.setLineWidth(0.5);
      doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

      // Decorative corner elements
      doc.setFillColor(59, 130, 246);
      doc.circle(20, 20, 3, "F");
      doc.circle(pageWidth - 20, 20, 3, "F");
      doc.circle(20, pageHeight - 20, 3, "F");
      doc.circle(pageWidth - 20, pageHeight - 20, 3, "F");

      // Certificate Title
      doc.setFontSize(48);
      doc.setTextColor(31, 41, 55);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICATE", pageWidth / 2, 45, { align: "center" });

      doc.setFontSize(20);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("OF COMPLETION", pageWidth / 2, 58, { align: "center" });

      // Divider line
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.5);
      doc.line(pageWidth / 2 - 50, 65, pageWidth / 2 + 50, 65);

      // Award icon representation (star)
      doc.setFillColor(234, 179, 8);
      doc.setDrawColor(234, 179, 8);
      const starX = pageWidth / 2;
      const starY = 80;
      const starSize = 8;
      
      // Draw a simple star shape
      for (let i = 0; i < 5; i++) {
        const angle1 = (Math.PI / 2) + (i * 2 * Math.PI / 5);
        const angle2 = angle1 + (Math.PI / 5);
        const x1 = starX + starSize * Math.cos(angle1);
        const y1 = starY - starSize * Math.sin(angle1);
        const x2 = starX + (starSize / 2) * Math.cos(angle2);
        const y2 = starY - (starSize / 2) * Math.sin(angle2);
        
        if (i === 0) {
          doc.moveTo(x1, y1);
        }
        doc.lineTo(x1, y1);
        doc.lineTo(x2, y2);
      }
      doc.fill();

      // "This is to certify that"
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("This is to certify that", pageWidth / 2, 100, { align: "center" });

      // Student Name
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      doc.text(studentName, pageWidth / 2, 115, { align: "center" });

      // Achievement text
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("has successfully completed", pageWidth / 2, 128, { align: "center" });

      // Course Title
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      
      // Handle long course titles
      const maxWidth = 220;
      const lines = doc.splitTextToSize(courseTitle, maxWidth);
      const lineHeight = 8;
      const startY = 143;
      
      lines.forEach((line: string, index: number) => {
        doc.text(line, pageWidth / 2, startY + (index * lineHeight), { align: "center" });
      });

      // Completion Date
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      const dateY = startY + (lines.length * lineHeight) + 15;
      const formattedDate = new Date(completionDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`Completed on ${formattedDate}`, pageWidth / 2, dateY, { align: "center" });

      // Signature section
      const signatureY = pageHeight - 45;
      
      // Left signature line
      doc.setDrawColor(156, 163, 175);
      doc.setLineWidth(0.5);
      doc.line(40, signatureY, 90, signatureY);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text("Instructor Signature", 65, signatureY + 6, { align: "center" });

      // Right signature line
      doc.line(pageWidth - 90, signatureY, pageWidth - 40, signatureY);
      doc.text("Date of Issue", pageWidth - 65, signatureY + 6, { align: "center" });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        "This certificate verifies the successful completion of the course curriculum",
        pageWidth / 2,
        pageHeight - 15,
        { align: "center" }
      );

      // Certificate ID
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      doc.text(
        `Certificate ID: ${certificateId}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Download PDF
      doc.save(`${courseTitle.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`);

      setCertificateGenerated(true);
      
      toast({
        title: "Certificate Generated! 🎉",
        description: "Your certificate has been downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive",
      });
      console.error("Certificate generation error:", error);
    } finally {
      setGenerating(false);
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
      <Card className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-background border-2 border-primary/20">
      <CardContent className="text-center py-12">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
          <Award className="h-12 w-12 text-primary" />
        </div>

        <h3 className="text-3xl font-bold mb-2">
          Congratulations! 🎉
        </h3>
        
        <p className="text-lg text-muted-foreground mb-6">
          You've successfully completed <span className="font-semibold text-foreground">{courseTitle}</span>
        </p>

        <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
          <Button
            size="lg"
            onClick={generatePDF}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Certificate...
              </>
            ) : certificateGenerated ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Download Again
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Download Certificate
              </>
            )}
          </Button>

          {certificateGenerated && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Check className="h-4 w-4" />
              <span>Certificate downloaded successfully!</span>
            </div>
          )}

          <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm text-left w-full">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Your Achievement
            </h4>
            <p className="text-muted-foreground">
              Share your certificate on LinkedIn, add it to your portfolio, or include it in your resume to showcase your new skills!
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            Your certificate includes a unique verification ID and completion date
          </p>
        </div>
      </CardContent>
    </Card>
    </>
    );
}
