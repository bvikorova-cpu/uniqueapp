import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface VocabWord {
  word: string;
  definition: string;
}

interface Props {
  summary: string;
  vocabulary: VocabWord[];
  onStartFlashcards: () => void;
  onStartQuiz: () => void;
}

export const InteractiveResults = ({ summary, vocabulary, onStartFlashcards, onStartQuiz }: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Interactive Results - How it works"} steps={[{ title: 'Open', desc: 'Access the Interactive Results section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Interactive Results.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          📝 Your Reading Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="summary">📋 Summary</TabsTrigger>
            <TabsTrigger value="vocabulary">🔤 Vocabulary ({vocabulary?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-background/60 border border-border/50"
            >
              <p className="text-sm leading-relaxed">{summary}</p>
            </motion.div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <span className="text-lg">💡</span>
              <p className="text-xs text-muted-foreground">
                Try the vocabulary flashcards to memorize new words, then take the quiz to test your understanding!
              </p>
            </div>
          </TabsContent>

          <TabsContent value="vocabulary" className="space-y-2">
            {vocabulary && vocabulary.length > 0 ? (
              vocabulary.map((word, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-xl bg-background/60 border border-border/50"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold text-sm">{word.word}</p>
                      <p className="text-xs text-muted-foreground">{word.definition}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-sm py-4">
                No new vocabulary found in this text.
              </p>
            )}
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            onClick={onStartFlashcards}
            variant="outline"
            className="gap-1"
            disabled={!vocabulary || vocabulary.length === 0}
          >
            🃏 Flashcards
          </Button>
          <Button onClick={onStartQuiz} className="gap-1">
            🎯 Take Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
