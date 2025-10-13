export interface Topic {
  title: string;
  content: string;
}

export const courseContent: Record<string, Topic[]> = {
  "Základy účtovníctva": [
    {
      title: "Téma 1: Úvod do účtovníctva",
      content: `**Čo je účtovníctvo?**

Účtovníctvo je systematický proces evidovania, spracovania a vykazovania finančných transakcií podniku. Pomáha sledovať príjmy, výdavky, aktíva a záväzky.

**Účel účtovníctva:**
- Evidencia všetkých obchodných transakcií
- Príprava finančných výkazov
- Pomoc pri rozhodovaní
- Zabezpečenie dodržiavania zákonov
- Poskytovanie informácií zainteresovaným stranám

**Kto používa účtovníctvo?**
- Majitelia a manažéri podnikov
- Investori a akcionári
- Daňové úrady
- Veritelia a poskytovatelia úverov
- Štátne inštitúcie

**Typy účtovníctva:**

**1. Finančné účtovníctvo:**
- Externé výkazníctvo
- Dodržiavanie štandardov
- Ročné finančné výkazy

**2. Manažérske účtovníctvo:**
- Vnútorné použitie
- Plánovanie a rozpočtovanie
- Analýza výkonnosti

**3. Daňové účtovníctvo:**
- Príprava daňových priznaní
- Daňové plánovanie
- Dodržiavanie daňových zákonov

**Význam:**
Účtovníctvo je nevyhnutné pre pochopenie finančného zdravia podniku a prijímanie informovaných rozhodnutí.`
    },
    {
      title: "Téma 2: Podvojné účtovníctvo",
      content: `**Systém podvojného účtovníctva**

Každá transakcia ovplyvňuje minimálne dva účty - jeden účet sa účtuje na ťarchu (MD) a druhý na dobropisu (D). Toto zabezpečuje, že účtovná rovnica zostáva v rovnováhe.

**Účtovná rovnica:**
Aktíva = Pasíva + Vlastné imanie

**Pravidlá účtovania na MD a D:**

**Aktíva:**
- MD zvyšuje
- D znižuje

**Pasíva:**
- MD znižuje
- D zvyšuje

**Vlastné imanie:**
- MD znižuje
- D zvyšuje

**Výnosy:**
- MD znižuje
- D zvyšuje

**Náklady:**
- MD zvyšuje
- D znižuje

**Príklad transakcie:**
Spoločnosť zakúpila zariadenie za 5 000 € v hotovosti.
- MD: Zariadenie 5 000 €
- D: Pokladňa 5 000 €

**Výhody podvojného účtovníctva:**
- Presnosť kontrolou rovnováhy
- Úplný záznam transakcií
- Odhalenie chýb
- Príprava finančných výkazov

**Účtovné zápisy:**
Všetky transakcie sa najskôr zaznamenávajú do denníka s uvedením:
- Dátumu
- Dotknutých účtov
- Súm na MD a D
- Stručného popisu`
    },
    {
      title: "Téma 3: Finančné výkazy",
      content: `**Hlavné finančné výkazy**

**1. Súvaha (Bilancia):**
Zobrazuje finančnú pozíciu k určitému dátumu.

**Zložky:**
- Aktíva (čo spoločnosť vlastní)
- Pasíva (čo spoločnosť dlhuje)
- Vlastné imanie (investícia vlastníka)

**2. Výkaz ziskov a strát:**
Zobrazuje ziskovosť za obdobie.

**Zložky:**
- Výnosy (tržby, poplatky)
- Náklady (náklady na podnikanie)
- Čistý zisk (zisk alebo strata)

**3. Výkaz peňažných tokov:**
Zobrazuje prílevy a odlevy peňazí.

**Kategórie:**
- Prevádzkové činnosti
- Investičné činnosti
- Finančné činnosti

**4. Výkaz zmien vlastného imania:**
Zobrazuje zmeny vo vlastnom imaní.

**Čítanie finančných výkazov:**

**Analýza likvidity:**
- Bežný pomer
- Rýchly pomer
- Peňažný pomer

**Analýza ziskovosti:**
- Hrubá zisková marža
- Čistá zisková marža
- Rentabilita aktív

**Význam:**
Finančné výkazy poskytujú dôležité informácie pre investorov, veriteľov a manažment na posúdenie výkonnosti spoločnosti.`
    },
    {
      title: "Téma 4: Účty a účtovné knihy",
      content: `**Účtový rozvrh**

Systematický zoznam všetkých účtov používaných podnikom.

**Kategórie:**

**1. Aktíva:**
- Obežné aktíva (pokladňa, pohľadávky)
- Dlhodobý majetok (nehnuteľnosti, zariadenia)
- Nehmotný majetok (patenty, goodwill)

**2. Pasíva:**
- Krátkodobé záväzky (záväzky, krátkodobé úvery)
- Dlhodobé záväzky (úvery, dlhopisy)

**3. Vlastné imanie:**
- Základné imanie
- Nerozdelený zisk
- Výbery

**4. Výnosy:**
- Tržby z predaja
- Tržby zo služieb
- Ostatné výnosy

**5. Náklady:**
- Náklady na predaný tovar
- Prevádzkové náklady
- Úrokové náklady

**Hlavná kniha:**

Hlavný záznam všetkých účtov.

**Proces:**
1. Transakcie zaznamenané v denníku
2. Zaúčtované do hlavnej knihy
3. Pripravená súhrnná bilancia
4. Vytvorené finančné výkazy

**Formát účtu:**
- T-účet formát
- Formát bežného zostatku

**Zaúčtovanie:**
Prenos denníkových zápisov na účty hlavnej knihy.`
    },
    {
      title: "Téma 5: Uznávanie výnosov a nákladov",
      content: `**Akruálne účtovníctvo**

Výnosy sa uznávajú, keď sú zarobené, nie keď sú prijaté peniaze. Náklady sa uznávajú, keď vzniknú, nie keď sú zaplatené.

**Princípy uznávania výnosov:**

**1. Kedy uznať:**
- Splnený výkonový záväzok
- Dodaný tovar alebo poskytnuté služby
- Suma je spoľahlivo merateľná

**2. Príklady:**
- Predaj na úver: uznať okamžite
- Platba vopred: uznať pri zarobení
- Dlhodobé zmluvy: uznať postupne

**Princíp priraďovania nákladov:**

Priraďovanie nákladov k súvisiacim výnosom v rovnakom období.

**Typy nákladov:**

**1. Priame náklady:**
- Náklady na predaný tovar
- Priama práca
- Priame materiály

**2. Nepriame náklady:**
- Nájomné
- Energie
- Mzdy
- Odpisy

**Úpravy účtov:**

**Vopred platené náklady:**
- Vopred platené poistenie
- Vopred platené nájomné

**Časovo rozlíšené náklady:**
- Mzdy na úhradu
- Úroky na úhradu

**Výnosy budúcich období:**
- Prijaté zálohy
- Odložené výnosy

**Časovo rozlíšené výnosy:**
- Poskytnuté služby, ale nefakturované
- Úroky na prijatie`
    },
    {
      title: "Téma 6: Oceňovanie zásob",
      content: `**Metódy oceňovania zásob**

**1. FIFO (First-In, First-Out):**
- Prvé položky sa predajú ako prvé
- Konečné zásoby v aktuálnych nákladoch
- Vyššie zisky pri rastúcich cenách

**2. LIFO (Last-In, First-Out):**
- Najnovšie položky sa predajú ako prvé
- Konečné zásoby v starších nákladoch
- Nižšie zisky pri rastúcich cenách
- Nie je povolené podľa IFRS

**3. Vážený priemer:**
- Priemerné náklady všetkých jednotiek
- Vyrovnáva kolísanie cien
- Jednoduché na výpočet

**Systémy evidencie zásob:**

**Periodický systém:**
- Inventúra zásob periodicky
- Výpočet nákladov na konci obdobia
- Jednoduchšie pre malé podniky

**Perpetuálny systém:**
- Kontinuálne sledovanie
- Záznamy v reálnom čase
- Lepšia kontrola a presnosť

**Komponenty nákladov:**

**Nákupné náklady:**
- Faktúrna cena
- Prepravné náklady
- Dovozné clá
- Mínus: obchodné zľavy

**Ocenenie na nižšiu hodnotu:**
Odpísať zásoby, ak trhová hodnota klesne pod náklady.

**Obrat zásob:**
= Náklady na predaný tovar / Priemerné zásoby
Meria, ako rýchlo sa zásoby predávajú.`
    },
    {
      title: "Téma 7: Odpisy",
      content: `**Čo sú odpisy?**

Systematické rozloženie nákladov na majetok počas jeho životnosti.

**Faktory:**
- Náklady na majetok
- Odhadovaná životnosť
- Odhadovaná zostatková hodnota

**Metódy odpisovania:**

**1. Rovnomerné odpisy:**
Ročný odpis = (Náklady - Zostatková hodnota) / Životnosť

**Príklad:**
- Náklady: 10 000 €
- Zostatková: 1 000 €
- Životnosť: 5 rokov
- Ročný odpis: 1 800 €

**2. Zrýchlené odpisy:**
Vyššie odpisy v prvých rokoch.

**Vzorec:**
Odpis = Účtovná hodnota × Sadzba odpisovania

**3. Výkonové odpisy:**
Založené na skutočnom používaní.

**Vzorec:**
Odpis na jednotku = (Náklady - Zostatková) / Celkové jednotky
Ročný odpis = Vyprodukované jednotky × Sadzba

**Zaúčtovanie odpisov:**

**Denníkový zápis:**
- MD: Náklad na odpisy
- D: Oprávky

**Zobrazenie v súvahe:**
Zariadenie 10 000 €
Mínus: Oprávky (3 600 €)
Čistá účtovná hodnota 6 400 €

**Vplyv:**
- Znižuje čistý zisk
- Neovplyvňuje peňažné toky
- Znižuje hodnotu majetku
- Daňovo uznateľný`
    },
    {
      title: "Téma 8: Bankové odsúhlasenie",
      content: `**Účel bankového odsúhlasenia**

Zosúladenie zostatku na bankovom výpise so zostatkom v pokladničnej knihe.

**Dôvody rozdielov:**

**1. Časové rozdiely:**
- Nevyrovnané šeky
- Prevodové vklady
- Nezaúčtované bankové poplatky
- Nezaúčtované úroky

**2. Chyby:**
- Chyby v záznamoch
- Bankové chyby

**Proces odsúhlasenia:**

**Krok 1: Začať s bankovým zostatkom**
Pridať: Prevodové vklady
Mínus: Nevyrovnané šeky
= Upravený bankový zostatok

**Krok 2: Začať so zostatkom v knihách**
Pridať: Nezaúčtované bankové kredity
Mínus: Nezaúčtované bankové poplatky
= Upravený zostatok v knihách

**Oba by sa mali zhodovať!**

**Bežné položky:**

**Strana banky:**
- Nevyrovnané šeky
- Ešte nepripísané vklady

**Strana knihy:**
- NSF (odmietnuté) šeky
- Bankové servisné poplatky
- Priame vklady
- Elektronické prevody
- Zarobené úroky

**Opravné zápisy:**
Vytvoriť denníkové zápisy pre položky ovplyvňujúce zostatok v knihách.

**Príklad zápisu:**
MD: Pokladňa 50 € (zarobené úroky)
D: Úrokové výnosy 50 €

**Význam:**
- Zabezpečuje presnosť
- Odhaľuje chyby a podvody
- Správna hotovostná správa`
    },
    {
      title: "Téma 9: Mzdové účtovníctvo",
      content: `**Zložky mzdy**

**Hrubá mzda:**
Celkové zárobky pred zrážkami.

**Typy:**
- Hodinová mzda
- Platy
- Príplatky
- Bonusy
- Provízie

**Zrážky:**

**1. Povinné:**
- Zrážka dane z príjmu
- Sociálne poistenie
- Zdravotné poistenie
- Štátne dane

**2. Dobrovoľné:**
- Zdravotné poistenie
- Dôchodkové príspevky
- Životné poistenie
- Odborové príspevky

**Čistá mzda:**
Hrubá mzda mínus všetky zrážky.

**Mzdové dane zamestnávateľa:**

**Dodatočné náklady:**
- Podiel zamestnávateľa na sociálnom poistení
- Podiel zamestnávateľa na zdravotnom poistení
- Dane z nezamestnanosti
- Úrazové poistenie

**Zaúčtovanie mzdy:**

**Odmena zamestnancov:**
MD: Mzdové náklady
D: Mzdy na úhradu
D: Rôzne daňové zrážky

**Dane zamestnávateľa:**
MD: Náklad na mzdové dane
D: Rôzne daňové záväzky

**Výplata:**
MD: Mzdy na úhradu
D: Pokladňa

**Mzdové záznamy:**
- Záznam zárobkov zamestnancov
- Mzdový register
- Daňové formuláre

**Dodržiavanie:**
- Včasné daňové vklady
- Štvrťročné výkazy
- Ročné podania
- Uchovávanie záznamov`
    },
    {
      title: "Téma 10: Finančná analýza a pomery",
      content: `**Analýza finančných pomerov**

**Pomery likvidity:**

**1. Bežný pomer:**
= Obežné aktíva / Krátkodobé záväzky
Meria schopnosť splácať krátkodobé záväzky.
Dobrý pomer: 2:1 alebo vyšší

**2. Rýchly pomer (Acid Test):**
= (Obežné aktíva - Zásoby) / Krátkodobé záväzky
Konzervatívnejšie meranie.
Dobrý pomer: 1:1 alebo vyšší

**Pomery ziskovosti:**

**1. Hrubá zisková marža:**
= (Hrubý zisk / Tržby) × 100
Ukazuje cenovú silu a efektívnosť.

**2. Čistá zisková marža:**
= (Čistý zisk / Tržby) × 100
Celkové meranie ziskovosti.

**3. Rentabilita aktív (ROA):**
= Čistý zisk / Celkové aktíva
Ako efektívne aktíva generujú zisk.

**4. Rentabilita vlastného imania (ROE):**
= Čistý zisk / Vlastné imanie
Návratnosť pre investorov.

**Pomery efektívnosti:**

**1. Obrat zásob:**
= Náklady na predaný tovar / Priemerné zásoby
Ako rýchlo sa zásoby predávajú.

**2. Obrat pohľadávok:**
= Čisté úverové tržby / Priemerné pohľadávky
Efektívnosť inkasa.

**Pomery zadlženosti:**

**1. Dlh k vlastnému imaniu:**
= Celkový dlh / Celkové vlastné imanie
Miera finančného pákového efektu.

**2. Pomer zadlženosti:**
= Celkový dlh / Celkové aktíva
Podiel aktív financovaných dlhom.

**Interpretácia:**
- Porovnať s priemernými hodnotami v odvetví
- Sledovať trendy v čase
- Zvážiť obchodný model spoločnosti
- Pozerať sa na pomery v kombinácii`
    }
  ],

  "PHP": [
    {
      title: "Téma 1: Úvod do PHP - Čo je PHP?",
      content: `**Čo je PHP?**

PHP (Hypertext Preprocessor) je open source skriptovací jazyk používaný primárne na strane servera pre vytváranie dynamického webového obsahu a webových aplikácií.

**História PHP:**
- Vytvorené v roku 1994
- Autor: Rasmus Lerdorf
- Pôvodne "Personal Home Page Tools"
- Dnes jeden z najpoužívanejších webových jazykov

**Základné charakteristiky:**

**1. Server-side jazyk:**
- PHP kód sa spracováva na serveri
- Nie v prehliadači používateľa
- Výsledok sa posiela ako HTML

**2. Open Source:**
- Bezplatný programovací jazyk
- Otvorený zdrojový kód
- Aktívna komunita vývojárov

**3. Dynamický obsah:**
- Umožňuje meniť obsah stránky
- Reaguje na akcie používateľa
- Prispôsobené prostredie namiesto statických stránok

**Praktický význam:**
PHP umožňuje webovým stránkam reagovať na akcie používateľov, vytvárať interaktívne a prispôsobené prostredie namiesto statických stránok.`
    },
    {
      title: "Téma 2: Spracovanie na serveri a výhody",
      content: `**Spracovanie PHP na serveri**

PHP kód sa vykonáva na webovom serveri a výsledok sa posiela do prehliadača používateľa ako štandardný HTML.

**Ako to funguje:**

**1. Priebeh spracovania:**
- Používateľ požiada o stránku
- Server spracuje PHP kód
- Vygeneruje HTML
- Pošle do prehliadača

**2. Bezpečnosť:**
- Používateľ nevidí PHP zdrojový kód
- Ochrana aplikačnej logiky
- Bezpečnejšie než klientske skripty

**3. Výkon:**
- Spracovanie na výkonných serveroch
- Nezávislé od zariadenia používateľa
- Efektívne využitie zdrojov

**Výhody servera:**

**1. Kompatibilita:**
- Funguje vo všetkých prehliadačoch
- Nezávislé od klientskeho zariadenia
- Konzistentné výsledky

**2. Prístup k dátam:**
- Priamy prístup k databáze
- Manipulácia so súbormi na serveri
- Spracovanie citlivých informácií

**3. Flexibilita:**
- Možnosť integrovať rôzne služby
- Práca s externými API
- Komplexné aplikácie`
    },
    {
      title: "Téma 3: Dynamický obsah a interaktivita",
      content: `**Vytváranie dynamického obsahu**

PHP umožňuje meniť obsah stránky na základe prihlásenia používateľa, preferencií alebo iných podmienok.

**Príklady dynamického obsahu:**

**1. Prispôsobenie používateľovi:**
\`\`\`php
<?php
session_start();
if (isset($_SESSION['username'])) {
    echo "Vitaj späť, " . $_SESSION['username'];
} else {
    echo "Vitaj, návštevník!";
}
?>
\`\`\`

**2. Časové zobrazenie:**
\`\`\`php
<?php
$hour = date("H");
if ($hour < 12) {
    echo "Dobré ráno!";
} elseif ($hour < 18) {
    echo "Dobré popoludnie!";
} else {
    echo "Dobrý večer!";
}
?>
\`\`\`

**3. Personalizovaný obsah:**
- Odporúčania produktov
- Používateľské preferencie
- História prehliadania
- Prispôsobené dashboardy

**Interaktívne funkcie:**

**1. Formuláre:**
- Spracovanie vstupov
- Validácia dát
- Uloženie do databázy

**2. Používateľské účty:**
- Registrácia
- Prihlásenie
- Správa profilu

**3. Komentáre a hodnotenia:**
- Pridávanie komentárov
- Hodnotenie systém
- Spätná väzba`
    },
    {
      title: "Téma 4: Open Source vlastnosti a komunita",
      content: `**PHP ako Open Source projekt**

PHP je bezplatný programovací jazyk s otvoreným zdrojovým kódom, ktorý má obrovskú komunitu vývojárov.

**Výhody Open Source:**

**1. Bezplatnosť:**
- Žiadne licenčné poplatky
- Voľné použitie pre akýkoľvek projekt
- Bez obmedzení

**2. Transparentnosť:**
- Otvorený zdrojový kód
- Možnosť bezpečnostného auditu
- Dôveryhodnosť

**3. Flexibilita:**
- Možnosť upraviť podľa potreby
- Prispievanie do projektu
- Vytváranie vlastných rozšírení

**PHP komunita:**

**1. Rozsiahle zdroje:**
- Milióny vývojárov po celom svete
- Obrovské množstvo dokumentácie
- Fóra a diskusie
- Online tutoriály

**2. Knižnice a frameworky:**
- Laravel
- Symfony
- CodeIgniter
- Zend Framework
- CakePHP

**3. Podpora:**
- Stack Overflow
- PHP oficiálna dokumentácia
- GitHub repozitáre
- Aktívne blogy a články

**Vývoj jazyka:**

**Pravidelné aktualizácie:**
- Nové verzie s vylepšeniami
- Bezpečnostné opravy
- Nové funkcie
- Lepší výkon

**Moderné PHP:**
- PHP 8.x s JIT kompilátorom
- Vylepšená syntax
- Lepší výkon
- Moderné programovacie koncepty`
    },
    {
      title: "Téma 5: Kompatibilita a všestrannosť",
      content: `**Multiplatformová podpora PHP**

PHP sa dá používať na rôznych operačných systémoch a funguje s rôznymi databázami.

**Podporované operačné systémy:**

**1. Windows:**
- PHP na IIS serveri
- Apache pre Windows
- XAMPP balík

**2. Mac OS:**
- Predinštalované v macOS
- MAMP balík
- Jednoduchá inštalácia

**3. Linux:**
- Najpoužívanejšia platforma
- LAMP stack
- Optimálny výkon

**Podpora databáz:**

**1. MySQL/MariaDB:**
\`\`\`php
<?php
$conn = mysqli_connect("localhost", "user", "pass", "db");
if (!$conn) {
    die("Pripojenie zlyhalo: " . mysqli_connect_error());
}
?>
\`\`\`

**2. PostgreSQL:**
- Pokročilá databáza
- Podpora komplexných dát
- Vysoký výkon

**3. SQLite:**
- Ľahká databáza
- Bez servera
- Vhodná pre menšie projekty

**4. Iné databázy:**
- Oracle
- Microsoft SQL Server
- MongoDB (cez rozšírenie)

**Webové servery:**

**1. Apache:**
- Najpoužívanejší
- Podpora .htaccess
- Modulárna architektúra

**2. Nginx:**
- Vysoký výkon
- Moderná alternatíva
- Efektívne spracovanie

**Všestrannosť použitia:**

**Nad rámec webových aplikácií:**
- CLI aplikácie
- Automatizácia úloh
- API servery
- Mikroslužby`
    },
    {
      title: "Téma 6: Základná syntax a štruktúra PHP",
      content: `**Základy PHP syntaxe**

Každý PHP kód začína značkou <?php a končí ?>

**Základná štruktúra:**

\`\`\`php
<?php
// Toto je komentár

/* Viacriadkový
   komentár */

echo "Ahoj, svet!";
?>
\`\`\`

**PHP v HTML:**

\`\`\`php
<!DOCTYPE html>
<html>
<head>
    <title>Moja stránka</title>
</head>
<body>
    <h1><?php echo "Vitajte v PHP"; ?></h1>
    <p>Aktuálny čas: <?php echo date("H:i:s"); ?></p>
</body>
</html>
\`\`\`

**Výpis textu:**

**1. Echo:**
\`\`\`php
<?php
echo "Text";
echo "Viacero ", "parametrov";
?>
\`\`\`

**2. Print:**
\`\`\`php
<?php
print "Text";
?>
\`\`\`

**Premenné:**

**Základy:**
\`\`\`php
<?php
$meno = "Peter";
$vek = 25;
$vyska = 180.5;
$student = true;

echo "Meno: $meno, Vek: $vek";
?>
\`\`\`

**Pravidlá pre premenné:**
- Začínajú znakom $
- Prvý znak musí byť písmeno alebo _
- Rozlišujú veľké a malé písmená ($Meno ≠ $meno)
- Môžu obsahovať písmená, čísla, _

**Dátové typy:**

**1. String:**
\`\`\`php
$text = "Ahoj";
$text2 = 'Svet';
?>
\`\`\`

**2. Integer:**
\`\`\`php
$cislo = 123;
?>
\`\`\`

**3. Float:**
\`\`\`php
$desatinne = 12.5;
?>
\`\`\`

**4. Boolean:**
\`\`\`php
$pravda = true;
?>
\`\`\`

**5. Array:**
\`\`\`php
$pole = array(1, 2, 3);
$pole2 = [4, 5, 6];
?>
\`\`\``
    },
    {
      title: "Téma 7: Práca s formulármi a HTTP",
      content: `**Spracovanie formulárov v PHP**

PHP umožňuje jednoduché spracovanie formulárov pomocou superglobálnych premenných.

**GET metóda:**

**HTML formulár:**
\`\`\`html
<form method="GET" action="spracuj.php">
    <input type="text" name="meno">
    <input type="submit" value="Odoslať">
</form>
\`\`\`

**Spracovanie:**
\`\`\`php
<?php
if (isset($_GET['meno'])) {
    $meno = $_GET['meno'];
    echo "Vaše meno je: " . htmlspecialchars($meno);
}
?>
\`\`\`

**POST metóda:**

**HTML formulár:**
\`\`\`html
<form method="POST" action="spracuj.php">
    <input type="email" name="email">
    <input type="password" name="heslo">
    <input type="submit" value="Prihlásiť">
</form>
\`\`\`

**Spracovanie:**
\`\`\`php
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $heslo = $_POST['heslo'];
    
    // Validácia
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Email je platný";
    }
}
?>
\`\`\`

**Validácia vstupov:**

**1. Kontrola prázdnych polí:**
\`\`\`php
<?php
if (empty($_POST['meno'])) {
    echo "Meno je povinné";
}
?>
\`\`\`

**2. Sanitizácia:**
\`\`\`php
<?php
$meno = htmlspecialchars($_POST['meno']);
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
?>
\`\`\`

**Nahrávanie súborov:**

**HTML:**
\`\`\`html
<form method="POST" enctype="multipart/form-data">
    <input type="file" name="subor">
    <input type="submit" value="Nahrať">
</form>
\`\`\`

**PHP:**
\`\`\`php
<?php
if (isset($_FILES['subor'])) {
    $nazov = $_FILES['subor']['name'];
    $tmp = $_FILES['subor']['tmp_name'];
    move_uploaded_file($tmp, "nahrate/" . $nazov);
}
?>
\`\`\``
    },
    {
      title: "Téma 8: Pripojenie k MySQL databáze",
      content: `**Práca s MySQL databázou**

PHP poskytuje niekoľko spôsobov pripojenia a práce s MySQL databázou.

**MySQLi - Objektovo orientované:**

**1. Pripojenie:**
\`\`\`php
<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mojaDB";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Pripojenie zlyhalo: " . $conn->connect_error);
}
echo "Pripojenie úspešné";
?>
\`\`\`

**2. SELECT dopyt:**
\`\`\`php
<?php
$sql = "SELECT id, meno, email FROM pouzivatelia";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "id: " . $row["id"] . " - Meno: " . $row["meno"];
    }
} else {
    echo "0 výsledkov";
}
$conn->close();
?>
\`\`\`

**3. INSERT dopyt:**
\`\`\`php
<?php
$sql = "INSERT INTO pouzivatelia (meno, email) VALUES ('Ján', 'jan@example.com')";

if ($conn->query($sql) === TRUE) {
    echo "Nový záznam úspešne vytvorený";
} else {
    echo "Chyba: " . $sql . "<br>" . $conn->error;
}
?>
\`\`\`

**Prepared Statements:**

**Bezpečnosť:**
\`\`\`php
<?php
$stmt = $conn->prepare("INSERT INTO pouzivatelia (meno, email) VALUES (?, ?)");
$stmt->bind_param("ss", $meno, $email);

$meno = "Ján";
$email = "jan@example.com";
$stmt->execute();

echo "Záznam úspešne vložený";
$stmt->close();
?>
\`\`\``
    },
    {
      title: "Téma 9: Relácie a cookies",
      content: `**Správa používateľských relácií**

Relácie a cookies umožňujú ukladať informácie o používateľovi naprieč viacerými stránkami.

**Relácie:**

**1. Spustenie relácie:**
\`\`\`php
<?php
session_start();
$_SESSION['username'] = "Ján";
$_SESSION['logged_in'] = true;
?>
\`\`\`

**2. Čítanie relácie:**
\`\`\`php
<?php
session_start();
if (isset($_SESSION['username'])) {
    echo "Vitaj " . $_SESSION['username'];
}
?>
\`\`\`

**3. Zničenie relácie:**
\`\`\`php
<?php
session_start();
session_destroy();
?>
\`\`\`

**Cookies:**

**1. Nastavenie cookie:**
\`\`\`php
<?php
setcookie("user", "Ján", time() + (86400 * 30), "/");
?>
\`\`\`

**2. Čítanie cookie:**
\`\`\`php
<?php
if (isset($_COOKIE['user'])) {
    echo "Používateľ je: " . $_COOKIE['user'];
}
?>
\`\`\`

**Príklad prihlasovacieho systému:**

\`\`\`php
<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    // Overenie prihlasovacích údajov (zjednodušené)
    if ($username == "admin" && $password == "heslo123") {
        $_SESSION['logged_in'] = true;
        $_SESSION['username'] = $username;
        header("Location: dashboard.php");
    } else {
        echo "Neplatné prihlasovacie údaje";
    }
}
?>
\`\`\``
    },
    {
      title: "Téma 10: Najlepšie postupy a bezpečnosť",
      content: `**PHP bezpečnosť a najlepšie postupy**

Dodržiavanie najlepších postupov a bezpečnostných zásad je nevyhnutné pre profesionálny PHP vývoj.

**Základy bezpečnosti:**

**1. Validácia vstupov:**
\`\`\`php
<?php
$email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
if (!$email) {
    die("Neplatný email");
}
?>
\`\`\`

**2. Prevencia SQL injection:**
\`\`\`php
<?php
// ZLE - zraniteľné voči SQL injection
$sql = "SELECT * FROM pouzivatelia WHERE meno = '$username'";

// SPRÁVNE - použitie prepared statements
$stmt = $conn->prepare("SELECT * FROM pouzivatelia WHERE meno = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
?>
\`\`\`

**3. Prevencia XSS:**
\`\`\`php
<?php
// Vždy escapovať výstup
echo htmlspecialchars($user_input, ENT_QUOTES, 'UTF-8');
?>
\`\`\`

**Najlepšie postupy:**

**1. Spracovanie chýb:**
\`\`\`php
<?php
// V produkcii
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Použiť try-catch
try {
    // Kód
} catch (Exception $e) {
    error_log($e->getMessage());
}
?>
\`\`\`

**2. Bezpečnosť hesiel:**
\`\`\`php
<?php
// Hashovanie hesla
$hash = password_hash($password, PASSWORD_DEFAULT);

// Overenie hesla
if (password_verify($input, $hash)) {
    echo "Platné heslo";
}
?>
\`\`\`

**3. Bezpečnosť nahrávania súborov:**
- Validovať typy súborov
- Obmedziť veľkosť súborov
- Uložiť mimo webového root-u
- Generovať jedinečné názvy súborov

**Organizácia kódu:**
- Používať funkcie a triedy
- Dodržiavať PSR štandardy
- Komentovať kód
- Používať zmysluplné názvy premenných`
    }
  ],

  "default": [
    {
      title: `Úvod do kurzu`,
      content: `Vitajte v tomto kurze. Tento komplexný program vás prevedie všetkými základnými aspektami tejto témy.`
    },
    {
      title: "Základy a kľúčové koncepty",
      content: `V tejto téme preskúmame základné princípy a kľúčové koncepty, ktoré tvoria základ tejto oblasti.`
    },
    {
      title: "Praktické aplikácie",
      content: `Naučte sa, ako aplikovať teoretické vedomosti v reálnych scenároch a praktických situáciách.`
    },
    {
      title: "Pokročilé techniky",
      content: `Ponorte sa hlbšie do pokročilých metód a techník používaných profesionálmi v tejto oblasti.`
    },
    {
      title: "Nástroje a zdroje",
      content: `Objavte základné nástroje, zdroje a platformy, ktoré zlepšia vaše učenie a prax.`
    },
    {
      title: "Najlepšie postupy",
      content: `Naučte sa osvedčené postupy a metodológie, aby ste vynikli v tejto oblasti.`
    },
    {
      title: "Bežné výzvy a riešenia",
      content: `Pochopte bežné prekážky, ktorým môžete čeliť, a efektívne stratégie na ich prekonanie.`
    },
    {
      title: "Prípadové štúdie",
      content: `Analyzujte reálne prípadové štúdie a príklady pre lepšie pochopenie praktických implementácií.`
    },
    {
      title: "Budúce trendy",
      content: `Preskúmajte vznikajúce trendy a budúci vývoj v tejto oblasti.`
    },
    {
      title: "Záverečné zhrnutie a príprava na hodnotenie",
      content: `Zopakujte si všetky kľúčové koncepty a pripravte sa na záverečné hodnotenie. Táto téma konsoliduje všetko, čo ste sa naučili.`
    }
  ]
};

export const generateDefaultTopics = (courseName: string): Topic[] => {
  return [
    {
      title: `Úvod do ${courseName}`,
      content: `Vitajte v kurze ${courseName}. Tento komplexný program vás prevedie všetkými základnými aspektmi tejto témy.`
    },
    {
      title: "Základy a kľúčové koncepty",
      content: `V tejto téme preskúmame základné princípy a kľúčové koncepty, ktoré tvoria základ ${courseName}.`
    },
    {
      title: "Praktické aplikácie",
      content: `Naučte sa, ako aplikovať teoretické vedomosti v reálnych scenároch a praktických situáciách.`
    },
    {
      title: "Pokročilé techniky",
      content: `Ponorte sa hlbšie do pokročilých metód a techník používaných profesionálmi v tejto oblasti.`
    },
    {
      title: "Nástroje a zdroje",
      content: `Objavte základné nástroje, zdroje a platformy, ktoré zlepšia vaše učenie a prax.`
    },
    {
      title: "Najlepšie postupy",
      content: `Naučte sa osvedčené postupy a metodológie, aby ste vynikli v ${courseName}.`
    },
    {
      title: "Bežné výzvy a riešenia",
      content: `Pochopte bežné prekážky, ktorým môžete čeliť, a efektívne stratégie na ich prekonanie.`
    },
    {
      title: "Prípadové štúdie",
      content: `Analyzujte reálne prípadové štúdie a príklady pre lepšie pochopenie praktických implementácií.`
    },
    {
      title: "Budúce trendy",
      content: `Preskúmajte vznikajúce trendy a budúci vývoj v oblasti ${courseName}.`
    },
    {
      title: "Záverečné zhrnutie a príprava na hodnotenie",
      content: `Zopakujte si všetky kľúčové koncepty a pripravte sa na záverečné hodnotenie. Táto téma konsoliduje všetko, čo ste sa naučili.`
    }
  ];
};
