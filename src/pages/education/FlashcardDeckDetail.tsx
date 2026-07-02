import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDeckCards, useAddCard, useAIGenerateCards, useSRSQueue, useReviewCard } from "@/hooks/useFlashcards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, ArrowLeft, Eye } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_FLASHCARDDECKDETAIL_STEPS = [
  { title: 'Flip a card', desc: 'Tap to reveal the answer, then rate how well you knew it.' },
  { title: 'Spaced repetition', desc: 'Cards you struggled with come back sooner.' },
  { title: 'Track mastery', desc: "The deck shows how much you've truly memorised." },
  { title: 'Practice anywhere', desc: 'Works offline once opened on the PWA.' }
];
const __HIW_FLASHCARDDECKDETAIL = { title: 'Flashcard Deck', intro: 'Study a deck of flashcards with spaced repetition.', steps: __HIW_FLASHCARDDECKDETAIL_STEPS };


export default function FlashcardDeckDetail() {
  const { deckId } = useParams<{ deckId: string }>();
  const { data: cards = [] } = useDeckCards(deckId);
  const add = useAddCard();
  const aiGen = useAIGenerateCards();
  const { data: queue = [] } = useSRSQueue(deckId);
  const review = useReviewCard();

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [reviewIdx, setReviewIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = queue[reviewIdx];

  const handleReview = async (quality: number) => {
    if (!current) return;
    await review.mutateAsync({ cardId: current.card_id, quality });
    setFlipped(false);
    setReviewIdx((i) => i + 1);
  };

  return (
    <>
      <FloatingHowItWorks title={__HIW_FLASHCARDDECKDETAIL.title} intro={__HIW_FLASHCARDDECKDETAIL.intro} steps={__HIW_FLASHCARDDECKDETAIL.steps} />
      <Helmet><title>Deck · Flashcards</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-3xl">
        <Link to="/education/flashcards" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to decks
        </Link>

        <Tabs defaultValue="review">
          <TabsList>
            <TabsTrigger value="review">Review ({queue.length})</TabsTrigger>
            <TabsTrigger value="cards">All cards ({cards.length})</TabsTrigger>
            <TabsTrigger value="add">Add</TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="mt-6">
            {queue.length === 0 || reviewIdx >= queue.length ? (
              <Card className="backdrop-blur-xl bg-card/80">
                <CardContent className="p-10 text-center">
                  <p className="text-muted-foreground">No cards due. Come back later!</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-3">Card {reviewIdx + 1} of {queue.length}</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${current.id}-${flipped}`}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card
                      className="backdrop-blur-xl bg-card/80 min-h-[260px] cursor-pointer"
                      onClick={() => setFlipped((f) => !f)}
                    >
                      <CardContent className="p-8 text-center flex flex-col justify-center min-h-[260px]">
                        <p className="text-xs uppercase text-muted-foreground mb-3">{flipped ? "Back" : "Front"}</p>
                        <p className="text-xl font-medium">
                          {flipped ? current.education_flashcards?.back : current.education_flashcards?.front}
                        </p>
                        {!flipped && <p className="text-xs text-muted-foreground mt-6"><Eye className="w-3 h-3 inline mr-1" />Tap to flip</p>}
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>

                {flipped && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <Button variant="destructive" onClick={() => handleReview(0)}>Again</Button>
                    <Button variant="outline" onClick={() => handleReview(3)}>Hard</Button>
                    <Button variant="secondary" onClick={() => handleReview(4)}>Good</Button>
                    <Button onClick={() => handleReview(5)}>Easy</Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cards" className="mt-6 space-y-2">
            {cards.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">No cards yet.</p>
            ) : (
              cards.map((c) => (
                <Card key={c.id} className="backdrop-blur-xl bg-card/80">
                  <CardContent className="p-4 grid grid-cols-2 gap-3">
                    <div className="text-sm">{c.front}</div>
                    <div className="text-sm text-muted-foreground">{c.back}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-6 space-y-6">
            <Card className="backdrop-blur-xl bg-card/80">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Generate with AI</h3>
                <Input placeholder="Topic (e.g. French verbs, cell biology)" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} />
                <Button
                  disabled={!aiTopic || aiGen.isPending}
                  onClick={async () => {
                    if (!deckId) return;
                    await aiGen.mutateAsync({ deckId, topic: aiTopic, count: 10 });
                    setAiTopic("");
                  }}
                >
                  {aiGen.isPending ? "Generating..." : "Generate 10 cards"}
                </Button>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-card/80">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold">Add manually</h3>
                <Input placeholder="Front" value={front} onChange={(e) => setFront(e.target.value)} />
                <Textarea placeholder="Back" value={back} onChange={(e) => setBack(e.target.value)} />
                <Button
                  disabled={!front || !back || add.isPending}
                  onClick={async () => {
                    if (!deckId) return;
                    await add.mutateAsync({ deck_id: deckId, front, back });
                    setFront(""); setBack("");
                    toast.success("Card added");
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add card
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
