import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Wand2, X, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreativeAITools, STYLE_TRANSFER_COST } from "@/hooks/useCreativeAITools";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const STYLES = [
  "Shakespeare", "Hemingway", "Tarantino", "Aaron Sorkin", "Stephen King",
  "Maya Angelou", "Neil Gaiman", "Chuck Palahniuk", "J.K. Rowling", "Cormac McCarthy",
  "Charles Bukowski", "Edgar Allan Poe", "Sylvia Plath", "Hunter S. Thompson",
];

interface Props {
  open: boolean;
  onClose: () => void;
  initialText: string;
  onApply: (text: string) => void;
}

export const ForgeStyleTransfer = ({ open, onClose, initialText, onApply }: Props) => {
  const [text, setText] = useState(initialText);
  const [style, setStyle] = useState("Hemingway");
  const [result, setResult] = useState<string | null>(null);
  const { styleTransfer } = useCreativeAITools();

  const run = async () => {
    if (!text.trim()) return;
    const res = await styleTransfer.mutateAsync({ text, targetStyle: style });
    setResult(res.rewritten);
  };

  if (!open) return null;

  return (
    <>
      <FloatingHowItWorks title={"Forge Style Transfer - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Style Transfer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Style Transfer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-amber-700/40 bg-[hsl(30,15%,8%)]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(251,191,36,0.2)]">
            <CardHeader className="pb-3 border-b border-amber-700/30 flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-amber-100" style={{ fontFamily: "Georgia, serif" }}>
                <Wand2 className="h-5 w-5 text-amber-400" />
                Style Transfer
                <Badge variant="outline" className="border-amber-600/40 text-amber-300 text-[10px] ml-2">{STYLE_TRANSFER_COST} cr</Badge>
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-amber-200 hover:text-amber-100 hover:bg-amber-900/20">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <label className="text-xs text-amber-200/80 mb-1 block">Your text</label>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={5}
                  placeholder="Paste the text you want to rewrite…"
                  className="bg-black/30 border-amber-700/40 text-amber-50 placeholder:text-amber-200/40"
                />
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-amber-200/80 mb-1 block">Rewrite in the style of</label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="bg-black/30 border-amber-700/40 text-amber-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={run}
                  disabled={styleTransfer.isPending || !text.trim()}
                  className="bg-amber-700 hover:bg-amber-600 text-white"
                >
                  {styleTransfer.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                  Transform
                </Button>
              </div>

              {result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="text-xs text-amber-200/80 mb-1 block flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" /> Rewritten in {style}'s style
                  </label>
                  <ScrollArea className="h-48 border border-amber-700/30 rounded-lg p-3 bg-black/40">
                    <pre className="whitespace-pre-wrap font-serif text-sm text-amber-50 leading-relaxed">{result}</pre>
                  </ScrollArea>
                  <Button
                    onClick={() => { onApply(result); onClose(); }}
                    className="mt-2 w-full bg-gradient-to-r from-amber-700 to-rose-700 hover:from-amber-600 hover:to-rose-600 text-white"
                  >
                    Use This Version
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </>
  );
};
