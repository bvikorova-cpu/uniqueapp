import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CertificateProps {
  userName: string;
  courseName: string;
  completionDate: string;
}

export const Certificate = ({ userName, courseName, completionDate }: CertificateProps) => {
  const navigate = useNavigate();
  const certificateNumber = `UNIQUE-${Date.now().toString().slice(-8)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex gap-4 print:hidden">
        <Button variant="outline" onClick={() => navigate("/education")}>
          <Home className="mr-2 h-4 w-4" />
          Späť na vzdelávanie
        </Button>
        <Button onClick={handlePrint}>
          <Download className="mr-2 h-4 w-4" />
          Stiahnuť certifikát
        </Button>
      </div>

      <Card className="bg-white text-black border-8 border-double border-primary">
        <CardContent className="p-12 space-y-8">
          {/* Header with seal */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-serif font-bold text-primary">UNIQUE</h1>
              <p className="text-sm text-muted-foreground">Education & Certification</p>
            </div>
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary flex items-center justify-center">
                <div className="text-center">
                  <Award className="h-10 w-10 mx-auto text-primary" />
                  <p className="text-xs font-bold mt-1">UNIQUE</p>
                  <p className="text-[8px]">EDUCATION</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate title */}
          <div className="text-center space-y-4 pt-4">
            <Award className="h-16 w-16 mx-auto text-primary" />
            <h2 className="text-5xl font-serif font-bold text-primary">
              CERTIFIKÁT
            </h2>
            <p className="text-lg text-muted-foreground">
              o absolvovaní kurzu
            </p>
          </div>

          {/* Recipient */}
          <div className="text-center space-y-4 py-6">
            <p className="text-lg">Týmto sa potvrdzuje, že</p>
            <h3 className="text-4xl font-serif font-bold border-b-2 border-primary inline-block px-8 pb-2">
              {userName}
            </h3>
            <p className="text-lg">úspešne absolvoval/a kurz</p>
            <h4 className="text-3xl font-serif font-semibold text-primary">
              {courseName}
            </h4>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-muted">
            <div>
              <p className="text-sm text-muted-foreground">Dátum ukončenia</p>
              <p className="font-semibold">{completionDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Číslo certifikátu</p>
              <p className="font-semibold">{certificateNumber}</p>
            </div>
          </div>

          {/* Signature */}
          <div className="pt-8 mt-8 border-t-2 border-muted">
            <div className="flex justify-between items-end">
              <div className="text-center flex-1">
                <div className="border-b-2 border-black w-48 mx-auto mb-2"></div>
                <p className="font-semibold">Mgr. Beáta Vikorová</p>
                <p className="text-sm">MBA, LL.M, MSc.</p>
                <p className="text-sm text-muted-foreground">Riaditeľka UNIQUE</p>
              </div>
              <div className="flex-1 flex justify-end">
                <div className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center bg-primary/5">
                  <div className="text-center">
                    <p className="text-xs font-bold">UNIQUE</p>
                    <Award className="h-8 w-8 mx-auto my-1 text-primary" />
                    <p className="text-[10px] font-semibold">EDUCATION</p>
                    <p className="text-[8px]">2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-6 border-t">
            <p>Poskytovateľ kurzu: UNIQUE</p>
            <p className="mt-1">www.unique-education.sk</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
