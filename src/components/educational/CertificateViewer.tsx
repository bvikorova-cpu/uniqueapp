import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Award, Star } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Certificate } from "@/hooks/useEducationalCertificates";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CertificateViewerProps {
  certificate: Certificate;
}

export const CertificateViewer = ({ certificate }: CertificateViewerProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    setIsDownloading(true);
    try {
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
      
      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Learn-Play-Certificate-${certificate.certificate_number}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Certificate Viewer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      <div
        ref={certificateRef}
        className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-12 rounded-lg border-8 border-yellow-300 shadow-2xl"
        style={{ minHeight: "500px" }}
      >
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="flex justify-center mb-4">
            <Award className="w-24 h-24 text-yellow-500" />
          </div>
          
          <h1 className="text-5xl font-bold text-orange-600 mb-2">
            Certificate of Achievement
          </h1>
          
          <div className="flex justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-8 h-8 text-yellow-500 fill-yellow-500"
              />
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4 py-6">
            <p className="text-2xl text-gray-700">This certifies that</p>
            
            <h2 className="text-6xl font-bold text-orange-600 my-4">
              {certificate.student_name}
            </h2>
            
            <p className="text-2xl text-gray-700">
              has successfully completed
            </p>
            
            <div className="bg-white/50 rounded-lg p-6 my-6 inline-block">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold text-orange-600">
                    {certificate.total_topics_completed}
                  </div>
                  <div className="text-lg text-gray-600 mt-2">Topics</div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-yellow-500">
                    {certificate.total_stars_earned}
                  </div>
                  <div className="text-lg text-gray-600 mt-2">Stars</div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-green-600">
                    {certificate.average_quiz_score.toFixed(0)}%
                  </div>
                  <div className="text-lg text-gray-600 mt-2">Average Score</div>
                </div>
              </div>
            </div>
            
            <p className="text-2xl text-gray-700">
              in the Learn & Play Educational Program
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end pt-8 mt-8 border-t-4 border-yellow-300">
            <div className="text-left">
              <p className="text-sm text-gray-600">Date Issued</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(certificate.issued_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-48 border-t-2 border-gray-400 mb-2"></div>
              <p className="text-lg font-semibold text-gray-800">Learn & Play</p>
              <p className="text-sm text-gray-600">Educational Platform</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Certificate No.</p>
              <p className="text-lg font-semibold text-gray-800">
                {certificate.certificate_number}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          size="lg"
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8"
        >
          <Download className="mr-2 h-5 w-5" />
          {isDownloading ? "Generating PDF..." : "Download Certificate"}
        </Button>
      </div>
    </div>
    </>
    );
};
