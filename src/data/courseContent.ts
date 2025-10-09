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
  ],

  "Finančná gramotnosť": [
    {
      title: "Téma 1: Čo je finančná gramotnosť?",
      content: `**Definícia**

Finančná gramotnosť je schopnosť rozumne spravovať svoje financie, plánovať svoje budúce financie a robiť informované finančné rozhodnutia. Táto schopnosť nie je obmedzená len na výpočty a účtovníctvo; zahŕňa aj širší súbor znalostí a zručností, ktoré nám umožňujú efektívne riadiť naše peniaze a dosiahnuť finančné ciele.

**Finančná gramotnosť zahŕňa nasledujúce aspekty:**

**A. Rozpoznávanie a spravovanie financií**

Schopnosť sledovať svoje príjmy a výdavky, vytvárať rozpočet a žiť v rámci svojich možností.

**Kľúčové zručnosti:**
- Vedenie domáceho rozpočtu
- Sledovanie príjmov a výdavkov
- Kategorizácia výdavkov
- Plánovanie finančných cieľov

**B. Pochopenie dlhu**

Schopnosť rozumieť rôznym druhom dlhu, ako sú úvery a pôžičky, a vedieť, kedy a ako ich použiť zodpovedne.

**Typy dlhu:**
- Hypotéka
- Spotrebiteľský úver
- Kreditné karty
- Kontokorent

**C. Investovanie**

Znalosť rôznych investičných možností a schopnosť vybrať tie, ktoré sú v súlade s našimi cieľmi a rizikovým profilom.

**Investičné nástroje:**
- Akcie
- Dlhopisy
- Podielové fondy
- Nehnuteľnosti

**D. Plánovanie dôchodku**

Vnímanie potreby našich budúcich dôchodkových príjmov a vytváranie plánu na ich dosiahnutie.

**E. Rozpoznávanie finančných rizík**

Schopnosť identifikovať riziká a vedieť, ako sa pred nimi chrániť (napríklad cez poistenie).`
    },
    {
      title: "Téma 2: Prečo je finančná gramotnosť dôležitá?",
      content: `**Význam v dnešnom svete**

Finančná gramotnosť má v dnešnom svete veľký význam a prináša mnoho výhod. Správne riadenie financií nám dáva väčšiu kontrolu nad naším životom a môže nám pomôcť dosiahnuť finančnú nezávislosť.

**Hlavné výhody finančnej gramotnosti:**

**1. Vyhýbanie sa finančným pasciam**

Finančná gramotnosť nám pomáha rozpoznať a vyhýbať sa finančným pasciam:
- Zadlženosť
- Nekontrolované výdavky
- Nízka úspora
- Predražené produkty
- Nevýhodné zmluvy

**2. Aktívne plánovanie cieľov**

S finančnou gramotnosťou môžeme aktívne plánovať svoje ciele:
- Kúpa domu
- Splatenie dlhov
- Vytvorenie havarijného fondu
- Investovanie do dôchodku
- Vzdelanie detí
- Cestovanie

**3. Zníženie stresu**

Keď vieme, že máme finančne zabezpečenú budúcnosť, môžeme žiť bez zbytočného stresu a obáv o peniaze.

**Psychologické výhody:**
- Lepší spánok
- Menej úzkosti
- Väčšia sebadôvera
- Pocit kontroly

**4. Efektívna alokácia zdrojov**

Finančná gramotnosť nám umožňuje lepšie alokovať naše zdroje a dosiahnuť tak väčšiu efektívnosť.

**Oblasti optimalizácie:**
- Úspory na zbytočných výdavkoch
- Lepšie investičné rozhodnutia
- Výhodnejšie úvery
- Nižšie poplatky

**Záver:**

Finančná gramotnosť je kľúčovým pilierom pre budúci finančný úspech a prosperitu jednotlivca i spoločnosti ako celku. V súčasnosti je náš svet stále komplexnejší a finančné rozhodnutia sa stávajú čoraz zložitejšími.`
    },
    {
      title: "Téma 3: Finančná gramotnosť detí",
      content: `**Prečo začať v ranom veku?**

Preto je dôležité začať vzdelávať deti v oblasti finančnej gramotnosti od najútlejšieho veku.

**Význam raného vzdelávania:**

Rané detstvo je obdobím, kedy sa formujú návyky, presvedčenia a vzťahy, ktoré budú mať významný vplyv na finančné správanie jednotlivca v dospelosti. Preto je vzdelávanie detí v oblasti finančnej gramotnosti mimoriadne dôležité.

**Prečo klásť dôraz na rozvoj finančnej gramotnosti v ranom veku?**

**1. Prevencia finančných problémov**

Vzdelávanie detí v oblasti finančnej gramotnosti v mladom veku môže pomôcť predchádzať finančným problémom v dospelosti.

**Problémy, ktorým sa dá predísť:**
- Dlhové problémy
- Nekontrolovateľné výdavky
- Nesprávne používanie úverov
- Impulzívne nákupy

**2. Rozvoj základných zručností**

Vzdelávanie detí v oblasti finančnej gramotnosti umožňuje rozvoj základných finančných zručností:
- Rozpoznávanie a správa financií
- Rozpoznanie hodnoty peňazí
- Pochopenie rôznych spôsobov investovania
- Šetrenie a rozpočtovanie

**3. Finančná nezávislosť**

Finančná nezávislosť je cieľom mnohých ľudí. Vzdelávanie detí v oblasti finančnej gramotnosti ich pripravuje na efektívne riadenie svojich financií, čo môže viesť k skoršiemu dosiahnutiu finančnej nezávislosti.

**4. Zodpovedné spotrebiteľstvo**

Deti, ktoré sú finančne gramotné, majú tendenciu byť zodpovednejšími spotrebiteľmi a občanmi.

**Charakteristiky:**
- Rozumejú dôsledkom svojich finančných rozhodnutí
- Snažia sa minimalizovať svoj ekologický vplyv
- Majú sociálnu zodpovednosť
- Sú kritickými spotrebiteľmi`
    },
    {
      title: "Téma 4: Ako vzdelávať deti v oblasti financií",
      content: `**Praktické metódy vzdelávania**

**1. Začať v ranom detstve**

Vzdelávanie v oblasti finančnej gramotnosti by malo začať už v ranom detstve.

**Jednoduché učebné programy pre najmenšie deti:**
- Rozpoznávanie mincí a bankoviek
- Základné pojmy o úsporách
- Základy rozpočtovania
- Hry podporujúce pochopenie hodnoty peňazí

**2. Prispôsobiť obsah veku**

Obsah vzdelávania by mal byť prispôsobený veku a úrovni pochopenia detí.

**Postupné zvyšovanie náročnosti:**

**3-6 rokov:**
- Rozlišovanie mincí
- Pokladnička
- Jednoduché počítanie

**7-12 rokov:**
- Vreckové
- Šetrenie na cieľ
- Rozdiel medzi potrebami a želaniami
- Jednoduchý rozpočet

**13-18 rokov:**
- Bankové účty
- Investovanie
- Dlh a úvery
- Plánovanie dôchodku

**3. Zapojenie rodiny a školy**

Rodina a škola majú dôležitú úlohu pri vývoji finančnej gramotnosti detí.

**Úloha rodičov:**
- Byť vzorom pre svoje deti
- Zapájať deti do rodinných finančných rozhodnutí
- Diskutovať o peniazoch otvorene
- Umožniť deťom robiť finančné chyby v bezpečnom prostredí

**Úloha školy:**
- Integrovať finančnú gramotnosť do učebných programov
- Praktické cvičenia
- Odborníci ako hosťujúci prednášajúci

**4. Interaktívne metódy**

Interaktívne metódy vzdelávania môžu zlepšiť zapamätávanie a pochopenie finančných konceptov u detí.

**Príklady:**
- Hry (Monopoly, Life)
- Simulácie
- Diskusie
- Projektové učenie

**5. Praktické skúsenosti**

Deti by mali mať príležitosť získavať praktické skúsenosti s riadením financií.

**Príklady:**
- Rodinné rozpočty
- Investovanie do fiktívnych akcií
- Správa vreckového
- Malé podnikanie (napr. limonádový stánok)`
    },
    {
      title: "Téma 5: Osobný rozpočet a plánovanie",
      content: `**Tvorba osobného rozpočtu**

**Prečo potrebujete rozpočet?**

Rozpočet je základom finančnej gramotnosti. Pomáha vám:
- Sledovať, kam idú vaše peniaze
- Kontrolovať výdavky
- Šetriť na ciele
- Vyhnúť sa dlhom

**Kroky k vytvoreniu rozpočtu:**

**1. Zistite svoje príjmy**
- Čistá mzda
- Dividendy
- Nájomné
- Vedľajšie príjmy

**2. Sledujte výdavky**

**Fixné výdavky:**
- Nájom/hypotéka
- Energie
- Poistenie
- Telefón a internet

**Variabilné výdavky:**
- Potraviny
- Doprava
- Zábava
- Oblečenie

**3. Vytvorte kategórie**

**Pravidlo 50/30/20:**
- 50% - Potreby (bývanie, jedlo, doprava)
- 30% - Želania (zábava, hobby)
- 20% - Úspory a dlhy

**4. Sledujte a upravujte**

Pravidelne kontrolujte svoj rozpočet a upravujte ho podľa potreby.

**Nástroje na rozpočtovanie:**
- Excel
- Aplikácie (YNAB, Mint, Wallet)
- Papierový denník
- Bankové aplikácie

**Havarijný fond**

**Prečo je dôležitý?**
- Neočakávané výdavky
- Strata zamestnania
- Zdravotné problémy
- Poruchy v dome/aute

**Koľko šetriť?**
- Ideálne 3-6 mesačných výdavkov
- Minimálne 1000 €

**Kde uchovávať?**
- Sporiaci účet
- Ľahko dostupné
- Bezpečné miesto`
    },
    {
      title: "Téma 6: Dlh a úvery",
      content: `**Pochopenie dlhu**

**Čo je dlh?**

Dlh je pôžičané peniaze, ktoré musíte vrátiť s úrokmi.

**Typy dlhu:**

**Dobrý vs. zlý dlh:**

**Dobrý dlh:**
- Hypotéka (investícia do nehnuteľnosti)
- Študentský úver (investícia do vzdelania)
- Podnikateľský úver (investícia do podnikania)

**Zlý dlh:**
- Spotrebiteľské úvery na luxusný tovar
- Kreditné karty s vysokými úrokmi
- Payday loans (pôžičky do výplaty)

**Úrokové sadzby**

**RPMN (ročná percentuálna miera nákladov):**
- Celkové náklady úveru
- Zahŕňa všetky poplatky
- Používajte na porovnanie

**Kreditné karty**

**Výhody:**
- Pohodlné
- Ochrana spotrebiteľa
- Odmeny a cashback

**Nevýhody:**
- Vysoké úroky
- Riziko zadlženia
- Poplatky

**Ako používať zodpovedne:**
- Splácajte celú sumu každý mesiac
- Nevyčerpajte limit
- Sledujte výdavky

**Hypotéka**

**Typy:**
- Fixná úroková sadzba
- Variabilná úroková sadzba

**Pred podpísaním:**
- Porovnajte ponuky
- Prečítajte si zmluvu
- Pochopte všetky poplatky
- Zvážte poistenie

**Ako sa zbaviť dlhov**

**Metóda snehovej gule:**
1. Zoraďte dlhy od najmenšieho
2. Splaťte minimum na všetky dlhy
3. Extra peniaze dajte na najmenší dlh
4. Keď splatíte najmenší, prejdite na ďalší

**Metóda lavíny:**
1. Zoraďte dlhy podľa úrokovej sadzby
2. Splaťte minimum na všetky dlhy
3. Extra peniaze dajte na dlh s najvyšším úrokom
4. Postupujte smerom k najnižším úrokom`
    },
    {
      title: "Téma 7: Sporenie a investovanie",
      content: `**Sporenie**

**Prečo šetriť?**
- Núdzový fond
- Krátkodobé ciele (dovolenka, auto)
- Dlhodobé ciele (dom, dôchodok)
- Finančná nezávislosť

**Kde šetriť?**

**Sporiaci účet:**
- Nízke riziko
- Nízky výnos
- Ľahký prístup k peniazom

**Termínovaný vklad:**
- Vyšší úrok ako sporiaci účet
- Peniaze viazané na určité obdobie

**Investovanie**

**Rozdiel medzi sporením a investovaním:**

**Sporenie:**
- Nízke riziko
- Nízky výnos
- Krátkodobé ciele

**Investovanie:**
- Vyššie riziko
- Potenciál vyššieho výnosu
- Dlhodobé ciele

**Investičné nástroje:**

**Akcie:**
- Vlastníctvo časti spoločnosti
- Vysoké riziko, vysoký potenciál výnosu
- Dividendy

**Dlhopisy:**
- Pôžička vláde alebo firme
- Nižšie riziko ako akcie
- Pravidelný príjem

**Podielové fondy:**
- Diverzifikácia
- Profesionálne riadenie
- Rôzne typy (akciové, dlhopisové, zmiešané)

**ETF (Exchange Traded Funds):**
- Podobné podielovým fondom
- Obchodované na burze
- Nižšie poplatky

**Nehnuteľnosti:**
- Fyzický majetok
- Nájomné príjmy
- Dlhodobá investícia

**Zlaté pravidlá investovania:**

**1. Diverzifikácia**
Nevsádzajte všetko na jednu kartu.

**2. Dlhodobý horizont**
Investujte na 5+ rokov.

**3. Pravidelné investovanie**
Využite dollar-cost averaging.

**4. Poznajte svoj rizikový profil**
Konzervatívny, vyvážený, alebo agresívny?

**5. Vzdelávajte sa**
Rozumejte tomu, do čoho investujete.`
    },
    {
      title: "Téma 8: Dôchodkové plánovanie",
      content: `**Prečo plánovať dôchodok?**

**Realita:**
- Štátny dôchodok nebude stačiť
- Ľudia žijú dlhšie
- Náklady na zdravotnú starostlivosť rastú

**Kedy začať?**

Čím skôr, tým lepšie!

**Príklad sily zloženého úročenia:**

**25-ročný:**
- Mesačne odkladá 100 €
- Do 65 rokov (40 rokov)
- Pri 7% ročne: ~240 000 €

**35-ročný:**
- Mesačne odkladá 100 €
- Do 65 rokov (30 rokov)
- Pri 7% ročne: ~120 000 €

**Piliere dôchodkového systému na Slovensku:**

**I. pilier - Štátny dôchodok**
- Povinný
- Pay-as-you-go systém
- Klesajúca hodnota

**II. pilier - Starobné dôchodkové sporenie (DSS)**
- Dobrovoľné (pre nových sporiteľov od 2013)
- Správcovské spoločnosti
- Vlastné prostriedky

**III. pilier - Doplnkové dôchodkové sporenie (DDS)**
- Dobrovoľné
- Daňové zvýhodnenie
- Flexibilné vklady

**Stratégie dôchodkového sporenia:**

**Mladí (20-40 rokov):**
- Agresívne portfólio
- Vyššie riziko
- Akcie, rastové fondy

**Stredný vek (40-55 rokov):**
- Vyvážené portfólio
- Postupné znižovanie rizika
- Mix akcií a dlhopisov

**Pred dôchodkom (55+):**
- Konzervatívne portfólio
- Ochrana kapitálu
- Dlhopisy, stabilné fondy

**Koľko potrebujete na dôchodku?**

**Pravidlo 4%:**
- Môžete ročne vybrať 4% svojich úspor
- Úspory by mali vydržať 30 rokov

**Príklad:**
- Chcete 1000 € mesačne (12 000 € ročne)
- Potrebujete: 12 000 € / 0,04 = 300 000 €`
    },
    {
      title: "Téma 9: Poistenie a ochrana majetku",
      content: `**Prečo poistenie?**

Poistenie je nástroj na ochranu pred finančnými stratami.

**Princíp:**
- Platíte pravidelné poistné
- V prípade škodovej udalosti dostanete odškodnenie
- Rozložíte riziko medzi viacerých ľudí

**Typy poistenia:**

**1. Životné poistenie**

**Rizikové životné poistenie:**
- Ochrana rodiny v prípade smrti
- Relatívne lacné
- Na určité obdobie

**Kapitálové životné poistenie:**
- Kombinácia ochrany a sporenia
- Drahšie
- Nižšie výnosy

**2. Zdravotné poistenie**

**Povinné:**
- Základné zdravotné poistenie
- Platené cez odvody

**Doplnkové:**
- Lepšia zdravotná starostlivosť
- Súkromné kliniky
- Zubné ošetrovanie

**3. Majetkové poistenie**

**Poistenie nehnuteľnosti:**
- Povinné pri hypotéke
- Ochrana pred požiarom, povodňami
- Zodpovednosť za škody

**Poistenie domácnosti:**
- Zariadenie bytu/domu
- Cennosti
- Elektronika

**4. Poistenie vozidla**

**Povinné ručenie (PZP):**
- Zákonná povinnosť
- Ochrana tretích osôb

**Havarijné poistenie:**
- Dobrovoľné
- Ochrana vášho vozidla
- Krádež, vandalizmus, nehoda

**5. Cestovné poistenie**

**Kryje:**
- Zdravotné náklady v zahraničí
- Storno zájazdu
- Stratu batožiny
- Zodpovednosť

**Ako vybrať správne poistenie:**

**1. Identifikujte riziká**
- Čo by vás mohlo finančne zruinovať?

**2. Porovnajte ponuky**
- Porovnávače
- Nezávislí makléri

**3. Čítajte podmienky**
- Co je kryté?
- Čo je vylúčené?
- Aké sú limity?

**4. Neprepoisťujte sa**
- Nekupujte zbytočné poistenie

**5. Pravidelne aktualizujte**
- Životné situácie sa menia`
    },
    {
      title: "Téma 10: Finančné ciele a stratégie",
      content: `**Stanovenie finančných cieľov**

**SMART ciele:**

**S - Specific (Špecifické)**
- "Chcem ušetriť 10 000 €"
- Nie: "Chcem viac peňazí"

**M - Measurable (Merateľné)**
- Môžete sledovať pokrok

**A - Achievable (Dosiahnuteľné)**
- Realistické vzhľadom na váš príjem

**R - Relevant (Relevantné)**
- Dôležité pre vás

**T - Time-bound (Časovo ohraničené)**
- "Do konca roku 2025"

**Typy finančných cieľov:**

**Krátkodobé (do 1 roka):**
- Vytvorenie núdzového fondu
- Splatenie kreditnej karty
- Dovolenka

**Strednodobé (1-5 rokov):**
- Kúpa auta
- Splatenie študentského úveru
- Renovácia bytu

**Dlhodobé (5+ rokov):**
- Kúpa domu
- Dôchodok
- Vzdelanie detí

**Stratégie na dosiahnutie cieľov:**

**1. Automatizácia**
- Automatické prevody na sporenie
- Investičné plány
- Odstraňuje pokušenie minúť

**2. Zvýšenie príjmov**
- Vedľajší príjem
- Zvýšenie platu
- Investície

**3. Zníženie výdavkov**
- Sledujte zbytočné výdavky
- Porovnávajte ceny
- DIY projekty

**4. Vzdelávanie**
- Čítajte knihy o financiách
- Sledujte finančné blogy
- Kurzy a semináre

**Bežné finančné chyby:**

**1. Život nad pomery**
- Kupovanie vecí, ktoré si nemôžete dovoliť

**2. Žiadne sporenie**
- Minúť všetko, čo zarobíte

**3. Impulzívne nákupy**
- Emočné rozhodnutia

**4. Ignorovanie dlhov**
- Splácanie len minima

**5. Nevzdelávanie sa**
- Finančná negramotnosť

**Záver:**

Vzdelávanie detí v oblasti finančnej gramotnosti je nevyhnutné pre ich budúci finančný úspech a celkovú prosperitu spoločnosti. Investícia do finančnej gramotnosti detí je investíciou do lepšej budúcnosti, kedy sa z detí stanú dospelí schopní efektívnejšie riadiť svoje financie a dosahovať svoje ciele.

**Kľúčové body:**
- Začnite vzdelávať sa čo najskôr
- Vytvorte si rozpočet
- Budujte havarijný fond
- Investujte do budúcnosti
- Chráňte sa poistením
- Stanovte si jasné ciele
- Neustále sa vzdelávajte

Finančná gramotnosť nie je cieľ, ale cesta. Každý deň sa môžete zlepšovať a robiť lepšie finančné rozhodnutia!`
    }
  ],
  "Manažment projektov": [
    {
      title: "Téma 1: Úvod do projektového manažmentu",
      content: `**Čo je projektový manažment?**

Projektový manažment je proces, ktorým sa zabezpečuje úspešná realizácia projektov prostredníctvom plánovania, monitorovania, delegovania a riadenia projektových aktivít. Cieľom je dosiahnuť definované ciele v rámci stanoveného rozpočtu, časového rámca a žiadanej kvality.

**Základné charakteristiky:**
- Štruktúrovaný prístup k realizácii projektov
- Jasné definovanie cieľov a výstupov
- Efektívne využívanie zdrojov
- Minimalizácia rizík
- Maximalizácia efektivity

**Úloha projektového manažéra:**

Projektový manažér dohliada na celý proces od začiatku až po dokončenie projektu. Jeho hlavné zodpovednosti zahŕňajú:
- Definovanie rozsahu projektu
- Plánovanie a rozdelenie úloh
- Koordinácia tímu
- Komunikácia so zainteresovanými stranami
- Monitorovanie postupu
- Riešenie problémov

**Prečo je projektový manažment dôležitý?**

Projektový manažment umožňuje firmám implementovať projekty štruktúrovaným spôsobom, čím minimalizujú riziká a maximalizujú efektivitu. Bez správneho riadenia a plánovania môžu projekty naraziť na problémy, ktoré vedú k zlyhaniu.

Projektový manažment je neoddeliteľnou súčasťou úspešného fungovania každej organizácie, ktorá chce dosiahnuť svoje ciele efektívne, včas a v rámci rozpočtu.`
    },
    {
      title: "Téma 2: Iniciácia projektu",
      content: `**Prvá fáza projektového manažmentu**

Iniciácia projektu je kľúčovou prvou fázou, ktorá rozhoduje o tom, či projekt stojí za realizáciu. Táto fáza zahŕňa definovanie cieľov, identifikáciu zainteresovaných strán a posúdenie uskutočniteľnosti.

**Definovanie cieľov projektu:**

Ciele musia byť SMART:
- **S**pecifické (konkrétne)
- **M**erateľné (možno ich kvantifikovať)
- **A**kceptovateľné (dosiahnuteľné)
- **R**elevantné (zmysluplné)
- **T**erminované (s jasným časovým rámcom)

**Identifikácia zainteresovaných strán:**

Zainteresované strany (stakeholders) sú jednotlivci alebo skupiny, ktoré majú záujem na úspechu projektu alebo sú ním ovplyvnené:
- Sponzori projektu
- Členovia tímu
- Zákazníci
- Dodávatelia
- Vedenie spoločnosti
- Koncoví používatelia

**Analýza požiadaviek:**

Dôkladná analýza požiadaviek zabezpečí jasné smerovanie projektu. Zahŕňa:
- Zber požiadaviek od všetkých zainteresovaných strán
- Dokumentáciu požiadaviek
- Prioritizáciu požiadaviek
- Validáciu s klientom

**Posúdenie uskutočniteľnosti:**

Pred schválením projektu je potrebné vyhodnotiť:
- Technickú realizovateľnosť
- Ekonomickú výhodnosť
- Časovú realizovateľnosť
- Dostupnosť zdrojov
- Potenciálne riziká

**Dokument o iniciácii projektu:**

Výstupom tejto fázy je dokument (Project Charter), ktorý obsahuje:
- Názov a popis projektu
- Ciele a očakávané výstupy
- Rozsah projektu
- Identifikáciu zainteresovaných strán
- Predbežný rozpočet a harmonogram
- Kritériá úspechu`
    },
    {
      title: "Téma 3: Plánovanie projektu",
      content: `**Detailné plánovanie projektu**

Plánovanie je kritickou fázou, kde sa detaily projektu starostlivo naplánujú. Kvalitné plánovanie je základom úspešnej realizácie projektu.

**Vytvorenie časového harmonogramu:**

Časový harmonogram definuje, kedy sa budú jednotlivé úlohy vykonávať:
- Rozdelenie projektu na menšie úlohy (Work Breakdown Structure)
- Určenie trvania každej úlohy
- Identifikácia závislostí medzi úlohami
- Stanovenie míľnikov
- Vytvorenie Ganttovho grafu

**Pridelenie zdrojov:**

Efektívne pridelenie zdrojov zahŕňa:
- **Ľudské zdroje:** Kto bude na projekte pracovať a v akom rozsahu
- **Materiálne zdroje:** Aké materiály a vybavenie budú potrebné
- **Finančné zdroje:** Koľko peňazí bude projekt vyžadovať
- **Technologické zdroje:** Aké nástroje a technológie sa použijú

**Určenie rozpočtu:**

Rozpočet projektu zahŕňa:
- Náklady na ľudské zdroje (mzdy, odmeny)
- Náklady na materiál a vybavenie
- Prevádzkové náklady
- Rezerva na nepredvídané výdavky (obvykle 10-20%)
- Náklady na externých dodávateľov

**Identifikácia rizík:**

Riadenie rizík začína už vo fáze plánovania:
- Identifikácia potenciálnych rizík
- Analýza pravdepodobnosti a dopadu
- Vytvorenie stratégií na mitigáciu rizík
- Definovanie kontingenčných plánov

**Komunikačný plán:**

Jasný komunikačný plán zabezpečuje:
- Kto bude informovaný o postupe projektu
- Ako často budú prebiehať aktualizácie
- Aké formy komunikácie sa použijú
- Kto je zodpovedný za komunikáciu

**Definovanie úloh pre členov tímu:**

Jasne definované úlohy pomáhajú zaručiť efektívnosť a koordináciu:
- Pridelenie zodpovedností
- Definovanie výstupov pre každú úlohu
- Stanovenie termínov
- Určenie kritérií kvality`
    },
    {
      title: "Téma 4: Realizácia projektu",
      content: `**Implementácia projektových úloh**

Počas realizácie sa uskutočňuje implementácia naplánovaných úloh. Táto fáza vyžaduje aktívne vedenie, koordináciu a flexibilitu.

**Zahájenie prác:**

Na začiatku realizácie:
- Kick-off meeting s celým tímom
- Distribúcia úloh podľa plánu
- Nastavenie pracovných procesov
- Aktivácia komunikačných kanálov
- Pridelenie prístupov a nástrojov

**Distribúcia zdrojov:**

Projektový manažér dohliada na:
- Efektívne využívanie ľudských zdrojov
- Dostupnosť materiálov a vybavenia
- Správu finančných prostriedkov
- Využívanie technológií a nástrojov

**Koordinácia tímu:**

Úspešná koordinácia zahŕňa:
- Pravidelné tímové stretnutia
- Sledovanie pokroku jednotlivých členov
- Riešenie prekážok a problémov
- Podpora tímovej spolupráce
- Motivácia tímu

**Komunikácia so zainteresovanými stranami:**

Priebežná komunikácia je kľúčová:
- Pravidelné reporty o postupe
- Informovanie o významných míľnikoch
- Riešenie požiadaviek a zmien
- Získavanie spätnej väzby
- Riadenie očakávaní

**Riadenie zmien:**

Projekty zriedka prebiehajú presne podľa plánu:
- Formálny proces schvaľovania zmien
- Analýza dopadu zmien na rozpočet a čas
- Aktualizácia projektovej dokumentácie
- Komunikácia zmien tímu a stakeholderom

**Riešenie problémov:**

Flexibilita pri riešení neočakávaných problémov:
- Rýchla identifikácia problémov
- Analýza príčin
- Hľadanie riešení
- Implementácia nápravných opatrení
- Dokumentácia riešení pre budúce projekty

**Zabezpečenie kvality:**

Kontrola kvality počas realizácie:
- Pravidelné kontroly výstupov
- Testovanie a validácia
- Dodržiavanie štandardov
- Dokumentácia kvality`
    },
    {
      title: "Téma 5: Monitorovanie a kontrola projektu",
      content: `**Sledovanie pokroku a výkonu**

Monitorovanie a kontrola prebieha súbežne s realizáciou projektu. Táto fáza zabezpečuje, že projekt zostáva na správnej ceste.

**Sledovanie pokroku:**

Pravidelné monitorovanie zahŕňa:
- Sledovanie dokončenia úloh podľa harmonogramu
- Porovnávanie skutočného pokroku s plánom
- Identifikácia oneskorení a odchýlok
- Meranie výkonnosti tímu
- Sledovanie míľnikov

**Kontrola rozpočtu:**

Finančné monitorovanie projektu:
- Porovnávanie skutočných výdavkov s plánovanými
- Sledovanie cashflow projektu
- Identifikácia prekročení rozpočtu
- Analýza hodnoty za peniaze (Value for Money)
- Prognózovanie konečných nákladov

**Metriky a KPI:**

Kľúčové ukazovatele výkonnosti:
- **SPI (Schedule Performance Index):** Meria efektívnosť času
- **CPI (Cost Performance Index):** Meria efektívnosť nákladov
- **Percentuálne dokončenie:** Koľko % projektu je hotových
- **Burndown chart:** Vizualizácia zostávajúcej práce
- **Počet zmien:** Sledovanie stability projektu

**Reportovanie:**

Pravidelné reporty pre stakeholderov:
- Statusové reporty (týždenné/mesačné)
- Reporty o míľnikoch
- Reporty o rizikách a problémoch
- Finančné reporty
- Reporty o kvalite

**Nápravné opatrenia:**

Keď vzniknú odchýlky od plánu:
- Analýza príčin odchýlok
- Návrh nápravných opatrení
- Schválenie zmien
- Implementácia úprav
- Sledovanie účinnosti opatrení

**Riadenie rizík:**

Kontinuálne monitorovanie rizík:
- Sledovanie identifikovaných rizík
- Identifikácia nových rizík
- Aktualizácia registra rizík
- Implementácia mitigačných stratégií
- Aktivácia kontingenčných plánov

**Riadenie kvality:**

Zabezpečenie kvality výstupov:
- Kontrola dodržiavania štandardov
- Testovanie a validácia
- Audit kvality
- Náprava nedostatkov
- Dokumentácia kvality`
    },
    {
      title: "Téma 6: Ukončenie projektu",
      content: `**Formálne uzavretie projektu**

Po úspešnom splnení úloh sa projekt uzavrie. Táto fáza je rovnako dôležitá ako predchádzajúce a zahŕňa hodnotenie výsledkov a získaných skúseností.

**Odovzdanie výstupov:**

Formálne odovzdanie projektu:
- Finalizácia všetkých výstupov
- Testovanie a validácia
- Dokumentácia
- Školenie používateľov (ak je potrebné)
- Formálne schválenie od klienta/sponzora

**Hodnotenie výsledkov:**

Zhodnotenie úspešnosti projektu:
- Splnenie cieľov projektu
- Dodržanie rozpočtu
- Dodržanie harmonogramu
- Kvalita výstupov
- Spokojnosť zainteresovaných strán

**Lessons Learned:**

Získavanie poznatkov pre budúce projekty:
- Čo sa podarilo dobre?
- Čo sa dalo urobiť lepšie?
- Aké problémy sa vyskytli?
- Ako boli riešené?
- Odporúčania pre budúce projekty

**Dokumentácia projektu:**

Kompletná projektová dokumentácia:
- Finálna projektová správa
- Aktualizované projektové plány
- Finančná správa
- Register rizík a problémov
- Zmluvy a dohody
- Technická dokumentácia

**Uvoľnenie zdrojov:**

Formálne ukončenie angažovania:
- Uvoľnenie členov tímu
- Vrátenie prenajatého vybavenia
- Uzavretie externých zmlúv
- Archivovanie dokumentov
- Ukončenie prístupov a licencií

**Záverečná správa:**

Prezentácia výsledkov:
- Zhrnutie projektu
- Dosiahnuté výsledky
- Použité zdroje
- Získané poznatky
- Odporúčania

**Oslava úspechu:**

Ocenenie tímu:
- Poďakovanie členom tímu
- Oslava dokončenia projektu
- Uznanie dosiahnutých výsledkov
- Podpora tímového ducha`
    },
    {
      title: "Téma 7: Význam projektového manažmentu pre firmy",
      content: `**Prečo sú firmy úspešnejšie s projektovým manažmentom**

Projektový manažment je pre firmy neoceniteľný nástroj, pretože umožňuje realizovať zložité úlohy efektívne a bez zbytočných komplikácií.

**Efektívne využívanie zdrojov:**

Projektové riadenie umožňuje lepšiu kontrolu nad zdrojmi:
- **Čas:** Optimalizácia pracovného času tímu
- **Financie:** Kontrola nákladov a prevencia prekročenia rozpočtu
- **Ľudské zdroje:** Optimálne využitie schopností členov tímu
- **Materiálne zdroje:** Zabránenie plytvaniu materiálov
- **Technológie:** Efektívne využívanie nástrojov

Tým sa zabezpečí, že sa žiadne zdroje nepremárnia, a to ani pri nepredvídaných problémoch.

**Lepšia komunikácia:**

Jasne definované ciele a pravidelné aktualizácie:
- Lepšia koordinácia medzi tímami
- Transparentnosť pre zainteresované strany
- Predchádzanie nedorozumeniam
- Rovnaké informácie pre všetkých účastníkov
- Rýchlejšie riešenie problémov
- Lepšia spolupráca

**Riadenie rizík:**

Včasná identifikácia potenciálnych problémov:
- Proaktívny prístup k rizikám
- Pripravené kontingenčné plány
- Rýchla reakcia na problémy
- Minimalizácia negatívnych dopadov
- Zníženie pravdepodobnosti neúspechu
- Ochrana investícií

**Zlepšená produktivita:**

Neustály dohľad na plnenie úloh:
- Dodržiavanie stanovených termínov
- Vyššia efektivita tímu
- Lepšia organizácia práce
- Zníženie zbytočných činností
- Zvýšená kvalita výstupov
- Spokojnosť zainteresovaných strán

**Strategické výhody:**

Projektový manažment prináša:
- Lepšie plánovanie budúcich projektov
- Budovanie znalostnej bázy
- Zvyšovanie konkurencieschopnosti
- Schopnosť riadiť viac projektov súčasne
- Lepšie využitie príležitostí
- Dlhodobý rozvoj firmy

**Merateľné výsledky:**

Projektový manažment umožňuje:
- Jasné meranie úspešnosti
- Objektívne hodnotenie výsledkov
- Dátovo podložené rozhodovanie
- Kontinuálne zlepšovanie procesov
- ROI (Return on Investment) analýzu`
    },
    {
      title: "Téma 8: Metodológia PRINCE2",
      content: `**Najrozšírenejšia metodika projektového manažmentu**

PRINCE2 (PRojects IN Controlled Environments) je celosvetovo najrozšírenejšia metodika projektového manažmentu. Ide o procesne orientovanú metodológiu, ktorá sa zameriava na kontrolu zdrojov a riadenie rizík.

**Základné princípy PRINCE2:**

Metodika stojí na 7 princípoch:
1. **Kontinuálne obchodné odôvodnenie:** Projekt musí mať obchodný zmysel
2. **Učenie sa zo skúseností:** Využívanie lessons learned
3. **Definované úlohy a zodpovednosti:** Jasná štruktúra tímu
4. **Riadenie po etapách:** Kontrola na konci každej fázy
5. **Riadenie podľa výnimiek:** Eskalácia len pri odchýlkach
6. **Zameranie na produkty:** Dôraz na výstupy projektu
7. **Prispôsobenie prostrediu projektu:** Flexibilita metodiky

**Sedem procesov PRINCE2:**

1. **Starting Up a Project (SU):** Príprava projektu
2. **Initiating a Project (IP):** Formálna iniciácia
3. **Directing a Project (DP):** Riadenie projektovej rady
4. **Controlling a Stage (CS):** Kontrola jednotlivých etáp
5. **Managing Product Delivery (MP):** Riadenie dodávky produktov
6. **Managing Stage Boundaries (SB):** Riadenie prechodu medzi etapami
7. **Closing a Project (CP):** Ukončenie projektu

**Témy PRINCE2:**

Sedem tém, ktoré sa riešia počas celého projektu:
- **Business Case:** Obchodné odôvodnenie
- **Organization:** Organizačná štruktúra
- **Quality:** Kvalita výstupov
- **Plans:** Plánovanie
- **Risk:** Riadenie rizík
- **Change:** Riadenie zmien
- **Progress:** Sledovanie pokroku

**Rozdelenie na etapy:**

Projekty sú rozdelené na fázy (stages):
- Jasné míľniky medzi etapami
- Kontrola na konci každej etapy
- Rozhodnutie o pokračovaní
- Hodnotenie výsledkov
- Aktualizácia plánov

**Flexibilita PRINCE2:**

PRINCE2 umožňuje prispôsobovať metodiku:
- Pre rôzne veľkosti projektov
- Pre rôzne odvetvia
- Pre rôzne typy projektov
- Podľa kultúry organizácie
- Podľa skúseností tímu

**PRINCE2 certifikácia:**

OMNICOM poskytuje kurzy:
- **PRINCE2 Foundation:** Základný kurz
- **PRINCE2 Practitioner:** Praktická aplikácia
- **PRINCE2 Agile Foundation:** Kombinácia s agilnými metódami`
    },
    {
      title: "Téma 9: Metodológia PMBOK a IPMA",
      content: `**Ďalšie významné metodológie projektového manažmentu**

**PMBOK (Project Management Body of Knowledge)**

PMBOK je štandard projektového riadenia vytvorený organizáciou PMI (Project Management Institute). Nejde o konkrétnu metodiku, ale o súbor osvedčených postupov na riadenie projektov v rôznych odvetviach.

**Päť fáz projektu podľa PMBOK:**

1. **Iniciácia:** Definovanie a autorizácia projektu
2. **Plánovanie:** Stanovenie rozsahu a cieľov
3. **Realizácia:** Koordinácia ľudí a zdrojov
4. **Monitorovanie a kontrola:** Sledovanie pokroku
5. **Ukončenie:** Formálne dokončenie projektu

**Desať oblastí znalostí PMBOK:**

1. **Integrácia:** Koordinácia všetkých aspektov projektu
2. **Rozsah:** Definovanie, čo projekt zahŕňa
3. **Čas:** Riadenie harmonogramu
4. **Náklady:** Rozpočtovanie a kontrola nákladov
5. **Kvalita:** Zabezpečenie kvality výstupov
6. **Zdroje:** Riadenie tímu a materiálov
7. **Komunikácia:** Plánovanie a distribúcia informácií
8. **Riziká:** Identifikácia a riadenie rizík
9. **Obstarávanie:** Riadenie dodávateľov
10. **Zainteresované strany:** Riadenie stakeholderov

**IPMA (International Project Management Association)**

IPMA je globálna organizácia, ktorá vyvinula systém certifikácie projektových manažérov na základe kompetenčného prístupu.

**IPMA ICB (Individual Competence Baseline)**

Metodika definuje tri hlavné oblasti kompetencií:

**1. Perspektívne kompetencie:**
- Strategické myslenie
- Pochopenie kontextu projektu
- Pochopenie organizácie
- Governance projektu
- Compliance a štandardy

**2. Ľudské kompetencie:**
- Vedenie tímu
- Komunikácia
- Riešenie konfliktov
- Tímová spolupráca
- Vyjednávanie
- Sebareflexia
- Etika a hodnoty
- Osobný rozvoj

**3. Technické kompetencie:**
- Plánovanie projektu
- Riadenie rizík
- Riadenie kvality
- Riadenie rozsahu
- Harmonogram projektu
- Náklady a financie
- Zdroje projektu
- Zmeny a riešenie problémov

**Certifikačné úrovne IPMA:**

- **Level A:** Certified Projects Director (riadenie portfólia)
- **Level B:** Certified Senior Project Manager (komplexné projekty)
- **Level C:** Certified Project Manager (menej komplexné projekty)
- **Level D:** Certified Project Management Associate (členovia tímov)

**Porovnanie metodológií:**

- **PRINCE2:** Procesne orientovaná, jasná štruktúra
- **PMBOK:** Súbor znalostí, flexibilná aplikácia
- **IPMA:** Kompetenčný prístup, zameranie na ľudí`
    },
    {
      title: "Téma 10: Nástroje a zhrnutie projektového manažmentu",
      content: `**Nástroje pre efektívny projektový manažment**

Moderný projektový manažment využíva rôzne nástroje a technológie:

**Plánovacie nástroje:**
- **Microsoft Project:** Komplexný nástroj pre plánovanie
- **Primavera P6:** Pre veľké a komplexné projekty
- **GanttProject:** Open-source alternatíva
- **SmartSheet:** Online plánovanie a spolupráca

**Nástroje pre agilný prístup:**
- **Jira:** Najpoužívanejší nástroj pre Scrum a Kanban
- **Trello:** Jednoduchý vizuálny nástroj
- **Asana:** Riadenie úloh a projektov
- **Monday.com:** Flexibilná platforma

**Komunikačné nástroje:**
- **Slack:** Tímová komunikácia
- **Microsoft Teams:** Komplexná spolupráca
- **Zoom:** Videokonferencie
- **Miro:** Virtuálne whiteboard

**Dokumentačné nástroje:**
- **Confluence:** Projektová dokumentácia
- **SharePoint:** Správa dokumentov
- **Google Workspace:** Cloudová spolupráca
- **Notion:** All-in-one workspace

**Kľúčové zručnosti projektového manažéra:**

**Tvrdé zručnosti:**
- Plánovanie a organizácia
- Riadenie rozpočtu
- Analýza rizík
- Znalosti metodológií
- Technické znalosti

**Mäkké zručnosti:**
- Vedenie tímu
- Komunikácia
- Riešenie problémov
- Vyjednávanie
- Adaptabilita
- Rozhodovanie

**Zhrnutie:**

Projektový manažment je základom úspechu pre firmy, ktoré chcú zvládnuť komplexné projekty efektívne a bez komplikácií. Význam správneho riadenia projektov je neoceniteľný, pretože prispieva k:

✅ Lepšej organizácii práce
✅ Efektívnemu využívaniu zdrojov
✅ Zvyšovaniu produktivity
✅ Minimalizácii rizík
✅ Spokojnosti zákazníkov
✅ Dosiahnutiu strategických cieľov

**Odporúčania pre začiatočníkov:**

1. **Začnite vzdelávaním:** Absolvujte certifikačný kurz (PRINCE2, PMP, IPMA)
2. **Získajte prax:** Začnite s menšími projektmi
3. **Používajte nástroje:** Naučte sa pracovať s PM software
4. **Učte sa zo skúseností:** Aplikujte lessons learned
5. **Rozvíjajte mäkké zručnosti:** Komunikácia je kľúčová
6. **Sledujte trendy:** PM sa neustále vyvíja

**Budúcnosť projektového manažmentu:**

- Hybridné metodológie (kombiná­cia Waterfall a Agile)
- Využívanie AI a automatizácie
- Dôraz na udržateľnosť
- Remote a hybridná práca
- Dátovo riadené rozhodovanie

Ak chcete dosiahnuť lepšie výsledky vo vašich projektoch, zvážte zavedenie profesionálneho projektového manažmentu a využitie nástrojov a metodík, ktoré sú dnes dostupné.`
    }
  ],
  "Business plán": [
    {
      title: "Téma 1: Úvod do Business plánu",
      content: `**Čo je Business plán?**

Business plán, alebo podnikateľský plán, je dokument, ktorý detailne popisuje váš podnikateľský zámer, ciele, stratégie, trh, konkurenciu, financie a riziká.

**Účel Business plánu:**
- Strategický manuál pre podnikateľa
- Nástroj na získanie financií od investorov alebo bánk
- Pomôcka pri hodnotení životaschopnosti podniku
- Príprava na možné úskalia a riziká

**Pre koho je určený?**
- Pre samotného podnikateľa
- Pre potenciálnych investorov
- Pre banky a finančné institúcie
- Pre obchodných partnerov`
    },
    {
      title: "Téma 2: Executive Summary",
      content: `**Executive Summary**

Executive Summary je stručné zhrnutie celého business plánu. Hoci sa píše ako prvé v dokumente, vytvára sa až ako posledné.

**Čo obsahuje:**
- Stručný popis firmy a jej poslania
- Hlavné produkty alebo služby
- Cieľový trh a zákazníci
- Konkurenčné výhody
- Finančné požiadavky a projektované výnosy
- Kľúčové míľniky

**Dôležitosť:**
Executive Summary je často prvá (a niekedy jediná) časť, ktorú investori čítajú. Musí byť presvedčivá a výstižná.`
    },
    {
      title: "Téma 3: Popis spoločnosti",
      content: `**Popis spoločnosti**

Táto časť poskytuje podrobné informácie o vašej firme.

**Čo zahŕňa:**
- Názov a právna forma spoločnosti
- Vízia a misia firmy
- História a vznik spoločnosti
- Umiestnenie a prevádzky
- Vlastnícka štruktúra
- Kľúčové hodnoty a firemná kultúra
- Dlhodobé ciele a ambície

**Vízia vs. Misia:**
- Vízia = kde chcete byť v budúcnosti
- Misia = čo robíte a prečo to robíte`
    },
    {
      title: "Téma 4: Produkt a služby",
      content: `**Produkt/Služba**

Detailný popis toho, čo ponúkate vašim zákazníkom.

**Obsah sekcie:**
- Presný popis produktu/služby
- Jedinečné vlastnosti a výhody
- Vývojový cyklus produktu
- Patenty, licencie, duševné vlastníctvo
- Cenová stratégia
- Plány budúceho rozvoja

**Value Proposition:**
Jasne definujte, akú hodnotu váš produkt/služba prináša zákazníkom a prečo je lepší ako konkurencia.`
    },
    {
      title: "Téma 5: Analýza trhu",
      content: `**Analýza trhu**

Prieskum trhu, zákazníkov a konkurencie je kľúčovou časťou business plánu.

**Obsah analýzy:**
- Veľkosť a rast trhu
- Segmentácia trhu
- Cieľová skupina zákazníkov
- Demografické a psychografické charakteristiky
- Nákupné správanie zákazníkov

**Konkurenčná analýza:**
- Identifikácia hlavných konkurentov
- Silné a slabé stránky konkurencie
- Trhový podiel konkurentov
- Vaša konkurenčná výhoda

**Trendy na trhu:**
Aktuálne trendy a budúci vývoj v odvetví.`
    },
    {
      title: "Téma 6: Stratégia a implementácia",
      content: `**Stratégia a implementácia**

Táto časť popisuje, ako dosiahnete svoje podnikateľské ciele.

**Marketingová stratégia:**
- Produktová stratégia
- Cenová stratégia
- Distribučná stratégia
- Komunikačná stratégia (reklama, PR)

**Predajná stratégia:**
- Predajné kanály
- Predajný proces
- Predajný tím a školenia

**Implementačný plán:**
- Časový harmonogram
- Míľniky a kontrolné body
- Zodpovednosti a úlohy
- Merateľné ciele (KPI)`
    },
    {
      title: "Téma 7: Finančná analýza",
      content: `**Finančná analýza**

Predpokladané náklady, príjmy, ziskovosť a potreba financií.

**Obsahuje:**
- Plán príjmov a výdavkov (P&L)
- Peňažný tok (Cash Flow)
- Súvaha (Balance Sheet)
- Bod zvratu (Break-even analysis)
- Finančné predpovede na 3-5 rokov

**Finančné požiadavky:**
- Celková potreba kapitálu
- Použitie finančných prostriedkov
- Zdroje financovania
- Návratnosť investície (ROI)
- Plán splácania úverov`
    },
    {
      title: "Téma 8: Zamestnanci a tím",
      content: `**Zamestnanci a tím**

Informácie o kľúčových ľuďoch a ich úlohách v spoločnosti.

**Manažérsky tím:**
- Mená a pozície kľúčových osôb
- Profesijné skúsenosti a kvalifikácia
- Úlohy a zodpovednosti
- Organizačná štruktúra

**Personálny plán:**
- Aktuálny počet zamestnancov
- Plánovaný nábor
- Vzdelávanie a rozvoj
- Odmeňovanie a benefity

**Poradné orgány:**
- Dozorná rada
- Poradcovia a mentori
- Externí experti`
    },
    {
      title: "Téma 9: Riziká a príležitosti (SWOT)",
      content: `**SWOT Analýza**

Identifikácia silných a slabých stránok, hrozieb a príležitostí.

**Strengths (Silné stránky):**
- Čo robíte dobre?
- Aké máte výhody oproti konkurencii?

**Weaknesses (Slabé stránky):**
- Kde máte rezervy?
- Čo by ste mohli zlepšiť?

**Opportunities (Príležitosti):**
- Aké príležitosti ponúka trh?
- Kde vidíte potenciál rastu?

**Threats (Hrozby):**
- Aké riziká môžu ohroziť váš biznis?
- Aká je konkurencia?

**Riadenie rizík:**
Plán na minimalizáciu identifikovaných rizík.`
    },
    {
      title: "Téma 10: Zhrnutie a Prílohy",
      content: `**Záver**

Zhrnutie kľúčových bodov business plánu a výzva k akcii.

**Prílohy:**
Podporné dokumenty, ktoré dopĺňajú business plán:

- Životopisy manažérskeho tímu
- Detailné finančné výkazy
- Prieskumy trhu
- Právne dokumenty
- Produktové katalógy
- Referencie a odporúčania
- Fotografie a vizualizácie

**Tipy na záver:**
- Buďte presvedčiví
- Zdôraznite kľúčové výhody
- Uveďte jasný plán ďalších krokov
- Poskytnite kontaktné údaje

Business plán je živý dokument, ktorý by sa mal pravidelne aktualizovať podľa vývoja firmy a trhu.`
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
