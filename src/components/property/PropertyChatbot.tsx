import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bot, Send, User, Sparkles, Home, Calculator, MapPin, FileText } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const QUICK_PROMPTS = [
  { icon: Home, label: "Best areas to invest?", color: "from-blue-500 to-cyan-500" },
  { icon: Calculator, label: "How much can I afford?", color: "from-emerald-500 to-green-500" },
  { icon: MapPin, label: "Compare neighborhoods", color: "from-purple-500 to-violet-500" },
  { icon: FileText, label: "Documents needed to buy", color: "from-amber-500 to-orange-500" },
];

type Message = { role: "user" | "assistant"; content: string };

const AI_RESPONSES: Record<string, string> = {
  "Best areas to invest?": "Based on current market trends, here are the top investment areas:\n\n🏙️ **Downtown West** — 12% YoY appreciation, high rental demand\n🌿 **Green Valley** — Emerging area, affordable entry points, 8% growth\n🏗️ **Tech District** — New developments, 15% projected growth\n\nWould you like detailed analytics for any of these areas?",
  "How much can I afford?": "Let me help you calculate! Based on typical lending criteria:\n\n💰 **Rule of thumb**: You can afford 3-4x your annual income\n📊 **Monthly payment**: Should be <30% of monthly income\n🏦 **Down payment**: Typically 10-20% of property value\n\nFor a precise calculation, try our **Mortgage Calculator** tool! Would you like me to run specific numbers?",
  "Compare neighborhoods": "I can compare any neighborhoods! Here's a quick overview of popular areas:\n\n📍 **Downtown** — Score: 92/100 | Avg price: €3,200/m²\n📍 **Suburbs** — Score: 85/100 | Avg price: €1,800/m²\n📍 **City Center** — Score: 88/100 | Avg price: €4,100/m²\n\nUse our **Neighborhood Insights** tool for detailed analysis!",
  "Documents needed to buy": "Here's your complete buying checklist:\n\n📋 **Required Documents:**\n1. Valid ID / Passport\n2. Proof of income (last 3 months)\n3. Bank statements\n4. Tax returns (last 2 years)\n5. Pre-approval letter from bank\n6. Property valuation report\n\n📝 Use our **Document Manager** to organize everything!",
};

export function PropertyChatbot({ onBack }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Hi! I'm your AI Property Assistant. I can help you with property searches, market insights, mortgage questions, and more. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = AI_RESPONSES[text] || "Great question! Based on my analysis of current market data, I'd recommend exploring our specialized tools for detailed insights. You can use the **AI Valuator** for property pricing, **Market Analytics** for trends, or **Neighborhood Insights** for area analysis. Would you like me to guide you to any of these?";
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setTyping(false);
    }, 1200);
  };

  return (
    <>
      <FloatingHowItWorks title={"Property Chatbot - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Chatbot section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Chatbot.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">💬 AI Property Assistant</h2>
          <p className="text-sm text-muted-foreground">Ask anything about properties, markets, financing & more</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_PROMPTS.map((prompt, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => sendMessage(prompt.label)} className="cursor-pointer">
            <Card className="bg-card/60 backdrop-blur-xl border-border/30 hover:border-primary/30 transition-all">
              <CardContent className="p-3 text-center">
                <div className={`w-8 h-8 mx-auto rounded-lg bg-gradient-to-br ${prompt.color} flex items-center justify-center mb-2`}>
                  <prompt.icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-medium">{prompt.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-card/60 backdrop-blur-xl border-border/30">
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm whitespace-pre-line ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl p-3 flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
          </div>
          <div className="border-t border-border/30 p-3 flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about properties, pricing, neighborhoods..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)} className="flex-1" />
            <Button onClick={() => sendMessage(input)} size="icon" className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
