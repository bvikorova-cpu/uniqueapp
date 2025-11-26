import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

export const WallBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate luxury particles
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: 2 + Math.random() * 4,
          duration: 3 + Math.random() * 4,
          delay: Math.random() * 3,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Luxury dark gradient base */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 40%),
            linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)
          `,
        }}
      />

      {/* Animated mesh gradient overlay */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(at 0% 0%, hsla(253,100%,67%,0.3) 0px, transparent 50%),
            radial-gradient(at 50% 0%, hsla(280,100%,70%,0.2) 0px, transparent 50%),
            radial-gradient(at 100% 0%, hsla(340,100%,76%,0.2) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(225,100%,67%,0.2) 0px, transparent 50%),
            radial-gradient(at 50% 50%, hsla(44,100%,50%,0.15) 0px, transparent 50%),
            radial-gradient(at 100% 50%, hsla(280,100%,67%,0.25) 0px, transparent 50%)
          `,
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 20s ease infinite',
        }}
      />

      {/* Premium glow orbs */}
      <div className="absolute top-[10%] left-[15%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] animate-pulse-slow" />
      <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[140px] animate-pulse-slow animation-delay-2000" />
      <div className="absolute bottom-[20%] left-[50%] w-[450px] h-[450px] bg-violet-600/18 rounded-full blur-[130px] animate-pulse-slow animation-delay-4000" />

      {/* Luxury geometric grid */}
      <div 
        className="absolute inset-0 opacity-[0.06]" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(rgba(251, 191, 36, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251, 191, 36, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px'
        }} 
      />

      {/* Floating luxury particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(251, 191, 36, 0.6) 100%)`,
              boxShadow: `0 0 ${particle.size * 3}px rgba(139, 92, 246, 0.5)`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Premium light streaks */}
      <div className="absolute top-[30%] left-0 w-full h-[1px]">
        <div 
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent animate-slide-right"
          style={{ animationDuration: '12s' }}
        />
      </div>
      <div className="absolute top-[70%] right-0 w-full h-[1px]">
        <div 
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent animate-slide-left"
          style={{ animationDuration: '15s' }}
        />
      </div>

      {/* Elegant sparkles */}
      <div className="absolute top-[15%] left-[20%] w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-sparkle" 
        style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' }}
      />
      <div className="absolute top-[45%] right-[30%] w-2 h-2 bg-gradient-to-br from-amber-400 to-yellow-300 rounded-full animate-sparkle animation-delay-1000" 
        style={{ boxShadow: '0 0 15px rgba(251, 191, 36, 0.6)' }}
      />
      <div className="absolute bottom-[35%] left-[60%] w-2.5 h-2.5 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full animate-sparkle animation-delay-2000" 
        style={{ boxShadow: '0 0 18px rgba(139, 92, 246, 0.6)' }}
      />
      <div className="absolute top-[60%] right-[15%] w-2 h-2 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full animate-sparkle animation-delay-3000" 
        style={{ boxShadow: '0 0 12px rgba(236, 72, 153, 0.6)' }}
      />

      {/* Hexagonal pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%238b5cf6' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />
    </div>
  );
};
