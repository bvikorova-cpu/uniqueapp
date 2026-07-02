import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CertificateGeneratorProps {
  userName: string;
  courseName: string;
  completionDate: string;
  certificateNumber: string;
  instructorName: string;
  score?: number;
}

export const CertificateGenerator = ({
  userName,
  courseName,
  completionDate,
  certificateNumber,
  instructorName,
  score,
}: CertificateGeneratorProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Certificate-${certificateNumber}.pdf`);
  };

  return (
    <>
      <FloatingHowItWorks title="How Certificate Generator works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div
        ref={certificateRef}
        className="relative bg-white p-12 rounded-lg shadow-2xl overflow-hidden"
        style={{ aspectRatio: "1.414/1" }}
      >
        {/* Decorative Border */}
        <div className="absolute inset-0 border-8 border-double border-amber-500/30 m-4 rounded-lg pointer-events-none" />
        
        {/* Corner Decorations */}
        <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-primary rounded-tl-lg" />
        <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-primary rounded-tr-lg" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-primary rounded-bl-lg" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-primary rounded-br-lg" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
          {/* Logo/Icon */}
          <div className="bg-gradient-to-br from-primary to-purple-600 p-6 rounded-full shadow-lg">
            <Award className="h-16 w-16 text-white" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-5xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'serif' }}>
              Certificate of Achievement
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-primary to-purple-600 mx-auto rounded-full" />
          </div>

          {/* Subheading */}
          <p className="text-xl text-gray-600 max-w-2xl">
            This certificate is proudly presented to
          </p>

          {/* Recipient Name */}
          <h2 className="text-4xl font-bold text-primary" style={{ fontFamily: 'serif' }}>
            {userName}
          </h2>

          {/* Achievement Description */}
          <div className="max-w-2xl space-y-2">
            <p className="text-lg text-gray-700">
              For successfully completing the certification program
            </p>
            <h3 className="text-2xl font-semibold text-gray-800">
              {courseName}
            </h3>
            {score && (
              <p className="text-lg text-gray-700">
                with a score of <span className="font-bold text-primary">{score}%</span>
              </p>
            )}
          </div>

          {/* Date and Details */}
          <div className="flex items-center justify-center gap-12 pt-8">
            <div className="text-center">
              <div className="h-0.5 w-48 bg-gray-300 mb-2" />
              <p className="text-sm text-gray-600">Completion Date</p>
              <p className="text-base font-semibold text-gray-800">
                {new Date(completionDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-center">
              <div className="h-0.5 w-48 bg-gray-300 mb-2" />
              <p className="text-sm text-gray-600">Instructor</p>
              <p className="text-base font-semibold text-gray-800">
                {instructorName}
              </p>
            </div>
          </div>

          {/* Certificate Number */}
          <div className="pt-4">
            <p className="text-xs text-gray-500 tracking-wider">
              Certificate No: {certificateNumber}
            </p>
          </div>

          {/* Seal/Stamp */}
          <div className="absolute bottom-12 right-12 w-24 h-24 rounded-full border-4 border-primary/30 flex items-center justify-center bg-primary/5">
            <div className="text-center">
              <p className="text-xs font-bold text-primary">CERTIFIED</p>
              <p className="text-xs text-primary">{new Date(completionDate).getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(124,58,237,0.3),transparent_50%)]" />
        </div>
      </div>
    </div>
    </>
    );
};
