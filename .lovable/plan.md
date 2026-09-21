# Zachovanie pôvodného štýlu pri preklade plagátu

## Cieľ
Preložiť iba text na zvolenom plagáte. Ilustrácie, farby, rozloženie, pozadie, pomery a celkový vizuálny štýl musia zostať čo najvernejšie pôvodnému obrázku.

## Zmeny
- Poslať do prekladovej funkcie aj pôvodný obrázok plagátu, nie iba jeho názov a popis.
- Zmeniť AI operáciu z tvorby nového obrázka na úpravu existujúceho obrázka s prísnym pokynom nahradiť iba text.
- Zachovať existujúcu cenu 2 kredity, výber jazykov, náhľad, stiahnutie a účtovanie bez zmien.
- Pri chybe neodpočítať kredity a zobraziť existujúcu chybovú správu.

## Technické detaily
- Klient prevedie lokálny obrázok na dátový obrázok a pošle ho ako referenciu.
- Server použije existujúci Vertex AI image-edit tok a referenčný obrázok; prompt zakáže zmenu kompozície, ilustrácií, farieb a typografie mimo samotného preloženého textu.
- Vstup sa overí vrátane formátu a veľkosti obrázka.

## Overenie
- Preložiť testovací plagát a vizuálne porovnať originál s výsledkom.
- Overiť, že téma, postavy, objekty, rozloženie a farby zostali zachované a zmenil sa iba jazyk textov.
- Overiť úspešné stiahnutie a správne odpočítanie 2 kreditov až po úspechu.
