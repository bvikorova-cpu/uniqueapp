import { Card } from "@/components/ui/card";
import { useSecretSanta } from "@/hooks/useSecretSanta";
import { BarChart3, TrendingUp, Gift, Inbox, Heart, Calendar, Award, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const GiftAnalytics = () => {
  const { sentGifts, receivedGifts, credits } = useSecretSanta();

  const totalSentValue = sentGifts.reduce((sum: number, g: any) => sum + (g.gift_value || 0), 0);
  const totalReceivedValue = receivedGifts.reduce((sum: number, g: any) => sum + (g.gift_value || 0), 0);

  // Calculate streak (consecutive days with gifts sent)
  const calculateStreak = () => {
    if (!sentGifts.length) return 0;
    const dates = [...new Set(sentGifts.map((g: any) => new Date(g.created_at).toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (dates[i] === expected.toDateString()) {
        streak++;
      } else break;
    }
    return streak;
  };

  // Most gifted category
  const getCategoryStats = () => {
    const cats: Record<string, number> = {};
    sentGifts.forEach((g: any) => {
      const type = g.gift_type || "unknown";
      cats[type] = (cats[type] || 0) + 1;
    });
    const sorted = Object.entries(cats).sort(([, a], [, b]) => b - a);
    return sorted.slice(0, 5);
  };

  const streak = calculateStreak();
  const topGifts = getCategoryStats();

  const stats = [
    { icon: Gift, label: "Gifts Sent", value: sentGifts.length, color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
    { icon: Inbox, label: "Gifts Received", value: receivedGifts.length, color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
    { icon: TrendingUp, label: "Total Value Sent", value: `💎 ${totalSentValue}`, color: "text-green-500", bg: "bg-green-50 border-green-200" },
    { icon: Heart, label: "Value Received", value: `💎 ${totalReceivedValue}`, color: "text-pink-500", bg: "bg-pink-50 border-pink-200" },
    { icon: Flame, label: "Current Streak", value: `${streak} days`, color: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
    { icon: Award, label: "Generosity Score", value: Math.min(100, Math.round((totalSentValue / Math.max(1, totalSentValue + totalReceivedValue)) * 100)), color: "text-purple-500", bg: "bg-purple-50 border-purple-200" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Gift Analytics - How it works"} steps={[{ title: 'Open', desc: 'Access the Gift Analytics section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gift Analytics.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-white/80 backdrop-blur-xl border-amber-200 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
          <BarChart3 className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Gift Analytics</h2>
        <p className="text-gray-500 text-sm">Track your gifting journey, streaks, and generosity score</p>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className={`p-4 ${s.bg} border shadow-sm`}>
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Streak card */}
      <Card className="p-5 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg border-transparent">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Flame className="h-8 w-8" />
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">Gifting Streak</p>
            <p className="text-4xl font-black">{streak} {streak === 1 ? "day" : "days"}</p>
            <p className="text-white/70 text-xs mt-1">
              {streak === 0 ? "Send a gift today to start your streak!" : streak >= 7 ? "🔥 You're on fire! Amazing streak!" : "Keep going! Send gifts daily."}
            </p>
          </div>
        </div>
      </Card>

      {/* Top gifts */}
      {topGifts.length > 0 && (
        <Card className="p-5 bg-white/80 border-amber-200 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" /> Most Sent Gifts
          </h3>
          <div className="space-y-2">
            {topGifts.map(([type, count], i) => (
              <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-500">#{i + 1}</span>
                  <span className="text-sm text-gray-700 capitalize">{type.replace(/_/g, " ")}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{count}x</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-4 bg-amber-50 border-amber-200 shadow-sm">
        <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Streak Tips
        </h3>
        <ul className="space-y-1 text-sm text-amber-700">
          <li>• Send at least one gift per day to maintain your streak</li>
          <li>• Higher streaks unlock special recognition on the leaderboard</li>
          <li>• Try the Gift Roulette for quick, anonymous daily gifting</li>
          <li>• Even small gifts (3-5 credits) count toward your streak!</li>
        </ul>
      </Card>
    </div>
    </>
  );
};
