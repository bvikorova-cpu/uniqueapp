import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lightbulb, Star, Brain, CheckCircle2, AlertTriangle, ListOrdered } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ChatResponseProps {
  result: {
    explanation: string;
    steps?: Array<{ title: string; detail: string }>;
    finalAnswer?: string;
    commonMistakes?: string[];
    funFacts?: string[];
    wasFiltered?: boolean;
  } | null;
  isLoading: boolean;
  question: string;
  subject: string;
}

const SUBJECT_EMOJI: Record<string, string> = {
  math: "📐", science: "🔬", english: "📖", history: "🏛️", geography: "🌍"
};

export const ChatResponse = ({ result, isLoading, question, subject }: ChatResponseProps) => {
  if (!isLoading && !result) return null;

  return (
    <>
      <FloatingHowItWorks title={"Chat Response - How it works"} steps={[{ title: 'Open', desc: 'Access the Chat Response section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Chat Response.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-3">
      {/* User question bubble */}
      {question && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-end"
        >
          <div className="max-w-[80%] bg-primary/10 border border-primary/20 rounded-2xl rounded-br-sm px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{SUBJECT_EMOJI[subject] || "📝"}</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase">{subject}</span>
            </div>
            <p className="text-sm text-foreground">{question}</p>
          </div>
        </motion.div>
      )}

      {/* AI response */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-start"
      >
        <div className="max-w-[90%] space-y-3">
          {/* AI avatar + typing */}
          <div className="flex items-start gap-3">
            <motion.div
              animate={isLoading ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl border border-primary/20 shrink-0"
            >
              {isLoading ? "🤔" : "🤖"}
            </motion.div>

            <div className="flex-1 space-y-3">
              {isLoading ? (
                <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center gap-1.5"
                    >
                      <Brain className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">AI is thinking</span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      >.</motion.span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                      >.</motion.span>
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                      >.</motion.span>
                    </motion.div>
                  </div>
                </div>
              ) : result ? (
                <AnimatePresence>
                  {/* Main explanation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold text-foreground">Explanation</span>
                    </div>
                    <div className="prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed">
                      <ReactMarkdown>{result.explanation}</ReactMarkdown>
                    </div>
                  </motion.div>

                  {/* Step-by-step */}
                  {result.steps && result.steps.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl px-4 py-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <ListOrdered className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-foreground">Step by Step</span>
                      </div>
                      <ol className="space-y-2">
                        {result.steps.map((s, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.08 }}
                            className="text-xs text-muted-foreground bg-card/50 p-2.5 rounded-lg"
                          >
                            <div className="font-semibold text-foreground mb-0.5">{i + 1}. {s.title}</div>
                            <div className="prose prose-sm max-w-none text-xs"><ReactMarkdown>{s.detail}</ReactMarkdown></div>
                          </motion.li>
                        ))}
                      </ol>
                    </motion.div>
                  )}

                  {/* Final answer */}
                  {result.finalAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Final Answer</span>
                      </div>
                      <p className="text-sm text-foreground font-medium">{result.finalAnswer}</p>
                    </motion.div>
                  )}

                  {/* Common mistakes */}
                  {result.commonMistakes && result.commonMistakes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-orange-500/10 border border-orange-500/20 rounded-2xl px-4 py-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">Watch Out</span>
                      </div>
                      <ul className="space-y-1">
                        {result.commonMistakes.map((m, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {m}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Fun facts */}
                  {result.funFacts && result.funFacts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Fun Facts!</span>
                      </div>
                      <ul className="space-y-1.5">
                        {result.funFacts.map((fact: string, i: number) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="text-xs text-muted-foreground bg-card/50 p-2 rounded-lg flex items-start gap-2"
                          >
                            <Star className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                            {fact}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Filtered tip */}
                  {result.wasFiltered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2 text-center"
                    >
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        💡 Tip: Try asking about school subjects like Math, Science, English, History, or Geography!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
};
