import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award } from "lucide-react";
import { CourseTest } from "@/components/courses/CourseTest";
import { Certificate } from "@/components/courses/Certificate";
import { CourseNavigation } from "@/components/courses/CourseNavigation";
import { TopicContent } from "@/components/courses/TopicContent";
import { useCourseProgress } from "@/hooks/useCourseProgress";

const CourseDetail = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const [showTest, setShowTest] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [userName, setUserName] = useState("");

  const { progress: courseProgress, statistics, isLoading, updateProgress, saveCompletedCourse } = useCourseProgress(courseName || "");

  const currentTopic = courseProgress?.current_topic || 0;
  const completedTopics = courseProgress?.completed_topics || [];

  const topics = [
    { 
      title: "Téma 1: Úvod do kurzu", 
      content: `Vitajte v tomto komplexnom vzdelávacom kurze. V tejto úvodnej téme sa oboznámite so základmi kurzu, jeho cieľmi a štruktúrou. Pochopenie týchto základov je kľúčové pre úspešné absolvovanie celého kurzu.

**Ciele kurzu:**
Hlavným cieľom tohto kurzu je poskytnúť vám komplexné vedomosti a praktické zručnosti, ktoré budete môcť okamžite aplikovať vo svojej práci alebo štúdiu. Kurz je navrhnutý tak, aby pokrýval nielen teoretické aspekty, ale aj praktické aplikácie a reálne príklady z praxe.

**Štruktúra kurzu:**
Kurz je rozdelený do 10 tém, pričom každá téma sa zameriava na špecifickú oblasť a postupne vás prevedie od základov až po pokročilé koncepty. Každá téma obsahuje podrobné vysvetlenia, príklady a praktické cvičenia, ktoré vám pomôžu lepšie pochopiť a zapamätať si preberanú látku.

**Očakávania a metodika:**
Od vás sa očakáva aktívna účasť a pravidelné štúdium. Odporúčame venovať každej téme dostatočný čas a vracať sa k materiálom podľa potreby. Kurz je postavený na princípe postupného budovania vedomostí, kde každá ďalšia téma nadväzuje na predchádzajúce.

**Hodnotenie a certifikát:**
Po dokončení všetkých tém budete mať možnosť absolvovať záverečný test, ktorý overí vaše znalosti. Po úspešnom absolvovaní testu získate oficiálny certifikát, ktorý môžete využiť vo svojom profesionálnom životopise.` 
    },
    { 
      title: "Téma 2: Základné pojmy", 
      content: `Táto téma je venovaná hlbokému pochopeniu základných pojmov a terminológie, ktorá je nevyhnutná pre zvládnutie pokročilejších častí kurzu. Bez pevných základov nie je možné efektívne napredovať k zložitejším témam.

**Terminológia a definície:**
V tejto časti sa naučíte kľúčové termíny a ich presné definície. Každý pojem je vysvetlený nielen teoreticky, ale aj s praktickými príkladmi, ktoré ilustrujú jeho použitie v reálnych situáciách. Je dôležité, aby ste si tieto pojmy nielen zapamätali, ale aj skutočne pochopili ich význam a kontexty ich použitia.

**Základné princípy:**
Okrem terminológie sa v tejto téme venujeme aj základným princípom, ktoré tvoria základ celej oblasti. Tieto princípy sú univerzálne a budú sa vám hodiť počas celého kurzu aj v praxi. Pochopenie týchto princípov vám umožní lepšie analyzovať problémy a hľadať efektívne riešenia.

**Vzájomné vzťahy pojmov:**
Dôležitou súčasťou tejto témy je aj pochopenie vzájomných vzťahov medzi jednotlivými pojmami. Žiadny pojem neexistuje izolovane a pochopenie týchto vzťahov vám pomôže vytvoriť si komplexný obraz o celej oblasti. Budeme sa venovať tomu, ako sa jednotlivé pojmy dopĺňajú a ako na seba vzájomne pôsobia.

**Praktické príklady:**
Ku každému pojmu sú priložené praktické príklady z reálneho sveta, ktoré vám pomôžu lepšie pochopiť jeho aplikáciu. Tieto príklady sú vybrané tak, aby pokrývali rôzne scenáre a situácie, s ktorými sa môžete stretnúť v praxi.` 
    },
    { 
      title: "Téma 3: Praktické aplikácie", 
      content: `Po zvládnutí teórie a základných pojmov je čas prejsť k praktickým aplikáciám. Táto téma sa zameriava na to, ako efektívne využiť získané vedomosti v reálnych situáciách a projektoch.

**Od teórie k praxi:**
Naučíte sa, ako previesť teoretické poznatky do praktických riešení. Prejdeme si krok za krokom proces aplikácie teórie na konkrétne problémy a situácie. Tento proces je kľúčový pre vaše pochopenie materiálu a schopnosť používať ho efektívne.

**Reálne scenáre:**
Budeme pracovať s reálnymi scenármi a prípadmi z praxe, ktoré vám ukážu, ako sa študovaná problematika uplatňuje v skutočnom svete. Tieto scenáre sú starostlivo vybrané tak, aby reprezentovali rôzne situácie a výzvy, s ktorými sa môžete stretnúť.

**Praktické cvičenia:**
Každá časť tejto témy obsahuje praktické cvičenia, ktoré vám umožnia priamo aplikovať naučené poznatky. Tieto cvičenia sú navrhnuté tak, aby postupne zvyšovali svoju náročnosť a pomohli vám rozvíjať vaše zručnosti systematicky.

**Najčastejšie chyby:**
Dôležitou súčasťou praktického učenia je aj pochopenie najčastejších chýb a úskalí. V tejto téme sa dozviete, aké chyby robia začiatočníci najčastejšie a ako sa im vyhnúť. Táto znalost' vám ušetrí veľa času a frustrácie pri vašich vlastných projektoch.

**Best practices:**
Nakoniec sa naučíte aj osvedčené postupy a odporúčania, ktoré vám pomôžu dosiahnuť najlepšie výsledky. Tieto postupy sú založené na skúsenostiach odborníkov a overené v praxi.` 
    },
    { 
      title: "Téma 4: Pokročilé techniky", 
      content: `Táto téma vás prevedie pokročilejšími technikami a metódami, ktoré rozšíria vaše schopnosti a umožnia vám riešiť zložitejšie problémy efektívnejšie.

**Rozšírené koncepty:**
Nadviažeme na základné poznatky a predstavíme vám pokročilejšie koncepty a prístupy. Tieto koncepty sú kľúčové pre profesionálnu úroveň práce a ich zvládnutie vás odlíši od začiatočníkov.

**Optimalizácia procesov:**
Naučíte sa, ako optimalizovať vaše pracovné procesy a dosiahnuť lepšie výsledky s menším úsilím. Optimalizácia je dôležitá nielen pre úsporu času, ale aj pre zlepšenie kvality výsledkov.

**Pokročilé nástroje:**
Predstavíme vám pokročilé nástroje a techniky, ktoré používajú profesionáli v odbore. Tieto nástroje vám umožnia pracovať efektívnejšie a riešiť problémy, ktoré by inak boli príliš zložité.

**Integrácia techník:**
Dôležitou časťou tejto témy je aj naučiť sa, ako integrovať rôzne techniky a prístupy do komplexných riešení. V reálnom svete málokedy stačí použiť jedinú techniku - úspech často závisí od schopnosti kombinovať rôzne prístupy.

**Pokročilé riešenie problémov:**
Naučíte sa pokročilé metodiky riešenia problémov, ktoré vám umožnia analyzovať a riešiť aj tie najzložitejšie výzvy. Tieto metodiky sú založené na systematickom prístupe a overených postupoch.` 
    },
    { 
      title: "Téma 5: Riešenie problémov", 
      content: `Schopnosť efektívne riešiť problémy je jednou z najcennejších zručností v akomkoľvek odbore. Táto téma vás naučí systematický prístup k identifikácii a riešeniu problémov.

**Identifikácia problémov:**
Prvým krokom k riešeniu problému je jeho správna identifikácia. Naučíte sa rozpoznať symptómy problémov a identifikovať ich skutočné príčiny. Toto je kritická schopnosť, pretože riešenie symptómov bez odstránenia príčin vedie len k dočasným riešeniam.

**Analytický prístup:**
Predstavíme vám systematický analytický prístup k riešeniu problémov. Tento prístup vás prevedie krok za krokom od identifikácie problému cez analýzu možných riešení až po implementáciu a vyhodnotenie výsledkov.

**Bežné problémy a ich riešenia:**
V tejto časti sa pozrieme na najčastejšie problémy, s ktorými sa môžete stretnúť, a ich overené riešenia. Tieto príklady vám poslúžia ako referencia pri riešení podobných situácií.

**Preventívne opatrenia:**
Okrem riešenia existujúcich problémov sa naučíte aj preventívne opatrenia, ktoré pomôžu predchádzať problémom skôr, než vzniknú. Prevencia je vždy efektívnejšia než riešenie už vzniklých problémov.

**Dokumentácia a učenie sa z chýb:**
Dôležitou súčasťou procesu je aj správna dokumentácia problémov a ich riešení. Táto dokumentácia vám umožní učiť sa z minulých skúseností a neustále zlepšovať vaše postupy.` 
    },
    { 
      title: "Téma 6: Prípadové štúdie", 
      content: `Prípadové štúdie sú excelentným spôsobom, ako sa učiť z reálnych situácií a skúseností iných. V tejto téme analyzujeme konkrétne prípady a projekty, ktoré ilustrujú aplikáciu naučených konceptov.

**Výber prípadových štúdií:**
Vybrali sme rôznorodé prípadové štúdie, ktoré pokrývajú širokú škálu situácií a aplikácií. Každá štúdia predstavuje jedinečnú výzvu a ponúka cenné lekcie.

**Detailná analýza:**
Pri každej prípadovej štúdii vykonáme detailnú analýzu situácie, použitých prístupov a dosiahnutých výsledkov. Táto analýza vám pomôže pochopiť nielen to, čo bolo urobené, ale aj prečo to bolo urobené práve takýmto spôsobom.

**Úspechy a neúspechy:**
Dôležité je učiť sa nielen z úspechov, ale aj z neúspechov. Niektoré prípadové štúdie ukazujú, čo sa pokazilo a ako sa dalo situácii predísť alebo ju lepšie riešiť.

**Aplikovateľné lekcie:**
Z každej prípadovej štúdie vyvodíme konkrétne lekcie a aplikovateľné poznatky, ktoré môžete využiť vo svojej práci. Tieto lekcie sú formulované tak, aby boli praktické a priamo použiteľné.

**Komparatívna analýza:**
Porovnáme rôzne prístupy a riešenia použité v jednotlivých prípadoch a diskutujeme o ich výhodách a nevýhodách. Táto komparatívna analýza vám pomôže rozvíjať kritické myslenie a schopnosť vyhodnotiť rôzne možnosti.` 
    },
    { 
      title: "Téma 7: Najlepšie postupy", 
      content: `V tejto téme sa zameriame na overené postupy a odporúčania, ktoré vám pomôžu dosiahnuť excelentné výsledky vo vašej práci. Tieto postupy sú založené na skúsenostiach odborníkov a overené v praxi.

**Štandardy a metodiky:**
Predstavíme vám uznávané štandardy a metodiky, ktoré sa používajú v profesionálnom prostredí. Pochopenie a aplikácia týchto štandardov vás odlíši od amatérov a pomôže vám produkovať kvalitnú prácu.

**Efektívnosť a kvalita:**
Naučíte sa, ako dosiahnuť optimálnu rovnováhu medzi efektívnosťou a kvalitou. Nie vždy je najrýchlejšie riešenie to najlepšie a naopak - niekedy je potrebné nájsť kompromis.

**Odporúčania odborníkov:**
Zhromaždili sme odporúčania od skúsených odborníkov v odbore, ktoré pokrývajú širokú škálu situácií a aplikácií. Tieto odporúčania sú založené na reálnych skúsenostiach a osvedčených postupoch.

**Vytvorenie vlastných postupov:**
Hoci je dôležité poznať existujúce najlepšie postupy, rovnako dôležité je vedieť ich prispôsobiť vlastným potrebám a vytvoriť si vlastné efektívne postupy. V tejto téme sa naučíte, ako na to.

**Kontinuálne zlepšovanie:**
Najlepšie postupy nie sú statické - neustále sa vyvíjajú s novými poznatkami a skúsenosťami. Naučíte sa prístup kontinuálneho zlepšovania, ktorý vám umožní neustále zdokonaľovať vaše postupy.` 
    },
    { 
      title: "Téma 8: Nástroje a zdroje", 
      content: `Správne nástroje a zdroje môžu výrazne uľahčiť vašu prácu a zlepšiť výsledky. V tejto téme sa zoznámite s užitočnými nástrojmi a zdrojmi, ktoré vám pomôžu v ďalšom štúdiu a praxi.

**Prehľad dostupných nástrojov:**
Predstavíme vám široký výber nástrojov, ktoré sú k dispozícii pre rôzne účely a situácie. Pre každý nástroj vysvetlíme jeho hlavné funkcie, výhody a typické použitie.

**Výber správneho nástroja:**
Naučíte sa, ako vybrať správny nástroj pre konkrétnu úlohu. Nie každý nástroj je vhodný pre každú situáciu a výber správneho nástroja môže výrazne ovplyvniť efektívnosť vašej práce.

**Vzdelávacie zdroje:**
Okrem nástrojov pre praktickú prácu vám predstavíme aj kvalitné vzdelávacie zdroje - knihy, online kurzy, blogy, podcasty a ďalšie materiály, ktoré vám pomôžu v ďalšom vzdelávaní.

**Komunity a siete:**
Dôležitou súčasťou profesionálneho rastu je aj zapojenie do relevantných komunít a sietí. Predstavíme vám aktívne komunity, kde môžete zdieľať skúsenosti, klásť otázky a učiť sa od iných.

**Aktualizácia znalostí:**
Oblast' sa neustále vyvíja, preto je dôležité mať k dispozícii zdroje, ktoré vás budú informovať o nových trendoch, nástrojoch a postupoch. Naučíte sa, ako zostať aktuálny vo vašom odbore.` 
    },
    { 
      title: "Téma 9: Trendy a budúcnosť", 
      content: `Pochopenie aktuálnych trendov a budúceho vývoja je kľúčové pre dlhodobý úspech v akomkoľvek odbore. Táto téma vám poskytne pohľad na to, kam sa oblasť uberá a ako sa na to pripraviť.

**Aktuálne trendy:**
Analyzujeme najdôležitejšie aktuálne trendy v odbore a ich potenciálny dopad na vašu prácu. Pochopenie týchto trendov vám umožní lepšie sa adaptovať a využiť nové príležitosti.

**Emerging technologies:**
Predstavíme vám nové technológie a prístupy, ktoré sa objavujú na horizonte a majú potenciál zmeniť oblasť v budúcnosti. Rané pochopenie týchto technológií vám môže poskytnúť konkurenčnú výhodu.

**Predikcie a scenáre:**
Na základe analýzy trendov a vývoja sa pozrieme na možné budúce scenáre a ich implikácie. Hoci nie je možné presne predpovedať budúcnosť, pochopenie možných scenárov vám pomôže lepšie sa pripraviť.

**Príprava na budúcnosť:**
Naučíte sa, ako sa pripraviť na budúce výzvy a príležitosti. To zahŕňa rozvíjanie správnych zručností, budovanie správnych sietí a udržiavanie flexibility a adaptability.

**Celoživotné vzdelávanie:**
V rýchlo sa meniacom svete je celoživotné vzdelávanie nevyhnutnosťou. Predstavíme vám stratégie a prístupy k kontinuálnemu vzdelávaniu, ktoré vám umožnia zostať relevantný a úspešný aj v budúcnosti.` 
    },
    { 
      title: "Téma 10: Zhrnutie a záver", 
      content: `V tejto záverečnej téme si zhrnieme všetko, čo sme sa naučili počas kurzu, a pripravíme sa na záverečný test. Táto téma je navrhnutá tak, aby vám pomohla konsolidovať vaše vedomosti a pripraviť sa na ich aplikáciu v praxi.

**Komplexné zhrnutie:**
Prejdeme si kľúčové body každej témy a zopakujeme si najdôležitejšie koncepty, princípy a postupy. Toto zhrnutie vám pomôže upevniť si vedomosti a identifikovať oblasti, ktorým by ste sa mali venovať ešte viac.

**Integrácia poznatkov:**
Ukážeme vám, ako všetky naučené témy a koncepty spolu súvisia a vytvárajú komplexný celok. Pochopenie týchto vzájomných súvislostí je kľúčové pre efektívnu aplikáciu vedomostí v praxi.

**Príprava na test:**
Poskytneme vám tipy a stratégie na úspešné absolvovanie záverečného testu. Test je navrhnutý tak, aby overil nielen vaše teoretické vedomosti, ale aj schopnosť aplikovať ich na praktické problémy.

**Ďalšie kroky:**
Diskutujeme o možných ďalších krokoch vo vašom vzdelávaní a profesionálnom rozvoji. Kurz je len začiatok vašej cesty - predstavíme vám možnosti, ako pokračovať v učení a rozvoji vašich zručností.

**Záverečné odporúčania:**
Na záver vám poskytneme súhrn najdôležitejších odporúčaní a rád, ktoré vám pomôžu v úspešnej aplikácii naučených poznatkov vo vašej práci alebo štúdiu. Tieto odporúčania sú založené na skúsenostiach úspešných profesionálov a overené v praxi.

**Príprava na certifikáciu:**
Po úspešnom zvládnutí tejto témy budete pripravení na záverečný test a získanie certifikátu, ktorý potvrdí vaše nové vedomosti a zručnosti.` 
    },
  ];

  useEffect(() => {
    if (courseProgress) return;
    
    // Initialize progress for new users
    updateProgress({
      current_topic: 0,
      completed_topics: [],
    });
  }, [courseProgress]);

  const handleTopicComplete = (index: number) => {
    const newCompletedTopics = completedTopics.includes(index) 
      ? completedTopics 
      : [...completedTopics, index];
    
    const nextTopic = index === 9 ? 9 : index + 1;

    updateProgress({
      current_topic: nextTopic,
      completed_topics: newCompletedTopics,
    });

    if (index === 9) {
      setShowTest(true);
    }
  };

  const handleTopicSelect = (index: number) => {
    updateProgress({
      current_topic: index,
      completed_topics: completedTopics,
    });
  };

  const handleTestPass = (name: string) => {
    setUserName(name);
    setTestPassed(true);
    // Save with default passing score
    saveCompletedCourse({
      test_score: 85,
      user_name: name,
    });
  };

  const progressPercentage = (completedTopics.length / topics.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Načítavam kurz...</p>
        </div>
      </div>
    );
  }

  if (testPassed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
        <Certificate
          userName={userName}
          courseName={courseName || ""}
          completionDate={new Date().toLocaleDateString('sk-SK')}
        />
      </div>
    );
  }

  if (showTest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowTest(false)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na kurz
          </Button>
          <CourseTest
            courseName={courseName || ""}
            onTestPass={handleTestPass}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/education")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Späť na vzdelávanie
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl">{courseName}</CardTitle>
                <CardDescription className="mt-2">
                  Online kurz s certifikáciou
                </CardDescription>
              </div>
              <Award className="h-12 w-12 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Postup kurzu</span>
                  <span className="text-sm text-muted-foreground">
                    {completedTopics.length}/{topics.length} tém dokončených
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              {statistics && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Čas strávený: {statistics.time_spent_minutes} min</span>
                  <span>•</span>
                  <span>Dokončených tém: {completedTopics.length}/10</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CourseNavigation
              topics={topics}
              currentTopic={currentTopic}
              completedTopics={completedTopics}
              onTopicSelect={handleTopicSelect}
            />
          </div>

          <div className="lg:col-span-3">
            <TopicContent
              topic={topics[currentTopic]}
              topicIndex={currentTopic}
              totalTopics={topics.length}
              isCompleted={completedTopics.includes(currentTopic)}
              onComplete={() => handleTopicComplete(currentTopic)}
              timeSpent={statistics?.time_spent_minutes}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
