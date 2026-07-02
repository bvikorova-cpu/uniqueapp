import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bot, Send, TrendingUp, Lightbulb, BarChart3, Sparkles } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
}

const INITIAL_SUGGESTIONS = [
  "What skills are most in-demand right now?",
  "What should I learn based on my current skills?",
  "Which skills pair well with programming?",
  "What are the fastest-growing skill categories?",
];

const TRENDING_SKILLS = [
  { name: "AI & Machine Learning", growth: "+340%", emoji: "🤖" },
  { name: "Video Editing", growth: "+180%", emoji: "🎬" },
  { name: "No-Code Development", growth: "+220%", emoji: "⚡" },
  { name: "Digital Marketing", growth: "+150%", emoji: "📱" },
  { name: "UX Design", growth: "+160%", emoji: "🎨" },
  { name: "Data Analytics", growth: "+190%", emoji: "📊" },
];

const SKILL_RECOMMENDATIONS = [
  { category: "Tech", skills: ["Python", "React", "Cloud Computing", "Cybersecurity"], color: "from-blue-500 to-cyan-500" },
  { category: "Creative", skills: ["UI/UX Design", "Motion Graphics", "3D Modeling", "Photography"], color: "from-purple-500 to-pink-500" },
  { category: "Business", skills: ["Project Management", "Data Analysis", "Public Speaking", "Negotiation"], color: "from-amber-500 to-orange-500" },
  { category: "Languages", skills: ["Mandarin", "Spanish", "German", "Japanese"], color: "from-emerald-500 to-teal-500" },
];

const AI_RESPONSES: Record<string, { content: string; suggestions: string[] }> = {
  "What skills are most in-demand right now?": {
    content: "Based on current market data, the most in-demand skills on our platform are:\n\n🥇 **AI & Machine Learning** — 340% growth in exchanges\n🥈 **No-Code Development** — 220% growth\n🥉 **Data Analytics** — 190% growth\n\nTech skills dominate, but creative skills like **Video Editing** (+180%) and **UX Design** (+160%) are catching up fast. Language skills remain consistently popular, especially **Mandarin** and **Spanish**.",
    suggestions: ["How do I start learning AI?", "What creative skills should I pick up?", "Best skills for career change?"],
  },
  "What should I learn based on my current skills?": {
    content: "To give you personalized recommendations, I'd consider skill pairing strategies:\n\n🔗 **Complementary Skills** — Skills that enhance your existing ones\n🌉 **Bridge Skills** — Connect different domains\n🚀 **Future-Proof Skills** — High growth potential\n\nFor example, if you know **programming**, adding **data visualization** or **AI** creates powerful combinations. If you're in **design**, learning **prototyping tools** or **user research** makes you more versatile.",
    suggestions: ["I know programming, what next?", "I'm a designer, what pairs well?", "Skills for freelancing?"],
  },
  "Which skills pair well with programming?": {
    content: "Great question! Programming pairs exceptionally well with:\n\n💡 **Data Science** — Analyze data with Python/R\n🎨 **UI/UX Design** — Build beautiful, user-friendly apps\n📊 **Business Analytics** — Turn code into business value\n🤖 **AI/ML** — The hottest combo right now\n🔐 **Cybersecurity** — High demand, high pay\n📱 **Mobile Development** — Extend to mobile platforms\n\nThe **programming + AI** combination has seen the highest exchange requests on our platform this quarter.",
    suggestions: ["How to learn data science?", "Best resources for UI/UX?", "AI learning path?"],
  },
  default: {
    content: "That's a great question! Based on current trends and our platform data, I'd recommend focusing on skills that:\n\n✅ Have high demand in exchanges\n✅ Complement your existing skillset\n✅ Are future-proof and growing\n\nWould you like me to analyze a specific skill area, or should I suggest a personalized learning path based on your interests?",
    suggestions: ["Show me trending skills", "Personalized recommendations", "Best skills for beginners"],
  },
};

interface AISkillAdvisorProps {
  onBack: () => void;
}

export const AISkillAdvisor = ({ onBack }: AISkillAdvisorProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your **AI Skill Advisor**. I analyze market trends, platform data, and skill combinations to recommend the best skills for you to learn or teach.\n\nWhat would you like to know?",
      suggestions: INITIAL_SUGGESTIONS,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = AI_RESPONSES[text] || AI_RESPONSES.default;
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        suggestions: response.suggestions,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Skill Advisor - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Skill Advisor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Skill Advisor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <div className="flex items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" /> AI Skill Advisor
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-[600px] bg-card/80 backdrop-blur-xl border-border/50 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 border border-border/50"
                    }`}>
                      <div className="text-sm whitespace-pre-line">
                        {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                          part.startsWith("**") && part.endsWith("**")
                            ? <strong key={i}>{part.slice(2, -2)}</strong>
                            : <span key={i}>{part}</span>
                        )}
                      </div>
                      {msg.suggestions && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {msg.suggestions.map(s => (
                            <button
                              key={s}
                              onClick={() => handleSend(s)}
                              className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-muted-foreground">
                  <Bot className="w-4 h-4" />
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full bg-primary/50" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            <div className="p-4 border-t border-border/30">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend(input)}
                  placeholder="Ask about skills to learn..."
                  className="bg-muted/10 border-border/50"
                />
                <Button onClick={() => handleSend(input)} size="icon" disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Trending Skills */}
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/50">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Trending Skills
            </h3>
            <div className="space-y-2">
              {TRENDING_SKILLS.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer"
                  onClick={() => handleSend(`Tell me about ${skill.name}`)}
                >
                  <span className="text-xs font-medium flex items-center gap-2">
                    <span>{skill.emoji}</span> {skill.name}
                  </span>
                  <Badge variant="secondary" className="text-[10px] text-emerald-600">{skill.growth}</Badge>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Skill Recommendations */}
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/50">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Top Categories
            </h3>
            <div className="space-y-2">
              {SKILL_RECOMMENDATIONS.map((cat, i) => (
                <motion.div key={cat.category} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                  className="p-3 rounded-xl bg-muted/20 border border-border/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${cat.color}`} />
                    <span className="text-xs font-bold">{cat.category}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map(s => (
                      <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
    </>
  );
};
