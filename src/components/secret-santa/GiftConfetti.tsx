import { useEffect } from "react";
import confetti from "canvas-confetti";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface GiftConfettiProps {
  trigger: boolean;
  type?: "send" | "receive" | "badge" | "levelup" | "mystery";
}

export const GiftConfetti = ({ trigger, type = "send" }: GiftConfettiProps) => {
  useEffect(() => {
    if (!trigger) return;

    const runConfetti = () => {
      switch (type) {
        case "send":
          // Burst from bottom
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.9 },
            colors: ["#f59e0b", "#f97316", "#fbbf24", "#fcd34d"],
          });
          break;
        case "receive": {
          // Rain from top with hearts
          const end = Date.now() + 2000;
          const colors = ["#ff6b81", "#ff4757", "#ffa502", "#ff6348"];
          
          (function frame() {
            confetti({
              particleCount: 3,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: colors,
              shapes: ["circle"],
            });
            confetti({
              particleCount: 3,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: colors,
              shapes: ["circle"],
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          })();
          break;
        }
        case "badge": {
          // Star explosion
          const badgeDefaults = {
            spread: 360,
            ticks: 100,
            gravity: 0,
            decay: 0.94,
            startVelocity: 30,
            colors: ["#ffd700", "#ffb700", "#ff9500", "#ffffff"],
          };
          
          confetti({
            ...badgeDefaults,
            particleCount: 40,
            scalar: 1.2,
            shapes: ["star"],
          });
          confetti({
            ...badgeDefaults,
            particleCount: 10,
            scalar: 0.75,
            shapes: ["circle"],
          });
          break;
        }
        case "levelup": {
          // Grand celebration
          const duration = 3000;
          const animationEnd = Date.now() + duration;
          const levelColors = ["#FFD700", "#FFA500", "#FF69B4", "#00CED1", "#9370DB"];

          (function levelFrame() {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: levelColors,
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: levelColors,
            });

            if (Date.now() < animationEnd) {
              requestAnimationFrame(levelFrame);
            }
          })();

          // Center burst
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
              colors: levelColors,
            });
          }, 250);
          break;
        }
        case "mystery":
          // Mystery box reveal - sparkle effect
          confetti({
            particleCount: 50,
            spread: 360,
            ticks: 200,
            gravity: 0.5,
            origin: { x: 0.5, y: 0.5 },
            colors: ["#9333ea", "#c084fc", "#e879f9", "#f0abfc", "#faf5ff"],
            shapes: ["star", "circle"],
            scalar: 1.5,
          });
          break;
      }
    };

    runConfetti();
  }, [trigger, type]);

  return null;
};

// Particle animation component for continuous effects
export const ParticleEffect = ({ type }: { type: "sparkle" | "hearts" | "stars" }) => {
  return (
    <>
      <FloatingHowItWorks title={"Gift Confetti - How it works"} steps={[{ title: 'Open', desc: 'Access the Gift Confetti section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gift Confetti.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        >
          {type === "sparkle" && <span className="text-amber-400 text-lg">✨</span>}
          {type === "hearts" && <span className="text-pink-400 text-lg">💕</span>}
          {type === "stars" && <span className="text-yellow-400 text-lg">⭐</span>}
        </div>
      ))}
    </div>
    </>
  );
};
