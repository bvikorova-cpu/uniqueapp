# Plynulé prehrávanie reverzného videa

## Cieľ
Odstrániť trasenie a nepravidelné skoky v náhľade aj v stiahnutom reverznom videu.

## Zmeny
- Pri extrakcii čakať na skutočne dekódovanú video snímku, nie iba na dokončenie posunu času; tým sa zabránia duplicitným alebo preskočeným snímkam najmä na mobile.
- Prehrávač riadiť podľa presného času od začiatku prehrávania namiesto postupného pripočítavania snímok, aby výpadok jedného renderu nerozhodil ďalšie snímky.
- Export časovať cez `requestAnimationFrame` a pevné termíny snímok namiesto reťazenia nepresných `setTimeout`, aby výsledný súbor nemal nerovnomerný pohyb.
- Zachovať limity, watermark, kredity, ovládanie aj existujúci vzhľad bez ďalších zmien.

## Overenie
- TypeScript kontrola a cielený test časovania.
- Kontrola stránky v mobilnom rozmere a krátkeho reverzného prehrávania/exportu, ak je dostupný testovací klip.

## Technické detaily
Zmena sa obmedzí na utility pre dekódovanie/export a canvas prehrávač. Pre staršie prehliadače zostane bezpečný fallback bez `requestVideoFrameCallback`.
