import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin } from "lucide-react";

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
    intro: "Rok 1947. Bol si najatý vyriešiť zmiznutie slávneho detektíva Jamesa Moriartyho. Jeho posledná správa hovorila o veľkom sprisahaní. Vkročil si do jeho kancelárie, kde všetko začalo...",
    rooms: [
      "Kancelária je presne tak, ako ju opustil. Káva na stole ešte teplá. Niečo tu nie je v poriadku...",
      "Tajná chodba za knižnicou! Moriarty mal evidentne čo skrývať. Tiene na stenách ti pripomínajú, že nie si sám...",
      "Konečne! Posledná miestnosť. Tu niekde musí byť odpoveď na všetky otázky. Ale pozor - pasca môže byť kdekoľvek."
    ],
    outro: "Unikol si! A s tebou aj pravda o Moriartyho zmiznutí. Teraz je čas odhaliť ju svetu..."
  },
  horror: {
    intro: "Prebúdzaš sa v opustenej nemocnici. Posledné, čo si pamätáš, je autonehoda. Ale niečo ti hovorí, že toto nie je obyčajná nemocnica...",
    rooms: [
      "Svetlá blikajú. Steny sú pokryté čímsi tmavým. Musíš sa dostať preč, kým 'oni' neprídu...",
      "Chodba sa zdá nekonečná. Počuješ kroky za sebou. Alebo je to len tvoja predstavivosť?",
      "Márnica. Miesto, kam sa dostávajú tí, čo neutiekli. Ty ale neutečieš... ak nenájdeš východ!"
    ],
    outro: "Svetlo! Čerstvý vzduch! Si vonku. Ale nočné mory z tejto noci ťa budú prenasledovať navždy..."
  },
  "sci-fi": {
    intro: "Rok 2347. Si člen posádky vesmírnej stanice Orion-7. Práve sa spustil alarm - systémy zlyhávajú a kyslík klesá. Máš 30 minút na únik...",
    rooms: [
      "Hlavná paluba je v chaose. Počítače hlásia kritické chyby. Musíš nájsť cestu k laboratóriu...",
      "Laboratórium obsahuje všetko potrebné pre prežitie. Ale experimenty sa vymkli kontrole...",
      "Strojovňa! Úniková kapsula je na dosah. Len aktivovať motory a si voľný!"
    ],
    outro: "Kapsula sa oddelila od stanice práve včas. Za tebou explózia. Pred tebou nekonečný vesmír a cesta domov..."
  },
  adventure: {
    intro: "1923, Egypt. Si archeológ na stope stratených pokladov faraóna Amenhotepa. Prepadol si sa do tajnej hrobky, o ktorej nikto nevedel...",
    rooms: [
      "Starobylá hrobka plná prachu tisícročí. Hieroglyfy na stenách rozprávajú príbehy dávno mŕtvych...",
      "Pokladnica! Zlato, drahokamy, artefakty nepredstaviteľnej hodnoty. Ale pozor na kliatbu faraónov...",
      "Sarkofágová sieň. Tu odpočíva faraón. A tu je aj tajný východ, ak si dosť múdry na jeho nájdenie."
    ],
    outro: "Denné svetlo po hodinách v tme! Prežil si kliatbu aj pasce. A príbeh, ktorý budeš rozprávať, bude legendárny..."
  },
  fantasy: {
    intro: "Bol si uväznený v Čarodejníkovej veži - väzení pre tých, ktorí sa vzpierali temnej mágii. Ale tvoja mágia je silnejšia, než si myslia...",
    rooms: [
      "Veža je plná magických predmetov a kúziel. Ale ktoré ti pomôžu a ktoré ťa zradia?",
      "Dračia jaskyňa pod vežou! Starý drak tu stráži poklady celé stáročia. Spí... zatiaľ.",
      "Elfský les - sloboda na dosah! Portál domov je blízko, len nájsť správne kúzlo..."
    ],
    outro: "Portál ťa preniesol domov! Si voľný a silnejší než predtým. Čarodejníkova moc nad tebou je navždy zlomená."
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
    title = "Príbeh začína...";
  } else if (roomIndex >= content.rooms.length) {
    // Outro
    narrativeText = content.outro;
    title = "Unikol si!";
  } else {
    narrativeText = content.rooms[roomIndex];
    title = roomName;
  }

  return (
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
                <span className="text-sm font-medium">Miestnosť {roomIndex + 1}</span>
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
                {roomIndex === -1 ? "Vstúpiť" : roomIndex >= content.rooms.length ? "Dokončiť" : "Pokračovať"}
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
  );
}

export default StoryNarrative;
