import { useState } from "react";
import { useCertificates, useIssueCertificate } from "@/hooks/useEducationGamification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Award, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_CERTIFICATES_STEPS = [
  { title: 'Complete a course', desc: 'Finish a full learning path or pass its final exam.' },
  { title: 'Get a certificate', desc: 'A shareable, verifiable certificate is issued to your profile.' },
  { title: 'Download or share', desc: 'Save the PDF or share the verification link.' }
];
const __HIW_CERTIFICATES = { title: 'Certificates', intro: "Certificates you've earned by completing courses and challenges.", steps: __HIW_CERTIFICATES_STEPS };


export default function Certificates() {
  const { data: certs = [] } = useCertificates();
  const issue = useIssueCertificate();
  const [courseTitle, setCourseTitle] = useState("");
  const [name, setName] = useState("");
  const [score, setScore] = useState(85);

  return (
    <>
      <FloatingHowItWorks title={__HIW_CERTIFICATES.title} intro={__HIW_CERTIFICATES.intro} steps={__HIW_CERTIFICATES.steps} />
      <Helmet><title>Certificates · Education</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-4xl">
        <h1 className="text-3xl font-black mb-6 flex items-center gap-2"><Award className="w-7 h-7 text-primary" /> My Certificates</h1>

        <Card className="backdrop-blur-xl bg-card/80 mb-6">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold">Claim a new certificate (after passing 70%+)</h3>
            <Input placeholder="Course title" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
            <Input placeholder="Recipient name (on certificate)" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="number" min={0} max={100} value={score} onChange={(e) => setScore(Number(e.target.value))} />
            <Button
              disabled={!courseTitle || issue.isPending}
              onClick={async () => {
                await issue.mutateAsync({ course_title: courseTitle, recipient_name: name, score });
                setCourseTitle("");
              }}
            >
              <Sparkles className="w-4 h-4 mr-1" /> Issue
            </Button>
          </CardContent>
        </Card>

        {certs.length === 0 ? (
          <Card className="backdrop-blur-xl bg-card/80">
            <CardContent className="p-10 text-center text-muted-foreground">No certificates yet.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certs.map((c: any) => (
              <Card key={c.id} className="backdrop-blur-xl bg-card/80 border-primary/30">
                <CardContent className="p-5">
                  <Award className="w-10 h-10 text-yellow-500 mb-2" />
                  <h3 className="font-bold text-lg">{c.course_title}</h3>
                  {c.recipient_name && <p className="text-sm">Awarded to <strong>{c.recipient_name}</strong></p>}
                  <p className="text-xs text-muted-foreground mt-2">Score: {Number(c.score).toFixed(0)}% · Issued {new Date(c.issued_at).toLocaleDateString()}</p>
                  <a className="text-xs text-primary mt-2 inline-block" href={`/cert/${c.certificate_code}`} target="_blank" rel="noreferrer">
                    Verify: /cert/{c.certificate_code}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
