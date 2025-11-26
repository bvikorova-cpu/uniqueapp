import { useEffect, useState } from "react";

interface Emoji {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
}

export const WallBackground = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  const emojiList = [
    "😊", "🎉", "❤️", "🔥", "✨", "🌟", "💫", "🎨", 
    "🎭", "🎪", "🎯", "🎸", "🎵", "💎", "🌈", "⚡",
    "🚀", "💪", "🏆", "👑", "🎬", "📸", "🎤", "🎧"
  ];

  useEffect(() => {
    // Generate random floating emojis
    const generateEmojis = () => {
      const newEmojis: Emoji[] = [];
      for (let i = 0; i < 20; i++) {
        newEmojis.push({
          id: i,
          emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
          left: Math.random() * 100,
          duration: 15 + Math.random() * 20,
          delay: Math.random() * 5,
          size: 20 + Math.random() * 30,
        });
      }
      setEmojis(newEmojis);
    };

    generateEmojis();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Much lighter base gradient with pink tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-100 to-indigo-200" />
      
      {/* Pink and purple animated gradient overlay */}
      <div className="absolute inset-0 opacity-50" 
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(244, 114, 182, 0.25) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(236, 72, 153, 0.25) 0%, transparent 50%), radial-gradient(ellipse at center, rgba(167, 139, 250, 0.2) 0%, transparent 50%)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 15s ease infinite'
        }}
      />
      
      {/* Softer colorful glow layers with more pink */}
      <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-pink-300/20 rounded-full blur-[130px] animate-pulse-slow" />
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-rose-300/18 rounded-full blur-[110px] animate-pulse-slow animation-delay-2000" />
      <div className="absolute bottom-0 left-1/4 w-[650px] h-[650px] bg-violet-300/15 rounded-full blur-[150px] animate-pulse-slow animation-delay-4000" />
      <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-fuchsia-300/17 rounded-full blur-[110px] animate-pulse-slow animation-delay-3000" />
      <div className="absolute bottom-1/4 left-1/2 w-[500px] h-[500px] bg-purple-300/14 rounded-full blur-[120px] animate-pulse-slow animation-delay-1000" />
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(rgba(236, 72, 153, 0.2) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(236, 72, 153, 0.2) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} 
      />

      {/* Floating emojis with animation */}
      <div className="absolute inset-0">
        {emojis.map((emoji) => (
          <div
            key={emoji.id}
            className="absolute animate-float-up opacity-60 hover:opacity-90 transition-opacity cursor-default"
            style={{
              left: `${emoji.left}%`,
              fontSize: `${emoji.size}px`,
              animationDuration: `${emoji.duration}s`,
              animationDelay: `${emoji.delay}s`,
              filter: 'drop-shadow(0 0 15px rgba(236, 72, 153, 0.7)) drop-shadow(0 0 10px rgba(167, 139, 250, 0.5))',
            }}
          >
            {emoji.emoji}
          </div>
        ))}
      </div>

      {/* Pink neon streaks */}
      <div className="absolute top-1/3 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-pink-400/40 to-transparent animate-slide-right shadow-[0_0_20px_rgba(236,72,153,0.5)]" />
      <div className="absolute top-2/3 right-0 w-full h-[3px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent animate-slide-left shadow-[0_0_20px_rgba(167,139,250,0.5)]" />
      
      {/* Enhanced sparkle effects with pink tones */}
      <div className="absolute top-[20%] left-[15%] w-3 h-3 bg-pink-400 rounded-full animate-sparkle shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
      <div className="absolute top-[60%] right-[25%] w-3 h-3 bg-rose-400 rounded-full animate-sparkle animation-delay-1000 shadow-[0_0_15px_rgba(244,114,182,0.8)]" />
      <div className="absolute bottom-[30%] left-[70%] w-3 h-3 bg-fuchsia-400 rounded-full animate-sparkle animation-delay-2000 shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
      <div className="absolute top-[40%] right-[60%] w-3 h-3 bg-violet-400 rounded-full animate-sparkle animation-delay-3000 shadow-[0_0_15px_rgba(167,139,250,0.8)]" />
    </div>
  );
};
