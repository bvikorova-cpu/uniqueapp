import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, AlertCircle, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { motion, AnimatePresence } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const suggestedQuestions = [
  "Explain the Pythagorean theorem",
  "What is photosynthesis?",
  "How does gravity work?",
  "Explain World War II",
];

interface EnhancedChatProps {
  chatHistory: Array<{ role: string; content: string }>;
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  credits: number;
  creditsLoading: boolean;
  isUsingCredit: boolean;
}

export const EnhancedChat = ({
  chatHistory,
  chatMessage,
  setChatMessage,
  handleSendMessage,
  isLoading,
  credits,
  creditsLoading,
  isUsingCredit,
}: EnhancedChatProps) => {
  return (
    <>
      <FloatingHowItWorks title="How Enhanced Chat works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Tutoring</CardTitle>
              <CardDescription className="text-xs">1 credit = 1 message</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {creditsLoading ? "..." : credits} credits
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "⚡", title: "Instant Answers" },
            { icon: "📚", title: "All Subjects" },
            { icon: "📝", title: "Step by Step" },
            { icon: "🕐", title: "Available 24/7" },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/20 transition-colors"
            >
              <span className="text-sm">{f.icon}</span>
              <p className="text-[11px] font-medium">{f.title}</p>
            </motion.div>
          ))}
        </div>

        {!creditsLoading && credits < 1 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-medium text-destructive text-sm">No credits available</p>
              <p className="text-xs text-muted-foreground">Purchase credits above to continue learning.</p>
            </div>
          </div>
        )}

        <div className="min-h-[280px] max-h-[450px] overflow-y-auto space-y-3 p-3 bg-muted/10 rounded-xl border border-border/30">
          {chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-primary/50" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Start a conversation or try:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQuestions.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => setChatMessage(q)}
                    className="text-left text-xs p-2.5 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-primary inline mr-1.5" />
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {chatHistory.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                    ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm
                    ${msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border/50 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isLoading && (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-card border border-border/50 rounded-xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            placeholder="Write your question..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
            }}
            className="min-h-[60px] resize-none rounded-xl"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !chatMessage.trim() || credits < 1 || isUsingCredit}
            size="icon"
            className="h-[60px] w-[60px] rounded-xl"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
    );
};
