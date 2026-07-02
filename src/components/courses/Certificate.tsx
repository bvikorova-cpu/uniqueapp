import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Home, Stamp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CertificateProps {
  userName: string;
  courseName: string;
  completionDate: string;
}

export const Certificate = ({ userName, courseName, completionDate }: CertificateProps) => {
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);
  const certificateNumber = `UNIQUE-${Date.now().toString().slice(-8)}`;

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      toast.loading("Generating PDF certificate...");
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate-${userName.replace(/\s+/g, "-")}-${courseName.substring(0, 30).replace(/\s+/g, "-")}.pdf`);
      
      toast.dismiss();
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Certificate works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex gap-4 print:hidden">
        <Button variant="outline" onClick={() => navigate("/education")}>
          <Home className="mr-2 h-4 w-4" />
          Back to Education
        </Button>
        <Button onClick={handleDownloadPDF} size="lg" className="bg-primary hover:bg-primary/90">
          <Download className="mr-2 h-5 w-5" />
          Download Certificate as PDF
        </Button>
      </div>

      <div ref={certificateRef}>
        <Card className="bg-gradient-to-br from-white via-blue-50/30 to-white text-black border-[12px] border-double border-primary/80 shadow-2xl">
          <CardContent className="p-16 space-y-10 relative">
            {/* Decorative corner elements */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-primary/40"></div>
            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-primary/40"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-primary/40"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-primary/40"></div>

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-6xl font-serif font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  UNIQUE
                </h1>
                <p className="text-base text-muted-foreground mt-1 tracking-wide">
                  Education & Professional Certification
                </p>
              </div>
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-[6px] border-primary/80 flex items-center justify-center bg-white shadow-lg">
                  <div className="text-center">
                    <Award className="h-12 w-12 mx-auto text-primary" />
                    <p className="text-xs font-bold mt-1 text-primary">VERIFIED</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate title */}
            <div className="text-center space-y-6 pt-4">
              <div className="flex justify-center">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Award className="h-20 w-20 text-primary" />
                </div>
              </div>
              <h2 className="text-6xl font-serif font-bold text-primary tracking-wider">
                CERTIFICATE
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
              <p className="text-xl text-muted-foreground font-light tracking-wide">
                of successful course completion
              </p>
            </div>

            {/* Recipient */}
            <div className="text-center space-y-6 py-8">
              <p className="text-xl font-light tracking-wide">This is to certify that</p>
              <div className="relative inline-block">
                <h3 className="text-5xl font-serif font-bold text-primary px-12 pb-3 relative z-10">
                  {userName}
                </h3>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              </div>
              <p className="text-xl font-light tracking-wide pt-4">has successfully completed the course</p>
              <h4 className="text-3xl font-serif font-semibold text-primary max-w-3xl mx-auto leading-relaxed">
                {courseName}
              </h4>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-12 pt-8 border-t-2 border-primary/20 max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Completion Date</p>
                <p className="font-semibold text-lg">{completionDate}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Certificate Number</p>
                <p className="font-semibold text-lg font-mono">{certificateNumber}</p>
              </div>
            </div>

            {/* Signature and Seal */}
            <div className="pt-12 mt-8 border-t-2 border-primary/20">
              <div className="flex justify-between items-end max-w-4xl mx-auto">
                <div className="text-center flex-1">
                  <div className="mb-6">
                    {/* Professional signature */}
                    <div className="relative inline-block">
                      <svg width="280" height="80" viewBox="0 0 280 80" className="mx-auto">
                        <path
                          d="M 20 60 Q 30 20, 50 50 T 80 40 Q 100 30, 120 55 T 150 45 Q 170 35, 190 50 T 220 40 Q 240 30, 260 55"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                          className="text-primary"
                          strokeLinecap="round"
                        />
                        <text x="140" y="35" textAnchor="middle" className="text-2xl font-serif italic fill-primary">
                          Beáta Vikorová
                        </text>
                      </svg>
                    </div>
                  </div>
                  <div className="border-t-2 border-black w-64 mx-auto mb-3"></div>
                  <p className="font-bold text-lg">Mgr. Beáta Vikorová</p>
                  <p className="text-sm font-semibold text-muted-foreground">MBA, LL.M, MSc.</p>
                  <p className="text-base font-medium text-primary mt-1">Director of UNIQUE</p>
                </div>
                
                {/* Realistic stamp/seal */}
                <div className="flex-1 flex justify-end">
                  <div className="relative w-40 h-40">
                    {/* Outer circle with dashed border */}
                    <div className="absolute inset-0 rounded-full border-[4px] border-dashed border-red-600/70 opacity-80"></div>
                    
                    {/* Inner circle */}
                    <div className="absolute inset-3 rounded-full border-[3px] border-red-600/70 bg-red-50/30 flex items-center justify-center">
                      <div className="text-center transform -rotate-3">
                        <p className="text-[11px] font-bold text-red-700 tracking-wider">★ UNIQUE ★</p>
                        <Stamp className="h-10 w-10 mx-auto my-2 text-red-600" strokeWidth={2.5} />
                        <p className="text-[10px] font-bold text-red-700 tracking-wide">EDUCATION</p>
                        <p className="text-[9px] font-semibold text-red-600 mt-1">EST. 2020</p>
                      </div>
                    </div>
                    
                    {/* Stamp texture overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-radial from-transparent via-red-600/5 to-red-600/10 pointer-events-none"></div>
                    
                    {/* Small stars around */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-red-600 text-xs">★</div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-red-600 text-xs">★</div>
                    <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 text-red-600 text-xs">★</div>
                    <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-red-600 text-xs">★</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground pt-8 border-t border-primary/10 space-y-2">
              <p className="font-medium">Accredited Education Provider</p>
              <p className="font-semibold text-primary">UNIQUE Education</p>
              <p className="text-xs">www.unique-education.com | info@unique-education.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
    );
};
