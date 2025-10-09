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
      title: "Téma 1: Moderná definícia marketingu",
      content: `**Čo je marketing?**

Marketing je dynamický a strategický proces, ktorý integruje multidisciplinárne prístupy a metódy s cieľom efektívne osloviť a uspokojiť zákazníkov, pričom je neoddeliteľnou súčasťou celkovej podnikovej stratégie.

**Hlavné komponenty:**

Tento proces kombinuje:
- Vedecké poznatky
- Analýzu veľkých dát
- Kreatívne myslenie
- Technologické inovácie

**Ciele marketingu:**

Marketing sa zameriava na:
- Dosiahnutie konkrétnych cieľov a KPI
- Skracovanie konverznej cesty zákazníka
- Budovanie osobnejších vzťahov s využitím emocionálnej inteligencie
- Vytváranie komunít okolo značky

**Marketing v digitálnej ére:**

V kontexte digitalizácie je marketing kľúčovým prvkom digitálnej transformácie podnikov. Dáta sú cenným aktívom, ktoré umožňuje:
- Personalizáciu ponúk
- Optimalizáciu marketingových aktivít
- Presné cielenie zákazníkov

**Udržateľnosť a etika:**

Moderný marketing kladie dôraz na:
- Ciele udržateľného rozvoja
- Spoločenskú zodpovednosť
- Etické konanie
- Budovanie dôvery zákazníkov`
    },
    {
      title: "Téma 2: Význam strategického marketingu pre podnikanie",
      content: `**Prečo je strategický marketing nevyhnutný?**

Strategický prístup k marketingu je nevyhnutný pre úspech každého podniku, pretože ide o komplexné a dlhodobé plánovanie, ktoré presahuje jednoduché využívanie reklamy.

**Marketing vs. Reklama:**

**Strategický marketing:**
- Celková vízia a smerovanie firmy
- Dlhodobé plánovanie
- Koordinované aktivity
- Integrácia všetkých obchodných cieľov

**Reklama:**
- Len jedna z mnohých taktík
- Krátkodobé ciele
- Čiastková aktivita

**Výhody strategického marketingu:**

**1. Budovanie silných značiek**
- Konzistentné správy
- Dlhodobé vzťahy so zákazníkmi
- Prepracované marketingové plány
- Integrácia od produktu po komunikáciu

**2. Flexibilita a inovácie**
- Rýchla reakcia na zmeny na trhu
- Využitie nových príležitostí
- Dôkladná analýza dát
- Pochopenie trhových trendov

**3. Optimalizácia zdrojov**
- Efektívne využívanie rozpočtu
- Investície do aktivít s najväčším dopadom
- Vyššia návratnosť investícií
- Lepší finančný výkon

**4. Jednotná vízia**
- Jasná komunikácia naprieč organizáciou
- Vyššia angažovanosť zamestnancov
- Produktivita
- Lojalita zákazníkov`
    },
    {
      title: "Téma 3: Strategický a taktický marketing",
      content: `**1. Strategický marketing**

**a) Marketingový výskum a analýza**

Kľúčové aktivity:
- Analýza trhu a konkurencie
- Segmentácia trhu
- Identifikácia cieľových trhov
- Zber a analýza dát

**b) Marketingová stratégia**

Zahŕňa:
- Definovanie marketingových cieľov
- Nastavenie kľúčových ukazovateľov výkonnosti (KPI)
- Dlhodobé plánovanie
- Integrácia marketingovej stratégie s celkovou podnikateľskou stratégiou

**2. Taktický marketing**

**a) Produktový marketing**

Oblasti:
- Vývoj a riadenie produktového portfólia
- Positioning produktov
- Životný cyklus produktu
- Správa produktových línií

**b) Cenová politika**

Stratégie:
- Cenotvorba
- Stratégie stanovenia cien
- Propagačné a zľavové stratégie
- Cenová diskriminácia

**Prepojenie stratégie a taktiky:**

Strategický marketing poskytuje smer a dlhodobú víziu, zatiaľ čo taktický marketing sa sústreďuje na konkrétne kroky a operatívne rozhodnutia potrebné na realizáciu tejto vízie.`
    },
    {
      title: "Téma 4: Digitálny a komunikačný marketing",
      content: `**3. Digitálny marketing**

**a) Online marketing**

Hlavné nástroje:
- **SEO a SEM** - optimalizácia pre vyhľadávače a marketing vo vyhľadávačoch
- **Sociálne médiá** - interakcia a influencer marketing
- **Email marketing** - priama komunikácia so zákazníkmi
- **Obsahový marketing** - tvorba hodnotného obsahu

**b) Dátovo orientovaný marketing**

Moderné metódy:
- Analýza veľkých dát (big data)
- Marketingová automatizácia
- Personalizácia kampaní
- Prediktívna analytika

**4. Komunikačný marketing**

**a) Branding a budovanie značky**

Kľúčové prvky:
- Vytváranie a správa značky
- Vizuálna identita a komunikácia značky
- Storytelling a vytváranie príbehov značky
- Emočné prepojenie so zákazníkmi

**b) Public Relations a komunikácia**

Oblasti:
- Media relations
- Interná komunikácia
- Krízová komunikácia
- Správa reputácie

**Synergický efekt:**

Digitálny marketing a komunikačný marketing sa dopĺňajú a vytvárajú komplexný systém, ktorý oslovuje zákazníkov na viacerých úrovniach.`
    },
    {
      title: "Téma 5: Udržateľný, etický a inovačný marketing",
      content: `**5. Udržateľný a etický marketing**

**a) Udržateľnosť a spoločenská zodpovednosť**

Moderné prístupy:
- **Zelený marketing** (green marketing)
- Spoločensky zodpovedné kampane
- Implementácia cieľov udržateľného rozvoja (SDGs)
- Environmentálne friendly produkty

**b) Etické konanie**

Základné princípy:
- Transparentnosť a integrita
- Ochrana súkromia a dát zákazníkov
- Etické reklamné praktiky
- Férové obchodné praktiky

**6. Inovačný a agilný marketing**

**a) Inovačné techniky**

Metódy:
- Experimentovanie a A/B testovanie
- Vývoj nových marketingových kanálov a technológií
- Agilné metódy a rýchle prispôsobenie sa trhu
- Kontinuálne zlepšovanie

**b) Kreatívne kampane**

Prístupy:
- Multisenzorické marketingové zážitky
- Interaktívny dizajn
- Kreatívne a vizuálne stratégie
- Nekonvenčné riešenia

**Význam v modernom svete:**

Udržateľnosť a inovácie sú kľúčové pre budovanie dôvery zákazníkov a dlhodobý úspech v konkurenčnom prostredí.`
    },
    {
      title: "Téma 6: Emocionálny, komunitný a výkonnostný marketing",
      content: `**7. Emocionálny a komunitný marketing**

**a) Emocionálna inteligencia**

Využitie:
- Pochopenie a využitie emócií zákazníkov
- Budovanie osobných vzťahov
- Emocionálne ladené kampane
- Empatický prístup

**b) Tvorba komunít**

Aktivity:
- Vytváranie a správa online a offline komunít
- Engagement a interakcia so zákazníkmi
- Podpora zdieľania zážitkov a referencií
- Community management

**8. Výkonnostný marketing**

**a) Mediálne plánovanie a nákup**

Procesy:
- Výber a nákup médií
- Optimalizácia mediálnych kampaní
- Meranie návratnosti investícií (ROI)
- Media mix modeling

**b) Predajná podpora a promo akcie**

Nástroje:
- Event marketing
- Vzorky a ukážky produktov
- Promočné aktivity a programy vernosti
- Trade marketing

**Komplexný prístup:**

Kombinácia emocionálneho prepojenia s komunitou a výkonnostného merania vytvára silný základ pre úspešný marketing.`
    },
    {
      title: "Téma 7: Reklama - definícia a ciele",
      content: `**Definícia reklamy**

Reklama (z lat. clamare = "kričať", "volať") je propagácia (publikovanie, podpora, komunikácia) produktu, informácií alebo názorov o výrobku alebo službe, prípadne organizácii, so zameraním na potenciálny trh.

**Charakteristika:**

Reklama je každá platená forma neosobnej prezentácie a propagácie myšlienok tovaru alebo služieb konkrétnym investorom.

**Použité prostriedky:**

Reklama môže mať viacero foriem:
- Reklama v médiách
- Priama reklama
- Internetová reklama

**Pozícia v marketingovom mixe:**

Reklama patrí medzi najdôležitejšie časti komunikačného mixu.

**Cieľová skupina**

Cieľová skupina je množina príjemcov, ktorých má reklamná kampaň osloviť.

**Môže ísť o:**
- Súčasných užívateľov výrobku, služby alebo značky
- Potenciálnych užívateľov
- Jednotlivcov alebo skupiny, ktorí sa rozhodujú o nákupe

**Charakteristika cieľovej skupiny:**

Je základným predpokladom pre ďalší postup stratégie, tj. pre stanovenie:
- Čo sa bude zdieľať
- Akým spôsobom
- Kedy
- Kde

**Ciele reklamy podľa účelu:**

Reklama môže mať za cieľ:
- **Informovať** - predstaviť nový produkt alebo službu
- **Presviedčať** - presvedčiť o výhodách produktu
- **Pripomínať** - udržať značku v povedomí
- **Porovnávať** - ukázať výhody oproti konkurencii`
    },
    {
      title: "Téma 8: ATL a BTL reklama",
      content: `**ATL reklama (Above The Line)**

Nadlinková reklama, mediálna reklama

**Typy ATL reklamy:**

**1. Televízna reklama**
- Masové pokrytie
- Kombinácia sluchových a vizuálnych prostriedkov
- Vysoké náklady

**2. Tlačová reklama**
- Inzeráty v novinách a časopisoch
- Akčné letáky
- Katalógy

**3. Rozhlasové spoty**
- Zvuková reklama
- Nižšie náklady
- Špecifická cieľová skupina

**4. Spoty v kinách**
- Captive audience
- Veľká obrazovka
- Silný dojem

**5. Internetová reklama**
- Display ads
- Video reklamy
- Native advertising

**6. OOH reklama (Out Of Home)**
- Plagáty a billboardy
- Reklama na dopravných prostriedkoch
- Atypické reklamné plochy

**BTL reklama (Below The Line)**

Podlinková reklama, nemediálna reklama

**Typy BTL reklamy:**

**1. Spotrebiteľské súťaže**
- Engagement zákazníkov
- Interaktívne kampane
- Budovanie databázy

**2. Direct mail**
- Personalizovaná komunikácia
- Priama odpoveď
- Merateľné výsledky

**3. Telemarketing**
- Osobný kontakt
- Okamžitá spätná väzba
- Call centra

**4. Propagačné predmety**
- Firemné darčeky
- Merchandise
- Dlhodobá viditeľnosť

**5. Product placement**
- Integrácia do obsahu
- Subtílna reklama
- Asociácia s kontextom

**Marketingová kampaň:**

Ak daný obchodník využíva niekoľko komunikačných kanálov zároveň, hovoríme o marketingovej kampani.`
    },
    {
      title: "Téma 9: Tlačové a zvukové médiá",
      content: `**Noviny**

**Výhody:**
- ✅ Možnosť zaujať širokú vrstvu populácie
- ✅ Pomerne nižšie finančné náklady
- ✅ Možnosť presného zamerania na cieľové skupiny
- ✅ Reklama v novinách patrí na prvé miesto v rebríčkoch dôveryhodnosti reklám
- ✅ Čitateľ si môže reklamu prečítať opakovane

**Nevýhody:**
- ❌ Krátka životnosť
- ❌ Nižšia kvalita tlače
- ❌ Preplnené reklamné plochy

**Časopisy**

**Výhody:**
- ✅ Dlhšia životnosť ako pri novinách
- ✅ Väčšia kreativita inzercie ako pri novinách
- ✅ Smerované na cieľovú skupinu
- ✅ Vyššia kvalita tlače
- ✅ Lepšie možnosti pre vizuálnu prezentáciu

**Nevýhody:**
- ❌ Dlhšie redakčné uzávierky
- ❌ Vyššie náklady ako noviny

**Rozhlas**

**Výhody:**
- ✅ Jedna z najlacnejších reklám
- ✅ Zameranie priamo na cieľovú skupinu
- ✅ Špecifický okruh poslucháčov (vek, región, životný štýl)
- ✅ Flexibilita a rýchla produkcia
- ✅ Možnosť lokálneho zamerania

**Nevýhody:**
- ❌ Prenos len pomocou zvuku – poslucháč nemá možnosť produkt vidieť
- ❌ Kulisovosť rozhlasu – poslucháč nepočúva naplno
- ❌ Obmedzená životnosť – poslucháč nemá možnosť sa k reklame vrátiť
- ❌ Nemožnosť vizuálnej prezentácie`
    },
    {
      title: "Téma 10: Televízia, internet a vonkajšia reklama",
      content: `**Televízia**

**Výhody:**
- ✅ Masové pokrytie
- ✅ Kombinácia sluchových a vizuálnych prostriedkov
- ✅ Pôsobenie na psychiku televízneho diváka
- ✅ Kreatívne možnosti televízie
- ✅ Demonštrácia produktu v akcii
- ✅ Silný emocionálny dopad

**Nevýhody:**
- ❌ Vysoké náklady na tvorbu reklamy a jej vysielanie
- ❌ Krátky čas na oslovenie – reklamný spot trvá približne 30 sekúnd
- ❌ Prepínanie počas reklám na iný program
- ❌ Vysoká konkurencia

**Internet**

**Výhody:**
- ✅ Presné zasiahnutie cieľovej skupiny na špecializovaných webových stránkach
- ✅ Spätná väzba s návštevníkom stránky
- ✅ Zákazník si ihneď môže zakúpiť ponúkaný produkt alebo službu
- ✅ Merateľnosť výsledkov
- ✅ Možnosť personalizácie
- ✅ Interaktivita

**Nevýhody:**
- ❌ Menej vhodná k osloveniu určitých skupín spotrebiteľov (napr. seniorov, soc. slabých)
- ❌ Nie je možné hovoriť o štandardnej cene, tá sa môže naprieč stránkami veľmi odlišovať
- ❌ Rozporuplný pohľad na efektivitu – reklamy sú často blokované
- ❌ Potreba technických znalostí

**Vonkajšia reklama**

Medzi tento typ patria billboardy, pútače, firemné štíty, plagáty atď.

**Výhody:**
- ✅ Možnosť vystavenia na verejnom priestranstve
- ✅ Môže osloviť takmer kohokoľvek
- ✅ 24/7 viditeľnosť
- ✅ Vysoká frekvenencia kontaktu
- ✅ Relatívne nízke náklady na kontakt

**Nevýhody:**
- ❌ Pohľadové médium – krátky čas na preštudovanie celého oznámenia (približne 2–3 sekundy)
- ❌ Obmedzenie pre vonkajšiu reklamu je tiež dlhý čas na zadanie a umiestenie
- ❌ Typická doba vystavenia billboardu sú dva až tri mesiace
- ❌ Nemožnosť detailnej komunikácie

**Zhrnutie:**

Každé médium má svoje špecifiká, výhody a nevýhody. Úspešná marketingová kampaň často kombinuje viacero médií pre maximálny dosah a efektivitu.`
    }
  ],
  
  "Finančné plánovanie": [
    {
      title: "Téma 1: Úvod do finančného plánovania",
      content: `**Čo je finančné plánovanie?**

Finančné plánovanie je činnosť vedúca k príprave finančného plánu. Teda stanovenie postupností budúcich dejov v oblasti financií, ktoré popíšu cestu k vytýčenému finančnému cieľu. Výsledkom finančného plánovania je finančný plán.

**Výsledok finančného plánovania**

Finančný plán je dokument, v ktorom sú proti sebe postavené súčasná a budúca potreba finančných prostriedkov (súčasné a budúce výdavky) a súčasné a budúce zdroje na ich krytie (súčasné a budúce príjmy).

**Význam pre podnik**

Pomocou finančného plánu vieme "predvídať" budúcnosť a predovšetkým domýšľať prípadné dôsledky pripravovaných rozhodnutí do budúcej finančnej kondície. Slúži k naplňovaniu základných cieľových poslaní podniku, t. j. zaisťovať rast hodnoty akcií, prípadne maximalizovať hodnotu firmy.

**Kto využíva finančné plány?**

O výsledky týchto budúcich rozhodnutí sa zaujímajú:
- Investori a vlastníci
- Potencionálni investori
- Analytici pri príprave investičných rozhodnutí

**Spojenie s históriou**

Finančné plánovanie vychádza zo znalosti historických dát, ktoré sú organizáciami získavané z účtovných dokumentov. Dochádza k vytváraniu budúcich finančných rozpočtov, rozvahy, výkazu ziskov a strát, výkazu finančných tokov atď.`
    },
    {
      title: "Téma 2: Finančné plánovanie ako kontinuálny proces",
      content: `**Nie je to jednorazový proces**

Na finančné plánovanie, tak ako na celý proces firemného plánovania sa nedá pozerať ako na diskrétny jednorazový proces. Ide o kontinuálny proces, lebo plánovaná projekcia sa nemôže nikdy považovať za finálny a posledný produkt.

**Potreba revízie**

Plán sa musí revidovať podľa toho, ako sa menia podmienky, plnia úlohy a ciele plánu. Informácie tohto charakteru poskytuje kontrolná činnosť, ktorá je úzko spätá s plánovacím procesom.

**Úloha kontroly**

Úlohou kontroly v plánovacej činnosti je:
- Hodnotenie návrhu plánu
- Sledovanie priebehu a stavu plnenia úloh
- Vyhodnocovanie plnenia cieľov plánu

**Funkcie kontroly**

Kontrola v procese plánovania je teda nevyhnutná, pretože plní nielen funkciu poznávaciu, ale ovplyvňuje aj ďalšie plánové rozhodnutia v procese tvorby plánu.

**Vzťah veľkosti podniku a časového horizontu**

Medzi časovým horizontom a veľkosťou podniku je veľmi úzka spojitosť:
- Menšie podniky spravidla plánujú na kratší časový horizont
- Veľké podniky majú podstatne dlhšie plánovacie horizonty

**Závislosť istoty a presnosti**

Všeobecne platí, že čím je plánovací horizont kratší, tým vyšší je stupeň istoty a presnosti plánu.`
    },
    {
      title: "Téma 3: Časové horizonty finančného plánovania",
      content: `**Delenie z časového hľadiska**

Z časového hľadiska rozlišujeme finančné plánovanie nasledovne:

**1. Krátkodobé plánovanie**
- Časový horizont do 1 roku
- Najvyššia presnosť a istota
- Detailné operatívne plány

**2. Strednodobé plánovanie**
- Časový horizont 1 – 5 rokov
- Taktické rozhodnutia
- Stredná úroveň detailnosti

**3. Dlhodobé plánovanie**
- Časový horizont 5 rokov a viac
- Strategické rozhodnutia
- Najvyššia úroveň neistoty

**Vzťah k veľkosti podniku**

Menšie podniky:
- Kratší časový horizont
- Jednoduchší plánovací systém
- Menej zložiek v plánovaní

Veľké podniky:
- Dlhší časový horizont
- Komplexný plánovací systém
- Všetky zložky plánovania

**Význam časového horizontu**

Správne nastavenie časového horizontu je kľúčové pre:
- Realistické ciele
- Správne rozdelenie zdrojov
- Efektívnu kontrolu plnenia`
    },
    {
      title: "Téma 4: Zložky finančného plánu",
      content: `**Základné zložky**

Finančný plán má príjmovú a výdajovú zložku. Ale tieto zložky môžu byť riešené aj samostatnými plánmi.

**Podrobnejšie plány**

V niektorých prípadoch, napríklad v podnikovom prostredí, bývajú vytvárané aj podrobnejšie plány:
- Plán investícií
- Plán odpisov
- Plán konkrétnych typov výdavkov
- Plán konkrétnych typov príjmov

**Hlavné finančné výkazy**

V rámci bežného riadenia podniku je finančný plán súčasťou podnikového plánu. Skladá sa z nasledujúcich hlavných finančných výkazov:

**1. Výsledovka**
- Zachytáva výnosy a náklady
- Ukazuje zisk alebo stratu
- Meria výkonnosť podniku

**2. Rozvaha**
- Prehľad aktív a pasív
- Finančná pozícia k danému dátumu
- Bilancie majetku a zdrojov

**3. Výkaz peňažných tokov (Cash flow)**
- Sleduje pohyb hotovosti
- Prevádzkové, investičné a finančné toky
- Kľúčový pre likviditu

**Syntéza plánov**

Vytváranie finančného plánu završuje a spája tieto tvorivé plány z pohľadu výnosnosti a rizík.`
    },
    {
      title: "Téma 5: Účel a ciele finančných plánov",
      content: `**Základný zmysel**

Zmyslom finančného plánovania je získanie kontroly nad financiami a riadením finančných rizík. Teda priamo stanoviť, či podporiť rozhodovanie pri stanovovaní konkrétneho správania subjektu v oblasti financií.

**Hlavné funkcie**

Finančné plánovanie pomáha:
- Predvídať pravdepodobné budúce finančné situácie
- Riadiť finančné riziká
- Podporovať rozhodovanie
- Stanovovať konkrétne správanie v oblasti financií

**Typy finančného plánovania**

Podľa subjektu rozlišujeme:

**1. Korporátne (podnikové)**
- Finančné plánovanie firiem
- Strategické a taktické rozhodnutia

**2. Verejné**
- Štátny rozpočet
- Rozpočty obcí a miest
- Verejné inštitúcie

**3. Osobné**
- Individuálne finančné plánovanie
- Osobné ciele a potreby

**4. Rodinný rozpočet**
- Plánovanie domácnosti
- Spoločné príjmy a výdavky

**Schopnosť obmedziť riziko**

Finančné plánovanie má schopnosť obmedziť finančné riziko, ak je realizované dlhodobo a korektne. Môžeme ho považovať za včasné varovanie, pretože by malo predvídať problematické situácie skôr, ako nastanú.`
    },
    {
      title: "Téma 6: Časté chyby a overenie uskutočniteľnosti",
      content: `**Najčastejšie chyby pri zostavovaní**

Medzi najčastejšie chyby pri zostavovaní finančného plánu môžeme zahrnúť:

**1. Odloženie plánu na zajtrajšok**
- Prokrastinácia
- Strata času a príležitostí
- Horšie výsledky

**2. Nedotiahnuté Cash Flow**
- Neúplné údaje
- Nerealistické predpoklady
- Chybné projekcie

**3. Inflácia podnikateľskej myšlienky**
- Prehnané očakávania
- Nerealistické ciele
- Nadhodnotenie príležitostí

**4. Strach a obavy zo zostavovania**
- Psychologická bariéra
- Nedostatok znalostí
- Obava z neúspechu

**5. Vágne (neurčité) ciele**
- Nejasné definície
- Nemerateľné výsledky
- Problematická kontrola

**Overenie uskutočniteľnosti**

Finančný plán takisto preveruje:
- Uskutočniteľnosť ostatných častí plánu firmy
- Obchodnú úspešnosť plánov
- Reálnosť stanovených cieľov
- Dostupnosť potrebných zdrojov`
    },
    {
      title: "Téma 7: Zásady finančného plánovania",
      content: `**Základné princípy**

Aby finančné plány mohli plniť svoju úlohu, je nutné rešpektovať určité zásady:

**1. Princíp preferencie peňažných tokov**
Upozorňuje na to, aby súhrnné peňažné príjmy prevyšovali nad celkovými peňažnými výdavkami.

**2. Princíp rešpektovania faktora času**
Preferencie skoršieho príjmu pred neskorším, aj keď je nominálna hodnota porovnávaných príjmov rovnaká.

**3. Princíp minimalizácie rizika**
Rovnaké množstvo peňazí získaných s menším rizikom má byť preferované pred tým istým príjmom získaným za cenu vyššieho rizika.

**4. Princíp optimalizácie kapitálovej štruktúry**
- Zabezpečenie finančnej stability
- Zníženie nákladov na kapitál
- Zvýšenie ziskovosti
- Dosiahnutie požadovanej hodnoty podniku

**5. Zásada dlhodobosti**
Krátkodobé finančné ciele podniku by mali byť podradené dlhodobým; nutnosť rešpektovať rozdielnosť vonkajšieho prostredia podniku.

**6. Zásada hierarchického usporiadania**
Musí byť len jeden hlavný cieľ medzi krátkodobými aj dlhodobými zámery pre určité plánovacie obdobie.

**7. Zásada reálnej dosiahnuteľnosti**
Je nutné vychádzať zo základných poznatkov získaných v analytickej fáze finančného plánovania; reálna dosiahnuteľnosť má dôležitý motivačný potenciál.`
    },
    {
      title: "Téma 8: Ďalšie dôležité zásady",
      content: `**Pokračovanie základných zásad**

**8. Zásada programovej ziskovej orientácie**
Najväčšia priorita sa skrýva v maximalizácii trhovej hodnoty podniku. Neznamená to, že by mala byť prehliadaná zisková orientácia firmy, pretože:
- Zisk zaujíma v postupnosti podnikových finančných cieľov druhú najväčšiu položku
- Je to ukazovateľ pre externé hodnotenie ekonomickej výkonnosti
- Zisk ovplyvňuje trhovú hodnotu podniku

**9. Zásada periodickej aktualizácie**
Aj ten najlepšie zostavený plán sa postupne dostáva do problémov, a to väčšinou u viacročného časového horizontu. Stretáva sa podniková realita so situáciou vo vonkajšom okolí.

**10. Zásada podstatnej zhody štruktúry**
Štruktúra, forma a metódy zostavenia finančných plánov musí nadväzovať na štruktúru, formu a metódy transferového ekonomického reportingu. Tým dosiahneme:
- Zabezpečiť porovnateľnosť výkazov
- Možnosť kontroly plánovaných zámerov

**11. Zásada jednoduchosti a transparentnosti**
Mala by viesť podnikový manažment na uprednostnenie takých procedúr, ktoré:
- Nemajú komplikovaný základ
- Umožňujú rýchle zorientovanie
- Sú ľahko pochopiteľné

**12. Zásada relatívnej autonómie**
Ide o možnosť čeliť eventuálnym pokusom o rozdelenie či opustenie vytýčených zámerov.`
    },
    {
      title: "Téma 9: Strategické finančné plánovanie - Analýza",
      content: `**Úvod do strategického plánovania**

Strategické finančné plánovanie je neoddeliteľnou súčasťou podnikového strategického plánovania, kedy finančný plán tvorí určitý základný pilier strategického plánu.

**Základné kroky tvorby**

**1. Analýza a hodnotenie podniku**

Kvalitné strategické plánovanie vyžaduje, aby boli získané a vyhodnotené určité súbory informácií, ktoré charakterizujú jednotlivé stránky podniku. V podstate ide o určitú diagnózu a o hodnotenie východiskovej situácie podniku.

**Schopnosti podniku:**

- **Vytvárať výrobky** - výskum, vývoj, technická príprava výrobkov
- **Vyrábať výrobky** - výrobné kapacity, zvládnuté technológie, materiálne a subdodávateľské možnosti
- **Predávať výrobky** - schopnosti odbytu, úroveň marketingu
- **Zabezpečiť finančnú stabilitu** - reprodukcia a rozvoj podniku

**Čiastkové analýzy:**

- Analýza zdrojov podniku
- Analýza a hodnotenie výrobného programu
- Analýza ekonomickej a finančnej situácie
- Analýza silných a slabých stránok podniku (SWOT)

**Význam interných analýz**

Interné analýzy poskytujú komplexný obraz o:
- Aktuálnom stave podniku
- Dostupných zdrojoch
- Vnútorných procesoch
- Konkurenčných výhodách`
    },
    {
      title: "Téma 10: Strategické plánovanie - Okolie a stratégia",
      content: `**Analýza prognózy vývoja okolia podniku**

Pre kvalitnú tvorbu strategického plánu nemôže podnik vystačiť iba s internými analýzami, ale rozhodujúci vplyv budú mať v mnohých prípadoch analýzy externé.

**Analýza makro okolia:**

- Hospodárska a legislatívna politika vlády
- Technológia okolia z hľadiska vedecko-technického rozvoja
- Očakávaný vývoj medzinárodných politických a ekonomických podmienok
- Vývoj na finančných trhoch

**Analýza mikro okolia:**

- Analýzy a prognózy trhovej situácie a jej vývoja
- Konkurenčná situácia a faktory ovplyvňujúce túto situáciu
- Dostupnosť a cenový vývoj na trhu surovín a energie

**Stanovenie poslania a cieľov**

Poslanie (vízia podniku, resp. misia) je určitý vrchol pyramídy podnikových cieľov a je spravidla všeobecným vyjadrením:
- Hlavných smerov činnosti podniku
- Určitou zjednocujúcou filozofiou
- Vyjadrením toho, čím chce podnik byť
- Prečo existuje
- Aký je jeho rozsah pôsobnosti

**Tvorba podnikateľskej stratégie**

Podnikateľská stratégia, resp. jej komponenty týkajúce sa jednotlivých funkčných oblastí predstavuje spôsob dosahovania strategických cieľov, ktoré si podnik stanovil.

**Porterov model:**

Najznámejšia stratégia založená na základnú orientáciu firmy na trhu, vychádzajúci z Porterovho modelu správania firmy:
- Nákladové líderstvo
- Diferenciácia
- Zameranie sa na segment`
    }
  ],

  "Investovanie pre začiatočníkov": [
    {
      title: "Téma 1: Čo je akcia a čo znamená vlastniť akciu",
      content: `**Definícia akcie**

Akcia je cenný papier, ktorý predstavuje vlastnícky podiel vo firme. Vydávajú ich akciové spoločnosti, ktorých základný kapitál je rozdelený na určitý počet akcií.

**Čo znamená kúpiť akciu?**

Kúpou akcie si kupujete časť firmy, vkladáte peniaze do jej majetku, a tým jej poskytujete prostriedky pre podnikanie. Stávate sa spoluvlastníkom spoločnosti.

**Prečo firmy vydávajú akcie?**

Akciové spoločnosti vydávajú akcie, aby získali kapitál potrebný na:
- Rozšírenie podnikania
- Nákup nových zariadení
- Výskum a vývoj
- Splatenie dlhov
- Financovanie nových projektov

**Základné práva akcionára**

Ako vlastník akcie máte určité práva, ktoré závisí od typu akcie:
- Právo na podiel na zisku (dividendy)
- Právo podieľať sa na riadení spoločnosti
- Právo na informácie o spoločnosti
- Právo na podiel pri likvidácii spoločnosti

**Výnosy z akcií**

Z akcií môžete zarobiť dvoma spôsobmi:
- **Dividendy** - pravidelné výplaty zo zisku spoločnosti
- **Kapitálový zisk** - rozdiel medzi nákupnou a predajnou cenou akcie`
    },
    {
      title: "Téma 2: Ako investovať do akcií - burzy a brokeri",
      content: `**Kde sa obchoduje s akciami?**

Akcie sa obvykle obchodujú na burzách cenných papierov. Najznámejšie burzy sú:
- New York Stock Exchange (NYSE)
- NASDAQ
- London Stock Exchange
- Burza cenných papierov v Bratislave

**Čo je to broker?**

Broker je sprostredkovateľ, ktorý vám umožňuje nakupovať a predávať akcie na burze. Mnoho investorov nakupuje a predáva akcie prostredníctvom brokerských účtov.

**Čo poskytuje brokerský účet?**

Brokerský účet vám poskytuje:
- Prístup k trhovým dátam
- Nákupné platformy
- Analytické nástroje
- Historické grafy a štatistiky
- Možnosť zadávať pokyny na nákup/predaj

**Ako funguje nákup akcií?**

1. Otvoríte si účet u brokera
2. Vložíte peniaze na účet
3. Vyberiete si akcie, ktoré chcete kúpiť
4. Zadáte nákupný pokyn
5. Broker realizuje nákup
6. Akcie sa objavia na vašom účte

**Náklady na investovanie**

Pri investovaní cez brokera platíte:
- Poplatky za obchodovanie (provízie)
- Správcovské poplatky
- Prípadné ďalšie poplatky

**Online vs. tradičný broker**

**Online brokeri:**
- Nižšie poplatky
- Väčšia kontrola
- Potrebné vlastné rozhodnutia

**Tradičný broker:**
- Osobná konzultácia
- Vyšší poplatky
- Profesionálne poradenstvo`
    },
    {
      title: "Téma 3: Základné princípy úspešného investovania",
      content: `**Recept na úspešné investovanie**

Výberom správneho fondu, pri poklesoch nepanikáriť, vybrať si dostatočne dlhý čas na investíciu je recept na úspešné investovanie.

**Dôležitosť trpezlivosti**

Môže prísť obdobie, kedy hodnota investície bude kolísať. Vtedy je veľmi dôležité a zásadné nepanikáriť. Negatívne obdobia nie sú vhodné na vyberanie investície, práve naopak, treba využiť poklesy na ďalšie investovanie.

**Znalosť vlastného rizikového profilu**

Ak ste konzervatívny tip a investujete do dynamického fondu s možnosťou vysokého výnosu, je pravdepodobné, že emočne neustojíte výraznejšie kolísanie hodnoty vašej investície. Je veľká pravdepodobnosť, že ukončíte svoju investíciu v tom najnevhodnejšom čase – v poklese.

**Charakteristiky úspešného investora**

Ani tá najlepšia investičná stratégia nepomôže, keď investor nie je trpezlivý. Najúspešnejší sú investori, ktorí:

- **Investujú pravidelne** - pravidelné investovanie využíva efekt priemerovania nákladov
- **Sú disciplinovaní** - držia sa svojej stratégie aj v ťažkých časoch
- **Zachovajú chladnú hlavu** - v čase poklesov nepanikária
- **Neukončujú investíciu predčasne** - nechajú investícii čas na rast

**Dlhodobý horizont**

Čím dlhší je váš investičný horizont, tým lepšie dokážete ustáť krátkodobé výkyvy a využiť dlhodobý rastový potenciál akcií.

**Čo potrebujete na úspech?**

- Trpezlivosť
- Disciplína
- Dlhodobá perspektíva
- Emocionálna stabilita
- Vhodná stratégia`
    },
    {
      title: "Téma 4: Akcie podľa formy - na majiteľa vs. na meno",
      content: `**Základné delenie akcií podľa formy**

Cenné papiere sa delia z hľadiska formy na dva základné typy: akcia na majiteľa a akcia na meno.

**Akcie na majiteľa (na doručiteľa)**

**Hlavné charakteristiky:**
- Akcia na majiteľa alebo na doručiteľa je bez obmedzenia prevoditeľná
- Noví ani bývalí vlastníci nemajú povinnosť tento prevod akciovej spoločnosti hlásiť
- Uplatňujú princíp anonymného investovania

**Výhody:**
- Jednoduchý prevod
- Anonymita vlastníka
- Žiadne administratívne povinnosti

**Nevýhody:**
- Riziko straty alebo krádeže
- Ťažšie dokazovanie vlastníctva
- Spoločnosť nepozná svojich akcionárov

**Akcie na meno**

**Hlavné charakteristiky:**
- Akcia na meno je vydávaná len na meno určitej osoby
- V zaknihovanej podobe sa prevádza zmluvou a registráciou
- Jej prevoditeľnosť na iného majiteľa môžu stanovy spoločnosti obmedziť (nesmie túto možnosť ale úplne vylúčiť)

**Povinnosti spoločnosti:**
Akciová spoločnosť, ktorá vydala akcie na meno, je povinná viesť zoznam akcionárov, ktoré cenné papiere držia.

**Výhody:**
- Jasné vlastníctvo
- Lepšia ochrana
- Prehľad o akcionároch

**Nevýhody:**
- Komplexnejší prevod
- Viac administratívy
- Možné obmedzenia prevodu`
    },
    {
      title: "Téma 5: Akcie podľa podoby - listinné vs. zaknihované",
      content: `**Akcie listinné (fyzické akcie)**

**Čo sú listinné akcie?**

Akcie listinné, alebo fyzické akcie, sú tradičnou formou akcií, kde je vlastníctvo akcie reprezentované certifikátom.

**Čo obsahuje certifikát?**

Dokument obsahuje dôležité informácie:
- Meno spoločnosti
- Počet akcií, ktoré držiteľ vlastní
- Sériové číslo
- Podpisy autorizovaných osôb
- Ďalšie relevantné údaje

**Vývoj listinných akcií:**

Listinné akcie boli v minulosti bežné, ale v súčasnej dobe sú stále viac nahradzované zaknihovanými akciami, ktoré sú uchovávané v elektronickej podobe.

**Nevýhody listinných akcií:**
- Riziko straty alebo poškodenia
- Potreba fyzického uchovávania
- Komplikovanejší prevod
- Vyššie náklady na správu

**Akcie zaknihované (elektronické akcie)**

**Moderná forma akcií:**

Zaknihované akcie sú modernou formou akcií, kde vlastníctvo a prevody sú zaznamenané elektronicky bez potreby fyzických certifikátov.

**Výhody zaknihovaných akcií:**

- **Bezpečnosť** - nemôžu sa stratiť ani poškodiť
- **Jednoduchosť** - ľahký prevod elektronicky
- **Nižšie náklady** - žiadne náklady na tlač a uchovávanie
- **Rýchlosť** - okamžité prevody a zmeny
- **Prehľadnosť** - elektronické záznamy

**Súčasný trend:**

Tento systém má mnoho výhod oproti tradičným listinným akciám a je bežne používaný v súčasnom finančnom svete. Väčšina akcií dnes existuje iba v elektronickej podobe.`
    },
    {
      title: "Téma 6: Typy akcií podľa práv - kmeňové a prioritné",
      content: `**Kmeňové akcie (obyčajné akcie)**

**Čo sú kmeňové akcie?**

Kmeňová akcia umožňuje majiteľovi využívať všetky práva, ktoré sú s držaním akcií spojené.

**Práva majiteľa kmeňových akcií:**

**1. Právo na riadenie spoločnosti**
- Môže sa podieľať na riadení spoločnosti
- Hlasovanie na valnom zhromaždení
- Voľba predstavenstva

**2. Právo na zisk spoločnosti**
- Má právo na zisk spoločnosti (dividendy)
- Výška dividend sa môže meniť

**3. Právo na likvidačný zostatok**
- Má právo na podiel na likvidačnom zostatku
- Až po uspokojení veriteľov a prioritných akcionárov

**4. Prednostné právo na upísanie**
- Má prednostné právo na upísanie nových akcií
- V takej miere, že jeho základný podiel v spoločnosti zostane nezmenený

**Prioritné akcie (preferenčné akcie)**

**Čo sú prioritné akcie?**

Prioritné akcie sú akcie, ktoré majú prednosť pred bežnými akciami spoločnosti.

**Výhody prioritných akcií:**

**1. Prednostné právo na dividendy**
- Na výplatu dividendy majú držitelia prioritných akcií prednostné právo
- Dividendy sú často fixné
- Vypláca sa skôr ako dividendy na kmeňové akcie

**2. Prednostné právo na likvidačný zostatok**
- V prípade, že sa firma predá alebo skrachuje
- Investor má väčšiu šancu dostať svoju nominálnu hodnotu investície späť
- Vyššia priorita ako kmeňoví akcionári

**Nevýhody prioritných akcií:**
- Zvyčajne nemajú hlasovacie práva
- Obmedzený potenciál rastu
- Nižšie dividendy v dobrých časoch`
    },
    {
      title: "Téma 7: Zamestnanecké a cyklické akcie",
      content: `**Zamestnanecké akcie**

**Čo sú zamestnanecké akcie?**

Zamestnanecké akcie niektoré firmy ponúkajú svojím zamestnancom ako bonus. Tieto akcie sú úplne oslobodené od dane, ale sú s nimi spojené určité obmedzenia.

**Charakteristiky zamestnaneckých akcií:**

- Spravidla vydávané ako akcie na meno
- Prevoditeľné sú len obmedzene
- Môžu mať obmedzenú možnosť odpredaja
- Často viazané na určité podmienky (napr. minimálna doba zamestnania)

**Kto môže dostať zamestnanecké akcie?**

Zamestnanecké akcie môžu dostať:
- Súčasní zamestnanci
- Bývalí zamestnanci, ktorí sú už na dôchodku
- Niekedy aj kľúčoví manažéri ako motivačný nástroj

**Výhody pre zamestnanca:**
- Oslobodenie od dane
- Možnosť podieľať sa na úspechu firmy
- Motivácia k lepším výkonom
- Budovanie majetku

**Cyklické akcie**

**Definícia cyklických akcií:**

Cyklické akcie sú také cenné papiere, ktorých cenu ovplyvňuje súčasná ekonomická situácia.

**Správanie cyklických akcií:**

- **V období ekonomického rastu** - cyklickým akciám sa darí
- **V období recesie** - hodnota cyklických akcií klesá

**Príklady cyklických akcií:**

**1. Ropné spoločnosti**
- Výnosy závisia od pohybu cien komodít
- Ovplyvňuje ich kurz a inflácia
- Niekedy aj politické rozhodnutia

**2. Automobilový priemysel**
- Výroba automobilov
- V čase ekonomického rozkvetu dopyt rastie
- V recesii ľudia kupujú menej áut

**3. Luxusný tovar**
- V dobrých časoch ľudia míňajú viac
- V kríze dopyt po luxuse klesá
- Veľmi citlivé na ekonomické zmeny

**Kedy investovať do cyklických akcií?**

- Na začiatku ekonomického rastu
- Pri signáloch oživenia ekonomiky
- S pochopením ekonomických cyklov`
    },
    {
      title: "Téma 8: Ako si vybrať vhodné akcie na investovanie",
      content: `**Základné kritériá výberu akcií**

Odpoveď pri otázke, ako si vybrať akcie, je, aby mali okrem finančnej sily a ziskovosti aj vysoký potenciál.

**Prečo je dôležitý strategický výber?**

Akcie sú považované za jedny z najrizikovejších aktív na svete a práve preto by každý investor mal byť ostražitý pri ich výbere.

**Potreba stratégie**

Pri kúpe akcií je potrebná vopred stanovená stratégia. Podľa toho, akú stratégiu si zvolíte, budete vedieť:
- Aké akcie máte uprednostniť
- Čo chcete dosiahnuť
- Aké riziko ste ochotní zniesť
- Aký je váš investičný horizont

**Strategický prístup vs. náhodný výber**

**Náhodný výber - ❌**
- Vysoké riziko straty
- Žiadna analýza
- Emočné rozhodnutia

**Strategický prístup - ✅**
- Dôkladná analýza
- Premyslené rozhodnutia
- Riadenie rizika

**Čo hľadajú skúsení investori?**

Skúsení investori hľadajú spoločnosti s:
- **Udržateľným obchodným modelom** - stabilné podnikanie s jasným plán
- **Potenciálom rastu** - možnosti expanzie a zvyšovania zisku
- **Odolnosťou** - schopnosť ustáť náročné obdobia
- **Hospodárskou stabilitou** - dobrá finančná kondícia

**Potrebné znalosti a analýza**

Investovanie do akcií vyžaduje:
- Znalosť trhov
- Analýzu finančných výkazov spoločnosti
- Sledovanie ekonomických trendov
- Pochopenie odvetvia

**Riziká a výnosy**

Výnosy z akcií môžu byť významné, ale je dôležité:
- Zvážiť potenciálne riziká
- Vykonať starostlivú analýzu pred investovaním
- Diverzifikovať portfólio
- Mať dlhodobú perspektívu`
    },
    {
      title: "Téma 9: Ako začať investovať - praktické rady",
      content: `**Dostupnosť investovania dnes**

Investovanie na burze je dnes dostupné takmer pre každého a to vďaka internetu. Netreba ale zabúdať na to, že obchodovanie na burze je rizikové.

**Potenciál a riziko**

Úspešná investícia vám môžu priniesť veľký zisk, ale ak neviete, ako investovať alebo ako funguje burza, môžete o všetky svoje peniaze veľmi ľahko prísť.

**Prečo investujeme?**

Pri investovaní myslíme na budúcnosť, aby sme sa v budúcnosti mali lepšie. Z investície nemáme okamžitý prospech, ten sa dostaví až po určitom čase.

**Realita investovania**

Je pravda že, nie vždy sa investícia vyplatí, a preto je nutné k investovaniu pristupovať zodpovedne a investuje len do toho, čomu rozumieme.

**Vzdelanie pred investíciou**

Pred tým, než sa rozhodnete svoje peniaze investovať, je dôležité mať o investovaní nejaké vedomosti:

**1. Samostatné štúdium**
- Naštudujte si investičné stratégie a postupy
- Prečítajte knihy o investovaní
- Sledujte finančné správy
- Učte sa z chýb iných

**2. Profesionálna pomoc**
- Oslovte skúseného brokera
- Využite finančného poradcu
- Konzultujte s odborníkmi

**Poznanie vlastného rizikového profilu**

Ak sa už rozhodnete investovať do akcií, je veľmi dôležité si uvedomovať riziko a vybrať si takú investíciu, ktorá zodpovedá vášmu rizikovému profilu, aby ste prípadné straty vedeli ustáť.

**Realita ziskov a strát**

Na akciách môžete zarobiť ale aj, naopak, prerobiť. Je dôležité:
- Byť pripravený na obe možnosti
- Investovať len peniaze, ktoré si môžete dovoliť stratiť
- Mať finančnú rezervu mimo investícií`
    },
    {
      title: "Téma 10: Zásady a tipy pre začínajúcich investorov",
      content: `**Diverzifikácia - kľúčová zásada**

Medzi veľmi dôležitú zásadu pri investovaní patrí diverzifikácia, aby ste znížili investičné riziko. To znamená rozloženie peňažných prostriedkov do viacerých finančných nástrojov. Cieľom je zníženie rizika spojeného s investíciou.

**Kedy NEINVESTOVAŤ do akcií?**

Do akcií by ste nemali investovať, ak:
- **Máte krátkodobé finančné ciele** - akcie sú vhodné pre dlhodobé investovanie
- **Chcete rýchly zisk** - úspešné investovanie vyžaduje trpezlivosť
- **Nechcete niesť riziko** - akcie sú rizikové aktíva
- **Nemáte finančnú rezervu** - najprv si vytvorte núdzový fond
- **Máte dlhy** - najprv splaťte vysokoúročené dlhy
- **Nerozumiete akciám** - najprv sa vzdelávajte

**TIP NA DLHODOBÉ INVESTOVANIE**

Pri pravidelnom investovaní počas dostatočne dlhého obdobia sa dá vytvoriť slušná suma, ktorá môže byť základom vašej mesačnej renty a nemusíte sa spoliehať iba na štát.

**Varovanie pred nečinnosťou**

Ak k investovaniu do budúcnosti budete ľahostajní, neskôr zistíte, že od štátu toho veľa nedostanete a že počas vašich produktívnych rokov by ste sa bez päťdesiatky alebo stovky mesačne zaobišli s vidinou slušného života aj v dôchodkovom veku.

**Zhrnutie kľúčových zásad**

**1. Vzdelávajte sa** - neustále rozširujte svoje znalosti
**2. Diverzifikujte** - nevsádzajte všetko na jednu kartu
**3. Buďte trpezliví** - úspech prichádza s časom
**4. Investujte pravidelne** - využite efekt priemerovania nákladov
**5. Nepanikárte** - v poklesoch zachovajte chladnú hlavu
**6. Majte stratégiu** - vedzte, čo robíte a prečo
**7. Kontrolujte emócie** - nerozhodujte sa impulzívne
**8. Mysli na budúcnosť** - investujte do svojho dôchodku

**Cesta k úspechu**

Úspešné investovanie nie je o šťastí, ale o vzdelaní, stratégii, disciplíne a trpezlivosti. Začnite čím skôr a investujte pravidelne!`
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
