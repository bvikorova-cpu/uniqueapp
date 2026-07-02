import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StoryNarrativeProps {
  theme: string;
  roomIndex: number;
  roomName: string;
  isTransition?: boolean;
  onContinue: () => void;
}

// Story narratives for each theme
const storyContent: Record<string, { intro: string; rooms: string[]; outro: string }> = {
  mystery: {
    intro: "Year 1947. You've been hired to solve the disappearance of the famous detective James Moriarty. His last message spoke of a grand conspiracy. You stepped into his office, where it all began...",
    rooms: [
      "The office is exactly as he left it. The coffee on the table is still warm. Something isn't right here...",
      "A secret passage behind the bookcase! Moriarty evidently had something to hide. Shadows on the walls remind you that you are not alone...",
      "Finally! The last room. The answer to all questions must be hidden here. But beware - a trap could be anywhere."
    ],
    outro: "You escaped! And with you, the truth about Moriarty's disappearance. Now it's time to reveal it to the world..."
  },
  horror: {
    intro: "You wake up in an abandoned hospital. The last thing you remember is a car accident. But something tells you this is no ordinary hospital...",
    rooms: [
      "Lights flicker. The walls are covered with something dark. You need to get out before 'they' come...",
      "The corridor seems endless. You hear footsteps behind you. Or is it just your imagination?",
      "The morgue. A place where those who didn't escape end up. But you won't escape... unless you find a way out!"
    ],
    outro: "Light! Fresh air! You're out. But the nightmares from this night will haunt you forever..."
  },
  "sci-fi": {
    intro: "Year 2347. You are a member of the crew of the space station Orion-7. An alarm has just sounded - systems are failing and oxygen is dropping. You have 30 minutes to escape...",
    rooms: [
      "The main deck is in chaos. Computers report critical errors. You must find your way to the laboratory...",
      "The laboratory contains everything necessary for survival. But experiments have gotten out of control...",
      "The engine room! The escape pod is within reach. Just activate the engines and you're free!"
    ],
    outro: "The capsule detached from the station just in time. Behind you, an explosion. Before you, the endless universe and the way home..."
  },
  adventure: {
    intro: "1923, Egypt. You are an archaeologist on the trail of the lost treasures of Pharaoh Amenhotep. You fell into a secret tomb that no one knew about...",
    rooms: [
      "An ancient tomb full of millennia of dust. Hieroglyphs on the walls tell stories of the long dead...",
      "Treasury! Gold, jewels, artifacts of unimaginable value. But beware of the curse of the pharaohs...",
      "Sarcophagus Hall. The pharaoh rests here. And here is also a secret exit, if you are clever enough to find it."
    ],
    outro: "Daylight after hours in darkness! You survived the curse and the traps. And the story you will tell will be legendary..."
  },
  fantasy: {
    intro: "You were imprisoned in the Wizard's Tower - a prison for those who defied dark magic. But your magic is stronger than they think...",
    rooms: [
      "The tower is full of magical items and spells. But which will help you and which will betray you?",
      "Dragon's Cave beneath the tower! An old dragon has guarded treasures here for centuries. He sleeps... for now.",
      "Elf forest - freedom within reach! The portal home is close, just find the right spell..."
    ],
    outro: "The portal has taken you home! You are free and stronger than before. The Wizard's power over you is broken forever."
  }
};

export function StoryNarrative({ 
  theme, 
  roomIndex, 
  roomName,
  isTransition = false,
  onContinue 
}: StoryNarrativeProps) {
  const content = storyContent[theme] || storyContent.mystery;
  
  // Determine which text to show
  let narrativeText: string;
  let title: string;
  
  if (roomIndex === -1) {
    // Intro
    narrativeText = content.intro;
    title = "Story begins...";
  } else if (roomIndex >= content.rooms.length) {
    // Outro
    narrativeText = content.outro;
    title = "Unikol si!";
  } else {
    narrativeText = content.rooms[roomIndex];
    title = roomName;
  }

  return (
    <>
      <FloatingHowItWorks title={"Story Narrative - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Narrative section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Narrative.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      >
        <div className="max-w-2xl w-full mx-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center"
          >
            {/* Location badge */}
            {roomIndex >= 0 && roomIndex < content.rooms.length && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6"
              >
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Room {roomIndex + 1}</span>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold text-white mb-8"
            >
              {title}
            </motion.h1>

            {/* Narrative text with typewriter effect simulation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none" />
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 italic">
                "{narrativeText}"
              </p>
            </motion.div>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="w-32 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8"
            />

            {/* Continue button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button
                size="lg"
                onClick={onContinue}
                className="group"
              >
                {roomIndex === -1 ? "Enter" : roomIndex >= content.rooms.length ? "Finish" : "Continue"}
                <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Ambient particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 10,
                }}
                animate={{
                  y: -10,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
    </>
  );
}

export default StoryNarrative;
