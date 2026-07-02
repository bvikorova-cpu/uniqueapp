import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_CERTIFICATEVERIFY_STEPS = [
  { title: 'Enter certificate ID', desc: 'Paste the ID printed on the certificate.' },
  { title: 'Instant lookup', desc: 'The verifier checks it against our database.' },
  { title: 'View the details', desc: "Owner, course, date and score are shown if it's valid." }
];
const __HIW_CERTIFICATEVERIFY = { title: 'Certificate Verification', intro: 'Verify a Unique learning certificate is genuine.', steps: __HIW_CERTIFICATEVERIFY_STEPS };


export default function CertificateVerify() {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!code) return;
      const { data } = await supabase
        .from("education_certificates")
        .select("*")
        .eq("certificate_code", code)
        .maybeSingle();
      setCert(data);
      setLoading(false);
    })();
  }, [code]);

  if (loading) return <div className="container mx-auto pt-20 px-4">Verifying...</div>;

  return (
    <>
      <FloatingHowItWorks title={__HIW_CERTIFICATEVERIFY.title} intro={__HIW_CERTIFICATEVERIFY.intro} steps={__HIW_CERTIFICATEVERIFY.steps} />
      <Helmet><title>Verify Certificate · Unique</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-xl">
        <Card className="backdrop-blur-xl bg-card/80">
          <CardContent className="p-10 text-center">
            {cert ? (
              <>
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <Award className="w-10 h-10 mx-auto mb-2 text-yellow-500" />
                <h1 className="text-2xl font-black mb-2">Verified Certificate</h1>
                <p className="text-lg">{cert.course_title}</p>
                {cert.recipient_name && <p className="mt-2">Awarded to <strong>{cert.recipient_name}</strong></p>}
                <p className="text-sm text-muted-foreground mt-2">Score: {Number(cert.score).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Issued {new Date(cert.issued_at).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground mt-4 font-mono">Code: {cert.certificate_code}</p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                <h1 className="text-xl font-bold">Certificate not found</h1>
                <p className="text-sm text-muted-foreground mt-2">Code: {code}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
