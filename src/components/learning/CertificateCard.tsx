import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Calendar } from "lucide-react";

interface CertificateCardProps {
  certificate: {
    id: string;
    title: string;
    certificate_number: string;
    issue_date: string;
    instructor_name: string | null;
    completion_score: number | null;
  };
}

export const CertificateCard = ({ certificate }: CertificateCardProps) => {
  const handleDownload = () => {
    // In a real implementation, this would download the PDF
    console.log("Downloading certificate:", certificate.certificate_number);
  };

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{certificate.title}</h3>
            <p className="text-sm text-muted-foreground">
              Certificate #{certificate.certificate_number}
            </p>
          </div>
        </div>
        <Badge variant="secondary">Certified</Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>Issued: {new Date(certificate.issue_date).toLocaleDateString()}</span>
        </div>
        {certificate.instructor_name && (
          <p className="text-sm text-muted-foreground">
            Instructor: {certificate.instructor_name}
          </p>
        )}
        {certificate.completion_score && (
          <p className="text-sm font-semibold text-primary">
            Score: {certificate.completion_score}%
          </p>
        )}
      </div>

      <Button onClick={handleDownload} className="w-full" variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Download Certificate
      </Button>
    </Card>
  );
};
