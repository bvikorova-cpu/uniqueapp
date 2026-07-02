import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Facebook, Twitter, Link as LinkIcon, Mail, Users, Trophy, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface LotterySocialSharingProps {
  onBack: () => void;
}

const SHARED_COMBOS = [
  { user: "LuckyMike", numbers: [7, 14, 21, 28, 35], bonus: [3], lottery: "EuroJackpot", likes: 42, wins: 1 },
  { user: "StarPlayer", numbers: [5, 12, 23, 34, 45], bonus: [8], lottery: "EuroJackpot", likes: 38, wins: 0 },
  { user: "NumGenius", numbers: [3, 17, 22, 39, 44], bonus: [11], lottery: "EuroJackpot", likes: 55, wins: 2 },
  { user: "LottoKing", numbers: [8, 15, 27, 33, 48], bonus: [6], lottery: "Powerball", likes: 29, wins: 0 },
];

export function LotterySocialSharing({ onBack }: LotterySocialSharingProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: string) => {
    toast.success(`Opening ${platform} to share! 🎰`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <FloatingHowItWorks
        title='Lottery Social Sharing'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Lottery Social Sharing panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Social Sharing
          </h2>
          <p className="text-sm text-muted-foreground">Share your lucky combos with friends</p>
        </div>
      </div>

      {/* Share Actions */}
      <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30">
        <CardContent className="pt-6">
          <h3 className="font-black mb-4 text-center">Share Your Latest Combination</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Facebook, label: "Facebook", color: "bg-blue-600 hover:bg-blue-700" },
              { icon: Twitter, label: "Twitter", color: "bg-sky-500 hover:bg-sky-600" },
              { icon: Mail, label: "Email", color: "bg-emerald-500 hover:bg-emerald-600" },
              { icon: Share2, label: "Share", color: "bg-violet-500 hover:bg-violet-600" },
            ].map(item => (
              <Button
                key={item.label}
                onClick={() => handleShare(item.label)}
                className={`${item.color} text-white gap-2`}
                size="sm"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
            <Button onClick={handleCopyLink} variant="outline" size="sm" className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community Shared Combos */}
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="font-black flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Community Shared Combinations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SHARED_COMBOS.map((combo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-blue-500/20 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-black">
                    {combo.user[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{combo.user}</p>
                    <p className="text-[10px] text-muted-foreground">{combo.lottery}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {combo.wins > 0 && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">
                      <Trophy className="h-3 w-3 mr-1" /> {combo.wins} win{combo.wins > 1 ? "s" : ""}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">❤️ {combo.likes}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {combo.numbers.map((num, idx) => (
                  <div key={idx} className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm">
                    {num}
                  </div>
                ))}
                {combo.bonus.map((num, idx) => (
                  <div key={`b-${idx}`} className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-black text-orange-500 text-sm">
                    {num}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
