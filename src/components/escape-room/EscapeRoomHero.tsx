import heroVideo from "@/assets/escape-room-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function EscapeRoomHero() {
  return (
    <>
      <FloatingHowItWorks
        title="Escape Rooms - How it works"
        steps={[
          { title: "Browse", desc: "Choose a themed escape room from the gallery." },
          { title: "Unlock", desc: "Pay 8 credits to enter a room and start the timer." },
          { title: "Solve", desc: "Find clues, crack codes, and progress through each chamber." },
          { title: "Escape", desc: "Complete all rooms to earn points, badges, and leaderboard rank." },
        ]}
      />
      <div className="relative rounded-2xl overflow-hidden mb-8 h-[340px] md:h-[400px]">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[1.3] saturate-[1.2]"
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <div className="border-2 border-amber-400/40 bg-card/30 backdrop-blur-xl rounded-2xl px-6 py-4 mb-4 animate-pulse shadow-[0_0_40px_rgba(217,119,6,0.15)]">
            <h1 className="text-2xl md:text-4xl font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Virtual <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Escape Rooms</span>
            </h1>
          </div>
          <p className="text-white/90 font-semibold text-sm md:text-base max-w-xl drop-shadow-lg">
            Solve immersive puzzles, race against the clock & challenge your team
          </p>
        </div>
      </div>
    </>
  );
}
