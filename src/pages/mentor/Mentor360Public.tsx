import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { mentorCall } from "@/hooks/useMentorRouter";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_MENTOR360PUBLIC_STEPS = [
  { title: 'View progress publicly', desc: 'Only the milestones you chose to share are visible.' },
  { title: 'No personal data', desc: 'Sensitive details stay private in your account.' },
  { title: 'Share the link', desc: 'Great for accountability partners or coaches.' }
];
const __HIW_MENTOR360PUBLIC = { title: 'Mentor 360', intro: "A public shareable view of a mentee's progress.", steps: __HIW_MENTOR360PUBLIC_STEPS };


export default function Mentor360Public() {
  const { token } = useParams();
  const [req, setReq] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [rel, setRel] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;
    mentorCall("feedback360.get_by_token", { token })
      .then((r) => setReq(r.request))
      .catch((e) => toast.error(e.message));
  }, [token]);

  const submit = async () => {
    try {
      await mentorCall("feedback360.submit", { token, responses: answers, relationship: rel });
      setDone(true);
    } catch (e: any) { toast.error(e.message); }
  };

  if (done) return <div className="container mx-auto pt-20 max-w-md text-center"><h1 className="text-2xl font-black">Thank you 💜</h1><p className="text-muted-foreground">Your anonymous feedback was submitted.</p></div>;
  if (!req) return <div className="container mx-auto pt-20 text-center">Loading...</div>;

  return (
    <>
      <FloatingHowItWorks title={__HIW_MENTOR360PUBLIC.title} intro={__HIW_MENTOR360PUBLIC.intro} steps={__HIW_MENTOR360PUBLIC.steps} />
      <Helmet><title>Anonymous 360° Feedback</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-xl">
        <h1 className="text-2xl font-black mb-2">Anonymous 360° feedback</h1>
        <p className="text-sm text-muted-foreground mb-4">Your honest answers help them grow. Identity stays anonymous.</p>
        <Card className="bg-card/80"><CardContent className="p-4 space-y-3">
          <Input placeholder="Relationship (friend / colleague / partner...)" value={rel} onChange={(e) => setRel(e.target.value)} />
          {(req.questions ?? []).map((q: string, i: number) => (
            <div key={i}>
              <label className="text-sm font-bold">{q}</label>
              <Textarea rows={3} value={answers[q] ?? ""} onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })} />
            </div>
          ))}
          <Button onClick={submit} className="w-full">Send feedback</Button>
        </CardContent></Card>
      </div>
    </>
  );
}
