import { useState } from "react";
import { useDailyChallenge, useSubmitDaily } from "@/hooks/useEducationGamification";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Flame, CheckCircle2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_DAILYCHALLENGE_STEPS = [
  { title: 'Come back daily', desc: 'A new challenge unlocks every 24 hours.' },
  { title: 'Answer within the time', desc: 'Faster answers give bigger XP rewards.' },
  { title: 'Grow the streak', desc: 'Consecutive days multiply your rewards.' },
  { title: 'Miss a day?', desc: 'Use a Streak Freeze from Rewards to protect it.' }
];
const __HIW_DAILYCHALLENGE = { title: 'Daily Challenge', intro: 'A fresh mini-quiz every day to keep your streak alive.', steps: __HIW_DAILYCHALLENGE_STEPS };


export default function DailyChallenge() {
  const { data, isLoading, refetch } = useDailyChallenge();
  const submit = useSubmitDaily();
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  if (isLoading) return <div className="container mx-auto pt-20 px-4">Loading...</div>;
  if (!data?.challenge) return <div className="container mx-auto pt-20 px-4">No challenge today.</div>;

  const questions = data.challenge.payload?.questions ?? [];
  const q = questions[idx];

  const handleAnswer = async (option: string) => {
    const isCorrect = option === q.correct_answer;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    setCorrect(nextCorrect);
    if (idx + 1 >= questions.length) {
      const score = Math.round((nextCorrect / questions.length) * 100);
      await submit.mutateAsync({ challengeId: data.challenge.id, score });
      setDone(true);
      refetch();
    } else {
      setIdx(idx + 1);
    }
  };

  if (data.completed || done) {
    return (
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-xl">
      <FloatingHowItWorks title={__HIW_DAILYCHALLENGE.title} intro={__HIW_DAILYCHALLENGE.intro} steps={__HIW_DAILYCHALLENGE.steps} />
        <Helmet><title>Daily Challenge · Education</title></Helmet>
        <Card className="backdrop-blur-xl bg-card/80">
          <CardContent className="p-10 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-black mb-2">Already done today!</h2>
            <p className="text-muted-foreground">Score: {data.score ?? Math.round((correct / questions.length) * 100)}%</p>
            <p className="text-muted-foreground mt-4">Come back tomorrow for a new challenge.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Daily Challenge · Education</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-xl">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-black">Daily Challenge</h1>
          <span className="ml-auto text-sm text-muted-foreground">{idx + 1} / {questions.length}</span>
        </div>

        {q ? (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="backdrop-blur-xl bg-card/80 mb-4">
              <CardContent className="p-6">
                <p className="text-lg font-medium">{q.question}</p>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {(q.options ?? []).map((opt: string) => (
                <Button key={opt} variant="outline" className="w-full justify-start h-auto py-3" onClick={() => handleAnswer(opt)}>
                  {opt}
                </Button>
              ))}
            </div>
          </motion.div>
        ) : (
          <p>No questions available.</p>
        )}
      </div>
    </>
  );
}
