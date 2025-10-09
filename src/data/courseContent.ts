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
      title: "Téma 1: Základy investovania",
      content: `Tento kurz je v príprave. Obsah bude čoskoro dostupný.`
    }
  ],

  "Podnikanie od A po Z": [
    {
      title: "Téma 1: (Ne)máte nápad na podnikanie?",
      content: `**Prvý krok - nápad**

Prvým krokom na začiatku akéhokoľvek podnikania je nápad. Samotný nápad ale zvyčajne tvorí iba malé percento z úspechu a tú dôležitejšiu časť zohráva jeho realizácia.

**Kľúčové vlastnosti nápadu**

Kľúčové je, aby podnikateľský nápad budúcim zákazníkom riešil ich problém. Nápad nemusí byť unikátny, ani jeho prevedenie nemusí byť dokonalé. Nevyhnutné ale je, aby ste zákazníkovi priniesli pridanú hodnotu a aby vaše riešenie bolo lepšie ako to, ktoré ponúka konkurencia.

**Vlastnosti úspešného podnikateľa**

Byť podnikateľom si tiež vyžaduje mať určitý súbor vlastností:
- Vytrvalosť
- Schopnosť odolávať (často aj existenčnému) tlaku
- Flexibilita
- Vynaliezavosť
- Vnútorná sila
- Schopnosť odosobniť sa

**Dôležitosť overovania**

Práve táto posledná vlastnosť je veľmi dôležitá najmä v začiatkoch podnikania, keď si potrebujete overiť, či váš nápad bude fungovať.

**Kde hľadať inšpiráciu?**

Ak nemáte nápad, inšpiráciu, v čom začať podnikať možno nájsť všade:
- V zahraničí
- Pri venovaní sa svojim koníčkom
- V ponuke franšízingových konceptov`
    },
    {
      title: "Téma 2: Potrebujete biznis plán?",
      content: `**Štatistiky a realita**

Štatistiky vravia, že takmer polovica začínajúcich firiem na Slovensku sa nedožije svojich piatych narodenín a mnohé dokonca končia už po prvom roku.

**Prečo firmy zlyhávajú?**

Začínajúci podnikatelia majú často „veľké oči", podceňujú financie a preceňujú vlastné schopnosti. Často si dostatočne nepremyslia biznis model a neotestujú svoj nápad ešte pred vstupom na trh.

**Význam biznis plánu**

Predísť týmto chybám pomáha biznis plán. Nemusí ísť o siahodlhý dokument, dôležité je najmä premyslieť si kľúčové body a dať ich na papier.

**Čo biznis plán prináša:**
- Overenie reálnosti nápadu
- Finančné predpoklady
- Identifikáciu rizík
- Jasný akčný plán
- Podklad pre investorov`
    },
    {
      title: "Téma 3: Príprava na začiatok podnikania",
      content: `**Základy prípravy**

Začiatky podnikania bývajú ťažké, hlavne ak sa na ne nepripravíte. Ak si poviete – chcem začať podnikať, zrejme máte veľa entuziazmu a tiež času a chuti do práce. Túto energiu by ste však mali využiť aj na dôslednú prípravu, ktorá vám začiatok podnikania výrazne uľahčí.

**Krok 1: Pracujte na sebe**

Skôr než začnete, učte sa. Mnohí svetoví biznis žraloci síce nedokončili školy, no vzdelávajú sa neustále.

**Ako sa vzdelávať:**
- Čítajte knihy o podnikaní
- Počúvajte biznis podcasty
- Sledujte rôzne internetové zdroje (biznisové magazíny)
- Navštevujte podujatia a workshopy na podnikateľské témy

**Krok 2: Stretávajte sa s biznis komunitou**

Ak ste začínajúcim podnikateľom, potrebujete nabrať prax. Nemusíte sa nutne učiť iba na vlastných chybách.

**Možnosti networking:**
- Podnikateľské akcelerátory či inkubátory
- Biznis mentor
- Podnikateľské združenia (napr. Združenie podnikateľov Slovenska, Akčné ženy)
- Odborne orientované združenia a asociácie

**Krok 3: Otestujte si myšlienku**

Overte si, či bude o váš produkt alebo o vašu službu záujem.

**Spôsoby testovania:**
- Vytvorte si skúšobnú webstránku
- Spustite predpredaj
- Spravte prieskum

Zistite, či bude po vašom podnikaní dopyt a ak nie, produkt/službu upravte alebo hľadajte nový nápad.

**Krok 4: Začnite podnikať**

Keď už viete, v čom budete podnikať a svoju myšlienku ste si otestovali, neotáľajte donekonečna. Ktosi múdry raz povedal, že cieľ bez dátumu exspirácie je iba sen.

**Praktické kroky:**
- Stanovte si pevné dátumy
- Spíšte si kroky, ktoré musíte urobiť
- Nekonečné zdokonaľovanie vás nikam nezavedie
- Stopercentná pripravenosť neexistuje`
    },
    {
      title: "Téma 4: Ako si vytvoriť biznis plán - Cieľová skupina",
      content: `**Význam biznis plánu**

Aby ste zvládli prípravnú fázu dobre, nezabudnite na podnikateľský plán. Nie je to iba zdrap papiera alebo slohová práca, ktorú odložíte do zásuvky, práve naopak. Ide o pomôcku, ktorá je pre podnikateľa akousi cestovnou mapou.

**Kto sú vaši zákazníci?**

Častou chybou začínajúcich podnikateľov je, že chcú predávať svoj produkt alebo službu úplne všetkým. Špecifikovanie si cieľovej skupiny je však alfou a omegou podnikania.

**Realita cieľovej skupiny:**
- Len veľmi málo firiem si môže povedať, že ich zákazníkom je každý
- Väčšina podnikateľov musí nájsť svojich zákazníkov a cielene ich oslovovať
- Táto úloha veľmi úzko súvisí aj s neskorším cielením marketingu

**Marketingové persóny**

Inšpirovať sa môžete marketingovými agentúrami, ktoré odporúčajú podnikateľom vypracovať si tzv. marketingové persóny.

**Charakteristiky persóny:**
- Vek, pohlavie
- Lokalita, kde zákazník žije
- Príjem
- Nákupné správanie
- Názory a hodnoty
- (Ne)prítomnosť na sociálnych sieťach
- Zručnosti

**Riešenie problému zákazníka**

Ujasnite si tiež:
- Aký problém zákazníkovi riešite
- Prečo by mal nakúpiť práve u vás
- Prečo nie u vašej konkurencie
- Nevymýšľajte produkty a služby, ktoré zákazníci nepotrebujú
- Váš zákazník musí byť ochotný za váš produkt alebo službu zaplatiť

**Príklad kaviarní**

Dve kaviarne v blízkosti detského ihriska:
- **Kaviareň A:** prebaľovací pult, detský kútik, bezkofeínová káva s bezlaktózovým mliekom
- **Kaviareň B:** nižšie ceny a WiFi zadarmo

Zákazníčkami sú hlavne mamičky s deťmi. Ktorá bude úspešnejšia?`
    },
    {
      title: "Téma 5: Biznis model a stratégia",
      content: `**Aký bude váš biznis model?**

Na čom budete zarábať a aká je vaša biznisová stratégia? Podnikanie bez platiacich zákazníkov a tržieb nie je podnikanie, ale skôr hobby.

**Zdroje príjmov**

Príjem firmy nemusí pochádzať iba zo samotných produktov alebo služieb, ale aj z rôznych doplnkových zdrojov.

**Príklady doplnkových služieb:**
- K elektronike: inštalácia, predaj na splátky
- K oblečeniu: e-book o osobnom stylingu
- K softvéru: školenie zamestnancov, ročná správa

**Predajné techniky**

**Up-selling:**
- Ponuka produktov vyššej cenovej kategórie

**Cross-selling:**
- Predaj súvisiaceho tovaru

**Subscription model:**
- Mesačné/ročné členské poplatky
- Opakovanie príjmov

**Sekundárne zdroje príjmu:**
- Reklama
- Affiliate (partnerský) systém

**Biznisová stratégia**

Z pohľadu stratégie sa zamyslite hlavne nad tým, ako chcete prilákať budúcich zákazníkov.

**Faktory rozhodnutia zákazníka:**
- Nie len cena!
- Pridaná hodnota
- Zákaznícka skúsenosť
- Rýchlosť doručenia
- Kvalita produktu/služby

**Varovanie pred cenovou stratégiou:**

Ak zvolíte stratégiu najnižšej ceny, stanete sa veľmi ľahkým terčom konkurencie. Ak tá ponúkne ešte nižšiu cenu, zákazník odíde a už sa nikdy nevráti.

**Freemium model:**

Ak sa bojíte ceny za váš produkt:
- Ponúknite freemium verziu
- Prvých pár dní zadarmo
- Po vyskúšaní platba (jednorazová alebo predplatné)

**Príklady freemium:**
- Softvérové spoločnosti
- Aplikácie
- Online kníhkupectvá s ukážkami
- Streamovacie platformy`
    },
    {
      title: "Téma 6: Firemné financie",
      content: `**Oplatí sa podnikať?**

Ešte pred štartom podnikania by ste si mali spočítať, či sa s vaším nápadom vôbec oplatí podnikať.

**Čo začínajúci podnikatelia zabúdajú:**
- Započítať svoju vlastnú prácu
- Zohľadniť iné možnosti sebarealizácie
- Porovnať s výnosom z alternatívnych činností (napr. zamestnanie)

**Realita tržieb**

Hlavne začínajúci podnikatelia sú často prehnane optimistickí:
- Neodhadnú výšku tržieb
- Nerátajú s tým, že prídu neskôr

**Optimizmus vs. realizmus**

Pri plánovaní biznisu by ste mali:
- Byť optimisti
- Ale rátať aj s pesimistickým scenárom
- Pripraviť sa na horšie časy

**Čo počítať vo finančnom pláne:**

**1. Výnosy a náklady**

**Tržby:**
- Koľko zarobíte
- S akou maržou budete predávať
- Odkiaľ potečú vaše príjmy

**Náklady fixné:**
- Nájom za prevádzku
- Nákup materiálov na výrobu
- Telefóny
- Pohonné hmoty
- Kuriérske služby

**Náklady variabilné:**
- Sezónna reklama
- Profesionálny softvér nad určitý počet užívateľov

**Bod zlomu:**
- Kedy výnosy presiahnu náklady
- Kedy začnete zarábať

**2. Cash-flow**

Tok firemných financií na mesačnej báze:
- Aké výdavky musíte kedy platiť
- Aké príjmy môžete kedy očakávať

**Bežné problémy:**
- Výdavky prichádzajú skôr ako príjmy
- Zákazníci chcú dlhšie splatnosti
- Dodávatelia chcú kratšie splatnosti
- Firma má tržby, ale nemá z čoho platiť účty

**3. Zdroje na štart**

Začiatok podnikania je najnáročnejší:
- Náklady na založenie firmy
- Náklady nábehovej fázy
- Náklady na zásoby/tovar
- Technológie a stroje
- Mnohé náklady vznikajú ešte pred spustením

**Príklad:**
Otvárate obchod s oblečením:
- Musíte si zariadiť prevádzku
- Zaplatiť nájom (často 3 mesiace dopredu)
- Nakúpiť tovar
- To všetko pred prvým zákazníkom`
    },
    {
      title: "Téma 7: SWOT analýza a ďalšie úvahy",
      content: `**Čo všetko ešte vziať do úvahy?**

Podnikateľský plán môže mať podobu jednoduchého dokumentu, môžete ho vytvoriť pomocou online aplikácie alebo použiť Excel. Dôležité je nedržať ho iba v hlave.

**SWOT analýza**

Nezabudnite sa zamyslieť nad:

**Strengths (Silné stránky):**
- Čo robíte lepšie ako konkurencia?
- Vaše jedinečné výhody
- Kvalifikácia tímu

**Weaknesses (Slabé stránky):**
- Kde ste slabší?
- Čo potrebujete zlepšiť?
- Oblasti na rozvoj

**Opportunities (Príležitosti):**
- Aké príležitosti trh ponúka?
- Nové trendy
- Neobsadené segmenty

**Threats (Riziká):**
- Neovplyvní váš biznis napríklad kríza?
- Konkurencia
- Legislatívne zmeny

**Ľudské zdroje**

Užitočné môže byť zamyslieť sa nad:

**Potreba zamestnancov:**
- Budete potrebovať zamestnancov?
- Kedy ich budete potrebovať?
- Kde a ako ich získate?

**Legislatíva:**
- Čo pre vás znamená zamestnávanie z legislatívneho hľadiska?
- Koľko vás budú stáť výplaty?
- Aké sú povinné odvody?

**Online nástroje na biznis plán:**
- Upmetrics
- LivePlan
- Excel šablóny`
    },
    {
      title: "Téma 8: Financovanie začiatkov podnikania",
      content: `**Ako začať podnikať bez peňazí?**

V niektorých prípadoch sa to dá aj bez veľkej sumy peňazí, no všetko závisí od typu biznisu.

**Príklady podľa typu:**

**Nízke náklady:**
- Konzultant/konzultantka
- Potrebné: počítač a pár stoviek eur

**Vysoké náklady:**
- Výrobná firma
- Potrebné: stroje, technológie, sklady, mzdy

**Možnosti financovania:**

**1. Vlastné úspory**
- Najčastejší zdroj
- Žiadne úroky
- Plná kontrola

**2. Investori**
- Hľadajú unikátne príležitosti
- Globálne uplatnenie
- Vysoký potenciál zárobku
- Schopný tím

**3. Crowdfunding**
- Testovanie životaschopnosti nápadu
- Špecializované portály
- "Predpredaj"
- Získanie peňazí aj spätnej väzby

**4. Finančné dotácie od štátu**
- Využíva len zlomok podnikateľov
- Dôvody: byrokracia, nízka flexibilita

**5. Bankové úvery**
- Klasický spôsob
- Potrebný biznis plán
- Úroky a splátky

**6. Business angels**
- Súkromní investori
- Okrem peňazí aj know-how
- Podiel v spoločnosti

**Výber správneho zdroja:**

Závisí od:
- Typu podnikania
- Výšky potrebných financií
- Ochoty deliť sa o vlastníctvo
- Časového horizontu návratnosti`
    },
    {
      title: "Téma 9: Výber právnej formy podnikania",
      content: `**Základné otázky**

**Počet zakladateľov:**
- Budete podnikať sami?
- So spoločníkom?
- S viacerými partnermi?

**Rozsah podnikania:**
- Privyrobenie popri zamestnaní?
- Podnikanie vo veľkom?
- Fulltimeová živnosť?

**Hlavné právne formy na Slovensku:**

**1. Živnosť (SZČO - Samostatne zárobkovo činná osoba)**

**Výhody:**
- Jednoduchá administratíva
- Nízke náklady na založenie
- Rýchle založenie
- Vhodné na začiatok

**Nevýhody:**
- Ručenie celým majetkom
- Vyššie odvody pri vysokých príjmoch
- Limitované možnosti rastu

**2. s.r.o. (Spoločnosť s ručením obmedzeným)**

**Výhody:**
- Obmedzené ručenie (len do výšky vkladu)
- Profesionálnejší imidž
- Vhodné pre väčšie projekty
- Možnosť viacerých spoločníkov

**Nevýhody:**
- Vyššie náklady na založenie (min. 5000 € základné imanie)
- Zložitejšia administratíva
- Potreba účtovníka

**3. a.s. (Akciová spoločnosť)**

**Výhody:**
- Najlepšia pre veľké projekty
- Možnosť získať kapitál vydaním akcií
- Obmedzené ručenie

**Nevýhody:**
- Vysoké náklady na založenie (min. 25 000 €)
- Veľmi zložitá administratíva
- Vhodné len pre veľké firmy

**4. v.o.s. (Verejná obchodná spoločnosť)**

**Charakteristika:**
- Minimálne 2 spoločníci
- Všetci ručia celým majetkom
- Menej bežná forma

**Rozhodovanie:**

Pri výbere zvážte:
- Výšku počiatočnej investície
- Potrebu ochrany majetku
- Počet zakladateľov
- Plánovaný obrat
- Administratívnu náročnosť`
    },
    {
      title: "Téma 10: Názov firmy a ďalšie kroky",
      content: `**Výber názvu firmy**

Názov firmy je dôležitá súčasť vašej identity.

**Základné pravidlá:**

**1. Jedinečnosť**
- Skontrolujte si, či nie je obsadený
- Registre: orsr.sk, zrsr.sk
- Overenie domén

**2. Zapamätateľnosť**
- Krátky a výstižný
- Ľahko vysloviteľný
- Zrozumiteľný

**3. Relevantnosť**
- Súvislosť s vašim biznisom
- Neobmedzuje budúci rozvoj

**4. Dostupnosť domény**
- Overenie dostupnosti .sk, .com
- Sociálne siete (Facebook, Instagram)

**Ochranné známky:**
- Zvážte registráciu ochrannej známky
- Ochrana pred konkurenciou
- Dlhodobá investícia

**Ďalšie kroky po výbere právnej formy:**

**1. Registrácia**
- Živnostenský úrad (SZČO)
- Obchodný register (s.r.o., a.s.)

**2. Daňový úrad**
- Registrácia na daňovom úrade
- Získanie DIČ

**3. Sociálna a zdravotná poisťovňa**
- Registrácia do 8 dní od začiatku podnikania

**4. DPH**
- Dobrovoľná alebo povinná registrácia
- Povinná pri obrate nad 50 000 €

**5. Bankový účet**
- Otvorenie firemného účtu
- Výber vhodnej banky

**6. Účtovníctvo**
- Jednoduché účtovníctvo (SZČO do 100 000 €)
- Podvojné účtovníctvo (s.r.o., a.s., SZČO nad 100 000 €)

**7. Poistenie**
- Zodpovednosti
- Majetku
- Príp. ďalšie podľa potrieb

**Zhrnutie:**

Podnikanie od A po Z nie je jednoduché, ale s dobrou prípravou, biznis plánom a správnym výberom právnej formy máte veľkú šancu na úspech. Nezabudnite:
- Vzdelávať sa
- Testovať nápad
- Pripraviť si financie
- Vybrať správnu právnu formu
- A hlavne - začať!`
    }
  ],

  "E-commerce": [
    {
      title: "Téma 1: Definícia a základné typy e-commerce",
      content: `**Čo je e-commerce?**

E-commerce (elektronický obchod) je proces nákupu a predaja tovarov alebo služieb prostredníctvom internetu alebo iných elektronických médií. To znamená, že zákazník si môže objednať produkty z pohodlia domova pomocou počítača alebo mobilného zariadenia a obchodník môže tieto objednávky spracovať a doručiť priamo zákazníkovi.

**Aké najčastejšie typy predaja ponúka e-commerce?**

**B2B (Business-to-Business)**

Pri tomto type obchodovania jeden podnik predáva produkty alebo služby inému podniku, namiesto toho, aby predával priamo zákazníkom.

**Charakteristiky B2B:**
- Väčšie objemy objednávok
- Dlhodobé vzťahy
- Komplexnejšie cenové štruktúry
- Špecializované produkty

**B2C (Business-to-Consumer)**

V B2C e-commerce podniky predávajú svoje produkty alebo služby koncovým zákazníkom, namiesto toho, aby predávali iným podnikom.

**Charakteristiky B2C:**
- Menšie, častejšie objednávky
- Rýchlejšie rozhodovanie o nákupe
- Dôraz na marketing a zákaznícku skúsenosť
- Široký sortiment

**C2C (Consumer-to-Consumer)**

V C2C e-commerce spotrebitelia nakupujú a predávajú produkty prostredníctvom internetových platforiem, kde môžu vytvárať inzeráty, prezerať ponuky a komunikovať s ostatnými spotrebiteľmi.

**Charakteristiky C2C:**
- Platformy typu marketplace
- Príklady: Bazos.sk, Modrykonik.sk, eBay
- Peer-to-peer transakcie
- Nižšie ceny použitého tovaru`
    },
    {
      title: "Téma 2: Benefity e-commerce",
      content: `**Dostupnosť 24/7**

Internet nikdy nespí, elektronické obchody sú k dispozícii pre zákazníkov 24 hodín denne, 7 dní v týždni.

**Výhody:**
- Zákazníci môžu nakupovať kedykoľvek sa im to hodí
- Zarábate, aj keď spíte
- Žiadne obmedzenie otváracími hodinami
- Globálna dostupnosť

**Široký dosah**

E-commerce umožňuje podnikom predávať svoje produkty alebo služby cez internet, čo znamená, že majú potenciál osloviť oveľa väčšiu zákaznícku základňu ako v kamennej predajni.

**Možnosti dosahu:**
- Lokálny trh
- Celoslovenský trh
- Medzinárodný trh
- Globálny trh

**Nižšie náklady**

E-commerce môže byť pre podniky lacnejšie ako tradičné kamenné obchody.

**Úspory:**
- Nižšie náklady na prenájom priestoru
- Úspora na energiách
- Úspora na vode
- Menší počet zamestnancov
- Nižšie náklady na prevádzku

**Personalizácia ponúk**

E-commerce umožňuje podnikom personalizovať ponuku na základe nákupného správania zákazníkov a zlepšiť tak zákaznícky zážitok.

**Nástroje personalizácie:**
- Odporúčané produkty
- Personalizované emailové kampane
- Dynamické ceny
- Individuálne zľavy`
    },
    {
      title: "Téma 3: Ďalšie výhody e-commerce",
      content: `**Jednoduchšie porovnávanie cien**

Zákazníci môžu jednoduchšie porovnávať ceny a vlastnosti produktov a služieb a nájsť tak najlepšie ponuky bez nutnosti fyzickej návštevy kamenných obchodov.

**Porovnávače cien:**
- Heureka.sk
- Najnakup.sk
- Pricemania.sk
- Cenové rozšírenia v prehliadači

**Flexibilita platobných možností**

E-commerce umožňuje zákazníkom platiť rôznymi spôsobmi, čo prispieva k ich pohodliu a bezpečnosti.

**Platobné metódy:**
- Kreditné a debetné karty
- PayPal
- Bankové prevody
- Dobierka
- Google Pay, Apple Pay
- Kryptomeny
- Platba na splátky

**Možnosť väčšej interakcie so zákazníkmi**

E-commerce umožňuje podnikom komunikovať so zákazníkmi prostredníctvom rôznych kanálov.

**Komunikačné kanály:**
- E-maily
- Live chat
- Chatboty
- Sociálne siete
- Telefón
- Video konferencie

**Lepšie sledovanie výkonu**

E-commerce umožňuje podnikom sledovať výkon svojich predajov a marketingových kampaní.

**Metriky:**
- Google Analytics
- Konverzný pomer
- Priemerná hodnota objednávky
- Návratnosť investícií (ROI)
- Zdroje návštevnosti
- Správanie zákazníkov

**Záver:**

E-commerce je biznis model, ktorý pomohol vyšľapať cestu úspechu nejednej veľkej značke. Začatím e-commerce získate viacej zákazníkov, povedomie o značke a značne zvýšite prínos tržieb pre váš biznis.`
    },
    {
      title: "Téma 4: Ako začať s e-commerce",
      content: `**Výber produktov alebo služieb**

**Kľúčové otázky:**
- Čo budete predávať?
- Existuje po tom dopyt?
- Kto je vaša cieľová skupina?
- Aká je konkurencia?

**Typy produktov:**
- Fyzické produkty (potrebujete sklad a logistiku)
- Digitálne produkty (ebook, kurzy, softvér)
- Služby (konzultácie, coaching)
- Dropshipping (predaj bez skladu)

**Výber platformy**

**Vlastná webstránka:**
- WooCommerce (WordPress)
- Shopify
- PrestaShop
- Magento

**Marketplace:**
- Amazon
- eBay
- Heureka Košík
- Alza Marketplace

**Výhody vlastnej stránky:**
- Plná kontrola
- Vlastný dizajn
- Žiadne provízie
- Vlastná zákaznícka databáza

**Výhody marketplace:**
- Existujúca návštevnosť
- Dôveryhodnosť
- Jednoduchý štart
- Technická podpora

**Registrácia a legislatíva**

**Potrebné kroky:**
- Živnostenské oprávnenie alebo s.r.o.
- Registrácia na daňovom úrade
- DPH (pri obrate nad 50 000 €)
- Obchodné podmienky
- GDPR súhlas
- Informačná povinnost

**Dôležité dokumenty:**
- Všeobecné obchodné podmienky
- Reklamačný poriadok
- Ochrana osobných údajov
- Cookies policy`
    },
    {
      title: "Téma 5: Dizajn a používateľská skúsenosť (UX)",
      content: `**Význam dobrého dizajnu**

**Prvý dojem:**
- Zákazníci rozhodujú o dôveryhodnosti za 0,05 sekundy
- Profesionálny dizajn zvyšuje konverzie
- Mobilná responzivita je nevyhnutná

**Kľúčové prvky e-shopu**

**Homepage:**
- Jasné value proposition
- Hlavné kategórie produktov
- Aktuálne akcie a novinky
- Vyhľadávanie
- Dôveryhodnostné signály

**Produktová stránka:**
- Kvalitné fotografie (min. 3-5)
- Detailný popis
- Technické parametre
- Recenzie zákazníkov
- Dostupnosť skladu
- Jasné call-to-action (CTA)

**Nákupný košík:**
- Jednoduchý proces
- Viditeľné náklady (DPH, doprava)
- Možnosť úpravy objednávky
- Odhadovaný čas doručenia
- Upsell a cross-sell produkty

**Checkout (pokladňa):**
- Minimálny počet krokov
- Možnosť nákupu bez registrácie
- Viacero platobných metód
- Jasné informácie o doprave
- Progress bar

**Mobilná optimalizácia**

**Dôležitosť:**
- Viac ako 60% nákupov je z mobilu
- Google uprednostňuje mobile-first
- Jednoduchá navigácia
- Veľké tlačidlá
- Rýchle načítanie

**Rýchlosť načítania**

**Prečo je dôležitá:**
- Každá sekunda znižuje konverzie o 7%
- Google penalizuje pomalé stránky
- Zákazníci majú nízku trpezlivosť

**Ako zrýchliť:**
- Optimalizácia obrázkov
- Caching
- CDN (Content Delivery Network)
- Minimalizácia kódu`
    },
    {
      title: "Téma 6: Marketing pre e-commerce",
      content: `**SEO (Search Engine Optimization)**

**On-page SEO:**
- Optimalizované názvy produktov
- Meta descriptions
- Alt texty obrázkov
- URL štruktúra
- Interné linkovanie

**Content marketing:**
- Blog s užitočným obsahom
- Návody a tutoriály
- Video obsah
- Infografiky

**PPC reklama (Pay-Per-Click)**

**Google Ads:**
- Vyhľadávacia sieť
- Nákupná kampaň (Google Shopping)
- Display sieť
- Remarketing

**Facebook a Instagram Ads:**
- Presné cielenie
- Vizuálne atraktívne reklamy
- Katalógové reklamy
- Dynamický remarketing

**Email marketing**

**Typy emailov:**
- Uvítací email
- Opustený košík (cart abandonment)
- Produktové odporúčania
- Novinky a akcie
- Post-purchase follow-up

**Sociálne siete**

**Výber platforiem:**
- Facebook - širšie publikum
- Instagram - vizuálne produkty
- TikTok - mladšie publikum
- Pinterest - DIY, móda, domácnosť
- LinkedIn - B2B

**Influencer marketing**

**Výhody:**
- Dôveryhodnosť
- Autentický obsah
- Nové publikum
- Sociálne dôkazy

**Affiliate marketing**

**Princíp:**
- Partneri propagujú vaše produkty
- Platba za výsledky (provízie)
- Win-win situácia`
    },
    {
      title: "Téma 7: Logistika a doručovanie",
      content: `**Skladovanie**

**Možnosti:**

**1. Vlastný sklad**
- Plná kontrola
- Vyššie náklady
- Potreba priestoru a personálu

**2. Outsourcing (3PL)**
- Profesionálne služby
- Škálovateľnosť
- Nižšie fixné náklady

**3. Dropshipping**
- Žiadny sklad
- Nižšie riziko
- Nižšie marže

**Správa zásob**

**Kľúčové metriky:**
- Stock Keeping Unit (SKU)
- Minimálna zásoba
- Obratovosť skladu
- Dead stock (nepredajné zásoby)

**Softvér:**
- Systémy na správu skladu (WMS)
- Automatické objednávanie
- Predikcia dopytu

**Doprava a doručovanie**

**Možnosti doručenia:**
- Kuriér (GLS, DPD, DHL)
- Slovenská pošta
- Packeta (Zásielkovňa)
- Alzaboxy
- Osobný odber

**Faktory výberu:**
- Cena
- Rýchlosť
- Spoľahlivosť
- Pokrytie
- Sledovanie zásielok

**Medzinárodná preprava**

**Výzvy:**
- Clo a dane
- Dlhšie dodacie lehoty
- Vyššie náklady
- Jazykové bariéry
- Právne odlišnosti

**Vrátenie tovaru**

**Dôležitosť:**
- Zákonná 14-dňová lehota
- Jednoduchý proces zvyšuje dôveru
- Náklady na vrátenie
- Spracovanie vráteného tovaru`
    },
    {
      title: "Téma 8: Platobné brány a bezpečnosť",
      content: `**Platobné brány**

**Populárne riešenia:**
- ComGate
- GoPay
- Stripe
- PayPal
- Tatrapay
- CardPay

**Výber platobnej brány:**
- Poplatky (setup, mesačné, transakčné)
- Podporované platobné metódy
- Integrácia s platformou
- Zákaznícka podpora
- Rýchlosť vyplácania

**Platobné metódy**

**Kreditné/debetné karty:**
- Najpoužívanejšie
- Okamžité spracovanie
- Vyššie poplatky

**Bankové prevody:**
- Nižšie poplatky
- Pomalšie spracovanie
- Vhodné pre B2B

**Dobierka:**
- Stále populárna na Slovensku
- Vyššie náklady
- Riziko vrátenia zásielky

**E-peňaženky:**
- PayPal
- Google Pay
- Apple Pay
- Rýchle a pohodlné

**Bezpečnosť**

**SSL certifikát:**
- Nevyhnutnosť
- HTTPS protokol
- Dôveryhodnosť
- SEO benefit

**PCI DSS:**
- Štandard pre spracovanie platieb kartou
- Ochrana údajov zákazníkov
- Povinnosť pre e-shopy

**3D Secure:**
- Dodatočná autentifikácia
- Znižuje riziko fraudu
- Povinné v EU

**Ochrana pred podvodmi**

**Riziká:**
- Ukradnuté karty
- Phishing
- Falošné objednávky
- Account takeover

**Prevencia:**
- Verifikácia adries
- Monitoring nezvyčajných aktivít
- Limit transakcií
- CAPTCHA
- Email verifikácia`
    },
    {
      title: "Téma 9: Zákaznícky servis a recenzie",
      content: `**Význam zákazníckeho servisu**

**Štatistiky:**
- 86% zákazníkov je ochotných zaplatiť viac za lepší servis
- Získať nového zákazníka je 5-7x drahšie ako udržať existujúceho
- Nespokojný zákazník povie o svojej skúsenosti 9-15 ľuďom

**Kanály zákazníckeho servisu**

**Email:**
- Ideálny pre komplexnejšie problémy
- Písomný záznam komunikácie
- Cieľ: odpoveď do 24 hodín

**Live chat:**
- Okamžitá pomoc
- Vyššie konverzie
- Možnosť použiť chatboty

**Telefón:**
- Osobný kontakt
- Rýchle riešenie problémov
- Vyššie náklady

**Sociálne siete:**
- Verejná komunikácia
- Rýchla odpoveď dôležitá
- Budovanie dôvery

**FAQ sekcia:**
- Odpovede na časté otázky
- Úspora času
- Lepšia SEO

**Spracovanie reklamácií**

**Zákonné lehoty:**
- Reklamácia: 30 dní
- Vrátenie tovaru: 14 dní
- Záruka: 24 mesiacov

**Best practices:**
- Jednoduchý proces
- Rýchle spracovanie
- Komunikácia so zákazníkom
- Spravodlivé riešenie

**Recenzie a hodnotenia**

**Význam:**
- 93% zákazníkov číta recenzie
- Zvyšujú konverzie o 18%
- Sociálny dôkaz
- Vylepšujú SEO

**Ako získať viac recenzií:**
- Email po nákupe
- Ponúknuť malú zľavu
- Jednoduchý proces
- Odpovedať na recenzie

**Správa negatívnych recenzií:**
- Rýchla odpoveď
- Profesionálny prístup
- Ponúknuť riešenie
- Učiť sa z feedbacku

**Loyalty programy**

**Typy:**
- Bodový systém
- VIP úrovne
- Cashback
- Exkluzívne zľavy

**Výhody:**
- Opakované nákupy
- Vyššia hodnota objednávky
- Brand advocacy
- Cenné dáta o zákazníkoch`
    },
    {
      title: "Téma 10: Analytika a optimalizácia",
      content: `**Kľúčové metriky**

**Traffic metrics:**
- Návštevníci (unique visitors)
- Zdroje návštevnosti
- Bounce rate (miera opustenia)
- Čas strávený na stránke

**Conversion metrics:**
- Konverzný pomer
- Opustené košíky
- Priemerná hodnota objednávky (AOV)
- Customer Lifetime Value (CLV)

**Revenue metrics:**
- Celkové tržby
- Tržby podľa kanálov
- ROI kampaní
- Zisková marža

**Nástroje**

**Google Analytics:**
- Sledovanie návštevnosti
- Správanie používateľov
- E-commerce tracking
- Conversion funnels

**Google Search Console:**
- SEO výkon
- Technické problémy
- Kľúčové slová
- Indexovanie

**Hotjar:**
- Heatmapy
- Screen recordings
- Feedback polls
- Conversion funnels

**A/B testovanie**

**Čo testovať:**
- Farby tlačidiel
- Texty CTA
- Produktové fotografie
- Ceny
- Checkout proces
- Homepage layout

**Nástroje:**
- Google Optimize
- Optimizely
- VWO

**Optimalizácia konverzií (CRO)**

**Best practices:**
- Jasné value proposition
- Sociálne důkazy (recenzie)
- Urgentnosť a scarcity
- Jednoduchý checkout
- Optimalizácia na mobil
- Rýchlosť načítania
- Živé fotografie produktov
- Detailné popisy

**Retargeting**

**Stratégie:**
- Opustené košíky
- Prezerané produkty
- Cross-sell a up-sell
- Zákazníci, ktorí nekúpili dlho

**Platformy:**
- Facebook Pixel
- Google Ads Remarketing
- AdRoll

**Škálovanie**

**Kedy škálovať:**
- Stabilné konverzie
- Pozitívny ROI
- Efektívne procesy
- Dostatok kapitálu

**Ako škálovať:**
- Zvýšenie marketingového rozpočtu
- Rozšírenie produktového portfólia
- Vstup na nové trhy
- Automatizácia procesov
- Budovanie tímu

**Záver:**

Úspešný e-commerce vyžaduje neustálu optimalizáciu, testovanie a prispôsobovanie sa zmenám na trhu. Sledujte svoje dáta, počúvajte zákazníkov a nebojte sa experimentovať!`
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
