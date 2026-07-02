import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Layers, Loader2, Copy, Check, Sparkles, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorialAICredits } from "@/hooks/useTutorialAICredits";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDITS_COST = 4;

interface Props { onBack: () => void; }

interface Flashcard { front: string; back: string; }

export function AIFlashcardMakerView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isDeducting, checkAndDeduct } = useTutorialAICredits();
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [cardCount, setCardCount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateFlashcards = async () => {
    if (!topic.trim()) {
      toast({ title: "Missing Topic", description: "Please enter a topic", variant: "destructive" });
      return;
    }
    setLoading(true);
    setCards([]);
    setCurrentCard(0);
    setFlipped(false);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'generate-flashcards', topic, content, cardCount: parseInt(cardCount) }
      });
      if (error) throw error;
      const text = data?.result || "";
      const parsed: Flashcard[] = [];
      const sections = text.split(/(?:^|\n)(?:#{1,3}\s*)?(?:Card|Flashcard|Q)\s*#?\d+/i).filter(Boolean);
      if (sections.length > 1) {
        sections.forEach(section => {
          const frontMatch = section.match(/(?:Front|Question|Q)[:\s]*(.+?)(?:\n|$)/i);
          const backMatch = section.match(/(?:Back|Answer|A)[:\s]*(.+?)(?:\n(?:Front|Question|Card|Flashcard|Q|$))/is);
          if (frontMatch && backMatch) {
            parsed.push({ front: frontMatch[1].trim(), back: backMatch[1].trim() });
          }
        });
      }
      if (parsed.length === 0) {
        const lines = text.split("\n").filter(l => l.trim());
        for (let i = 0; i < lines.length - 1; i += 2) {
          const front = lines[i].replace(/^(?:[-*•]\s*)?(?:Front|Q|Question)?[:\s]*/i, "").replace(/\*\*/g, "").trim();
          const back = lines[i + 1]?.replace(/^(?:[-*•]\s*)?(?:Back|A|Answer)?[:\s]*/i, "").replace(/\*\*/g, "").trim();
          if (front && back) parsed.push({ front, back });
        }
      }
      if (parsed.length === 0) {
        parsed.push({ front: "Generated Content", back: text.substring(0, 500) });
      }
      setCards(parsed);
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = cards.map((c, i) => `Card ${i + 1}\nQ: ${c.front}\nA: ${c.back}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Flashcard Maker View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Flashcard Maker View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Flashcard Maker View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Layers className="h-6 w-6 text-violet-500" /> AI Flashcard Maker
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px]">4 CR</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">Auto-generate study flashcards from any course content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-violet-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-violet-500" /> Source Material</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Topic</label>
              <Input placeholder="e.g. React Hooks, World War II, Organic Chemistry..." value={topic} onChange={e => setTopic(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Content (optional - paste notes/text)</label>
              <Textarea placeholder="Paste lecture notes, textbook content, or leave empty for AI-generated cards..." value={content} onChange={e => setContent(e.target.value)} rows={6} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Number of Cards</label>
              <Select value={cardCount} onValueChange={setCardCount}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 25].map(n => <SelectItem key={n} value={n.toString()}>{n} cards</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateFlashcards} disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : <><Layers className="h-4 w-4 mr-2" /> Generate Flashcards</>}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {cards.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-sm">{currentCard + 1} / {cards.length}</Badge>
                <Button variant="ghost" size="sm" onClick={handleCopy}>{copied ? <Check className="h-4 w-4" /> : <><Copy className="h-4 w-4 mr-1" /> Copy All</>}</Button>
              </div>
              <div className="relative min-h-[280px] cursor-pointer perspective-1000" onClick={() => setFlipped(!flipped)}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentCard}-${flipped}`}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`min-h-[280px] flex items-center justify-center p-8 text-center border-2 ${flipped ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" : "border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/10"}`}>
                      <div>
                        <Badge className={`mb-4 ${flipped ? "bg-emerald-500/20 text-emerald-500" : "bg-violet-500/20 text-violet-500"}`}>
                          {flipped ? "Answer" : "Question"}
                        </Badge>
                        <p className="text-lg font-semibold leading-relaxed">
                          {flipped ? cards[currentCard].back : cards[currentCard].front}
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">Tap to {flipped ? "see question" : "reveal answer"}</p>
                      </div>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" onClick={() => { setCurrentCard(Math.max(0, currentCard - 1)); setFlipped(false); }} disabled={currentCard === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setFlipped(false)}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => { setCurrentCard(Math.min(cards.length - 1, currentCard + 1)); setFlipped(false); }} disabled={currentCard === cards.length - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Card className="border-violet-500/20 min-h-[280px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Generate flashcards to start studying</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
