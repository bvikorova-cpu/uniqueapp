export type Lang = "en" | "sk" | "hu";

export type SceneText = {
  kicker?: string;
  title?: string;
  copy?: string;
  details?: string[];
  facts?: string[];
  /** Narration text used for TTS generation (story scenes only). */
  voice?: string;
};

export const INTRO_TEXT: Record<Lang, SceneText> = {
  en: { title: "uniqueapp.fun", copy: "The social wall for creators" },
  sk: { title: "uniqueapp.fun", copy: "Sociálna stena pre tvorcov" },
  hu: { title: "uniqueapp.fun", copy: "A közösségi fal alkotóknak" },
};

export const OUTRO_TEXT: Record<Lang, SceneText> = {
  en: { title: "uniqueapp.fun", copy: "Your feed. Your rules. Your income." },
  sk: { title: "uniqueapp.fun", copy: "Tvoj feed. Tvoje pravidlá. Tvoj príjem." },
  hu: { title: "uniqueapp.fun", copy: "A te feed-ed. A te szabályaid. A te bevételed." },
};

export const STORY_TEXT: Record<Lang, SceneText[]> = {
  en: [
    {
      kicker: "WELCOME TO",
      title: "SOCIAL WALL",
      copy: "Where creation meets AI & real cash",
      details: [
        "Share photos, videos, stories and everyday moments in one vibrant creator community.",
        "Connect with your audience, build momentum and turn genuine engagement into real value.",
      ],
      facts: ["Post", "Connect", "Earn"],
    },
    {
      kicker: "CREATE • GROW • EARN",
      title: "YOUR CONTENT.\nYOUR MOMENT.",
      copy: "The ultimate social hub for creators",
      details: [
        "Publish your ideas, reach new people and keep your community close with stories and 24-hour notes.",
        "Every post is another opportunity to grow your audience and creator presence.",
      ],
      facts: ["Photos & video", "Stories", "24h notes"],
    },
    {
      kicker: "BUILT IN",
      title: "SMART AI TOOLS",
      copy: "5 AI tools inside your wall",
      details: [
        "Plan, improve and evaluate content without leaving Social Wall.",
        "Practical AI guidance helps you make stronger creative decisions before you publish.",
      ],
    },
    {
      kicker: "BEFORE YOU POST",
      title: "AI VIRAL\nPREDICTOR",
      copy: "Score your viral potential",
      details: [
        "Analyze your draft before it goes live and see how strongly it may connect with viewers.",
        "Receive an instant score and focused recommendations to improve its potential.",
      ],
      facts: ["Viral score", "Instant tips"],
    },
    {
      kicker: "PERFECT TIMING",
      title: "AI CONTENT\nCALENDAR",
      copy: "Optimal posting schedule for peak reach",
      details: [
        "Turn your ideas into a clear weekly publishing plan built around the best posting times.",
        "Stay consistent and reach your audience when engagement is most likely.",
      ],
      facts: ["Best hours", "Weekly plan"],
    },
    {
      kicker: "MORE IMPACT",
      title: "ENHANCE &\nGO VIRAL",
      copy: "AI post enhancer + hashtag generator",
      details: [
        "Refine captions, sharpen your message and discover hashtags that match your content.",
        "Audience insights help every post feel more relevant, clear and engaging.",
      ],
      facts: ["Audience insights", "Smart hashtags"],
    },
    {
      kicker: "REAL VALUE",
      title: "UNIQUE GIFTS",
      copy: "Turn appreciation into income",
      details: [
        "Your audience can support the content they enjoy with expressive digital gifts.",
        "Each gift creates a memorable interaction while helping your creativity generate value.",
      ],
    },
    {
      kicker: "EXPRESS EVERYTHING",
      title: "360+ GIFTS",
      copy: "Animated gifts & collectibles",
      details: [
        "Choose from more than 360 animated gifts for celebrations, romance, travel and everyday reactions.",
        "Collectible designs make every message of support feel personal and fun.",
      ],
      facts: ["Hearts", "Diamonds", "Adventures"],
    },
    {
      kicker: "EARN REAL EUROS",
      title: "50% CASH\nPAYOUTS",
      copy: "Cashout from €20",
      details: [
        "Creators receive 50% of the value of eligible gifts directly in euros.",
        "Once your available earnings reach €20, you can request a convenient cashout.",
      ],
      facts: ["50% of gift value", "Paid in EUR"],
    },
    {
      kicker: "PLAY. CREATE. GROW.",
      title: "LEVEL UP",
      copy: "Growth that feels rewarding",
      details: [
        "Regular creative activity moves your profile forward and makes progress visible.",
        "Small daily actions build momentum, unlock milestones and keep creation exciting.",
      ],
    },
    {
      kicker: "EVERY ACTION COUNTS",
      title: "XP • STREAKS\n150+ BADGES",
      copy: "Unlock creator milestones",
      details: [
        "Earn XP for posts, comments and consistent daily activity across Social Wall.",
        "Maintain your streak and discover more than 150 badges celebrating your creator journey.",
      ],
      facts: ["XP for posts", "Daily streaks", "150+ badges"],
    },
    {
      kicker: "ANYTIME",
      title: "WATCH & EARN",
      copy: "Extra XP from short videos",
      details: [
        "Watch quick 15-second videos whenever you want to collect extra XP.",
        "Unlimited viewing gives you another simple way to progress between posts.",
      ],
      facts: ["15s videos", "Unlimited"],
    },
    {
      kicker: "MAKE IT YOURS",
      title: "YOUR SPACE.\nYOUR STYLE.",
      copy: "A wall as unique as you",
      details: [
        "Shape an online space that reflects your personality, content and creative identity.",
        "Your Social Wall can feel recognizably yours from the first glance.",
      ],
    },
    {
      kicker: "PERSONALIZE",
      title: "CUSTOM THEMES",
      copy: "Neon • Ocean • Purple & Pink",
      details: [
        "Switch between distinctive themes and color combinations to match your mood or brand.",
        "Personalization gives your everyday Social Wall experience a fresh visual identity.",
      ],
      facts: ["Themes", "Colors", "Your vibe"],
    },
    {
      kicker: "PEACE OF MIND",
      title: "SAFE COMMUNITY",
      copy: "Built-in tools put you in control",
      details: [
        "Mute unwanted words or users and decide what belongs in your personal experience.",
        "Practical safety controls help you focus on positive connections and creativity.",
      ],
      facts: ["Muted words", "Muted users", "Full control"],
    },
    {
      kicker: "JOIN TODAY",
      title: "CREATE. GROW.\nSTART EARNING.",
      copy: "uniqueapp.fun",
      details: [
        "Bring your content, community and creator ambitions together in one place.",
        "Join Unique today, build your momentum and turn engagement into opportunity.",
      ],
    },
  ],
  sk: [
    {
      kicker: "VITAJ V",
      title: "SOCIAL WALL",
      copy: "Kde sa tvorba spája s AI a reálnymi peniazmi",
      details: [
        "Zdieľaj fotky, videá, stories a bežné momenty v jednej živej komunite tvorcov.",
        "Spoj sa so svojím publikom a premeň skutočný záujem na reálnu hodnotu.",
      ],
      facts: ["Zverejni", "Spoj sa", "Zarábaj"],
      voice: "Vitaj na Social Wall. Zdieľaj fotky, videá a stories v jednej živej komunite tvorcov a premeň skutočný záujem publika na reálnu hodnotu.",
    },
    {
      kicker: "TVOR • RASTI • ZARÁBAJ",
      title: "TVOJ OBSAH.\nTVOJ MOMENT.",
      copy: "Sociálne centrum pre tvorcov",
      details: [
        "Zverejňuj svoje nápady, získavaj nových ľudí a udržuj komunitu blízko cez stories a 24-hodinové poznámky.",
        "Každý príspevok je ďalšia príležitosť rozšíriť tvoje publikum.",
      ],
      facts: ["Fotky a video", "Stories", "24h poznámky"],
      voice: "Zverejňuj svoje nápady, získavaj nových ľudí a udržuj komunitu blízko cez stories a dvadsaťštyri hodinové poznámky. Každý príspevok je ďalšia príležitosť rozšíriť publikum.",
    },
    {
      kicker: "SÚČASŤ APLIKÁCIE",
      title: "SMART AI NÁSTROJE",
      copy: "5 AI nástrojov priamo v stene",
      details: [
        "Plánuj, vylepšuj a vyhodnocuj obsah bez toho, aby si opustil Social Wall.",
        "Praktické AI odporúčania ti pomôžu rozhodovať sa lepšie ešte pred zverejnením.",
      ],
      voice: "Päť inteligentných AI nástrojov máš priamo v stene. Plánuj, vylepšuj a vyhodnocuj obsah a rozhoduj sa lepšie ešte pred zverejnením.",
    },
    {
      kicker: "PRED ZVEREJNENÍM",
      title: "AI VIRAL\nPREDICTOR",
      copy: "Zisti svoj virálny potenciál",
      details: [
        "Analyzuj koncept ešte pred zverejnením a zisti, ako silno môže zaujať divákov.",
        "Získaj okamžité skóre a konkrétne odporúčania na zlepšenie.",
      ],
      facts: ["Virálne skóre", "Okamžité tipy"],
      voice: "AI Viral Predictor analyzuje tvoj koncept ešte pred zverejnením. Získaš okamžité skóre a konkrétne odporúčania, ako zvýšiť jeho potenciál.",
    },
    {
      kicker: "SPRÁVNE ČASOVANIE",
      title: "AI OBSAHOVÝ\nKALENDÁR",
      copy: "Optimálny plán pre maximálny dosah",
      details: [
        "Premeň nápady na jasný týždenný plán postavený na najlepších časoch zverejnenia.",
        "Buď konzistentný a zasiahni publikum, keď je najaktívnejšie.",
      ],
      facts: ["Najlepšie hodiny", "Týždenný plán"],
      voice: "AI obsahový kalendár premení tvoje nápady na jasný týždenný plán. Zverejňuj v najlepších časoch a zasiahni publikum, keď je najaktívnejšie.",
    },
    {
      kicker: "VÄČŠÍ DOPAD",
      title: "VYLEPŠI A\nZAUJMI",
      copy: "AI vylepšovač príspevkov a hashtagy",
      details: [
        "Vylaď popisky, zostri svoje odkazy a nájdi hashtagy, ktoré sedia k tvojmu obsahu.",
        "Prehľady o publiku pomôžu, aby bol každý príspevok jasnejší a zaujímavejší.",
      ],
      facts: ["Prehľady o publiku", "Smart hashtagy"],
      voice: "Vylaď popisky, zostri svoj odkaz a nájdi hashtagy, ktoré sedia k tvojmu obsahu. Prehľady o publiku urobia každý príspevok jasnejším a zaujímavejším.",
    },
    {
      kicker: "REÁLNA HODNOTA",
      title: "UNIQUE GIFTS",
      copy: "Premeň uznanie na príjem",
      details: [
        "Tvoje publikum môže podporiť obsah, ktorý ho baví, výraznými digitálnymi darčekmi.",
        "Každý darček vytvorí zapamätateľnú interakciu a pomáha tvojej tvorbe zarábať.",
      ],
      voice: "Unique Gifts premenia uznanie na príjem. Tvoje publikum podporí obsah, ktorý ho baví, digitálnymi darčekmi a každý darček vytvorí zapamätateľnú interakciu.",
    },
    {
      kicker: "VYJADRI VŠETKO",
      title: "360+ DARČEKOV",
      copy: "Animované darčeky a zberateľské kúsky",
      details: [
        "Vyber si z viac ako 360 animovaných darčekov na oslavy, romantiku, cestovanie aj bežné reakcie.",
        "Zberateľské dizajny urobia každú podporu osobnou a zábavnou.",
      ],
      facts: ["Srdcia", "Diamanty", "Dobrodružstvá"],
      voice: "Vyber si z viac ako tristošesťdesiatich animovaných darčekov na oslavy, romantiku aj cestovanie. Zberateľské dizajny urobia každú podporu osobnou a zábavnou.",
    },
    {
      kicker: "ZARÁBAJ REÁLNE EURÁ",
      title: "50 % VÝPLATA\nV HOTOVOSTI",
      copy: "Výplata už od 20 €",
      details: [
        "Tvorcovia dostávajú 50 % z hodnoty oprávnených darčekov priamo v eurách.",
        "Keď tvoj dostupný zárobok dosiahne 20 €, môžeš požiadať o výplatu.",
      ],
      facts: ["50 % z hodnoty darčeka", "Vyplácané v EUR"],
      voice: "Tvorcovia dostávajú päťdesiat percent z hodnoty oprávnených darčekov priamo v eurách. Keď tvoj zárobok dosiahne dvadsať eur, môžeš požiadať o výplatu.",
    },
    {
      kicker: "HRAJ. TVOR. RASTI.",
      title: "LEVEL UP",
      copy: "Rast, ktorý sa odmeňuje",
      details: [
        "Pravidelná tvorivá aktivita posúva tvoj profil vpred a robí pokrok viditeľným.",
        "Malé denné kroky budujú tempo, odomykajú míľniky a udržujú tvorbu zábavnou.",
      ],
      voice: "Pravidelná tvorivá aktivita posúva tvoj profil vpred. Malé denné kroky budujú tempo, odomykajú míľniky a udržujú tvorbu zábavnou.",
    },
    {
      kicker: "KAŽDÁ AKCIA SA POČÍTA",
      title: "XP • SÉRIE\n150+ ODZNAKOV",
      copy: "Odomykaj míľniky tvorcu",
      details: [
        "Získavaj XP za príspevky, komentáre a pravidelnú dennú aktivitu na Social Wall.",
        "Udržuj sériu a objav viac ako 150 odznakov, ktoré oslavujú tvoju cestu tvorcu.",
      ],
      facts: ["XP za príspevky", "Denné série", "150+ odznakov"],
      voice: "Získavaj XP za príspevky, komentáre a pravidelnú dennú aktivitu. Udržuj sériu a objav viac ako stopäťdesiat odznakov, ktoré oslavujú tvoju cestu tvorcu.",
    },
    {
      kicker: "KEDYKOĽVEK",
      title: "WATCH & EARN",
      copy: "Extra XP z krátkych videí",
      details: [
        "Pozeraj krátke 15-sekundové videá vždy, keď chceš získať extra XP.",
        "Neobmedzené pozeranie je ďalší jednoduchý spôsob, ako sa posunúť vpred.",
      ],
      facts: ["15s videá", "Bez limitu"],
      voice: "Pozeraj krátke pätnásťsekundové videá vždy, keď chceš získať extra XP. Neobmedzené pozeranie je ďalší jednoduchý spôsob, ako sa posunúť vpred.",
    },
    {
      kicker: "UROB SI TO PODĽA SEBA",
      title: "TVOJ PRIESTOR.\nTVOJ ŠTÝL.",
      copy: "Stena taká jedinečná ako ty",
      details: [
        "Vytvor priestor, ktorý odráža tvoju osobnosť, obsah aj tvorivú identitu.",
        "Tvoja Social Wall môže byť rozpoznateľne tvoja už na prvý pohľad.",
      ],
      voice: "Vytvor priestor, ktorý odráža tvoju osobnosť, obsah aj tvorivú identitu. Tvoja stena môže byť rozpoznateľne tvoja už na prvý pohľad.",
    },
    {
      kicker: "PERSONALIZÁCIA",
      title: "VLASTNÉ TÉMY",
      copy: "Neon • Ocean • Purple & Pink",
      details: [
        "Prepínaj medzi výraznými témami a kombináciami farieb podľa nálady alebo brandu.",
        "Personalizácia dá tvojej stene sviežu vizuálnu identitu.",
      ],
      facts: ["Témy", "Farby", "Tvoj vibe"],
      voice: "Prepínaj medzi výraznými témami a kombináciami farieb podľa nálady alebo svojho brandu. Personalizácia dá tvojej stene sviežu vizuálnu identitu.",
    },
    {
      kicker: "POKOJ NA DUŠI",
      title: "BEZPEČNÁ KOMUNITA",
      copy: "Nástroje, ktoré ti dávajú kontrolu",
      details: [
        "Stíš nechcené slová alebo používateľov a rozhodni, čo patrí do tvojho priestoru.",
        "Praktické bezpečnostné nastavenia ti pomôžu sústrediť sa na tvorbu.",
      ],
      facts: ["Stíšené slová", "Stíšení používatelia", "Plná kontrola"],
      voice: "Bezpečná komunita ti dáva kontrolu. Stíš nechcené slová alebo používateľov a rozhodni, čo patrí do tvojho priestoru, aby si sa mohol sústrediť na tvorbu.",
    },
    {
      kicker: "PRIDAJ SA DNES",
      title: "TVOR. RASTI.\nZARÁBAJ.",
      copy: "uniqueapp.fun",
      details: [
        "Spoj svoj obsah, komunitu a ambície tvorcu na jednom mieste.",
        "Pridaj sa k Unique ešte dnes a premeň záujem na príležitosť.",
      ],
      voice: "Spoj svoj obsah, komunitu a ambície tvorcu na jednom mieste. Pridaj sa k Unique ešte dnes na uniqueapp.fun a premeň záujem na príležitosť.",
    },
  ],
  hu: [
    {
      kicker: "ÜDVÖZLÜNK A",
      title: "SOCIAL WALL",
      copy: "Ahol az alkotás AI-jal és valódi pénzzel találkozik",
      details: [
        "Oszd meg fotóidat, videóidat, sztorijaidat és hétköznapi pillanataidat egy élő alkotói közösségben.",
        "Kapcsolódj a közönségedhez, és váltsd valódi értékre az őszinte figyelmet.",
      ],
      facts: ["Posztolj", "Kapcsolódj", "Keress"],
      voice: "Üdvözlünk a Social Wallon. Oszd meg fotóidat, videóidat és sztorijaidat egy élő alkotói közösségben, és váltsd valódi értékre a közönséged figyelmét.",
    },
    {
      kicker: "ALKOSS • NŐJ • KERESS",
      title: "A TE TARTALMAD.\nA TE PILLANATOD.",
      copy: "A tökéletes közösségi tér alkotóknak",
      details: [
        "Tedd közzé az ötleteidet, érj el új embereket, és tartsd közel a közösséged sztorikkal és 24 órás jegyzetekkel.",
        "Minden poszt újabb lehetőség a közönséged növelésére.",
      ],
      facts: ["Fotó és videó", "Sztorik", "24 órás jegyzetek"],
      voice: "Tedd közzé az ötleteidet, érj el új embereket, és tartsd közel a közösséged sztorikkal és huszonnégy órás jegyzetekkel. Minden poszt újabb lehetőség a növekedésre.",
    },
    {
      kicker: "BEÉPÍTVE",
      title: "OKOS AI ESZKÖZÖK",
      copy: "5 AI eszköz a falon belül",
      details: [
        "Tervezz, javíts és értékelj tartalmat anélkül, hogy elhagynád a Social Wallt.",
        "A gyakorlatias AI javaslatok segítenek jobb döntéseket hozni közzététel előtt.",
      ],
      voice: "Öt okos AI eszköz található közvetlenül a falon. Tervezz, javíts és értékelj tartalmat, és hozz jobb döntéseket még a közzététel előtt.",
    },
    {
      kicker: "POSZTOLÁS ELŐTT",
      title: "AI VIRAL\nPREDICTOR",
      copy: "Mérd fel a virális potenciált",
      details: [
        "Elemezd a vázlatot közzététel előtt, és nézd meg, mennyire szólíthatja meg a nézőket.",
        "Azonnali pontszámot és konkrét javaslatokat kapsz a javításhoz.",
      ],
      facts: ["Virális pontszám", "Azonnali tippek"],
      voice: "Az AI Viral Predictor közzététel előtt elemzi a vázlatodat. Azonnali pontszámot és konkrét javaslatokat kapsz, hogyan növelheted a potenciálját.",
    },
    {
      kicker: "TÖKÉLETES IDŐZÍTÉS",
      title: "AI TARTALOM\nNAPTÁR",
      copy: "Optimális ütemezés a legnagyobb elérésért",
      details: [
        "Alakítsd ötleteidet világos heti tervvé a legjobb közzétételi időpontok alapján.",
        "Legyél következetes, és érd el a közönséged, amikor a legaktívabb.",
      ],
      facts: ["Legjobb órák", "Heti terv"],
      voice: "Az AI tartalomnaptár világos heti tervvé alakítja az ötleteidet. Posztolj a legjobb időpontokban, és érd el a közönséged, amikor a legaktívabb.",
    },
    {
      kicker: "NAGYOBB HATÁS",
      title: "JAVÍTSD ÉS\nTERJEDJ",
      copy: "AI posztjavító és hashtag generátor",
      details: [
        "Csiszold a szövegeket, élesítsd az üzenetet, és találj a tartalmadhoz illő hashtageket.",
        "A közönségelemzések minden posztot érthetőbbé és érdekesebbé tesznek.",
      ],
      facts: ["Közönségelemzés", "Okos hashtagek"],
      voice: "Csiszold a szövegeket, élesítsd az üzenetet, és találj a tartalmadhoz illő hashtageket. A közönségelemzések minden posztot érthetőbbé és érdekesebbé tesznek.",
    },
    {
      kicker: "VALÓDI ÉRTÉK",
      title: "UNIQUE GIFTS",
      copy: "Váltsd bevételre az elismerést",
      details: [
        "A közönséged kifejező digitális ajándékokkal támogathatja a tartalmat, amit szeret.",
        "Minden ajándék emlékezetes interakciót teremt, és értéket ad az alkotásodnak.",
      ],
      voice: "A Unique Gifts bevételre váltja az elismerést. A közönséged digitális ajándékokkal támogatja a tartalmat, amit szeret, és minden ajándék emlékezetes interakciót teremt.",
    },
    {
      kicker: "FEJEZZ KI MINDENT",
      title: "360+ AJÁNDÉK",
      copy: "Animált ajándékok és gyűjthető darabok",
      details: [
        "Válassz több mint 360 animált ajándék közül ünneplésre, romantikára, utazásra és hétköznapi reakciókra.",
        "A gyűjthető dizájnok személyessé és szórakoztatóvá teszik a támogatást.",
      ],
      facts: ["Szívek", "Gyémántok", "Kalandok"],
      voice: "Válassz több mint háromszázhatvan animált ajándék közül ünneplésre, romantikára és utazásra. A gyűjthető dizájnok személyessé és szórakoztatóvá teszik a támogatást.",
    },
    {
      kicker: "KERESS VALÓDI EURÓT",
      title: "50% KÉSZPÉNZ\nKIFIZETÉS",
      copy: "Kifizetés már 20 €-tól",
      details: [
        "Az alkotók a jogosult ajándékok értékének 50%-át közvetlenül euróban kapják meg.",
        "Ha az elérhető bevételed eléri a 20 eurót, kifizetést kérhetsz.",
      ],
      facts: ["Az ajándék értékének 50%-a", "EUR-ban fizetve"],
      voice: "Az alkotók a jogosult ajándékok értékének ötven százalékát közvetlenül euróban kapják meg. Ha a bevételed eléri a húsz eurót, kifizetést kérhetsz.",
    },
    {
      kicker: "JÁTSSZ. ALKOSS. NŐJ.",
      title: "LEVEL UP",
      copy: "Növekedés, ami megéri",
      details: [
        "A rendszeres alkotói aktivitás előre viszi a profilodat, és láthatóvá teszi a fejlődést.",
        "A kis napi lépések lendületet adnak, mérföldköveket nyitnak, és izgalmasan tartják az alkotást.",
      ],
      voice: "A rendszeres alkotói aktivitás előre viszi a profilodat. A kis napi lépések lendületet adnak, mérföldköveket nyitnak, és izgalmasan tartják az alkotást.",
    },
    {
      kicker: "MINDEN LÉPÉS SZÁMÍT",
      title: "XP • SOROZATOK\n150+ JELVÉNY",
      copy: "Nyisd meg az alkotói mérföldköveket",
      details: [
        "Szerezz XP-t posztokért, kommentekért és a rendszeres napi aktivitásért a Social Wallon.",
        "Tartsd a sorozatot, és fedezz fel több mint 150 jelvényt az alkotói utad elismerésére.",
      ],
      facts: ["XP posztokért", "Napi sorozatok", "150+ jelvény"],
      voice: "Szerezz XP-t posztokért, kommentekért és a rendszeres napi aktivitásért. Tartsd a sorozatot, és fedezz fel több mint százötven jelvényt az alkotói utad elismerésére.",
    },
    {
      kicker: "BÁRMIKOR",
      title: "WATCH & EARN",
      copy: "Extra XP rövid videókból",
      details: [
        "Nézz rövid, 15 másodperces videókat, amikor csak extra XP-t szeretnél.",
        "A korlátlan megtekintés újabb egyszerű módja a fejlődésnek.",
      ],
      facts: ["15 mp-es videók", "Korlátlan"],
      voice: "Nézz rövid, tizenöt másodperces videókat, amikor csak extra XP-t szeretnél. A korlátlan megtekintés újabb egyszerű módja a fejlődésnek.",
    },
    {
      kicker: "ALAKÍTSD MAGADRA",
      title: "A TE TERED.\nA TE STÍLUSOD.",
      copy: "Egy fal, ami olyan egyedi, mint te",
      details: [
        "Alakíts ki online teret, amely tükrözi a személyiséged, tartalmad és alkotói identitásod.",
        "A Social Wallod már első pillantásra felismerhetően a tiéd lehet.",
      ],
      voice: "Alakíts ki online teret, amely tükrözi a személyiséged, tartalmad és alkotói identitásod. A falad már első pillantásra felismerhetően a tiéd lehet.",
    },
    {
      kicker: "SZEMÉLYRE SZABÁS",
      title: "EGYÉNI TÉMÁK",
      copy: "Neon • Ocean • Purple & Pink",
      details: [
        "Válts markáns témák és színkombinációk között a hangulatod vagy a márkád szerint.",
        "A személyre szabás friss látványt ad a napi élményednek.",
      ],
      facts: ["Témák", "Színek", "A te stílusod"],
      voice: "Válts markáns témák és színkombinációk között a hangulatod vagy a márkád szerint. A személyre szabás friss látványt ad a napi élményednek.",
    },
    {
      kicker: "NYUGALOM",
      title: "BIZTONSÁGOS KÖZÖSSÉG",
      copy: "Beépített eszközök a te kontrollod alatt",
      details: [
        "Némítsd a nem kívánt szavakat vagy felhasználókat, és döntsd el, mi kerül a teredbe.",
        "A gyakorlatias biztonsági beállítások segítenek az alkotásra koncentrálni.",
      ],
      facts: ["Némított szavak", "Némított felhasználók", "Teljes kontroll"],
      voice: "A biztonságos közösség neked adja a kontrollt. Némítsd a nem kívánt szavakat vagy felhasználókat, és döntsd el, mi kerül a teredbe, hogy az alkotásra koncentrálhass.",
    },
    {
      kicker: "CSATLAKOZZ MA",
      title: "ALKOSS. NŐJ.\nKERESS.",
      copy: "uniqueapp.fun",
      details: [
        "Hozd egy helyre a tartalmadat, a közösségedet és az alkotói céljaidat.",
        "Csatlakozz ma a Unique-hoz, és váltsd lehetőségre a figyelmet.",
      ],
      voice: "Hozd egy helyre a tartalmadat, a közösségedet és az alkotói céljaidat. Csatlakozz ma a Unique-hoz a uniqueapp.fun oldalon, és váltsd lehetőségre a figyelmet.",
    },
  ],
};
