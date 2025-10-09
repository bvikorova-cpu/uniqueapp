export interface Topic {
  title: string;
  content: string;
}

export const courseContent: Record<string, Topic[]> = {
  "Základy účtovníctva": [
    {
      title: "Téma 1: Úvod do účtovníctva",
      content: `**Čo je účtovníctvo?**

Účtovníctvo je systematický proces zaznamenávania, triedenia a vyhodnocovania finančných transakcií podniku. Slúži na poskytovanie prehľadu o finančnom stave a výkonnosti spoločnosti.

**Základné princípy:**
- Princíp verného zobrazenia
- Princíp opatrnosti
- Princíp akruálneho účtovania
- Princíp súvzťažnosti

**Účtová osnova**

Účtová osnova je zoznam účtov, ktoré podnik používa na zaznamenávanie svojich obchodných operácií. V roku 2025 sa používa aktualizovaná účtová osnova podľa slovenských účtovných predpisov.

**Typy účtov:**
- Účty aktív (majetok)
- Účty pasív (zdroje krytia majetku)
- Účty nákladov
- Účty výnosov`
    },
    {
      title: "Téma 2: Účtovné doklady",
      content: `**Základné typy dokladov:**

**1. Externé doklady**
- Faktúry prijaté a vydané
- Výpisy z bankového účtu
- Pokladničné doklady
- Dodacie listy

**2. Interné doklady**
- Výdajky
- Príjemky
- Inventúrne súpisy
- Odpisy majetku

**Náležitosti účtovného dokladu:**
- Označenie účtovného dokladu
- Obsah účtovného prípadu
- Označenie zúčastnených osôb
- Peňažná suma alebo údaj o cene
- Dátum vyhotovenia
- Dátum uskutočnenia účtovného prípadu
- Podpis osoby zodpovednej za účtovný prípad`
    },
    {
      title: "Téma 3: Podvojné účtovníctvo",
      content: `**Princíp podvojnosti**

Každá účtovná operácia sa zaznamenáva na dvoch účtoch - jeden účet sa účtuje na strane Má dať (MD) a druhý na strane Dal (D). Súčet MD sa musí rovnať súčtu D.

**Príklad účtovania:**
Nákup tovaru v hodnote 1000 € na faktúru:
- MD: 132 Tovar (aktívum sa zvyšuje)
- D: 321 Dodávatelia (pasívum sa zvyšuje)

**Účtovné knihy:**
- Denník - chronologický záznam operácií
- Hlavná kniha - systematický záznam operácií
- Pomocné knihy (kniha pohľadávok, záväzkov, skladové karty)

**Účtovná uzávierka**

Proces, pri ktorom sa na konci účtovného obdobia kontrolujú a zatvára všetky účty. Výsledkom je účtovná závierka obsahujúca súvahu a výkaz ziskov a strát.`
    },
    {
      title: "Téma 4: Daň z pridanej hodnoty (DPH)",
      content: `**Základné informácie o DPH**

DPH je nepriama daň, ktorú platí konečný spotrebiteľ. Podnikateľ je len sprostredkovateľom medzi štátom a zákazníkom.

**Sadzby DPH v roku 2025:**
- Základná sadzba: 20%
- Znížená sadzba: 10% (potraviny, lieky, knihy)

**Registrácia k DPH:**
Povinná pri obrate nad 50 000 € za 12 po sebe nasledujúcich kalendárnych mesiacov.

**Evidencia:**
- Daňová povinnosť (DPH na výstupe)
- Nárok na odpočítanie (DPH na vstupe)
- Daňové priznanie k DPH

**Príklad:**
Nákup tovaru za 1200 € vrátane DPH (20%):
- Základ dane: 1000 €
- DPH: 200 €
- Celkom: 1200 €`
    },
    {
      title: "Téma 5: Mzdy a odvody",
      content: `**Hrubá mzda vs. čistá mzda**

Zamestnávateľ vypláca zamestnancovi čistú mzdu, ktorá je hrubá mzda znížená o odvody a dane.

**Odvody zamestnanca (2025):**
- Zdravotné poistenie: 4%
- Sociálne poistenie: 9,4%
- Daň z príjmov: podľa daňových pásiem

**Odvody zamestnávateľa:**
- Zdravotné poistenie: 10%
- Sociálne poistenie: 25,2%

**Príklad výpočtu:**
Hrubá mzda: 1500 €
- Zdravotné poistenie (4%): 60 €
- Sociálne poistenie (9,4%): 141 €
- Celkové odvody: 201 €
- Základ dane: 1299 €
- Daň (podľa tabuľky): približne 259,80 €
- Čistá mzda: približne 1039,20 €

**Mzdové doklady:**
- Mzdový list
- Potvrdenie o zdaniteľných príjmoch`
    },
    {
      title: "Téma 6: Majetok a odpisy",
      content: `**Členenie majetku:**

**1. Dlhodobý majetok**
- Dlhodobý nehmotný majetok (software, licencie)
- Dlhodobý hmotný majetok (budovy, stroje, vozidlá)
- Dlhodobý finančný majetok (cenné papiere, podiely)

**2. Obežný majetok**
- Zásoby (materiál, tovar, výrobky)
- Pohľadávky
- Finančný majetok (pokladnica, bankové účty)

**Odpisy majetku**

Odpisy vyjadrujú postupné opotrebovanie majetku počas jeho používania.

**Typy odpisov:**
- Účtovné odpisy
- Daňové odpisy (rovnomerné, zrýchlené)

**Príklad odpisovania:**
Nákup počítača za 1000 € (4-ročná životnosť):
- Ročný odpis: 250 €
- Mesačný odpis: 20,83 €`
    },
    {
      title: "Téma 7: Zásoby a inventarizácia",
      content: `**Oceňovanie zásob**

**Metódy oceňovania:**
- Cena obstarania (nákupná cena + vedľajšie náklady)
- FIFO (first in, first out)
- Vážený aritmetický priemer

**Inventarizácia**

Inventarizácia je fyzické zistenie skutočného stavu majetku a záväzkov k určitému dňu a porovnanie so stavom v účtovníctve.

**Typy inventarizácie:**
- Fyzická inventúra (počítanie, váženie, meranie)
- Dokladová inventúra (potvrdenie stavu dokladmi)

**Inventarizačný rozdiel:**
- Manko (skutočný stav < účtovný stav)
- Prebytok (skutočný stav > účtovný stav)

**Periodicita:**
- Ročná riadna inventúra
- Mimoriadna inventúra (pri zmene majetku, krádež)
- Priebežná inventúra (počas roka po častiach)`
    },
    {
      title: "Téma 8: Účtovná závierka",
      content: `**Súčasti účtovnej závierky:**

**1. Súvaha (bilancia)**
Prehľad majetku (aktív) a zdrojov jeho krytia (pasív) k určitému dňu.

**Aktíva:**
- Stále aktíva
- Obežné aktíva

**Pasíva:**
- Vlastné imanie
- Cudzie zdroje (záväzky)

**2. Výkaz ziskov a strát**
Prehľad nákladov a výnosov za účtovné obdobie.

**Výsledok hospodárenia:**
- Zisk: výnosy > náklady
- Strata: náklady > výnosy

**3. Poznámky**
Doplňujúce informácie k súvahe a výkazu ziskov a strát.

**Účtovná závierka musí:**
- Poskytovať verný a pravdivý obraz
- Byť zostavená k poslednému dňu účtovného obdobia
- Byť schválená štatutárnym orgánom`
    },
    {
      title: "Téma 9: Daň z príjmov",
      content: `**Daň z príjmov právnických osôb**

Základná sadzba dane: 21%

**Základ dane:**
Rozdiel medzi výnosmi a nákladmi upravený podľa zákona o dani z príjmov.

**Úpravy základu dane:**
- Pripočítateľné položky (nedaňové náklady)
- Odpočítateľné položky (daňové náklady nezahrnuté vo výnosoch)

**Daň z príjmov fyzických osôb**

**Daňové pásma (2025):**
- Do 42 325,14 €: 19%
- Nad 42 325,14 €: 25%

**Nezdaniteľné časti:**
- Základná nezdaniteľná časť
- Na manželku/manžela
- Na vyživované dieťa

**Daňový bonus na dieťa:**
Nárok na daňový bonus pri splnení podmienok.

**Príklad:**
Príjem: 30 000 €
Nezdaniteľná časť: 5 506,20 €
Základ dane: 24 493,80 €
Daň (19%): 4 653,82 €`
    },
    {
      title: "Téma 10: Zhrnutie a certifikácia",
      content: `**Kľúčové poznatky z kurzu:**

**1. Účtovné základy**
- Pochopenie účtovnej osnovy
- Princíp podvojného účtovníctva
- Práca s účtovnými dokladmi

**2. Daňová problematika**
- DPH a jej evidencia
- Daň z príjmov fyzických a právnických osôb
- Mzdové odvody

**3. Majetok a zásoby**
- Oceňovanie a odpisovanie majetku
- Inventarizácia zásob
- Evidencia pohľadávok a záväzkov

**4. Účtovná závierka**
- Zostavenie súvahy
- Výkaz ziskov a strát
- Poznámky k účtovnej závierke

**Praktické využitie:**
Absolvovaním tohto kurzu ste získali základné znalosti potrebné na vedenie jednoduchého účtovníctva, pochopenie účtovných výkazov a orientáciu v daňovej problematike.

**Ďalšie vzdelávanie:**
Odporúčame pokračovať v štúdiu špecializovaných oblastí účtovníctva alebo získať certifikáciu v oblasti účtovníctva a daní.`
    }
  ],
  
  "Marketing a reklama": [
    {
      title: "Téma 1: Úvod do marketingu",
      content: `**Čo je marketing?**

Marketing je proces plánovania a realizácie koncepcie, oceňovania, propagácie a distribúcie produktov, služieb a myšlienok s cieľom vytvoriť výmenu, ktorá uspokojuje ciele jednotlivcov a organizácií.

**Základné prvky marketingu (4P):**
- **Product** (Produkt) - čo ponúkate
- **Price** (Cena) - za koľko to ponúkate
- **Place** (Miesto) - kde to ponúkate
- **Promotion** (Propagácia) - ako to propagujete

**Marketing mix v roku 2025:**
Moderný marketing zahŕňa aj ďalšie P:
- People (Ľudia)
- Process (Proces)
- Physical Evidence (Fyzický dôkaz)

**Typy marketingu:**
- B2C (Business to Consumer)
- B2B (Business to Business)
- C2C (Consumer to Consumer)
- D2C (Direct to Consumer)`
    },
    {
      title: "Téma 2: Digitálny marketing",
      content: `**Formy digitálneho marketingu:**

**1. SEO (Search Engine Optimization)**
Optimalizácia webových stránok pre vyhľadávače ako Google.

**Kľúčové faktory:**
- Kľúčové slová
- Kvalitný obsah
- Technická optimalizácia
- Backlinky

**2. PPC (Pay-Per-Click)**
Platená reklama na vyhľadávačoch a sociálnych sieťach.

**Platformy:**
- Google Ads
- Facebook Ads
- Instagram Ads
- LinkedIn Ads

**3. Email marketing**
Komunikácia so zákazníkmi cez email.

**Typy emailov:**
- Newsletter
- Propagačné emaily
- Transakčné emaily
- Automatizované sekvencie

**4. Obsahový marketing (Content Marketing)**
Tvorba a distribúcia hodnotného obsahu pre cieľové publikum.

**Formy obsahu:**
- Blog články
- Videá
- Infografiky
- Podcasty
- E-knihy`
    },
    {
      title: "Téma 3: Sociálne médiá",
      content: `**Social Media Marketing v roku 2025**

**Hlavné platformy:**

**1. Facebook**
- Najväčšia sociálna sieť
- Vhodná pre B2C aj B2B
- Facebook Ads s pokročilým targetingom

**2. Instagram**
- Vizuálna platforma
- Stories, Reels, Shopping
- Ideálna pre mladšie publikum

**3. TikTok**
- Krátke videá
- Virálny potenciál
- Gen Z a mladší mileniáli

**4. LinkedIn**
- Profesionálna sieť
- B2B marketing
- Thought leadership

**5. YouTube**
- Videá všetkých dĺžok
- SEO pre videá
- Monetizácia obsahu

**Stratégie:**
- Pravidelné publikovanie
- Engagement s komunitou
- Influencer marketing
- User-generated content
- Platená reklama`
    },
    {
      title: "Téma 4: Obsahový marketing",
      content: `**Tvorba obsahu**

**Typy obsahu:**

**1. Blog**
- SEO optimalizované články
- Vzdelávacie príspevky
- Prípadové štúdie
- How-to návody

**2. Video obsah**
- YouTube videá
- TikTok/Reels
- Webináre
- Live streamy

**3. Vizuálny obsah**
- Infografiky
- Obrázky pre sociálne siete
- GIF-y a memes
- Grafický design

**4. Audio obsah**
- Podcasty
- Audio knihy
- Audionahrávky

**Content kalendár:**
Plánovanie obsahu na týždne a mesiace dopredu.

**Metriky úspešnosti:**
- Počet zobrazení
- Engagement rate
- Čas strávený na stránke
- Konverzný pomer
- Zdieľania`
    },
    {
      title: "Téma 5: Email marketing",
      content: `**Budovanie email listu**

**Metódy získavania emailov:**
- Lead magnety (e-knihy, checklisty)
- Webináre
- Súťaže
- Popup formuláre
- Landing pages

**Segmentácia**

Rozdelenie zoznamu podľa:
- Demografických údajov
- Správania
- Fázy v nákupnom cykle
- Záujmov

**Typy emailových kampaní:**

**1. Welcome séria**
Automatická séria emailov pre nových odoberateľov.

**2. Newsletter**
Pravidelné aktuality a obsah.

**3. Propagačné emaily**
Ponuky, zľavy, nové produkty.

**4. Abandonovaný košík**
Pripomienky pre zákazníkov, ktorí neukončili nákup.

**5. Re-engagement**
Aktivácia neaktívnych odoberateľov.

**Metriky:**
- Open rate (miera otvorení)
- Click-through rate (CTR)
- Conversion rate
- Unsubscribe rate`
    },
    {
      title: "Téma 6: Google Ads a PPC",
      content: `**Google Ads v roku 2025**

**Typy kampaní:**

**1. Search Ads**
Textové reklamy vo vyhľadávaní Google.

**2. Display Ads**
Bannerové reklamy na milónoch webov.

**3. Shopping Ads**
Produktové reklamy s obrázkami a cenami.

**4. Video Ads**
Reklamy na YouTube.

**5. Performance Max**
AI-driven kampane naprieč všetkými platformami Google.

**Kľúčové slová:**
- Broad match (široká zhoda)
- Phrase match (fráza)
- Exact match (presná zhoda)
- Negative keywords (negatívne kľúčové slová)

**Quality Score:**
Skóre kvality ovplyvňujúce cenu a pozíciu reklamy.

**Faktory:**
- Relevancia reklamy
- Očakávaný CTR
- Kvalita landing page

**Náklady:**
CPC (Cost Per Click), CPA (Cost Per Acquisition), ROAS (Return on Ad Spend)`
    },
    {
      title: "Téma 7: Influencer marketing",
      content: `**Typy influencerov:**

**1. Mega influenceri**
- Nad 1 milión followerov
- Vysoké náklady
- Široký dosah

**2. Macro influenceri**
- 100 000 - 1 milión followerov
- Stredné náklady
- Dobrý dosah a engagement

**3. Micro influenceri**
- 10 000 - 100 000 followerov
- Nižšie náklady
- Vysoký engagement
- Niche publikum

**4. Nano influenceri**
- Pod 10 000 followerov
- Minimálne náklady
- Veľmi vysoký engagement
- Lokálny dosah

**Spolupráca s influencermi:**

**Formy:**
- Sponzorované príspevky
- Affiliate marketing
- Darčeky produktov
- Ambasadorship
- Spoluautorstvo obsahu

**Výber influencera:**
- Relevancia k značke
- Engagement rate
- Autenticita
- Demografia publika
- História spolupráce`
    },
    {
      title: "Téma 8: Analytika a meranie",
      content: `**Kľúčové metriky (KPIs):**

**Web analytika:**
- Návštevnosť (Traffic)
- Bounce rate (miera opustenia)
- Conversion rate
- Priemerný čas na stránke
- Pages per session

**Social media metriky:**
- Reach (dosah)
- Impressions (zobrazenia)
- Engagement rate
- Follower growth
- Click-through rate

**Email metriky:**
- Open rate
- Click rate
- Conversion rate
- Unsubscribe rate

**ROI (Return on Investment)**

Výpočet: (Zisk - Náklady) / Náklady × 100%

**Nástroje:**

**1. Google Analytics 4**
Komplexná web analytika.

**2. Google Search Console**
SEO data z Google vyhľadávania.

**3. Facebook/Instagram Insights**
Štatistiky sociálnych sietí.

**4. Hotjar**
Heatmapy a nahrávky návštevníkov.

**5. SEMrush/Ahrefs**
SEO a konkurenčná analýza.`
    },
    {
      title: "Téma 9: Marketingová stratégia",
      content: `**Tvorba marketingovej stratégie:**

**1. Analýza situácie**

**SWOT analýza:**
- Strengths (silné stránky)
- Weaknesses (slabé stránky)
- Opportunities (príležitosti)
- Threats (hrozby)

**2. Stanovenie cieľov**

**SMART ciele:**
- Specific (špecifické)
- Measurable (merateľné)
- Achievable (dosiahnuteľné)
- Relevant (relevantné)
- Time-bound (časovo ohraničené)

**3. Identifikácia cieľového publika**

**Buyer persona:**
- Demografia
- Psychografia
- Správanie
- Potreby a bolesti
- Nákupný proces

**4. Positioning**

Ako chcete, aby vás vnímalo vaše publikum?

**5. Marketingový mix**

Kombinácia kanálov a taktík:
- Organické social media
- Platená reklama
- Email marketing
- Content marketing
- SEO

**6. Budget**

Rozdelenie rozpočtu podľa kanálov a cieľov.`
    },
    {
      title: "Téma 10: Trendy a budúcnosť marketingu",
      content: `**Marketingové trendy v roku 2025:**

**1. AI a automatizácia**
- AI copywriting
- Chatboty
- Prediktívna analytika
- Personalizácia v reálnom čase

**2. Video dominancia**
- Short-form video (TikTok, Reels)
- Live streaming
- Interaktívne videá
- Shoppable videos

**3. Voice search**
- Optimalizácia pre hlasové vyhľadávanie
- Smart speakers
- Konverzačný marketing

**4. Privacy-first marketing**
- Cookieless budúcnosť
- First-party data
- Transparentnosť

**5. Udržateľnosť**
- Green marketing
- Sociálna zodpovednosť
- Autentickosť

**6. AR/VR**
- Virtual try-ons
- Immersive experiences
- Metaverse marketing

**Budúce zručnosti:**
- Data literacy
- AI tools
- Video production
- Community building
- Storytelling

**Záver:**
Marketing sa neustále vyvíja. Kľúčom k úspechu je neustále vzdelávanie, testovanie nových prístupov a prispôsobovanie sa zmenám v správaní spotrebiteľov a technológiách.`
    }
  ]
};

// Generate default topics for courses not in the list
export const generateDefaultTopics = (courseName: string): Topic[] => {
  return [
    { title: `Téma 1: Úvod do ${courseName}`, content: `Základné informácie o téme ${courseName}. Táto téma poskytuje úvod do problematiky a definuje kľúčové pojmy.` },
    { title: `Téma 2: Základné pojmy ${courseName}`, content: `Kľúčová terminológia a definície potrebné na pochopenie ${courseName}.` },
    { title: `Téma 3: Praktické aplikácie`, content: `Praktické využitie poznatkov z ${courseName} v reálnych situáciách.` },
    { title: `Téma 4: Pokročilé techniky`, content: `Pokročilejšie metódy a postupy v oblasti ${courseName}.` },
    { title: `Téma 5: Riešenie problémov`, content: `Časté problémy a ich riešenia v ${courseName}.` },
    { title: `Téma 6: Prípadové štúdie`, content: `Reálne príklady a prípadové štúdie z praxe ${courseName}.` },
    { title: `Téma 7: Najlepšie postupy`, content: `Overené postupy a odporúčania pre ${courseName}.` },
    { title: `Téma 8: Nástroje a zdroje`, content: `Užitočné nástroje a zdroje pre ${courseName}.` },
    { title: `Téma 9: Trendy a budúcnosť`, content: `Aktuálne trendy a budúci vývoj v oblasti ${courseName}.` },
    { title: `Téma 10: Zhrnutie a certifikácia`, content: `Zhrnutie kľúčových poznatkov a informácie o certifikácii.` }
  ];
};
