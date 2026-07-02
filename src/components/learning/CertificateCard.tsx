import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Calendar, Eye } from "lucide-react";
import { useState } from "react";
import { CertificateGenerator } from "./CertificateGenerator";
import { supabase } from "@/integrations/supabase/client";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
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
  const [showCertificate, setShowCertificate] = useState(false);
  const [userName, setUserName] = useState<string>("User");

  // Get user name from profile
  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data?.full_name) {
              setUserName(data.full_name);
            }
          });
      }
    });
  });

  return (
    <>
      <FloatingHowItWorks title="How Certificate Card works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <>
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

        <Button 
          onClick={() => setShowCertificate(true)} 
          className="w-full" 
          variant="outline"
        >
          <Eye className="w-4 h-4 mr-2" />
          View & Download Certificate
        </Button>
      </Card>

      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Your Professional Certificate</h2>
              <Button variant="ghost" onClick={() => setShowCertificate(false)}>
                Close
              </Button>
            </div>
            <CertificateGenerator
              userName={userName}
              courseName={certificate.title}
              completionDate={certificate.issue_date}
              certificateNumber={certificate.certificate_number}
              instructorName={certificate.instructor_name || "MegaMix Academy"}
              score={certificate.completion_score || undefined}
            />
          </div>
        </div>
      )}
    </>
    </>
    );
};
